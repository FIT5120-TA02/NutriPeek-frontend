'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
  carouselItemClass = ''
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);

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
          goToNext();
        } else {
          // Swipe right
          goToPrev();
        }
      }
    }
  };

  // Navigate to previous item
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  // Navigate to next item
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={`w-full max-w-sm mx-auto relative ${className}`}>
      <div 
        ref={carouselRef}
        className="relative w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Item */}
        <div className={`relative z-20 ${carouselItemClass}`}>
          {items[currentIndex].content}
        </div>

        {/* Carousel Navigation */}
        {showControls && (
          <div className="flex justify-between items-center absolute top-1/2 transform -translate-y-1/2 w-full px-2 z-30">
            <button 
              onClick={goToPrev}
              className="bg-white/90 rounded-full p-3 shadow-md text-green-600 hover:bg-white transition-colors -translate-x-1"
              aria-label="Previous item"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <button 
              onClick={goToNext}
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
                onClick={() => setCurrentIndex(index)}
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