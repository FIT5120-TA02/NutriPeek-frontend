import React from 'react';
import { RecommendationType } from '@/api/types';
import { motion } from 'framer-motion';

interface RecommendationTypeToggleProps {
  selectedType: RecommendationType;
  onTypeChange: (type: RecommendationType) => void;
  selectedRegion?: string | null;
}

/**
 * Toggle component for switching between different recommendation types
 */
const RecommendationTypeToggle: React.FC<RecommendationTypeToggleProps> = ({
  selectedType,
  onTypeChange,
  selectedRegion
}) => {
  return (
    <div className="relative">
      <div className="bg-white rounded-full shadow p-1 flex items-center justify-between w-full max-w-md mx-auto mb-4">
        <button
          className={`py-2 px-4 rounded-full transition-all flex-1 text-center ${
            selectedType === RecommendationType.STANDARD
              ? 'bg-green-500 text-white font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onTypeChange(RecommendationType.STANDARD)}
        >
          Standard
        </button>
        <button
          className={`py-2 px-4 rounded-full transition-all flex-1 text-center ${
            selectedType === RecommendationType.OPTIMIZED
              ? 'bg-green-500 text-white font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onTypeChange(RecommendationType.OPTIMIZED)}
        >
          Optimized
        </button>
        <button
          className={`py-2 px-4 rounded-full transition-all flex-1 text-center ${
            selectedType === RecommendationType.SEASONAL
              ? 'bg-green-500 text-white font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onTypeChange(RecommendationType.SEASONAL)}
        >
          Seasonal
        </button>
      </div>
    </div>
  );
};

export default RecommendationTypeToggle; 