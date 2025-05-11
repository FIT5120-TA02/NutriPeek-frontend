import React, { useRef, useState } from "react";
import { nutripeekApi } from "../../../api/nutripeekApi";
import { MealType } from "../../../api/types";
import { toast } from "sonner";

interface ImageUploaderProps {
  isConnected: boolean;
  sessionId: string | null;
  selectedMealType: MealType;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  isConnected,
  sessionId,
  selectedMealType,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Process the selected file, converting if necessary
  const processSelectedFile = async (file: File) => {
    try {
      // Check if file needs conversion for proper previewing
      if (nutripeekApi.isImageConversionNeeded(file)) {
        setIsConverting(true);
        toast.info("Converting image for compatibility...");

        try {
          // Use the conversion service
          const convertResult = await nutripeekApi.convertImage(file, "JPEG");

          // Create preview URL from the converted file
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          setPreviewUrl(convertResult.url);
          setSelectedFile(convertResult.file);

          toast.success("Image converted successfully");
        } catch (error) {
          console.error("Error converting image:", error);
          toast.error("Could not convert image, using original");

          // Fallback to original file if conversion fails
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
          setSelectedFile(file);
        } finally {
          setIsConverting(false);
        }
      } else {
        // No conversion needed - use file as is
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process image");

      // Fallback: use original file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    }
  };

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processSelectedFile(file);

    // Clear input values to allow re-selecting the same file
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
      // Upload file to the session (conversion will happen automatically if needed)
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {isConverting ? (
        // Conversion in progress indicator
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-700 font-medium">Converting image...</p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a moment for large files and HEIC/HEIF formats
          </p>
        </div>
      ) : previewUrl ? (
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
              disabled={isUploading || !isConnected}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                isUploading || !isConnected
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

          {selectedFile && (
            <div className="mt-2 text-xs text-gray-500">
              <p>
                File: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
              <p>Type: {selectedFile.type || "Unknown"}</p>
            </div>
          )}
        </div>
      ) : (
        // File selection options
        <>
          <h2 className="text-xl font-semibold mb-4">Upload Your Meal</h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleCameraCapture}
              disabled={isUploading || !isConnected}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                isConnected && !isUploading
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
              disabled={isUploading || !isConnected}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium ${
                isConnected && !isUploading
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
        disabled={isUploading || !isConnected}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading || !isConnected}
      />
    </div>
  );
};

export default ImageUploader;
