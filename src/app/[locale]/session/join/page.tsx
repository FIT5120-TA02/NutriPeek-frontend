"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { nutripeekApi } from "../../../../api/nutripeekApi";
import { MealType } from "../../../../api/types";
import {
  ConnectionStatus,
  MealTypeSelector,
  ImageUploader,
  FormatInfo,
  Instructions,
  EndSessionButton,
} from "../../../../components/session/join";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error" | "closed"
  >("connecting");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
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

  // Handler for session end
  const handleSessionEnd = () => {
    // Stop polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Update UI state
    setConnectionStatus("closed");
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

  // Check if we should show the instructions and format info
  const showInfoComponents = connectionStatus === "connected";

  return (
    <div className="w-full max-w-6xl min-h-screen px-4 pt-20 md:pt-24 pb-16 flex flex-col bg-gradient-to-b from-blue-50 to-green-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">NutriPeek Upload</h1>
        <p className="text-gray-600 mt-2">
          Upload or take a photo of your meal to analyze
        </p>
      </div>

      {/* Connection status */}
      <ConnectionStatus status={connectionStatus} />

      {/* Meal type selection */}
      <MealTypeSelector
        selectedMealType={selectedMealType}
        onChange={setSelectedMealType}
        disabled={connectionStatus !== "connected"}
      />

      {/* Image uploader */}
      <ImageUploader
        isConnected={connectionStatus === "connected"}
        sessionId={sessionId}
        selectedMealType={selectedMealType}
      />

      {/* Format Info */}
      <FormatInfo visible={showInfoComponents} />

      {/* Instructions */}
      <Instructions visible={showInfoComponents} />

      {/* End Session Button */}
      {connectionStatus === "connected" && (
        <EndSessionButton
          sessionId={sessionId}
          wsConnection={wsConnection}
          onSessionEnd={handleSessionEnd}
        />
      )}
    </div>
  );
}
