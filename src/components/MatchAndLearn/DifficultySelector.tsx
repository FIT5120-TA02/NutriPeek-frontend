"use client";

/**
 * Difficulty Selector Component
 * Allows the user to select a difficulty level for the game
 */
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { DifficultySelectorProps, DifficultyLevel } from './types';
import useDeviceDetection from '@/hooks/useDeviceDetection';
import { DIFFICULTY_LEVELS } from './constants';

export default function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  const t = useTranslations('MatchAndLearn');
  const { isMobile } = useDeviceDetection();
  const [isLoading, setIsLoading] = useState<DifficultyLevel | null>(null);
  
  const getDifficultyDescription = (difficulty: DifficultyLevel) => {
    const desktopCards = DIFFICULTY_LEVELS[difficulty].desktop;
    const mobileCards = DIFFICULTY_LEVELS[difficulty].mobile;
    
    const desktopPairs = desktopCards / 2;
    const mobilePairs = mobileCards / 2;
    
    // Format the main description using the desktop values
    const mainDescription = t('difficulty_format', {
      pairs: isMobile ? mobilePairs : desktopPairs,
      cards: isMobile ? mobileCards : desktopCards
    });
    
    return mainDescription;
  };
  
  const handleSelectDifficulty = async (difficulty: DifficultyLevel) => {
    setIsLoading(difficulty);
    try {
      await onSelectDifficulty(difficulty);
    } catch (error) {
      console.error('Error selecting difficulty:', error);
    } finally {
      setIsLoading(null);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full mx-auto"
      >
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          {t('choose_difficulty')}
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          {t('difficulty_description')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DifficultyCard
            title={t('easy')}
            description={getDifficultyDescription('easy')}
            onClick={() => handleSelectDifficulty('easy')}
            color="from-green-400 to-green-500"
            isLoading={isLoading === 'easy'}
          />
          
          <DifficultyCard
            title={t('medium')}
            description={getDifficultyDescription('medium')}
            onClick={() => handleSelectDifficulty('medium')}
            color="from-blue-400 to-blue-500"
            isLoading={isLoading === 'medium'}
          />
          
          <DifficultyCard
            title={t('hard')}
            description={getDifficultyDescription('hard')}
            onClick={() => handleSelectDifficulty('hard')}
            color="from-purple-400 to-purple-500"
            isLoading={isLoading === 'hard'}
          />
        </div>
      </motion.div>
    </div>
  );
}

interface DifficultyCardProps {
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  isLoading: boolean;
}

function DifficultyCard({ title, description, onClick, color, isLoading }: DifficultyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      className={`bg-gradient-to-br ${color} text-white rounded-lg p-4 shadow-md ${isLoading ? 'opacity-75' : 'cursor-pointer'}`}
      onClick={isLoading ? undefined : onClick}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm mb-2 opacity-90">{description}</p>
      <div className="flex justify-between items-center">
        {isLoading && (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        )}
      </div>
    </motion.div>
  );
} 