"use client";

import { useRef, useState, useEffect } from "react";
import { QRCodeData, MealType, MealImage } from "./types";
import { MealScanCard } from "./Meal";
import { getMealTitle } from "./utils";
interface ScanningSectionProps {
  mealImages: MealImage[];
  isMobile: boolean;
  isLoading: boolean;
  qrData: QRCodeData | null;
  uploadStatus: string;
  errorMessage: string | null;
  isQrProcessing: boolean;
  isBlurred: boolean;
  regenerateQRCode: () => void;
  activateQRCode: () => void;
  closeQRSession: () => void;
  handleFileChange: (
    mealType: MealType,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleScan: (newImages: MealImage[] | null) => void;
}

export default function ScanningSection({
  mealImages,
  isMobile,
  isLoading,
  qrData,
  uploadStatus,
  errorMessage,
  isQrProcessing,
  isBlurred,
  regenerateQRCode,
  activateQRCode,
  closeQRSession,
  handleFileChange,
  handleScan,
}: ScanningSectionProps) {
  // Create refs for file inputs for each meal type
  const fileInputRefs = {
    breakfast: useRef<HTMLInputElement>(null),
    lunch: useRef<HTMLInputElement>(null),
    dinner: useRef<HTMLInputElement>(null),
  };

  // Create refs for camera inputs for each meal type
  const cameraInputRefs = {
    breakfast: useRef<HTMLInputElement>(null),
    lunch: useRef<HTMLInputElement>(null),
    dinner: useRef<HTMLInputElement>(null),
  };

  // Current slide index for carousel
  const [currentSlide, setCurrentSlide] = useState(1); // Start with lunch

  // Countdown timer for QR code session
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize countdown timer when QR code is activated
  useEffect(() => {
    if (qrData && !isBlurred && qrData.expires_in_seconds) {
      setTimeRemaining(qrData.expires_in_seconds);

      const timerInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [qrData, isBlurred]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if any meal has an image
  const hasAnyImage = mealImages.some((meal) => meal.file !== null);

  // Check if any meal is currently being processed
  const isAnyMealProcessing = mealImages.some((meal) => meal.isProcessing);

  // Get the count of uploaded images
  const uploadedCount = mealImages.filter((meal) => meal.file !== null).length;

  // Meal types array for mapping
  const mealTypes = ["breakfast", "lunch", "dinner"] as const;

  // Get processing status text
  const getProcessingStatusText = () => {
    const processingMeals = mealImages.filter((meal) => meal.isProcessing);
    if (processingMeals.length === 0) return "";

    if (processingMeals.length === 1) {
      const mealType = processingMeals[0].mealType;
      const readableMealType =
        mealType === "breakfast"
          ? "Breakfast"
          : mealType === "lunch"
            ? "Lunch"
            : mealType === "dinner"
              ? "Dinner"
              : "Meal";
      return `Processing ${readableMealType}...`;
    }

    return `Processing ${processingMeals.length} meals...`;
  };

  // Navigate to previous slide
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? mealImages.length - 1 : prev - 1));
  };

  // Navigate to next slide
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === mealImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* QR Code Section - Only shown on desktop */}
        {!isMobile && (
          <div className="flex flex-col items-center justify-center md:w-1/3 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Scan with Phone
            </h2>

            <div className="flex flex-col items-center">
              <div className={`mb-4 p-4 rounded-lg bg-gray-50 w-full`}>
                {isQrProcessing && !qrData && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 text-center mb-2">
                      Generating QR Code...
                    </p>
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
                    <div
                      className={`bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm ${isBlurred ? "relative" : ""}`}
                    >
                      <img
                        src={`data:image/png;base64,${qrData.qrcode_base64}`}
                        alt="Generated QR Code"
                        className={`w-full max-w-[180px] object-contain ${isBlurred ? "blur-sm" : ""}`}
                      />

                      {isBlurred && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={activateQRCode}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
                            disabled={isQrProcessing}
                          >
                            {isQrProcessing
                              ? "Activating..."
                              : "Activate Session"}
                          </button>
                        </div>
                      )}
                    </div>

                    {uploadStatus === "pending" && !isBlurred && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Waiting for upload...
                      </p>
                    )}

                    {uploadStatus === "uploaded" && (
                      <div className="mt-3 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-700">
                            Processing...
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(
                                100,
                                (mealImages.filter(
                                  (m) => m.processingStep === "complete"
                                ).length /
                                  Math.max(
                                    1,
                                    mealImages.filter((m) => m.isProcessing)
                                      .length
                                  )) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {qrData && (
                <div className="text-center mt-2 w-full">
                  <h3 className="font-medium text-gray-700 mb-2">
                    How to use:
                  </h3>

                  <ol className="text-left text-sm text-gray-600 space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">
                        1
                      </span>
                      Open your phone's camera app
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">
                        2
                      </span>
                      Point it at the QR code above
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">
                        3
                      </span>
                      Take photos of your meals when prompted
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 h-5 w-5 text-xs mr-2 mt-0.5">
                        4
                      </span>
                      Results will appear automatically on this screen
                    </li>
                  </ol>

                  {timeRemaining !== null && !isBlurred ? (
                    <div
                      className={`text-sm font-medium mb-1 ${timeRemaining < 60 ? "text-red-600" : "text-gray-600"}`}
                    >
                      Session expires in: {formatTimeRemaining(timeRemaining)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mb-1">
                      QR code expires in {qrData.expires_in_seconds} seconds
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={regenerateQRCode}
                      className="text-sm text-blue-500 hover:text-blue-700"
                      disabled={isQrProcessing}
                    >
                      {isQrProcessing
                        ? "Generating..."
                        : "Generate New QR Code"}
                    </button>

                    {!isBlurred && (
                      <button
                        onClick={closeQRSession}
                        className="mt-2 text-sm px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meal Scan Carousel Section */}
        <div className={`${!isMobile ? "md:w-2/3" : "w-full"}`}>
          {/* Hidden file and camera inputs for each meal type */}
          {mealTypes.map((mealType) => (
            <div key={mealType} className="hidden">
              <input
                ref={fileInputRefs[mealType]}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(mealType, e)}
                className="hidden"
                disabled={isLoading}
              />

              <input
                ref={cameraInputRefs[mealType]}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(mealType, e)}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          ))}

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
                <p className="text-sm text-blue-800 font-medium">
                  Upload at least one meal
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  You only need to upload one meal photo to start analysis. Add
                  more meals for a more complete picture of your nutrition.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Supports all common image formats including JPEG, PNG, and
                  HEIC/HEIF (iPhone photos).
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Upload Your Meals
            </h2>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg text-center">
                {getMealTitle(mealImages[currentSlide].mealType)}
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevSlide}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex space-x-1">
                  {mealImages.map((meal, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        index === currentSlide ? "bg-blue-500" : "bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                      title={getMealTitle(meal.mealType)}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNextSlide}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Current Slide */}
            <div className="transition-opacity duration-300">
              <MealScanCard
                key={mealImages[currentSlide].mealType}
                mealType={mealImages[currentSlide].mealType}
                file={mealImages[currentSlide].file}
                isProcessing={mealImages[currentSlide].isProcessing}
                processingStep={mealImages[currentSlide].processingStep}
                imagePreviewUrl={mealImages[currentSlide].imagePreviewUrl}
                fileInputRef={fileInputRefs[mealImages[currentSlide].mealType]}
              />
            </div>

            {/* Progress Status */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mealImages.map((meal, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      meal.file
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    title={`${getMealTitle(meal.mealType)} ${meal.file ? "uploaded" : "not uploaded"}`}
                  >
                    {meal.file ? (
                      <span className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1"
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
                        {getMealTitle(meal.mealType)}
                      </span>
                    ) : (
                      <span>{getMealTitle(meal.mealType)}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {uploadedCount} of 3 uploaded
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Ready to analyze?</h3>
                <p className="text-gray-600 text-sm">
                  {!hasAnyImage
                    ? "Upload at least one meal photo to proceed with analysis"
                    : uploadedCount === 1
                      ? "1 meal uploaded. You can analyze now or add more meals for a complete analysis."
                      : uploadedCount === 3
                        ? "All meals uploaded. You can proceed with a comprehensive analysis."
                        : `${uploadedCount} meals uploaded. You can proceed or add more meals.`}
                </p>

                {/* Processing status */}
                {isAnyMealProcessing && (
                  <div className="mt-3 mb-1 w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getProcessingStatusText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (mealImages.filter(
                              (m) => m.processingStep === "complete"
                            ).length /
                              Math.max(
                                1,
                                mealImages.filter((m) => m.isProcessing).length
                              )) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleScan(null)}
                className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 ${
                  hasAnyImage && !isAnyMealProcessing
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!hasAnyImage || isAnyMealProcessing}
              >
                {isAnyMealProcessing ? (
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
                    Processing...
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    Analyze Images
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
