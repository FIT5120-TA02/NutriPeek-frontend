'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

interface PullableSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  handleLabel?: string;
  backgroundColor?: string;
  handleColor?: string;
  sheetWidth?: string;
  navbarHeight?: string;
}

/**
 * A sheet component that can be pulled from the right side of the screen
 * Features a trapezoid-shaped pull handle for intuitive interaction
 */
const PullableSheet: React.FC<PullableSheetProps> = ({
  children,
  isOpen,
  onOpenChange,
  title = 'Saved Items',
  handleLabel = 'Saved Items',
  backgroundColor = 'bg-white',
  handleColor = 'bg-green-500',
  sheetWidth = '350px',
  navbarHeight = '72px', // Default navbar height
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState('100dvh');
  
  // Motion values for smooth animations
  const x = useMotionValue(0);
  const springX = useSpring(x, { damping: 100, stiffness: 700 });
  
  // Transform x value to control opacity of sheet content
  const contentOpacity = useTransform(
    x, 
    [0, 100, 200], 
    [1, 0.8, 0.5]
  );
  
  // Calculate sheet height based on viewport and navbar
  useEffect(() => {
    const calculateHeight = () => {
      // If we're on mobile or tablet where navbar might be hidden
      if (window.innerWidth < 768) {
        setSheetHeight('100dvh');
      } else {
        // On desktop, account for navbar
        setSheetHeight(`calc(100dvh - ${navbarHeight})`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [navbarHeight]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        sheetRef.current && 
        !sheetRef.current.contains(event.target as Node) && 
        handleRef.current && 
        !handleRef.current.contains(event.target as Node)
      ) {
        // Check if the click is on a popover or overlay (high z-index elements)
        const target = event.target as HTMLElement;
        // Don't close if clicking on something with a higher z-index than our sheet
        const targetZIndex = window.getComputedStyle(target).zIndex;
        const sheetZIndex = sheetRef.current ? window.getComputedStyle(sheetRef.current).zIndex : '40';
        
        if (targetZIndex === 'auto' || parseInt(targetZIndex) <= parseInt(sheetZIndex)) {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onOpenChange]);

  // Animation variants
  const sheetVariants = {
    hidden: {
      x: '100%',
      opacity: 0,
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        type: 'tween',
        ease: 'easeOut',
        duration: 0.3,
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'tween',
        ease: 'easeIn',
        duration: 0.3,
      },
    },
  };

  const handleVariants = {
    closed: {
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.3
      }
    },
    open: {
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.3
      }
    }
  };

  // Animation for drawing attention to the handle when closed
  const pulseAnimation = !isOpen ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  } : {};

  return (
    <>
      {/* Trapezoid handle - always visible */}
      <motion.div
        ref={handleRef}
        variants={handleVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex items-center cursor-pointer"
        style={{
          marginRight: isOpen ? sheetWidth : 0
        }}
        onClick={() => onOpenChange(!isOpen)}
        {...pulseAnimation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${isOpen ? 'Close' : 'Open'} saved items panel`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenChange(!isOpen);
          }
        }}
      >
        <div className={`relative ${handleColor} w-12 h-44 flex items-center justify-center rounded-l-lg shadow-xl`}>
          {/* Trapezoid shape using pseudo-elements */}
          <div className={`absolute -top-5 left-0 w-0 h-0 
            border-l-0 border-r-0 border-t-[20px] border-b-[20px] 
            border-transparent ${handleColor.includes('green') ? 'border-t-green-500' : 'border-t-blue-500'}`}>
          </div>
          <div className={`absolute -bottom-5 left-0 w-0 h-0 
            border-l-0 border-r-0 border-t-[20px] border-b-[20px] 
            border-transparent ${handleColor.includes('green') ? 'border-b-green-500' : 'border-b-blue-500'}`}>
          </div>
          
          {/* Handle content with improved layout - icon positioned absolutely at top */}
          <div className="flex flex-col items-center h-full w-full justify-center relative">
            {/* Bookmark icon positioned at top */}
            <div className="absolute top-4 left-0 right-0 flex justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-white"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            
            {/* Vertically oriented text in center/bottom area */}
            <div className="transform -rotate-90 whitespace-nowrap mt-8">
              <span className="text-white font-medium tracking-wider text-sm uppercase">{handleLabel}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={(e) => {
                // Only close if clicking directly on the backdrop
                if (e.target === e.currentTarget) {
                  onOpenChange(false);
                }
              }}
            />

            {/* Sheet content - positioned to account for navbar */}
            <motion.div
              ref={sheetRef}
              className={`fixed top-0 right-0 bottom-0 ${backgroundColor} rounded-l-xl shadow-xl z-40 overflow-hidden flex flex-col`}
              style={{ 
                width: sheetWidth,
                x: springX,
                height: sheetHeight,
                marginTop: navbarHeight,
              }}
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="font-medium text-lg">{title}</h3>
                  <button 
                    onClick={() => onOpenChange(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close panel"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content */}
              <motion.div 
                className="flex-1 overflow-y-auto pl-6 pr-4 py-2 pb-safe"
                style={{ opacity: contentOpacity }}
              >
                {children}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PullableSheet; 