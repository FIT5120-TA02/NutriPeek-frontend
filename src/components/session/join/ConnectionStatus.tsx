import React from "react";

type ConnectionStatusType = "connecting" | "connected" | "error" | "closed";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <div
      className={`mb-6 p-4 rounded-lg ${
        status === "connected"
          ? "bg-green-100 text-green-800"
          : status === "connecting"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "connected"
              ? "bg-green-500"
              : status === "connecting"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        ></div>
        <span className="font-medium">
          {status === "connected"
            ? "Connected"
            : status === "connecting"
              ? "Connecting..."
              : status === "closed"
                ? "Connection closed"
                : "Connection error"}
        </span>
      </div>
      {status === "closed" && (
        <p className="text-xs mt-1 text-gray-600">
          Redirecting to home page...
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus;
