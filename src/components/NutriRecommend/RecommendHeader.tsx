'use client';

import { motion } from 'framer-motion';
import BackButton from '@/components/ui/BackButton';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { ChildProfile } from '@/types/profile';
import TooltipButton from '@/components/ui/TooltipButton';
import { useMemo } from 'react';

interface RecommendHeaderProps {
  selectedChild: ChildProfile | null;
  hasNewSelections?: boolean;
}

/**
 * Header component for the NutriRecommend page showing back button, title, and child avatar
 */
export default function RecommendHeader({ 
  selectedChild, 
  hasNewSelections = false
}: RecommendHeaderProps) {
  
  // Determine if the back button should be disabled
  const isBackButtonDisabled = useMemo(() => {
    // Use the hasNewSelections prop passed from the parent component
    return hasNewSelections;
  }, [hasNewSelections]);
  
  // Tooltip message for disabled back button
  const disabledTooltip = "Please deselect new foods or save your selection before going back. Navigating away will lose your current selections.";
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="w-1/4">
        {isBackButtonDisabled ? (
          <TooltipButton
            onClick={() => window.history.back()}
            disabled={true}
            disabledTooltip={disabledTooltip}
            position="bottom"
            className="flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </TooltipButton>
        ) : (
          <BackButton href="/NutriGap" label="Back" />
        )}
      </div>
      
      <motion.div
        className="text-center w-2/4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-green-700">Fill Your Nutrition Gaps</h1>
        <p className="text-gray-600 text-sm md:text-base">Select foods to improve your child's nutrition</p>
      </motion.div>
      
      {selectedChild && (
        <motion.div
          className="flex justify-end items-center w-1/4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex flex-col items-end mr-3 text-right">
            <p className="font-bold text-sm md:text-base text-gray-800">{selectedChild.name}</p>
            <p className="text-xs text-gray-500">{selectedChild.age} years old</p>
          </div>
          <ChildAvatar
            name={selectedChild.name}
            gender={selectedChild.gender}
            size={50}
          />
        </motion.div>
      )}
    </div>
  );
}