/**
 * React hooks for using the NutriPeek API
 * Provides hooks with loading, error, and data states
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { nutripeekApi } from "./nutripeekApi";
import { ApiError } from "./apiClient";
import {
  FoodDetectionResponse,
  FoodMappingRequest,
  FoodMappingResponse,
  CreateSessionResponse,
  FileInfo,
  FoodAutocompleteResponse,
  FoodNutrientResponse,
  NutrientGapRequest,
  NutrientGapResponse,
  NutrientIntakeResponse,
  SessionStatus,
  MealType,
  type processedFiles,
} from "./types";

// Import MealImage type from the NutriScan components
import { MealImage } from "../components/NutriScan/types";

// New interface for downloaded files
interface DownloadedFile {
  file: File;
  id: string;
}

// Modified state type for uploadedFilesMap
type UploadedFilesMapType = Record<
  string,
  FoodDetectionResponse | DownloadedFile
>;

interface ApiHookState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiHookResult<T> extends ApiHookState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Generic hook for making API calls
 * @param apiFunction - Function to call
 * @param executeOnMount - Whether to execute on mount
 * @param defaultArgs - Default arguments for the function
 * @returns Hook result with execute function and state
 */
function useApiCall<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  executeOnMount = false,
  defaultArgs?: Args
): ApiHookResult<T> {
  const [state, setState] = useState<ApiHookState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "An unknown error occurred";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  useEffect(() => {
    if (executeOnMount && defaultArgs) {
      execute(...defaultArgs);
    }
  }, [execute, executeOnMount, defaultArgs]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for detecting food items in an image
 */
export function useDetectFoodItems() {
  return useApiCall<FoodDetectionResponse, [File]>((imageFile: File) =>
    nutripeekApi.detectFoodItems(imageFile)
  );
}

/**
 * Hook for mapping food items to nutrients
 */
export function useMapFoodToNutrients() {
  return useApiCall<FoodMappingResponse, [FoodMappingRequest]>(
    (request: FoodMappingRequest) => nutripeekApi.mapFoodToNutrients(request)
  );
}

/**
 * WebSocket Session hook for handling the QR code-based file upload flow
 * Handles session creation, monitoring status, and file uploads
 */
export function useWebSocketSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(
    null
  );
  const [sessionData, setSessionData] = useState<CreateSessionResponse | null>(
    null
  );
  const [isBlurred, setIsBlurred] = useState<boolean>(true);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<
    "pending" | "uploaded" | "processed" | "error"
  >("pending");
  const [resultData, setResultData] = useState<FoodDetectionResponse | null>(
    null
  );

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadedFilesMap, setUploadedFilesMap] =
    useState<UploadedFilesMapType>({});
  const wsConnectionRef = useRef<WebSocket | null>(null);

  // Track downloaded files by meal type
  const [mealTypeFiles, setMealTypeFiles] = useState<
    Record<MealType, FileInfo | null>
  >({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  // Store blob URLs to prevent recreating them
  const blobUrlsRef = useRef<Record<string, string>>({});

  // Stop polling for session status - moved up to fix reference error
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Create session
  const createSession = useCallback(async (expirySeconds = 300) => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      const data = await nutripeekApi.createSession(expirySeconds);
      setSessionId(data.session_id);
      setSessionData(data);
      setSessionStatus("created");
      setIsLoading(false);
      return data;
    } catch (error) {
      const errorMsg =
        error instanceof ApiError ? error.message : "Failed to create session";
      setErrorMessage(errorMsg);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Initialize session with QR code (initially blurred)
  const initializeQRCode = useCallback(
    async (expirySeconds = 300) => {
      const data = await createSession(expirySeconds);
      setIsBlurred(true); // Start with blurred QR code
      setUploadStatus("pending");
      return data;
    },
    [createSession]
  );

  // Set up session expiry timer
  const startSessionExpiryTimer = useCallback(
    (expirySeconds: number) => {
      // Clear any existing timer
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }

      // Set new timer to blur QR code when session expires
      sessionTimerRef.current = setTimeout(() => {
        setIsBlurred(true);
        setSessionStatus("expired");
        stopPolling();
      }, expirySeconds * 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearTimeout(sessionTimerRef.current);
        }
      };
    },
    [stopPolling]
  );

  // Start polling for session status
  const startPolling = useCallback(() => {
    if (!sessionId || isPolling) return;

    setIsPolling(true);

    const pollSessionStatus = async () => {
      try {
        if (!sessionId) return;

        const status = await nutripeekApi.getSessionStatus(sessionId);
        setSessionStatus(status.status);

        // Get files if status is active
        if (status.status === "active") {
          const filesData = await nutripeekApi.listSessionFiles(sessionId);

          // Check if we have new files since the last update
          if (filesData.files.length > files.length) {
            setUploadStatus("uploaded");
            setFiles(filesData.files);

            // Process newly completed files - we just need to download them
            const newFiles = filesData.files.filter(
              (file) =>
                file.status === "completed" && !uploadedFilesMap[file.file_id]
            );

            if (newFiles.length > 0) {
              for (const file of newFiles) {
                try {
                  // Skip if we already have a file for this meal type
                  if (file.meal_type && mealTypeFiles[file.meal_type]) {
                    continue;
                  }

                  // Download the file for use in the app
                  const blob = await nutripeekApi.downloadSessionFile(
                    sessionId,
                    file.file_id
                  );
                  const imageFile = new File([blob], file.filename, {
                    type: file.content_type,
                  });

                  // Store the file in the uploadedFilesMap
                  setUploadedFilesMap((prev) => ({
                    ...prev,
                    [file.file_id]: { file: imageFile, id: file.file_id },
                  }));

                  // Update meal type files mapping if meal type is provided
                  if (file.meal_type) {
                    setMealTypeFiles((prev) => ({
                      ...prev,
                      [file.meal_type!]: file,
                    }));
                  }

                  setUploadStatus("processed");
                } catch (error) {
                  console.error(
                    `Error downloading file ${file.file_id}:`,
                    error
                  );
                  setUploadStatus("error");
                  setErrorMessage(
                    `Failed to download image: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                }
              }
            }
          } else {
            setFiles(filesData.files);
          }
        }

        // If expired or closed, stop polling and blur QR code
        if (status.status === "expired" || status.status === "closed") {
          setIsBlurred(true);
          stopPolling();
        }
      } catch (error) {
        const errorMsg =
          error instanceof ApiError
            ? error.message
            : "Error polling session status";
        setErrorMessage(errorMsg);
        console.error("Polling error:", error);
        stopPolling();
      }
    };

    // Poll immediately
    pollSessionStatus();

    // Use a longer interval (5s instead of 2s) to reduce server load
    pollingIntervalRef.current = setInterval(pollSessionStatus, 5000);

    return () => stopPolling();
  }, [
    sessionId,
    isPolling,
    uploadedFilesMap,
    files.length,
    stopPolling,
    mealTypeFiles,
  ]);

  // Activate session - unblurs the QR code and establishes WebSocket connection to activate the session
  const activateSession = useCallback(() => {
    if (!sessionId) {
      setErrorMessage("No active session to activate");
      return;
    }

    // Reset error message
    setErrorMessage(null);

    // Close any existing WebSocket connection first
    if (wsConnectionRef.current) {
      wsConnectionRef.current.close();
      wsConnectionRef.current = null;
    }

    setIsBlurred(false); // Unblur the QR code
    setIsLoading(true);

    // Reset meal type files when activating a new session
    setMealTypeFiles({
      breakfast: null,
      lunch: null,
      dinner: null,
    });

    // Reset upload status to pending
    setUploadStatus("pending");

    // Establish WebSocket connection to activate the session
    const wsConnection = nutripeekApi.connectToSessionWebSocket(
      sessionId,
      // onOpen
      () => {
        setSessionStatus("active");
        setIsLoading(false);

        // Start session expiry timer
        if (sessionData?.expires_in_seconds) {
          startSessionExpiryTimer(sessionData.expires_in_seconds);
        }

        // Start polling for session status and files once WebSocket is connected
        startPolling();
      },
      // onMessage
      (data) => {
        // Check for session status updates
        const statusUpdate = nutripeekApi.isSessionStatusUpdateMessage(data);
        if (statusUpdate.isStatusUpdate && statusUpdate.status) {
          setSessionStatus(statusUpdate.status);

          // If the session is closed or expired, take appropriate actions
          if (
            statusUpdate.status === "closed" ||
            statusUpdate.status === "expired"
          ) {
            setIsBlurred(true);
            stopPolling();
          }
        }

        // Handle file uploaded event
        if (
          data &&
          typeof data === "object" &&
          data.type === "file_uploaded" &&
          data.file_info
        ) {
          setUploadStatus("uploaded");

          // Make sure to update the files list with the new file
          setFiles((prev) => {
            // Check if file already exists
            const fileExists = prev.some(
              (f) => f.file_id === data.file_info.file_id
            );
            if (fileExists) {
              return prev;
            }
            return [...prev, data.file_info];
          });
        }
      },
      // onClose
      () => {
        setIsLoading(false);
        // Session might be expired or closed, check status
        if (sessionId) {
          nutripeekApi
            .getSessionStatus(sessionId)
            .then((status) => {
              setSessionStatus(status.status);
              if (status.status === "expired" || status.status === "closed") {
                setIsBlurred(true);
                stopPolling();
              }
            })
            .catch((error) => {
              console.error(
                "Error checking session status after WebSocket closed:",
                error
              );
            });
        }
      },
      // onError
      (error) => {
        console.error("WebSocket connection error:", error);
        setErrorMessage(
          "Failed to establish WebSocket connection. Please try again."
        );
        setIsLoading(false);
      }
    );

    // Store WebSocket connection in ref for cleanup
    wsConnectionRef.current = wsConnection;
  }, [
    sessionId,
    sessionData,
    startPolling,
    stopPolling,
    startSessionExpiryTimer,
  ]);

  // Extend session
  const extendSession = useCallback(
    async (additionalSeconds = 300) => {
      if (!sessionId) {
        setErrorMessage("No active session to extend");
        return;
      }

      try {
        setIsLoading(true);
        await nutripeekApi.extendSession(sessionId, additionalSeconds);

        // Update session data with new expiry
        if (sessionData) {
          const newExpirySeconds =
            (sessionData.expires_in_seconds || 300) + additionalSeconds;
          setSessionData({
            ...sessionData,
            expires_in_seconds: newExpirySeconds,
          });

          // Reset the session expiry timer
          startSessionExpiryTimer(newExpirySeconds);
        }
        setIsLoading(false);
      } catch (error) {
        const errorMsg =
          error instanceof ApiError
            ? error.message
            : "Failed to extend session";
        setErrorMessage(errorMsg);
        setIsLoading(false);
      }
    },
    [sessionId, sessionData, startSessionExpiryTimer]
  );

  // Close session
  const closeSession = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage("No active session to close");
      return;
    }

    try {
      setIsLoading(true);
      await nutripeekApi.closeSession(sessionId);

      // Update session status
      setSessionStatus("closed");
      setIsBlurred(true);
      stopPolling();

      // Reset upload status to pending for new uploads
      setUploadStatus("pending");

      // Clear the session expiry timer
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      // Close WebSocket connection if it exists
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close();
        wsConnectionRef.current = null;
      }

      setIsLoading(false);
    } catch (error) {
      const errorMsg =
        error instanceof ApiError ? error.message : "Failed to close session";
      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  }, [sessionId, stopPolling]);

  // Reset the session state
  const resetSession = useCallback(() => {
    // Stop polling first
    stopPolling();

    // Clear the session expiry timer
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // Close WebSocket connection if it exists
    if (wsConnectionRef.current) {
      wsConnectionRef.current.close();
      wsConnectionRef.current = null;
    }

    // Reset all session-related state variables
    setSessionId(null);
    setSessionData(null);
    setSessionStatus(null);
    setIsBlurred(true);
    setFiles([]);
    setErrorMessage(null);
    setUploadedFilesMap({});
    setUploadStatus("pending");
    setResultData(null);
    setIsLoading(false);

    // Reset meal type files
    setMealTypeFiles({
      breakfast: null,
      lunch: null,
      dinner: null,
    });
  }, [stopPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }

      // Close WebSocket connection on unmount
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close();
        wsConnectionRef.current = null;
      }

      // NOW we can safely clean up blob URLs when the component unmounts
      Object.values(blobUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current = {};
    };
  }, []);

  // Convert uploaded files to meal images for direct display
  const getUploadedMealImages = useCallback((): MealImage[] => {
    const result: MealImage[] = [
      {
        file: null,
        mealType: "breakfast",
        imagePreviewUrl: null,
        processingStep: "idle",
        isProcessing: false,
      },
      {
        file: null,
        mealType: "lunch",
        imagePreviewUrl: null,
        processingStep: "idle",
        isProcessing: false,
      },
      {
        file: null,
        mealType: "dinner",
        imagePreviewUrl: null,
        processingStep: "idle",
        isProcessing: false,
      },
    ];

    // Update images based on meal type files
    for (const mealType of ["breakfast", "lunch", "dinner"] as MealType[]) {
      const fileInfo = mealTypeFiles[mealType];
      if (fileInfo && uploadedFilesMap[fileInfo.file_id]) {
        const fileData = uploadedFilesMap[fileInfo.file_id] as DownloadedFile;

        // Find index for this meal type
        const index = result.findIndex((m) => m.mealType === mealType);
        if (index !== -1) {
          // Check if we already have a URL for this file
          const fileKey = `${fileInfo.file_id}`;
          let imageUrl: string | null = blobUrlsRef.current[fileKey];

          // Create URL only if needed
          if (!imageUrl && fileData.file) {
            imageUrl = URL.createObjectURL(fileData.file);
            blobUrlsRef.current[fileKey] = imageUrl;
          }

          result[index] = {
            file: fileData.file,
            mealType,
            imagePreviewUrl: imageUrl,
            processingStep: "complete",
            isProcessing: false,
          };
        }
      }
    }

    return result;
  }, [mealTypeFiles, uploadedFilesMap]);

  // Get processed files grouped by meal type
  const getProcessedFilesByMealType = useCallback((): Record<
    MealType,
    processedFiles[]
  > => {
    if (!files.length) return { breakfast: [], lunch: [], dinner: [] };

    const result: Record<MealType, processedFiles[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };

    files.forEach((file) => {
      if (
        file.status === "completed" &&
        file.meal_type &&
        uploadedFilesMap[file.file_id]
      ) {
        const fileData = uploadedFilesMap[file.file_id];

        // Check if fileData is a FoodDetectionResponse
        if ("processing_time_ms" in fileData) {
          result[file.meal_type].push({
            file,
            detectionResult: fileData as FoodDetectionResponse,
          });
        }
        // Otherwise it's just a DownloadedFile - you may want to handle this differently
        // based on your application's needs
      }
    });

    return result;
  }, [files, uploadedFilesMap]);

  return {
    sessionId,
    sessionData,
    sessionStatus,
    isBlurred,
    files,
    errorMessage,
    isPolling,
    isLoading,
    uploadStatus,
    resultData,
    processedFiles: getProcessedFilesByMealType(),
    uploadedMealImages: getUploadedMealImages(),
    mealTypeFiles,
    initializeQRCode,
    activateSession,
    startPolling,
    stopPolling,
    extendSession,
    closeSession,
    reset: resetSession,
  };
}

/**
 * Hook for searching foods by name (autocomplete)
 */
export function useSearchFoods() {
  return useApiCall<FoodAutocompleteResponse[], [string, number?]>(
    (query: string, limit?: number) => nutripeekApi.searchFoods(query, limit)
  );
}

/**
 * Hook for getting detailed nutrient information for a food item
 */
export function useFoodNutrients(
  foodId: string | null,
  executeOnMount = false
) {
  return useApiCall<FoodNutrientResponse, [string]>(
    (id: string) => nutripeekApi.getFoodNutrients(id),
    executeOnMount && foodId !== null,
    foodId ? [foodId] : undefined
  );
}

/**
 * Hook for calculating nutritional gaps for a child
 */
export function useCalculateNutrientGap() {
  return useApiCall<NutrientGapResponse, [NutrientGapRequest]>(
    (request: NutrientGapRequest) => nutripeekApi.calculateNutrientGap(request)
  );
}

/**
 * Hook for getting recommended nutrient intake for a child
 */
export function useGetNutrientIntake() {
  return useApiCall<
    NutrientIntakeResponse,
    [{ age: number; gender: "boy" | "girl" }]
  >((childProfile: { age: number; gender: "boy" | "girl" }) =>
    nutripeekApi.getNutrientIntake(childProfile)
  );
}
