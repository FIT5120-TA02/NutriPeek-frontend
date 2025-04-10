'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
        setPrediction(parsedItems);
      } catch (err) {
        console.error('Failed to parse items', err);
      }
    }
  }, [searchParams]);

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading or No prediction found...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <motion.h1 className="text-4xl font-bold mb-6 text-gray-800">
        Nutrition Analysis Results
      </motion.h1>
      {prediction.map((item: any, index: number) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 w-80 mb-4">
          <p className="text-lg font-semibold">Detected: {item.class_name}</p>
          <p className="text-gray-600">Confidence: {(item.confidence * 100).toFixed(2)}%</p>
        </div>
      ))}
    </div>
  );
}
