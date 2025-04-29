"use client";

/**
 * Game Over Screen Component
 * Displays the final score and options to play again
 * Shows appropriate animations based on the game outcome
 */
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { GameOverScreenProps } from './types';

export default function GameOverScreen({ 
  playerScore, 
  computerScore, 
  onReset, 
  onChangeDifficulty,
  onInit
}: GameOverScreenProps) {
  const t = useTranslations('MatchAndLearn');
  
  // Call onInit when component mounts
  useEffect(() => {
    onInit?.();
  }, [onInit]);
  
  // Determine if player won, lost, or tied
  const playerWon = playerScore > computerScore;
  const isTie = playerScore === computerScore;
  
  // Animation for confetti elements (used when player wins)
  const confettiElements = Array.from({ length: 100 }).map((_, i) => {
    const size = Math.random() * 15 + 5;
    const color = [
      'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 
      'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-orange-400', 'bg-teal-400', 'bg-indigo-400'
    ][Math.floor(Math.random() * 9)];
    
    return (
      <motion.div
        key={`confetti-${i}`}
        className={`absolute rounded-sm ${color}`}
        style={{
          width: size,
          height: size,
          top: '-5%',
          left: `${Math.random() * 100}%`,
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: `${Math.random() * 130 + 10}vh`,
          opacity: [0, 1, 1, 0],
          rotate: Math.random() * 360,
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          ease: "linear",
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    );
  });
  
  // Animation for food floating elements (used in case of tie)
  const tieAnimationElements = Array.from({ length: 30 }).map((_, i) => {
    const size = Math.random() * 35 + 20;
    const foods = ['🍎', '🍌', '🥦', '🥕', '🍗', '🥚', '🥛', '🍊', '🍚', '🍓', '🍅', '🥑', '🍕', '🍔', '🌮', '🥗', '🍇', '🍉']; 
    const food = foods[Math.floor(Math.random() * foods.length)];
    
    return (
      <motion.div
        key={`food-${i}`}
        className="absolute text-3xl"
        style={{
          fontSize: size,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.8,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: [0, 0.8, 0.8, 0],
          rotate: Math.random() * 360 - 180,
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          ease: "easeInOut",
          repeat: Infinity,
          delay: Math.random() * 3,
        }}
      >
        {food}
      </motion.div>
    );
  });
  
  // Animation for loss bubbles (used when player loses)
  const lossAnimationElements = Array.from({ length: 25 }).map((_, i) => {
    const size = Math.random() * 50 + 20;
    const colors = ['bg-blue-200', 'bg-blue-300', 'bg-indigo-200', 'bg-purple-200', 'bg-teal-200'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <motion.div
        key={`bubble-${i}`}
        className={`absolute rounded-full ${color} opacity-70`}
        style={{
          width: size,
          height: size,
          bottom: '-10%',
          left: `${Math.random() * 100}%`,
        }}
        initial={{ y: 0, opacity: 0 }}
        animate={{
          y: `-${Math.random() * 120 + 20}vh`,
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          ease: "easeOut",
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    );
  });
  
  return (
    <AnimatePresence>
      <motion.div
        key="game-over-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-b from-gray-600/50 to-gray-800/50 backdrop-blur-md p-4"
      >
        {/* Outcome-specific animations */}
        {playerWon && (
          <motion.div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {confettiElements}
          </motion.div>
        )}
        
        {isTie && (
          <motion.div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tieAnimationElements}
          </motion.div>
        )}
        
        {!playerWon && !isTie && (
          <motion.div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {lossAnimationElements}
          </motion.div>
        )}
        
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
        >
          {/* Game over title */}
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-center text-indigo-700 mb-6"
          >
            {t('game_over')}
          </motion.h2>
          
          {/* Game result message */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl font-bold text-center mb-6 ${
              playerWon ? 'text-green-600' : isTie ? 'text-blue-600' : 'text-orange-600'
            }`}
          >
            {playerWon 
              ? t('you_won') 
              : isTie 
                ? t('its_a_tie')
                : t('computer_won')
            }
          </motion.h3>
          
          {/* Score summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-around mb-8 text-center"
          >
            <div>
              <h4 className="text-lg font-semibold text-indigo-600">{t('your_score')}</h4>
              <p className="text-3xl font-bold">{playerScore}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-orange-600">{t('computer_score')}</h4>
              <p className="text-3xl font-bold">{computerScore}</p>
            </div>
          </motion.div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-colors"
            >
              {t('play_again')}
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onChangeDifficulty}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-bold shadow-md transition-colors"
            >
              {t('change_difficulty')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 