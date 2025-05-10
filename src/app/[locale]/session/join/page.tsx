"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { nutripeekApi } from "../../../../api/nutripeekApi";
import { MealType } from "../../../../api/types";
import Image from "next/image";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error" | "closed"
  >("connecting");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get session ID from URL parameters
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSessionId(id);
    } else {
      toast.error("No session ID provided");
      setConnectionStatus("error");
    }
  }, [searchParams]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Setup polling to check session status periodically
  useEffect(() => {
    if (
      !sessionId ||
      connectionStatus === "error" ||
      connectionStatus === "closed"
    ) {
      return;
    }

    // Function to poll the session status
    const pollSessionStatus = async () => {
      try {
        const status = await nutripeekApi.getSessionStatus(sessionId);

        // If session is no longer active, update UI and potentially redirect
        if (status.status === "closed" || status.status === "expired") {
          setConnectionStatus("closed");

          // If WebSocket is still connected, close it
          if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            wsConnection.close();
            setWsConnection(null);
          }

          // Show a notification about the session being ended
          toast.info(
            `Session ${status.status === "closed" ? "ended by host" : "expired"}`,
            {
              duration: 5000,
            }
          );

          // Redirect after a short delay
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } catch (error) {
        console.error("Error polling session status:", error);
      }
    };

    // Start polling - every 10 seconds is a good balance between responsiveness and efficiency
    pollingIntervalRef.current = setInterval(pollSessionStatus, 10000);

    // Clean up interval on unmount or status change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [sessionId, connectionStatus, router, wsConnection]);

  // Connect to WebSocket when session ID is available
  useEffect(() => {
    if (!sessionId) return;

    const connectToSession = async () => {
      try {
        // First, join the session via API call
        const joinResponse = await nutripeekApi.joinSession(sessionId);

        if (
          joinResponse.status !== "active" &&
          joinResponse.status !== "created"
        ) {
          toast.error(`Cannot join session: ${joinResponse.message}`);
          setConnectionStatus("error");
          return;
        }

        // Then establish WebSocket connection
        const ws = nutripeekApi.connectToSessionWebSocket(
          sessionId,
          // onOpen
          () => {
            setConnectionStatus("connected");
            toast.success("Connected to session");
          },
          // onMessage
          (data) => {
            // Check for session status updates
            const statusUpdate =
              nutripeekApi.isSessionStatusUpdateMessage(data);
            if (statusUpdate.isStatusUpdate && statusUpdate.status) {
              // Handle closed or expired session status
              if (
                statusUpdate.status === "closed" ||
                statusUpdate.status === "expired"
              ) {
                setConnectionStatus("closed");

                // Show a notification about the session being ended
                const message =
                  statusUpdate.status === "closed"
                    ? "Session ended by host"
                    : "Session has expired";

                toast.info(message, {
                  duration: 5000,
                });

                // Redirect after a short delay
                setTimeout(() => {
                  router.push("/");
                }, 3000);
              }
            }
          },
          // onClose
          () => {
            setConnectionStatus("closed");
            toast.info("Connection closed");
          },
          // onError
          (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus("error");
            toast.error("Connection error");
          }
        );

        if (ws) {
          setWsConnection(ws);
        }
      } catch (error) {
        console.error("Error connecting to session:", error);
        setConnectionStatus("error");
        toast.error("Failed to join session");
      }
    };

    connectToSession();

    // Cleanup function
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }

      // Also clean up any polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [sessionId, router]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    // Clear input values
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !sessionId) {
      toast.error("No file selected or session not available");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to the session
      const uploadResponse = await nutripeekApi.uploadFileToSession(
        sessionId,
        selectedFile,
        selectedMealType
      );

      if (uploadResponse.status === "completed") {
        toast.success("File uploaded successfully!");

        // Clear selected file and preview
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        // Show success message with instructions to return to desktop
        toast.success("Image uploaded! Check your computer for results.", {
          duration: 5000,
        });
      } else {
        toast.error(`Upload failed: ${uploadResponse.message}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
    setIsUploading(false);
  };

  // Close the session
  const handleCloseSession = async () => {
    if (!sessionId) return;

    try {
      // Attempt to close WebSocket first
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }

      // Clean up polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Call API to close the session
      await nutripeekApi.closeSession(sessionId);
      toast.success("Session ended successfully");
      setConnectionStatus("closed");

      // Redirect back to home after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close session");
    }
  };

  // Cancel file selection
  const handleCancelSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  // Trigger camera capture
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Trigger file selection
  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Redirect to home if connection is closed or error
  useEffect(() => {
    if (connectionStatus === "closed") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, router]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-green-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">NutriPeek Upload</h1>
        <p className="text-gray-600 mt-2">
          Upload or take a photo of your meal to analyze
        </p>
      </div>

      {/* Connection status */}
      <div
        className={`mb-6 p-4 rounded-lg ${
          connectionStatus === "connected"
            ? "bg-green-100 text-green-800"
            : connectionStatus === "connecting"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          ></div>
          <span className="font-medium">
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
                ? "Connecting..."
                : connectionStatus === "closed"
                  ? "Connection closed"
                  : "Connection error"}
          </span>
        </div>
        {connectionStatus === "closed" && (
          <p className="text-xs mt-1 text-gray-600">
            Redirecting to home page...
          </p>
        )}
      </div>

      {/* Meal type selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Meal Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["breakfast", "lunch", "dinner"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={`py-3 px-4 rounded-lg border transition-colors ${
                selectedMealType === type
                  ? "bg-blue-100 border-blue-500 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              disabled={connectionStatus !== "connected"}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview & Upload UI */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {previewUrl ? (
          // Image preview and upload controls
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Preview & Confirm</h2>

            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Selected meal"
                className="object-contain w-full h-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpload}
                disabled={isUploading || connectionStatus !== "connected"}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                  isUploading || connectionStatus !== "connected"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirm Upload
                  </>
                )}
              </button>

              <button
                onClick={handleCancelSelection}
                disabled={isUploading}
                className="py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // File selection options
          <>
            <h2 className="text-xl font-semibold mb-4">Upload Your Meal</h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleCameraCapture}
                disabled={isUploading || connectionStatus !== "connected"}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                  connectionStatus === "connected" && !isUploading
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Take Photo
              </button>

              <button
                onClick={handleFileSelection}
                disabled={isUploading || connectionStatus !== "connected"}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                  connectionStatus === "connected" && !isUploading
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Upload from Gallery
              </button>
            </div>
          </>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || connectionStatus !== "connected"}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || connectionStatus !== "connected"}
        />
      </div>

      {/* Instructions */}
      {!previewUrl && connectionStatus === "connected" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="mt-0.5 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Instructions</p>
              <ol className="text-sm text-blue-600 mt-1 space-y-1 list-decimal pl-5">
                <li>Select the meal type (breakfast, lunch, or dinner)</li>
                <li>Take a photo or upload an image of your meal</li>
                <li>Confirm your selection to upload</li>
                <li>
                  Your desktop browser will automatically display the results
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* End Session Button - shown if connected */}
      {connectionStatus === "connected" && (
        <div className="mt-4 bg-gray-100 rounded-lg p-4 flex flex-col items-center">
          <p className="text-gray-700 mb-2 text-center">
            Finished uploading your meal photos?
          </p>
          <button
            onClick={handleCloseSession}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            End Session
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This will close the connection and return to home screen
          </p>
        </div>
      )}
    </div>
  );
}
