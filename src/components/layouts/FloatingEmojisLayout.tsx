'use client';

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface FloatingEmojisLayoutProps {
  children: ReactNode;
  emojis?: string[];
  emojisCount?: number;
  backgroundClasses?: string;
}

interface EmojiProps {
  emoji: string;
  x: number;
  x2: number;
  y: number;
  size: number;
  duration: number;
}

/**
 * A layout component that displays floating food emojis in the background
 * Can be reused across multiple pages for consistent visual effect
 * 
 * @param children - Content to render inside the layout
 * @param emojis - Array of emoji characters to display (optional)
 * @param emojisCount - Number of emojis to display (default: 30)
 * @param backgroundClasses - Additional classes for the background container
 */
export default function FloatingEmojisLayout({
  children,
  emojis,
  emojisCount = 30,
  backgroundClasses = "min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100"
}: FloatingEmojisLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [emojisData, setEmojisData] = useState<EmojiProps[]>([]);
  
  // Default food emojis for background if none provided
  const defaultEmojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🥑", "🍞",
    "🍔", "🍉", "🍍", "🥗", "🥛", "🍗", 
    "🍑", "🥒", "🍓", "🍊", "🥦", "🥝", "🍌",
    "🍆", "🥬", "🧀", "🥕", "🫐", "🍅", "🥭"
  ];
  
  // Use provided emojis or fall back to defaults
  const displayEmojis = emojis || defaultEmojis;

  // Generate random emoji data once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && emojisData.length === 0) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight * 2;
      
      // Create more emojis to make them more frequent based on emojisCount
      const newEmojisData = Array(emojisCount).fill(null).map(() => {
        const randomX = Math.random() * windowWidth;
        const randomX2 = Math.random() * windowWidth;
        const randomY = Math.random() * windowHeight;
        // Calculate random size between 1 and 2.5
        const randomSize = 1 + Math.random() * 1.5;
        // Calculate random speed/duration between 12 and 25 seconds
        const randomDuration = 12 + Math.random() * 13;
        
        return {
          emoji: displayEmojis[Math.floor(Math.random() * displayEmojis.length)],
          x: randomX,
          x2: randomX2,
          y: randomY,
          size: randomSize,
          duration: randomDuration
        };
      });
      
      setEmojisData(newEmojisData);
      setMounted(true);
    }
    
    document.body.className = backgroundClasses;
    
    return () => {
      document.body.className = "";
    };
  }, [backgroundClasses, emojisCount, emojisData.length, displayEmojis]);

  return (
    <>
      {/* Floating Emojis Background */}
      {mounted && (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
          {emojisData.map((emojiData, index) => (
            <motion.div
              key={`emoji-${index}`}
              className="fixed text-5xl select-none pointer-events-none"
              style={{
                zIndex: -1,
                fontSize: `${emojiData.size}rem`
              }}
              initial={{ 
                x: emojiData.x, 
                y: -100,
                opacity: 0,
                rotate: 0
              }}
              animate={{ 
                x: [emojiData.x, emojiData.x2, emojiData.x],
                y: [0, emojiData.y, 0],
                opacity: [0.15, 0.35, 0.15],
                rotate: [0, emojiData.size * 60, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: emojiData.duration, 
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
            >
              {emojiData.emoji}
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Page Content */}
      {children}
    </>
  );
}