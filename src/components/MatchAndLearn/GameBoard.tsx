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

// Get optimal grid layout based on difficulty and device
const getGridLayout = (difficulty: string, isMobile: boolean) => {
  if (isMobile) {
    // Mobile-optimized layouts
    switch (difficulty) {
      case 'easy':
        // 8 cards (4 pairs) in a 4x2 grid (4 rows, 2 columns)
        return 'grid-cols-2 gap-2';
      
      case 'medium':
        // 12 cards (6 pairs) in a 4x3 grid (4 rows, 3 columns)
        return 'grid-cols-3 gap-2';
      
      case 'hard':
        // 16 cards (8 pairs) in a 4x4 grid (4 rows, 4 columns)
        return 'grid-cols-4 gap-2';
      
      default:
        return 'grid-cols-4 gap-2';
    }
  } else {
    // Desktop layouts
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
  }
};

export default function GameBoard({ 
  cards, 
  onCardFlip, 
  isPlayerTurn,
  computerThinking,
  difficulty,
  isMobile
}: GameBoardProps) {
  const t = useTranslations('MatchAndLearn');
  
  // Determine if all cards should be disabled
  const areCardsDisabled = !isPlayerTurn || computerThinking;
  
  // Get the grid layout based on difficulty and device
  const gridClass = useMemo(() => getGridLayout(difficulty, isMobile), [difficulty, isMobile]);
  
  // Calculate the max width for the game board based on difficulty and device
  const maxWidthClass = useMemo(() => {
    if (isMobile) {
      // Mobile has fixed width based on difficulty
      switch (difficulty) {
        case 'easy':
        case 'medium':
          return 'max-w-[320px]';
        case 'hard':
          return 'max-w-[360px]';
        default:
          return 'max-w-[320px]';
      }
    } else {
      // Desktop uses responsive max-width
      return 'max-w-5xl';
    }
  }, [difficulty, isMobile]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className={`grid ${gridClass} mx-auto ${maxWidthClass} justify-center`}>
        {cards.map(card => (
          <GameCard
            key={card.id}
            card={card}
            onFlip={onCardFlip}
            isDisabled={areCardsDisabled}
            isMobile={isMobile}
          />
        ))}
      </div>
    </motion.div>
  );
} 