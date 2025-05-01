'use client';

/**
 * Loading spinner for the NutriRecommend page
 */
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-green-700 font-medium">Loading recommendations...</p>
    </div>
  );
}