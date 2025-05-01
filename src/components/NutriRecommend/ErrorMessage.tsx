'use client';

import { useRouter } from 'next/navigation';

interface ErrorMessageProps {
  message: string;
}

/**
 * Error message component for the NutriRecommend page
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="bg-red-100 p-6 rounded-lg shadow-md max-w-md w-full mx-4 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Oops!</h2>
        <p className="text-red-600 mb-4">{message}</p>
        <button 
          onClick={() => router.push('/NutriScan')}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Go to Scan
        </button>
      </div>
    </div>
  );
}