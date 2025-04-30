"use client";

/**
 * Difficulty Selector Component
 * Allows the user to select a difficulty level for the game
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { DifficultySelectorProps } from './types';

export default function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  const t = useTranslations('MatchAndLearn');
  
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
            description={t('easy_description')}
            pairs={5}
            onClick={() => onSelectDifficulty('easy')}
            color="from-green-400 to-green-500"
          />
          
          <DifficultyCard
            title={t('medium')}
            description={t('medium_description')}
            pairs={12}
            onClick={() => onSelectDifficulty('medium')}
            color="from-blue-400 to-blue-500"
          />
          
          <DifficultyCard
            title={t('hard')}
            description={t('hard_description')}
            pairs={26}
            onClick={() => onSelectDifficulty('hard')}
            color="from-purple-400 to-purple-500"
          />
        </div>
      </motion.div>
    </div>
  );
}

interface DifficultyCardProps {
  title: string;
  description: string;
  pairs: number;
  onClick: () => void;
  color: string;
}

function DifficultyCard({ title, description, pairs, onClick, color }: DifficultyCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-br ${color} text-white rounded-lg p-4 shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm mb-2 opacity-90">{description}</p>
      <p className="font-bold">{pairs} pairs</p>
    </motion.div>
  );
} 