'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight } from 'phosphor-react';

export interface CarouselItem {
  key: string | number;
  content: React.ReactNode;
}

interface MobileCarouselProps {
  items: CarouselItem[];
  showControls?: boolean;
  showIndicators?: boolean;
  showInstructions?: boolean;
  className?: string;
  carouselItemClass?: string;
  autoAdvance?: boolean;
  autoAdvanceInterval?: number;
  initialIndex?: number;
  onSlideChange?: (index: number) => void;
  pauseOnHover?: boolean;
  transitionType?: 'slide' | 'fade' | 'zoom' | 'none';
}

/**
 * MobileCarousel Component
 * A reusable component for displaying content in a mobile-friendly carousel
 */
export default function MobileCarousel({
  items,
  showControls = false,
  showIndicators = true,
  showInstructions = true,
  className = '',
  carouselItemClass = '',
  autoAdvance = false,
  autoAdvanceInterval = 3000,
  initialIndex = 0,
  onSlideChange,
  pauseOnHover = true,
  transitionType = 'slide'
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const carouselRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Animation variants based on transition type
  const variants = {
    slide: {
      enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 1
      }),
      center: {
        x: 0,
        opacity: 1
      },
      exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0.3
      })
    },
    fade: {
      enter: {
        opacity: 0
      },
      center: {
        opacity: 1
      },
      exit: {
        opacity: 0
      }
    },
    zoom: {
      enter: {
        opacity: 0,
        scale: 0.9
      },
      center: {
        opacity: 1,
        scale: 1
      },
      exit: {
        opacity: 0,
        scale: 1.1
      }
    },
    none: {
      enter: {
        opacity: 1
      },
      center: {
        opacity: 1
      },
      exit: {
        opacity: 1
      }
    }
  };

  // Handle swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsHorizontalSwipe(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = startXRef.current - currentX;
    const diffY = startYRef.current - currentY;
    
    // Determine if this is a horizontal or vertical swipe
    if (!isHorizontalSwipe && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      setIsHorizontalSwipe(true);
    }
    
    // Only prevent default for horizontal swipes
    if (isHorizontalSwipe && Math.abs(diffX) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Only process swipe if it was predominantly horizontal
    if (isHorizontalSwipe) {
      const currentX = e.changedTouches[0].clientX;
      const diff = startXRef.current - currentX;
      
      // Swipe threshold
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left
          setDirection(1);
          goToNext();
        } else {
          // Swipe right
          setDirection(-1);
          goToPrev();
        }
      }
    }
  };

  // Navigate to previous item
  const goToPrev = () => {
    setDirection(-1);
    const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  // Navigate to next item
  const goToNext = () => {
    setDirection(1);
    const newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Notify parent component of slide changes after the state has been updated
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex, onSlideChange]);

  // Set up auto-advancing
  useEffect(() => {
    if (autoAdvance && !isPaused && items.length > 1) {
      autoAdvanceTimerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => 
          prevIndex === items.length - 1 ? 0 : prevIndex + 1
        );
      }, autoAdvanceInterval);
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [autoAdvance, isPaused, items.length, autoAdvanceInterval]);

  // Handle mouse interactions for desktop
  const handleMouseEnter = () => {
    if (pauseOnHover && autoAdvance) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && autoAdvance) {
      setIsPaused(false);
    }
  };

  // Reset auto-advance when user manually navigates
  useEffect(() => {
    if (!isInitialMount.current && autoAdvance && autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      if (!isPaused) {
        autoAdvanceTimerRef.current = setInterval(() => {
          setDirection(1);
          setCurrentIndex(prevIndex => 
            prevIndex === items.length - 1 ? 0 : prevIndex + 1
          );
        }, autoAdvanceInterval);
      }
    }
  }, [currentIndex, autoAdvance, isPaused, autoAdvanceInterval, items.length]);

  // Sync with parent's initialIndex when it changes
  useEffect(() => {
    if (currentIndex !== initialIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  return (
    <div className={`w-full max-w-sm mx-auto relative ${className}`}>
      <div 
        ref={carouselRef}
        className="relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Current Item with Animation */}
        <div className={`relative ${carouselItemClass}`}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants[transitionType]}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              className="w-full"
            >
              {items[currentIndex].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation */}
        {showControls && (
          <div className="flex justify-between items-center absolute top-1/2 transform -translate-y-1/2 w-full px-2 z-30">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="bg-white/90 rounded-full p-3 shadow-md text-green-600 hover:bg-white transition-colors -translate-x-1"
              aria-label="Previous item"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="bg-white/90 rounded-full p-3 shadow-md text-green-600 hover:bg-white transition-colors translate-x-1"
              aria-label="Next item"
            >
              <CaretRight size={20} weight="bold" />
            </button>
          </div>
        )}
        
        {/* Carousel Indicators */}
        {showIndicators && items.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {items.map((_, index) => (
              <button 
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to item ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentIndex ? 'bg-green-500 scale-125 w-3 h-3' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
        
        {/* Swipe Instructions */}
        {showInstructions && items.length > 1 && (
          <div className="text-center mt-2 text-xs text-gray-500">
            <p>Swipe left or right to see more</p>
          </div>
        )}
      </div>
    </div>
  );
} 