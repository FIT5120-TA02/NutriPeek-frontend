'use client';

import { motion } from 'framer-motion';
import { ExtendedNutrientGap } from './types';
import InfoPopup from '@/components/ui/InfoPopup';
import { useEffect, useRef } from 'react';

interface NutrientListProps {
  nutrients: ExtendedNutrientGap[];
  activeNutrient: string | null;
  onSelectNutrient: (nutrientName: string) => void;
}

/**
 * Displays a list of missing nutrients with progress bars
 * Supports horizontal scrolling on small screens and vertical scrolling on large screens
 */
export default function NutrientList({ 
  nutrients, 
  activeNutrient, 
  onSelectNutrient 
}: NutrientListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll active nutrient into view when it changes
  useEffect(() => {
    if (activeNutrient && scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-nutrient="${activeNutrient}"]`);
      
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [activeNutrient]);

  // Content for the recommendation explanation
  const recommendationContent = (
    <div className="max-w-[300px]">
      <p className="font-medium text-gray-800 mb-2">How are ingredients recommended?</p>
      <p className="mb-2">
        Our recommendation system identifies nutritional gaps in your meal plan and searches our database for ingredients rich in those missing nutrients.
      </p>
      <p className="mb-2">
        We analyze your current ingredients, determine which food groups need supplementing, and suggest options that provide the highest nutritional value while complementing your existing food items.
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
      <div className="flex items-center mb-3">
        <h2 className="font-bold text-lg text-gray-800">Missing Nutrients</h2>
        <InfoPopup 
          content={recommendationContent}
          position="bottom"
          iconSize={18}
          iconClassName="ml-2 text-gray-400"
        />
      </div>
      
      {/* Responsive container that switches between horizontal and vertical layout */}
      <div 
        ref={scrollContainerRef}
        className="lg:space-y-2 lg:max-h-[400px] lg:overflow-y-auto lg:pr-2 
                  flex lg:flex-col overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar"
      >
        {nutrients.map((nutrient) => (
          <motion.div
            key={nutrient.name}
            data-nutrient={nutrient.name}
            className={`cursor-pointer rounded-lg p-3 transition-all flex-shrink-0 
                      lg:w-auto w-[280px] mx-1 lg:mx-0 ${
              activeNutrient === nutrient.name
                ? 'bg-green-100 border-l-4 border-green-500'
                : nutrient.isAdjustedForActivity
                ? 'bg-blue-50 hover:bg-blue-100'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => onSelectNutrient(nutrient.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">{nutrient.name}</span>
                {nutrient.isAdjustedForActivity && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    Adjusted
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold">
                <span className={nutrient.updatedPercentage > nutrient.percentage ? 'text-green-600' : 'text-gray-600'}>
                  {Math.min(Math.round(nutrient.updatedPercentage), 100)}%
                </span>
                {nutrient.updatedPercentage > nutrient.percentage && (
                  <span className="text-gray-400 ml-1">
                    (↑{Math.round(nutrient.updatedPercentage - nutrient.percentage)}%)
                  </span>
                )}
              </div>
            </div>
            {nutrient.isAdjustedForActivity && (
              <div className="text-xs text-blue-600 mt-1 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Increased target due to high activity level
              </div>
            )}
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${nutrient.isAdjustedForActivity ? 'bg-blue-400' : 'bg-gray-400'}`}
                style={{ width: `${Math.min(Math.round(nutrient.percentage), 100)}%` }}
              ></div>
              {nutrient.updatedPercentage > nutrient.percentage && (
                <div
                  className="h-full bg-green-400 -mt-2"
                  style={{ 
                    width: `${Math.min(Math.round(nutrient.updatedPercentage - nutrient.percentage), 100 - Math.round(nutrient.percentage))}%`,
                    marginLeft: `${Math.min(Math.round(nutrient.percentage), 100)}%`
                  }}
                ></div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Add a style to hide scrollbar but keep functionality
const styleElement = document.createElement('style');
styleElement.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleElement);
}