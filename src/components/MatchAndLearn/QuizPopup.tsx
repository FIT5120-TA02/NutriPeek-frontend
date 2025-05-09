"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Food } from './types';

interface QuizPopupProps {
  quizFood: Food;
  incorrectOptions: Food[];
  onAnswer: (isCorrect: boolean) => void;
}

export default function QuizPopup({ quizFood, incorrectOptions, onAnswer }: QuizPopupProps) {
  const t = useTranslations('MatchAndLearn');
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to answer
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState<Food[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState(0); // 0: normal, 1: getting urgent, 2: very urgent

  // Update urgency level based on time left
  useEffect(() => {
    if (showResult) return; // Don't update urgency level if result is showing
    
    if (timeLeft <= 10 && timeLeft > 5) {
      setUrgencyLevel(1); // Getting urgent
    } else if (timeLeft <= 5) {
      setUrgencyLevel(2); // Very urgent
    } else {
      setUrgencyLevel(0); // Normal
    }
  }, [timeLeft, showResult]);

  // Shuffle the options when component mounts
  useEffect(() => {
    const allOptions = [quizFood, ...incorrectOptions];
    // Fisher-Yates shuffle algorithm
    const shuffled = [...allOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOptions(shuffled);
  }, [quizFood, incorrectOptions]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleOptionClick('timeout');
    }
  }, [timeLeft, showResult]);

  const handleOptionClick = (foodId: string) => {
    if (showResult) return; // Prevent multiple selections
    
    setSelectedOption(foodId);
    
    const correct = foodId === quizFood.id.toString();
    setIsCorrect(correct);
    setShowResult(true);
    
    // After showing the result for 2 seconds, call the onAnswer callback
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  // Clock timer animation, intensity increases as time runs out
  const clockAnimation = {
    animate: showResult ? 
      { scale: 1, rotate: 0 } : // Stop animation when showing result
      {
        scale: [1, 1.05, 1],
        rotate: urgencyLevel === 2 
          ? [-5, 0, 5, 0] 
          : urgencyLevel === 1 
            ? [-3, 0, 3, 0] 
            : [-1, 0, 1, 0],
        transition: { 
          repeat: Infinity,
          duration: urgencyLevel === 2 ? 0.4 : urgencyLevel === 1 ? 0.7 : 1,
          ease: "easeInOut",
          times: [0, 0.25, 0.75, 1]
        }
      }
  };

  // Card container animation - shake from the beginning, increase intensity with time
  const cardContainerAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: showResult ? 
      { scale: 1, opacity: 1, x: 0 } : // Stop shaking when showing result
      { 
        scale: 1, 
        opacity: 1,
        x: urgencyLevel === 2 
          ? [0, -5, 5, -5, 0] 
          : urgencyLevel === 1 
            ? [0, -3, 3, 0] 
            : [0, -1, 1, 0], // Always have a slight shake
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          x: {
            repeat: Infinity,
            duration: urgencyLevel === 2 ? 0.5 : urgencyLevel === 1 ? 0.8 : 1.2,
            ease: "easeInOut"
          }
        }
      },
    exit: { scale: 0.8, opacity: 0 }
  };

  // Generate clock and fire emojis for the background - always visible, increasing in number and intensity
  const generateBackgroundElements = () => {
    // If showing result, don't show background elements
    if (showResult) return null;
    
    // Calculate count based on urgency level and timeLeft
    const baseCount = 5; // Always have at least some emojis
    const urgencyMultiplier = urgencyLevel === 2 ? 3 : urgencyLevel === 1 ? 2 : 1;
    const count = baseCount * urgencyMultiplier;
    
    // Select emojis based on urgency
    const clockEmojis = ['⏰', '⌚', '⏱️', '⏳'];
    const urgentEmojis = ['🔥', '⚡', '💥', '⚠️'];
    
    // Mix emojis based on urgency level
    let emojis = [];
    if (urgencyLevel === 2) {
      emojis = [...clockEmojis, ...urgentEmojis]; // More urgent emojis at high urgency
    } else if (urgencyLevel === 1) {
      emojis = [...clockEmojis, urgentEmojis[0]]; // Add just one urgent emoji
    } else {
      emojis = clockEmojis; // Only clock emojis at normal level
    }
    
    return Array.from({ length: count }).map((_, i) => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const size = Math.random() * 20 + 15; // Reduced emoji size
      const speed = urgencyLevel === 2 ? 2 : urgencyLevel === 1 ? 3 : 4; // Faster at higher urgency
      
      return (
        <motion.div
          key={`bg-emoji-${i}`}
          className="absolute text-2xl pointer-events-none select-none z-0" // Reduced text size
          style={{
            fontSize: size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))",
            opacity: urgencyLevel === 2 ? 0.8 : urgencyLevel === 1 ? 0.6 : 0.4, // More visible at higher urgency
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, urgencyLevel === 2 ? 0.8 : urgencyLevel === 1 ? 0.6 : 0.4, 0],
            scale: [0, 1, 0.8],
            rotate: Math.random() > 0.5 ? 360 : -360,
            y: [0, Math.random() > 0.5 ? 60 : -60] // Reduced movement
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        >
          {emoji}
        </motion.div>
      );
    });
  };
  
  // Generate ticking sound visualization - animated circles representing sound waves
  const generateTickingVisualization = () => {
    // If showing result, don't show ticking visualization
    if (showResult) return null;
    
    // Only show for urgency level 1 and 2
    if (urgencyLevel === 0) return null;
    
    const count = urgencyLevel === 2 ? 4 : 2;
    
    return (
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none z-0">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={`tick-${i}`}
            className={`rounded-full mx-1 ${
              urgencyLevel === 2 ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{
              width: (i + 1) * 2.5, // Slightly smaller
              height: (i + 1) * 2.5
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0.9, 0.7]
            }}
            transition={{
              duration: urgencyLevel === 2 ? 0.5 : 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md p-4 overflow-hidden
        ${showResult && isCorrect 
          ? 'bg-gradient-to-b from-green-600/30 to-green-800/30' // Green background for correct answer
          : showResult && !isCorrect
            ? 'bg-gradient-to-b from-red-600/30 to-red-800/30' // Red background for incorrect answer
            : urgencyLevel === 2 
              ? 'bg-gradient-to-b from-red-600/40 to-orange-700/40' 
              : urgencyLevel === 1 
                ? 'bg-gradient-to-b from-amber-600/30 to-gray-700/40' 
                : 'bg-gradient-to-b from-blue-500/20 to-gray-700/30'}`}
    >
      {/* Background animation elements */}
      {!showResult && generateBackgroundElements()}
      
      {/* Animated countdown bar */}
      {!showResult && (
        <motion.div 
          className={`absolute top-0 left-0 h-1.5 ${/* Thinner bar */
            urgencyLevel === 2 ? 'bg-red-500' : urgencyLevel === 1 ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / 15) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      )}
      
      <motion.div
        variants={cardContainerAnimation}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-xl w-11/12 shadow-2xl relative overflow-hidden z-10
          max-h-[80vh] overflow-y-auto
          ${showResult && isCorrect 
            ? 'border-3 border-green-500' // Thinner border
            : showResult && !isCorrect
              ? 'border-3 border-red-500' // Thinner border
              : urgencyLevel === 2 
                ? 'border-3 border-red-500' 
                : urgencyLevel === 1 
                  ? 'border-3 border-amber-500' 
                  : 'border-3 border-blue-400'}`}
      >
        {generateTickingVisualization()}
        
        <div className="absolute top-2 right-2 flex items-center"> {/* Reduced spacing */}
          <motion.div
            variants={clockAnimation}
            animate="animate"
            className={`flex items-center justify-center rounded-full font-bold px-2 py-0.5 text-sm ${/* Smaller timer */
              showResult && isCorrect 
                ? 'bg-green-100 text-green-700 border-2 border-green-500' // Green timer for correct
                : showResult && !isCorrect
                  ? 'bg-red-100 text-red-700 border-2 border-red-500' // Red timer for incorrect
                  : urgencyLevel === 2 
                    ? 'bg-red-100 text-red-700 border-2 border-red-500' 
                    : urgencyLevel === 1 
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-500' 
                      : 'bg-blue-100 text-blue-600 border-2 border-blue-400'
              }`}
          >
            {showResult ? (isCorrect ? '✓' : '✗') : `${timeLeft}s`}
          </motion.div>
        </div>

        <motion.h2
          animate={showResult ? 
            { scale: 1 } : // Stop animation when showing result
            {
              scale: [1, 1.05, 1],
              transition: { 
                scale: { repeat: Infinity, duration: urgencyLevel === 2 ? 0.5 : urgencyLevel === 1 ? 0.8 : 1.2 }
              }
            }
          }
          className={`text-lg md:text-xl font-bold text-center mb-3 ${/* Smaller heading */
            showResult && isCorrect 
              ? 'text-green-600' // Green text for correct
              : showResult && !isCorrect
                ? 'text-red-600' // Red text for incorrect
                : urgencyLevel === 2 
                  ? 'text-red-600' 
                  : urgencyLevel === 1 
                    ? 'text-amber-600' 
                    : 'text-blue-600'
            }`}
        >
          {showResult 
            ? (isCorrect ? t('quiz_correct_answer') : t('quiz_wrong_answer'))
            : (urgencyLevel === 2 ? t('hurry_up') : t('final_challenge'))}
        </motion.h2>
        
        <p className="text-gray-700 mb-4 text-center text-sm"> {/* Smaller text */}
          {t('quiz_instruction')}
        </p>
        
        <div className={`p-3 rounded-lg mb-4 text-sm ${/* Smaller fact box */
          showResult && isCorrect 
            ? 'bg-green-50 border-l-4 border-green-500' // Green panel for correct
            : showResult && !isCorrect
              ? 'bg-red-50 border-l-4 border-red-500' // Red panel for incorrect
              : urgencyLevel === 2 
                ? 'bg-red-50 border-l-4 border-red-500' 
                : urgencyLevel === 1 
                  ? 'bg-amber-50 border-l-4 border-amber-500' 
                  : 'bg-blue-50 border-l-4 border-blue-400'
          }`}
        >
          <p className={`font-bold mb-1 ${/* Smaller spacing */
            showResult && isCorrect 
              ? 'text-green-700' // Green text for correct
              : showResult && !isCorrect
                ? 'text-red-700' // Red text for incorrect
                : urgencyLevel === 2 
                  ? 'text-red-700' 
                  : urgencyLevel === 1 
                    ? 'text-amber-700' 
                    : 'text-blue-700'
            }`}>{t('food_fact_prefix')}</p>
          <p className="italic text-sm">"{quizFood.fact}"</p> {/* Smaller text */}
        </div>
        
        <div className="grid grid-cols-2 gap-3"> {/* Reduced gap */}
          {options.map((food) => (
            <motion.div
              key={food.id}
              whileHover={!showResult ? { scale: 1.03 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              animate={
                showResult ? {} : {
                  y: urgencyLevel === 2 
                    ? [0, -2, 0, 2, 0] 
                    : urgencyLevel === 1 
                      ? [0, -1, 0, 1, 0] 
                      : [0, -0.5, 0, 0.5, 0],
                  transition: { 
                    repeat: Infinity, 
                    duration: urgencyLevel === 2 ? 0.5 : urgencyLevel === 1 ? 0.8 : 1.2
                  }
                }
              }
              onClick={() => handleOptionClick(food.id.toString())}
              className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${/* Reduced padding */
                showResult
                  ? food.id.toString() === quizFood.id.toString()
                    ? 'border-green-500 bg-green-50'
                    : selectedOption === food.id.toString()
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  : urgencyLevel === 2
                    ? 'border-red-300 hover:border-red-400 shadow-md'
                    : urgencyLevel === 1
                      ? 'border-amber-300 hover:border-amber-400'
                      : 'border-blue-300 hover:border-blue-400'
              }`}
            >
              <div className="aspect-square relative overflow-hidden rounded-md mb-1 p-1"> {/* Smaller spacing */}
                <div className="relative w-full h-full">
                  <Image
                    src={food.imageUrl}
                    alt={food.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100px, 140px" /* Smaller image sizes */
                  />
                </div>
              </div>
              <p className="text-center font-medium capitalize text-sm">{food.name}</p> {/* Smaller text */}
            </motion.div>
          ))}
        </div>
        
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`mt-3 p-2 rounded-lg text-center font-medium text-sm ${/* Smaller result message */
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isCorrect ? t('quiz_correct_answer') : t('quiz_wrong_answer')}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 