"use client";

/**
 * Loading Spinner Component
 * Displays a loading spinner with an optional label
 */
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  center?: boolean;
}

/**
 * Loading spinner component
 */
export default function LoadingSpinner({ 
  size = 'medium', 
  label = 'Loading...', 
  center = true 
}: LoadingSpinnerProps) {
  // Define sizes
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const spinnerSize = sizes[size];
  
  return (
    <div className={`flex flex-col items-center ${center ? 'justify-center h-full min-h-40' : ''}`}>
      <motion.div
        className={`${spinnerSize} border-4 border-gray-200 border-t-green-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        data-testid="loading-spinner"
      />
      {label && (
        <span className="mt-2 text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
} 