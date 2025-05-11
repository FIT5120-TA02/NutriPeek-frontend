import React from "react";

interface InstructionsProps {
  visible: boolean;
}

const Instructions: React.FC<InstructionsProps> = ({ visible }) => {
  if (!visible) return null;

  return (
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
            <li>Your desktop browser will automatically display the results</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
