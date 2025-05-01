"use client";

/**
 * Avatar Feedback Component
 * Displays an animated character with emotions based on nutritional balance
 * Enhanced for a child-friendly, playful experience
 */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AvatarEmotion } from './types';
import { getAvatarImageUrl } from '@/utils/assetHelpers';

interface AvatarFeedbackProps {
  emotion: AvatarEmotion;
  message?: string;
}

/**
 * Map of emotion types to avatar image paths
 */
const AVATAR_IMAGES: Record<AvatarEmotion, string> = {
  happy: getAvatarImageUrl('happy'),
  neutral: getAvatarImageUrl('neutral'),
  sad: getAvatarImageUrl('sad')
};

/**
 * Enhanced avatar animations based on emotion
 */
const avatarAnimations: Record<AvatarEmotion, any> = {
  happy: {
    animate: {
      y: [0, -15, 0],
      rotate: [-2, 2, -2],
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut'
      }
    }
  },
  neutral: {
    animate: {
      rotate: [-3, 3, -3],
      scale: [1, 1.02, 1],
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut'
      }
    }
  },
  sad: {
    animate: {
      y: [0, -5, 0],
      scale: [1, 0.95, 1],
      rotate: [-1, 1, -1],
      transition: {
        repeat: Infinity,
        duration: 3.5,
        ease: 'easeInOut'
      }
    }
  }
};

/**
 * Speech bubble animations based on emotion
 */
const speechBubbleVariants = {
  initial: { 
    scale: 0.8, 
    opacity: 0, 
    y: 10 
  },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.3,
      ease: "backOut"
    }
  }
};

/**
 * Avatar feedback component with enhanced animations and visual effects
 */
export default function AvatarFeedback({ 
  emotion, 
  message
}: AvatarFeedbackProps) {
  const avatarImage = AVATAR_IMAGES[emotion];
  const animation = avatarAnimations[emotion];
  const [previousEmotion, setPreviousEmotion] = useState<AvatarEmotion>(emotion);
  const [animateChange, setAnimateChange] = useState(false);
  
  // Detect emotion changes to trigger transition animation
  useEffect(() => {
    if (previousEmotion !== emotion) {
      setAnimateChange(true);
      const timer = setTimeout(() => {
        setAnimateChange(false);
        setPreviousEmotion(emotion);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [emotion, previousEmotion]);
  
  // Determine background colors and effects based on emotion
  const bgColors = {
    happy: 'bg-gradient-to-br from-yellow-100 to-green-100 border-green-200',
    neutral: 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200',
    sad: 'bg-gradient-to-br from-gray-100 to-blue-100 border-blue-200'
  };
  
  // Determine emoji decorations based on emotion
  const emojis = {
    happy: ['🌟', '😄', '🎉'],
    neutral: ['🤔', '📝', '🔍'],
    sad: ['💧', '🥺', '💭']
  };
  
  return (
    <div className="flex flex-col items-center mt-2">
      {/* Decorative background blob */}
      <div className={`relative rounded-full p-6 ${bgColors[emotion]} border-2 transition-colors duration-500`}>
        {/* Animated decorative emojis */}
        {emojis[emotion].map((emoji, index) => (
          <motion.div
            key={`emoji-${index}`}
            className="absolute text-xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: [(index-1) * 30, (index-1) * 40, (index-1) * 30],
              y: [-20, -40, -20]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              delay: index * 0.8,
              ease: "easeInOut"
            }}
            style={{
              top: '10%',
              left: `${25 + (index * 20)}%`
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        {/* Avatar with emotion-specific animation */}
        <motion.div
          className="relative w-32 h-32"
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            ...animation.animate
          }}
          transition={{
            scale: { duration: 0.5, ease: 'backOut' },
            ...animation.transition
          }}
        >
          {/* Flash animation when emotion changes */}
          {animateChange && (
            <motion.div 
              className="absolute inset-0 bg-white rounded-full z-10"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
          
          <Image
            src={avatarImage}
            alt={`Avatar ${emotion} emotion`}
            fill
            className="object-contain drop-shadow-md"
          />
        </motion.div>
      </div>
      
      {/* Speech bubble with message - conditionally rendered */}
      {message && (
        <motion.div
          className="relative mt-4 bg-white px-5 py-3 rounded-2xl shadow-md w-full max-w-xs 
                    border-2 border-indigo-100 transform origin-top"
          variants={speechBubbleVariants}
          initial="initial"
          animate="animate"
        >
          {/* Speech bubble pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white border-l-2 border-t-2 border-indigo-100" />
          
          <p className="text-center text-gray-700 font-medium">{message}</p>
          
          {/* Animated indicator dots for a more interactive feel */}
          <div className="flex justify-center mt-2 space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-${i}`}
                className="w-2 h-2 bg-indigo-300 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 