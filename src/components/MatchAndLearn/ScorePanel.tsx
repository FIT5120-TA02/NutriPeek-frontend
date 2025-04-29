"use client";

/**
 * Score Panel Component
 * Displays the current scores for both player and computer
 */
import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ScorePanelProps } from './types';

export default function ScorePanel({ playerScore, computerScore, totalPairs }: ScorePanelProps) {
  const t = useTranslations('MatchAndLearn');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-6 bg-white rounded-lg shadow-md p-3 w-full max-w-md"
    >
      <ScoreCard 
        label={t('your_score')} 
        score={playerScore} 
        isPlayer={true} 
      />
      
      <div className="text-lg font-bold text-gray-500">vs</div>
      
      <ScoreCard 
        label={t('computer_score')} 
        score={computerScore} 
        isPlayer={false} 
      />
    </motion.div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  isPlayer: boolean;
}

function ScoreCard({ label, score, isPlayer }: ScoreCardProps) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm ${isPlayer ? 'text-indigo-600' : 'text-orange-600'}`}>
        {label}
      </span>
      <motion.span 
        key={score}
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className={`text-2xl font-bold ${isPlayer ? 'text-indigo-700' : 'text-orange-700'}`}
      >
        {score}
      </motion.span>
    </div>
  );
} 