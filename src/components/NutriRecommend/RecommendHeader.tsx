'use client';

import { motion } from 'framer-motion';
import BackButton from '@/components/ui/BackButton';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { ChildProfile } from '@/types/profile';

interface RecommendHeaderProps {
  selectedChild: ChildProfile | null;
}

/**
 * Header component for the NutriRecommend page showing back button, title, and child avatar
 */
export default function RecommendHeader({ selectedChild }: RecommendHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="w-1/4">
        <BackButton href="/NutriGap" label="Back" />
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