"use client";

/**
 * Game Card Component
 * Displays a single card in the Match & Learn game
 * Mobile-responsive design with optimized sizes for mobile devices
 */
import React from 'react';
import { motion } from 'framer-motion';
import { GameCardProps } from './types';

export default function GameCard({ card, onFlip, isDisabled, isMobile }: GameCardProps) {
  // Handle card click
  const handleClick = () => {
    if (!isDisabled && !card.isFlipped && !card.isMatched) {
      onFlip(card);
    }
  };
  
  // Determine if card is clickable
  const isClickable = !isDisabled && !card.isFlipped && !card.isMatched;
  
  // Define different animation scales based on device
  const animationScale = isMobile ? 0.9 : 0.8;
  
  // Define text sizes based on device
  const questionMarkSize = isMobile ? 'text-2xl' : 'text-4xl';
  const checkmarkSize = isMobile ? 'text-sm w-6 h-6' : 'text-lg w-8 h-8';
  
  // Define card padding based on device
  const cardPadding = isMobile ? 'p-1' : 'p-2';
  
  return (
    <motion.div
      className="aspect-square perspective-500"
      initial={{ scale: animationScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20, 
        delay: Math.random() * 0.3 
      }}
    >
      <div 
        onClick={handleClick}
        className={`w-full h-full relative preserve-3d transition-transform duration-500 ${
          card.isFlipped ? 'rotate-y-180' : ''
        } ${isClickable ? 'cursor-pointer hover:scale-105' : ''}
        ${card.isMatched ? '' : ''}`}
      >
        {/* Card back (question mark) */}
        <div className={`absolute w-full h-full backface-hidden rounded-xl shadow-md border-2 border-white flex items-center justify-center 
          ${card.isMatched ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
          <span className={`${questionMarkSize} text-white font-bold`}>{card.isMatched ? '✓' : '?'}</span>
        </div>
        
        {/* Card front (food image) */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-md border-2 ${cardPadding} flex flex-col items-center justify-center
          ${card.isMatched ? 'bg-green-100 border-green-400' : 'bg-white border-indigo-200'}`}>
          {card.isMatched && (
            <div className="absolute inset-0 bg-green-300 bg-opacity-30 flex items-center justify-center rounded-lg z-10">
              <div className={`bg-green-500 text-white rounded-full flex items-center justify-center ${checkmarkSize}`}>
                <span>✓</span>
              </div>
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center p-1 relative">
            <img 
              src={card.food.imageUrl} 
              alt={card.food.name}
              className={`object-contain max-h-full max-w-full ${card.isMatched ? 'opacity-90' : ''}`} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 