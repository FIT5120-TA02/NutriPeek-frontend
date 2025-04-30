"use client";

/**
 * Turn Indicator Component
 * Shows whose turn it is in the game
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { TurnIndicatorProps } from './types';

export default function TurnIndicator({ isPlayerTurn, computerThinking }: TurnIndicatorProps) {
  const t = useTranslations('MatchAndLearn');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <AnimatePresence mode="wait">
        {isPlayerTurn ? (
          <motion.div
            key="player-turn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-indigo-100 border-2 border-indigo-400 text-indigo-700 font-bold 
                     px-5 py-2 rounded-lg shadow-md flex items-center"
          >
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
            {t('your_turn')}
          </motion.div>
        ) : (
          <motion.div
            key="computer-turn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-orange-100 border-2 border-orange-400 text-orange-700 font-bold 
                     px-5 py-2 rounded-lg shadow-md flex items-center"
          >
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            {computerThinking ? t('computer_thinking') : t('computer_turn')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 