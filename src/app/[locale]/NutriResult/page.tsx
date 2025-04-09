'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ResultPage() {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`http://52.64.79.147:8000/api/v1/result/${shortcode}`);
        if (!response.ok) {
          throw new Error('Result not found');
        }
        const data = await response.json();
        setPrediction(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [shortcode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>No prediction found. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <motion.h1
        className="text-4xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Detection Result
      </motion.h1>
      <p className="text-2xl text-gray-700">Food: {prediction.label}</p>
      <p className="text-lg text-gray-500 mt-2">Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
    </div>
  );
}
