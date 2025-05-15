'use client';

import React, { useEffect, useState } from 'react';
import { SeasonalFood } from '@/types/seasonal';
import seasonalFoodService from '@/libs/SeasonalFoodService';
import { motion, AnimatePresence } from 'framer-motion';

interface PinnedFoodsCarouselProps {
  onFoodSelect?: (food: SeasonalFood) => void;
}

// Custom event for updating pinned foods
export const refreshPinnedFoods = () => {
  window.dispatchEvent(new Event('pinnedFoodsUpdated'));
};

/**
 * Carousel component to display pinned seasonal foods
 * Shows a horizontally scrollable list of pinned foods with empty state handling
 */
const PinnedFoodsCarousel: React.FC<PinnedFoodsCarouselProps> = ({ onFoodSelect }) => {
  const [pinnedFoods, setPinnedFoods] = useState<SeasonalFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load pinned foods on component mount
  useEffect(() => {
    loadPinnedFoods();
  }, []);

  // Function to load pinned foods (made reusable for external updates)
  const loadPinnedFoods = () => {
    try {
      const foods = seasonalFoodService.getAllPinnedFoods();
      setPinnedFoods(foods);
    } catch (error) {
      console.error('Error loading pinned foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to storage changes to refresh pinned foods when they change
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pinnedSeasonalFoods') {
        loadPinnedFoods();
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    window.addEventListener('pinnedFoodsUpdated', loadPinnedFoods);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pinnedFoodsUpdated', loadPinnedFoods);
    };
  }, []);

  // Toggle the expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Animation variants
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      marginTop: 0 
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      marginTop: 12,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      marginTop: 0,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mb-4">
        <div 
          className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between cursor-pointer"
          onClick={toggleExpanded}
        >
          <h3 className="text-lg font-medium text-gray-800">Your Pinned Foods</h3>
          <motion.span 
            className="text-gray-400"
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.span>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex-shrink-0 w-32">
                    <div className="h-28 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Empty state
  if (pinnedFoods.length === 0) {
    return (
      <div className="mb-4">
        <div 
          className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between cursor-pointer"
          onClick={toggleExpanded}
        >
          <h3 className="text-lg font-medium text-gray-800">Your Pinned Foods</h3>
          <motion.span 
            className="text-gray-400"
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.span>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden bg-transparent rounded-b-xl"
            >
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h4 className="text-gray-800 font-medium mb-1">No pinned foods yet</h4>
                <p className="text-gray-500 text-sm max-w-xs">
                  Pin your favorite seasonal foods as you explore to make them easily accessible here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div 
        className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="text-lg font-medium text-gray-800">Your Pinned Foods</h3>
        <motion.span 
          className="text-gray-400"
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden bg-transparent"
          >
            <div className="px-2">
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {pinnedFoods.map((food) => (
                  <motion.div
                    key={food.id}
                    whileHover={{ scale: 1.03 }}
                    className="flex-shrink-0 w-32 cursor-pointer"
                    onClick={() => {
                      // Set source flag to carousel
                      localStorage.setItem('foodPopupSource', 'carousel');
                      onFoodSelect?.(food);
                    }}
                  >
                    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-28">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-50 flex items-center justify-center">
                            <span className="text-3xl">🍎</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="truncate font-medium text-sm text-gray-800">{food.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {food.seasons.join(', ')}
                        </div>
                      </div>
                      <button 
                        className="absolute right-1 top-1 p-1 rounded-full bg-white shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          seasonalFoodService.unpinSeasonalFood(food.id);
                          setPinnedFoods(prev => prev.filter(f => f.id !== food.id));
                          
                          // Dispatch custom event for other components to catch
                          window.dispatchEvent(new Event('pinnedFoodsUpdated'));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 hover:text-red-500">
                          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PinnedFoodsCarousel; 