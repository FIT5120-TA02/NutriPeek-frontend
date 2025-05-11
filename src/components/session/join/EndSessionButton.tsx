import React from "react";
import { toast } from "sonner";
import { nutripeekApi } from "../../../api/nutripeekApi";
import { useRouter } from "next/navigation";

interface EndSessionButtonProps {
  sessionId: string | null;
  wsConnection: WebSocket | null;
  onSessionEnd: () => void;
}

const EndSessionButton: React.FC<EndSessionButtonProps> = ({
  sessionId,
  wsConnection,
  onSessionEnd,
}) => {
  const router = useRouter();

  const handleCloseSession = async () => {
    if (!sessionId) return;

    try {
      // Attempt to close WebSocket first
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.close();
      }

      // Call API to close the session
      await nutripeekApi.closeSession(sessionId);
      toast.success("Session ended successfully");

      // Trigger callback
      onSessionEnd();

      // Redirect back to home after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close session");
    }
  };

  return (
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
  );
};

export default EndSessionButton;
