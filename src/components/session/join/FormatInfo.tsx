import React from "react";

interface FormatInfoProps {
  visible: boolean;
}

const FormatInfo: React.FC<FormatInfoProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="mt-0.5 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
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
          <p className="text-sm text-gray-700 font-medium">Supported Formats</p>
          <p className="text-xs text-gray-600 mt-1">
            JPEG, PNG, WebP, HEIC/HEIF, and more. Large or incompatible images
            will be automatically converted for optimal quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormatInfo;
