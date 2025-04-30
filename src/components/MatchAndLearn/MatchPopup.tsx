"use client";

/**
 * Match Popup Component
 * Displays a popup with information about the matched food
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MatchPopupProps } from './types';
import { getAvatarImageUrl } from '@/utils/assetHelpers';

export default function MatchPopup({ food, isPlayerMatch, onClose }: MatchPopupProps) {
  const t = useTranslations('MatchAndLearn');
  
  // Use happy avatar for matches
  const avatarUrl = getAvatarImageUrl('happy');
  
  // Handle click on the background to close the popup
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the background, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-[2px] p-4 cursor-pointer"
      onClick={handleBackgroundClick}
    >
      <motion.div 
        className="bg-white/95 rounded-xl shadow-xl p-6 max-w-md w-full cursor-auto"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", delay: 0.1 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the popup content
      >
        <div className="flex flex-col items-center">
          {/* Match title with animation */}
          <motion.h3 
            className="text-2xl font-bold text-indigo-700 mb-4 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isPlayerMatch ? t('you_found_a_match') : t('computer_found_a_match')}
          </motion.h3>
          
          {/* Food image */}
          <motion.div 
            className="relative w-32 h-32 mb-4"
            initial={{ rotate: -5, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.3
            }}
          >
            <img
              src={food.imageUrl}
              alt={food.name}
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          {/* Food name */}
          <motion.h4 
            className="text-xl font-bold text-green-600 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {food.name}
          </motion.h4>
          
          {/* Food fact */}
          <motion.p 
            className="text-gray-600 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {food.fact}
          </motion.p>
          
          {/* Avatar reaction */}
          <motion.div 
            className="flex items-center mt-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="relative w-16 h-16 mr-3">
              <Image
                src={avatarUrl}
                alt="Happy avatar"
                fill
                className="object-contain"
              />
            </div>
            <motion.div 
              className="bg-indigo-100 p-3 rounded-lg"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-indigo-700 font-medium">
                {t('avatar_match_reaction')}
              </p>
            </motion.div>
          </motion.div>
          
          {/* Dismissal instruction */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-500 mt-4 text-center"
          >
            {t('click_anywhere_to_continue')}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
} 