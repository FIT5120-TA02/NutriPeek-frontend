'use client';

import { useState } from 'react';
import { MealType } from '../types';
import { getMealTitle } from '../utils';

interface MealScanCardProps {
  mealType: MealType;
  file: File | null;
  isProcessing: boolean;
  processingStep: 'idle' | 'detecting' | 'mapping' | 'complete';
  imagePreviewUrl: string | null;
  isMobile: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCameraCapture: () => void;
}

export default function MealScanCard({
  mealType,
  file,
  isProcessing,
  processingStep,
  imagePreviewUrl,
  isMobile,
  fileInputRef,
  cameraInputRef,
  onFileChange,
  onCameraCapture
}: MealScanCardProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Helper to get processing progress percentage
  const getProcessingProgress = () => {
    switch (processingStep) {
      case 'detecting':
        return 'w-1/2'; // 50% progress
      case 'mapping':
        return 'w-3/4'; // 75% progress
      case 'complete':
        return 'w-full'; // 100% progress
      default:
        return 'w-1/4'; // 25% progress when starting
    }
  };

  // Helper to get processing text
  const getProcessingText = () => {
    switch (processingStep) {
      case 'detecting':
        return 'Detecting food items...';
      case 'mapping':
        return 'Mapping nutrients...';
      default:
        return 'Processing...';
    }
  };

  // Toggle the image expanded state
  const toggleImageExpand = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 w-full flex flex-col ${!file ? 'border-2 border-dashed border-gray-300' : ''}`}>
      <div className="flex-grow flex flex-col justify-center">
        {/* Image preview */}
        {file && imagePreviewUrl && (
          <div className="mb-4 relative">
            <div 
              className={`relative overflow-hidden rounded border cursor-pointer ${isImageExpanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4' : 'h-40'}`}
              onClick={toggleImageExpand}
            >
              <img 
                src={imagePreviewUrl} 
                alt={`${getMealTitle(mealType)} Preview`} 
                className={`${isImageExpanded ? 'max-h-[90vh] max-w-[90vw] object-contain' : 'w-full h-full object-contain'}`}
              />
              
              {/* Close button for expanded view */}
              {isImageExpanded && (
                <button
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageExpanded(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Expand hint icon */}
              {!isImageExpanded && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1 truncate">{file.name}</p>
            <p className="text-xs text-blue-500 mt-1 text-center">Tap image to {isImageExpanded ? 'close' : 'expand'}</p>
          </div>
        )}
        
        {/* Empty state (no file uploaded yet) */}
        {!file && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-gray-100 rounded-full p-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              Upload your {getMealTitle(mealType).toLowerCase()} photo
            </p>
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{getProcessingText()}</span>
              <span className="text-sm font-medium text-gray-700">
                {processingStep === 'detecting' ? '50%' : 
                 processingStep === 'mapping' ? '75%' : 
                 processingStep === 'complete' ? '100%' : '25%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out ${getProcessingProgress()}`}></div>
            </div>
          </div>
        )}
        
        {/* Upload buttons - only show if not processing */}
        {!isProcessing && (
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              disabled={isProcessing}
            >
              {file ? 'Change Photo' : 'Browse Files'}
            </button>
            
            {isMobile && (
              <button
                onClick={onCameraCapture}
                className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                disabled={isProcessing}
              >
                {file ? 'Take New Photo' : 'Take Photo'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 