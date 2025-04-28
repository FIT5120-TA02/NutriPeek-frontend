'use client';

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface FloatingEmojisLayoutProps {
  children: ReactNode;
  emojisCount?: number;
  backgroundClasses?: string;
}

/**
 * A layout component that displays floating food emojis in the background
 * Can be reused across multiple pages for consistent visual effect
 * 
 * @param children - Content to render inside the layout
 * @param emojisCount - Number of emojis to display (default: 30)
 * @param backgroundClasses - Additional classes for the background container
 */
export default function FloatingEmojisLayout({
  children,
  emojisCount = 30,
  backgroundClasses = "min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100"
}: FloatingEmojisLayoutProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    document.body.className = backgroundClasses;
    
    return () => {
      document.body.className = "";
    };
  }, [backgroundClasses]);

  // Food emojis for background
  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🥑", "🍞",
    "🍔", "🍉", "🍍", "🥗", "🥛", "🍗", 
    "🍑", "🥒", "🍓", "🍊", "🥦", "🥝", "🍌",
    "🍆", "🥬", "🧀", "🥕", "🫐", "🍅", "🥭"
  ];

  // Generate random positions only on client-side
  const generateRandomEmojis = () => {
    if (!mounted) return [];
    
    // Create more emojis to make them more frequent based on emojisCount
    const moreEmojis = Array(emojisCount).fill(null).map(() => 
      emojis[Math.floor(Math.random() * emojis.length)]
    );
    
    return moreEmojis.map((emoji, index) => {
      const randomX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      const randomX2 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY2 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      
      // Calculate random size between 1 and 2.5
      const randomSize = 1 + Math.random() * 1.5;
      
      // Calculate random speed/duration between 12 and 25 seconds
      const randomDuration = 12 + Math.random() * 13;
      
      return (
        <motion.div
          key={`emoji-${index}`}
          className="fixed text-5xl select-none pointer-events-none"
          style={{
            zIndex: -1,
            fontSize: `${randomSize}rem`
          }}
          initial={{ 
            x: randomX, 
            y: -100,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            x: [randomX, randomX2, randomX],
            y: [0, randomY, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, randomSize * 60, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: randomDuration, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          {emoji}
        </motion.div>
      );
    });
  };

  return (
    <>
      {/* Floating Emojis Background */}
      {mounted && (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
          {generateRandomEmojis()}
        </div>
      )}
      
      {/* Page Content */}
      {children}
    </>
  );
}