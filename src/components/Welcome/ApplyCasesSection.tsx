'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import { Hamburger, Barbell, GameController, X, LightbulbFilament } from 'phosphor-react';
import SectionContainer from './SectionContainer';
import MobileCarousel, { CarouselItem } from '../ui/MobileCarousel';

/**
 * Apply Cases section component
 * Shows who the app is designed for - the target audience
 * Highlights specific use cases for different types of users
 */
export default function ApplyCasesSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const factBoxRef = useRef<HTMLDivElement>(null);

  const applyCases = [
    {
      title: "Ingredient-First Meal Planners",
      description: "Supports parents who want to use what's already at home to create healthy, balanced lunches.",
      icon: <Hamburger size={40} weight="duotone" className="text-orange-500" />,
    },
    {
      title: "Activity-Aware Families",
      description: "Supports parents who want meal ideas linked to their child's daily physical activity levels for better energy balance.",
      icon: <Barbell size={40} weight="duotone" className="text-green-500" />,
    },
    {
      title: "Gamified Nutrition Parents",
      description: "For parents who want their children to develop healthy eating behaviors through fun, gamified experiences.",
      icon: <GameController size={40} weight="duotone" className="text-purple-500" />,
    }
  ];

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIfMobile();
    
    // Update on resize
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close fact box when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (factBoxRef.current && !factBoxRef.current.contains(event.target as Node)) {
        setShowFact(false);
      }
    };

    if (showFact) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFact]);

  // Toggle fact box
  const toggleFact = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFact(!showFact);
  };

  // Generate carousel items
  const carouselItems: CarouselItem[] = applyCases.map((useCase, index) => ({
    key: index,
    content: (
      <Card className="h-full flex flex-col items-center text-center bg-white/80 backdrop-blur-sm border border-white/20">
        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
          {useCase.icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-800">{useCase.title}</h3>
        <p className="text-sm text-gray-600">{useCase.description}</p>
      </Card>
    )
  }));

  return (
    <SectionContainer removeMinHeight={true}>
      <motion.div 
        className="text-center mb-6 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-2 md:mb-4">For Who?</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          NutriPeek is designed specifically for Australian parents of primary school children who want to create healthier lunch boxes.
        </p>
      </motion.div>

      {/* Desktop View - Grid Layout */}
      {!isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {applyCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : index === 1 ? 0 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col items-center text-center p-8 bg-white/80 backdrop-blur-sm hover:bg-green-50/60 border border-white/20">
                <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Mobile View - Carousel */
        <div className="md:hidden">
          <MobileCarousel 
            items={carouselItems}
            className="mb-4"
            autoAdvance={true}
            autoAdvanceInterval={4000}
            transitionType="zoom"
          />
        </div>
      )}

      {/* Desktop Fact Box (always visible) */}
      {!isMobile && (
        <motion.div 
          className="mt-12 bg-green-50/70 backdrop-blur-sm p-8 rounded-xl max-w-4xl mx-auto border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-green-700 mb-4">Did You Know?</h3>
          <p className="text-gray-700">
            Over 50% of Australian parents struggle to make healthy food choices for their children, and 1 in 3 are unsure which foods are best, according to the Royal Children's Hospital. NutriPeek aims to solve this problem.
          </p>
        </motion.div>
      )}

      {/* Mobile Fact Button */}
      {isMobile && (
        <motion.button
          className="mt-4 mx-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-sm"
          onClick={toggleFact}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          whileTap={{ scale: 0.95 }}
        >
          <LightbulbFilament size={18} weight="fill" className="text-white" />
          <span>Did You Know?</span>
        </motion.button>
      )}

      {/* Mobile Popup Fact Box */}
      {isMobile && (
        <AnimatePresence>
          {showFact && (
            <motion.div 
              ref={factBoxRef}
              className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFact(false)}
            >
              <motion.div 
                className="bg-white rounded-xl p-5 shadow-xl w-full max-w-xs relative"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setShowFact(false)}
                >
                  <X size={20} weight="bold" className="text-gray-500" />
                </button>
                <h3 className="text-lg font-bold text-green-700 mb-2">Did You Know?</h3>
                <p className="text-sm text-gray-700">
                  Over 50% of Australian parents struggle to make healthy food choices for their children, and 1 in 3 are unsure which foods are best, according to the Royal Children's Hospital.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </SectionContainer>
  );
}