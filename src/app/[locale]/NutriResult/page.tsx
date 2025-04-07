'use client';

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function NutriResultPage() {
  const searchParams = useSearchParams();
  const predictions = searchParams.get('predictions')?.split(',') || [];

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-6">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        NutriScan Results
      </motion.h1>

      {predictions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-96 max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Detected Items</h2>
          <ul className="list-disc list-inside text-gray-600">
            {predictions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">No predictions found. Please scan again.</p>
      )}
    </div>
  );
}
