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
  handleFileChange: (mealType: MealType, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleScan: (newImages: MealImage[] | null) => void;
}

/* Meal-type visual config — SVG icons only, no emoji */
function MealIcon({ type, className }: { type: MealType; className?: string }) {
  if (type === "breakfast")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M17.66 17.66l1.41 1.41M20 12h2M17.66 6.34l1.41-1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  if (type === "lunch")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

const MEAL_META: Record<MealType, { accent: string; ring: string; badge: string; label: string }> = {
  breakfast: { accent: "text-amber-600",  ring: "border-amber-200",  badge: "bg-amber-50 text-amber-700",  label: "Breakfast" },
  lunch:     { accent: "text-orange-600", ring: "border-orange-200", badge: "bg-orange-50 text-orange-700", label: "Lunch"     },
  dinner:    { accent: "text-indigo-600", ring: "border-indigo-200", badge: "bg-indigo-50 text-indigo-700", label: "Dinner"    },
};

export default function ScanningSection({
  mealImages, isMobile, isLoading, qrData, uploadStatus, errorMessage,
  isQrProcessing, isBlurred, regenerateQRCode, activateQRCode, closeQRSession,
  handleFileChange, handleScan,
}: ScanningSectionProps) {
  const fileInputRefs   = { breakfast: useRef<HTMLInputElement>(null), lunch: useRef<HTMLInputElement>(null), dinner: useRef<HTMLInputElement>(null) };
  const cameraInputRefs = { breakfast: useRef<HTMLInputElement>(null), lunch: useRef<HTMLInputElement>(null), dinner: useRef<HTMLInputElement>(null) };
  const mealTypes = ["breakfast", "lunch", "dinner"] as const;

  const [currentSlide, setCurrentSlide]     = useState(1);
  const [timeRemaining, setTimeRemaining]   = useState<number | null>(null);
  const [showQR, setShowQR]                 = useState(false);

  useEffect(() => {
    if (qrData && !isBlurred && qrData.expires_in_seconds) {
      setTimeRemaining(qrData.expires_in_seconds);
      const t = setInterval(() => setTimeRemaining((p) => (!p || p <= 0 ? (clearInterval(t), 0) : p - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [qrData, isBlurred]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const hasAnyImage         = mealImages.some((m) => m.file !== null);
  const isAnyMealProcessing = mealImages.some((m) => m.isProcessing);
  const uploadedCount       = mealImages.filter((m) => m.file !== null).length;

  return (
    <div className="w-full max-w-4xl space-y-5">
      {/* Hidden file inputs */}
      {mealTypes.map((t) => (
        <div key={t} className="hidden">
          <input ref={fileInputRefs[t]}   type="file" accept="image/*"                  onChange={(e) => handleFileChange(t, e)} disabled={isLoading} />
          <input ref={cameraInputRefs[t]} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(t, e)} disabled={isLoading} />
        </div>
      ))}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 px-8 py-7 text-white shadow-md">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1.5">Step 1 — Upload</p>
          <h1 className="text-2xl font-bold leading-snug mb-1">What did your child eat today?</h1>
          <p className="text-sm opacity-75 leading-relaxed">Upload a photo of at least one meal. Our AI will identify the food items automatically.</p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 -bottom-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Meal cards */}
      {isMobile ? (
        <div>
          <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-colors ${
            mealImages[currentSlide].file ? "border-green-400" : MEAL_META[mealImages[currentSlide].mealType].ring
          }`}>
            <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100">
              <MealIcon type={mealImages[currentSlide].mealType} className={`w-4 h-4 ${MEAL_META[mealImages[currentSlide].mealType].accent}`} />
              <span className="text-sm font-semibold text-gray-700">{MEAL_META[mealImages[currentSlide].mealType].label}</span>
              {mealImages[currentSlide].file && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 rounded-full px-2.5 py-0.5 font-medium">Uploaded</span>
              )}
            </div>
            <div className="p-5">
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
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <button onClick={() => setCurrentSlide((p) => (p === 0 ? 2 : p - 1))}
              className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:shadow transition-shadow" disabled={isLoading}>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {mealImages.map((m, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all duration-200 ${i === currentSlide ? "w-6 h-2.5 bg-green-500" : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"}`} />
            ))}
            <button onClick={() => setCurrentSlide((p) => (p === 2 ? 0 : p + 1))}
              className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:shadow transition-shadow" disabled={isLoading}>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {mealImages.map((meal) => {
            const meta = MEAL_META[meal.mealType];
            const uploaded = !!meal.file;
            return (
              <div key={meal.mealType}
                className={`rounded-2xl border-2 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${uploaded ? "border-green-400" : meta.ring}`}>
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                  <MealIcon type={meal.mealType} className={`w-4 h-4 ${uploaded ? "text-green-600" : meta.accent}`} />
                  <span className={`text-sm font-semibold ${uploaded ? "text-green-700" : "text-gray-700"}`}>{meta.label}</span>
                  {uploaded && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <MealScanCard
                    mealType={meal.mealType}
                    file={meal.file}
                    isProcessing={meal.isProcessing}
                    processingStep={meal.processingStep}
                    imagePreviewUrl={meal.imagePreviewUrl}
                    fileInputRef={fileInputRefs[meal.mealType]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Processing bar */}
      {isAnyMealProcessing && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Identifying food items…
            </span>
            <span className="text-xs text-blue-400 font-medium">
              {mealImages.filter((m) => m.processingStep === "complete").length} / {mealImages.filter((m) => m.isProcessing).length}
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (mealImages.filter((m) => m.processingStep === "complete").length / Math.max(1, mealImages.filter((m) => m.isProcessing).length)) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3 pt-1">
        {/* Phone QR — desktop only */}
        {!isMobile && (
          <div className="relative">
            <button onClick={() => setShowQR((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showQR ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Upload from phone
              <svg className={`w-3.5 h-3.5 transition-transform ${showQR ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showQR && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-30">
                {isQrProcessing && !qrData && (
                  <div className="flex flex-col items-center py-5">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mb-2" />
                    <p className="text-sm text-gray-400">Generating QR code…</p>
                  </div>
                )}
                {errorMessage && (
                  <div className="text-center py-3">
                    <p className="text-sm text-red-500 mb-2">{errorMessage}</p>
                    <button onClick={regenerateQRCode} className="text-sm text-blue-500 hover:underline">Try again</button>
                  </div>
                )}
                {qrData && (
                  <div className="flex gap-4 items-start">
                    <div className="relative flex-shrink-0">
                      <img src={`data:image/png;base64,${qrData.qrcode_base64}`} alt="QR Code"
                        className={`w-24 h-24 rounded-xl border border-gray-100 ${isBlurred ? "blur-sm" : ""}`} />
                      {isBlurred && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
                          <button onClick={activateQRCode} disabled={isQrProcessing}
                            className="px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg shadow font-medium hover:bg-gray-50">
                            {isQrProcessing ? "Activating…" : "Activate"}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-700">How to use</p>
                      {["Open your phone camera", "Scan this QR code", "Take meal photos", "Results appear automatically"].map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-500 font-bold text-[10px] flex-shrink-0">{i + 1}</span>
                          {s}
                        </div>
                      ))}
                      {timeRemaining !== null && !isBlurred && (
                        <p className={`text-xs font-medium pt-1 ${timeRemaining < 60 ? "text-red-500" : "text-gray-400"}`}>
                          Expires in {formatTime(timeRemaining)}
                        </p>
                      )}
                      <div className="flex gap-3 pt-1">
                        <button onClick={regenerateQRCode} disabled={isQrProcessing} className="text-xs text-blue-500 hover:underline">
                          {isQrProcessing ? "Generating…" : "New code"}
                        </button>
                        {!isBlurred && <button onClick={closeQRSession} className="text-xs text-gray-400 hover:underline">End session</button>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        <span className="text-sm text-gray-400 font-medium">{uploadedCount} / 3 uploaded</span>

        <button
          onClick={() => handleScan(null)}
          disabled={!hasAnyImage || isAnyMealProcessing}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            hasAnyImage && !isAnyMealProcessing
              ? "bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isAnyMealProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing…
            </>
          ) : (
            <>
              Analyse Meals
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>

      {!hasAnyImage && (
        <p className="text-xs text-gray-400 text-center pt-1">
          Upload at least one meal photo to continue &mdash; JPEG, PNG and HEIC are supported.
        </p>
      )}
    </div>
  );
}