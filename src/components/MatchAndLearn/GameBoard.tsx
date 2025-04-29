"use client";

/**
 * Game Board Component
 * Displays the grid of cards for the Match & Learn game
 */
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { GameBoardProps } from './types';
import GameCard from './GameCard';

// Get optimal grid layout based on difficulty
const getGridLayout = (difficulty: string) => {
  // Define grid layouts that ensure at least 3 rows with equal cards per row
  // These layouts correspond to the updated card counts in MatchAndLearnGame.tsx
  
  switch (difficulty) {
    case 'easy':
      // 12 cards (6 pairs) in a 3x4 grid (3 rows, 4 columns)
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';
    
    case 'medium':
      // 24 cards (12 pairs) in a 4x6 grid (4 rows, 6 columns)
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
    
    case 'hard':
      // 40 cards (20 pairs) in a 5x8 grid (5 rows, 8 columns)
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2';
    
    default:
      return 'grid-cols-3 md:grid-cols-4 gap-3';
  }
};

export default function GameBoard({ 
  cards, 
  onCardFlip, 
  isPlayerTurn,
  computerThinking,
  difficulty
}: GameBoardProps) {
  const t = useTranslations('MatchAndLearn');
  
  // Determine if all cards should be disabled
  const areCardsDisabled = !isPlayerTurn || computerThinking;
  
  // Get the grid layout based on difficulty
  const gridClass = useMemo(() => getGridLayout(difficulty), [difficulty]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className={`grid ${gridClass} mx-auto max-w-5xl justify-center`}>
        {cards.map(card => (
          <GameCard
            key={card.id}
            card={card}
            onFlip={onCardFlip}
            isDisabled={areCardsDisabled}
          />
        ))}
      </div>
    </motion.div>
  );
} 