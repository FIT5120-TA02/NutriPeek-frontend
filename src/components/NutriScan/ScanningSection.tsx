'use client';

import { QRCodeData } from './types';

interface ScanningSectionProps {
  image: File | null;
  isMobile: boolean;
  isLoading: boolean;
  processingStep: 'idle' | 'detecting' | 'mapping' | 'complete';
  imagePreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  qrData: QRCodeData | null;
  uploadStatus: string;
  errorMessage: string | null;
  isQrProcessing: boolean;
  regenerateQRCode: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCameraCapture: () => void;
  handleScan: () => void;
}

export default function ScanningSection({
  image,
  isMobile,
  isLoading,
  processingStep,
  imagePreviewUrl,
  fileInputRef,
  cameraInputRef,
  qrData,
  uploadStatus,
  errorMessage,
  isQrProcessing,
  regenerateQRCode,
  handleFileChange,
  handleCameraCapture,
  handleScan
}: ScanningSectionProps) {
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
  
  // Calculate the processing progress for the animation
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      {/* Upload Local Image Section */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-4 text-center">Upload Image</h2>
        
        <div className="flex-grow flex flex-col justify-center">
          {/* Hidden file input for regular uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          
          {/* Hidden camera input for mobile devices */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          
          {image && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-2">File selected: {image.name}</p>
              <img 
                src={imagePreviewUrl || ''} 
                alt="Preview" 
                className="w-full h-40 object-contain rounded border"
              />
            </div>
          )}
          
          {/* Processing indicator */}
          {isLoading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{getProcessingText()}</span>
                <span className="text-sm font-medium text-gray-700">
                  {processingStep === 'detecting' ? '50%' : 
                   processingStep === 'mapping' ? '75%' : 
                   processingStep === 'complete' ? '100%' : '25%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out ${getProcessingProgress()}`}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Detecting</span>
                <span>Mapping</span>
                <span>Complete</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Browse Files
            </button>
            
            {isMobile && (
              <button
                onClick={handleCameraCapture}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Take Photo
              </button>
            )}
          </div>
          
          <button
            onClick={handleScan}
            className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || !image}
          >
            {isLoading ? getProcessingText() : 'Analyze Image'}
          </button>
        </div>
      </div>

      {/* QR Code Section - Only shown on desktop */}
      {!isMobile && (
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Scan with Phone</h2>
          
          <div className="flex flex-col items-center">
            <div className={`mb-4 p-4 rounded-lg ${uploadStatus === 'uploaded' ? 'bg-blue-50' : uploadStatus === 'processed' ? 'bg-green-50' : 'bg-gray-50'}`}>
              {isQrProcessing && !qrData && (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500 text-center mb-2">Generating QR Code...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              
              {errorMessage && (
                <div className="py-6">
                  <p className="text-red-500 text-center">{errorMessage}</p>
                  <button 
                    onClick={regenerateQRCode}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {qrData && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <img 
                      src={`data:image/png;base64,${qrData.qrcode_base64}`} 
                      alt="Generated QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  {uploadStatus === 'pending' && (
                    <p className="text-sm text-gray-500 text-center mt-2">Waiting for upload...</p>
                  )}
                  
                  {uploadStatus === 'uploaded' && (
                    <div>
                      {/* Mobile Processing Steps */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-700">Processing...</span>
                          <span className="text-sm font-medium text-blue-700">
                            {processingStep === 'detecting' ? '50%' : 
                            processingStep === 'mapping' ? '75%' : 
                            processingStep === 'complete' ? '100%' : '25%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out ${getProcessingProgress()}`}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Detecting</span>
                          <span>Mapping</span>
                          <span>Results</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {qrData && (
              <div className="text-center mt-2">
                <h3 className="font-medium text-gray-700 mb-2">How to use:</h3>
                
                <ol className="text-left text-sm text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">1</span>
                    Open your phone's camera app
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">2</span>
                    Point it at the QR code above
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">3</span>
                    Take a photo of your food when prompted
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">4</span>
                    Results will appear automatically on this screen
                  </li>
                </ol>
                
                <div className="text-xs text-gray-400 mb-1">QR code expires in {qrData.expires_in_seconds} seconds</div>
                
                <button 
                  onClick={regenerateQRCode}
                  className="text-sm text-blue-500 hover:text-blue-700"
                  disabled={isQrProcessing}
                >
                  {isQrProcessing ? 'Generating...' : 'Generate New QR Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}