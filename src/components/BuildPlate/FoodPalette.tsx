"use client";

/**
 * Food Palette Component
 * A colorful, engaging food selection grid for the Build a Plate feature
 * Designed to be appealing to children while maintaining all functionality
 */
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MagnifyingGlass } from 'phosphor-react';

import { PlateFood, FoodPaletteProps } from './types';
import FoodGrid from './FoodGrid';

/**
 * Enhanced Food Palette component with filters and search
 */
export default function FoodPalette({ 
  foods, 
  onDragStart, 
  loading = false 
}: FoodPaletteProps) {
  const t = useTranslations('BuildPlate');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter foods based on active category and search term
  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      // Apply category filter
      const categoryMatch = !activeCategory || food.category === activeCategory;
      
      // Apply search filter if there's a search term
      const searchMatch = !searchTerm || 
        food.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [foods, activeCategory, searchTerm]);
  
  // Different vibrant colors and icons for each category
  const categoryStyles = {
    protein: {
      color: 'bg-gradient-to-r from-red-400 to-red-500',
      hoverColor: 'hover:bg-red-600',
      activeColor: 'bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      icon: '🍗'
    },
    carbs: {
      color: 'bg-gradient-to-r from-amber-400 to-amber-500',
      hoverColor: 'hover:bg-amber-600',
      activeColor: 'bg-amber-600',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      icon: '🍚'
    },
    extras: {
      color: 'bg-gradient-to-r from-green-400 to-green-500',
      hoverColor: 'hover:bg-green-600',
      activeColor: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      icon: '🥦'
    }
  };
  
  // Category buttons for filtering
  const CategoryButton = ({ 
    category, 
    label
  }: { 
    category: string; 
    label: string;
  }) => {
    const isActive = activeCategory === category;
    const styles = categoryStyles[category as keyof typeof categoryStyles];
    
    return (
      <motion.button
        onClick={() => setActiveCategory(isActive ? null : category)}
        className={`relative px-4 py-2 rounded-full text-white font-bold ${isActive ? styles.activeColor : styles.color} 
                  transition-all duration-200 transform`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="mr-2">{styles.icon}</span>
        {label}
        {isActive && (
          <motion.span 
            className="absolute -top-1 -right-1 w-5 h-5 bg-white text-xs flex items-center 
                    justify-center rounded-full font-bold text-red-500"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            ✕
          </motion.span>
        )}
      </motion.button>
    );
  };
  
  return (
    <div className="relative">
      <div className="mb-6">
        <motion.h3 
          className="text-xl font-bold text-indigo-700 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('available_foods')}
        </motion.h3>
        
        {/* Enhanced search input with animation */}
        <div className="flex mb-4">
          <div className="relative flex-grow">
            <motion.div 
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500"
              animate={{ rotate: searchTerm ? [0, 15, 0, -15, 0] : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MagnifyingGlass size={20} weight="bold" />
            </motion.div>
            <input
              type="text"
              placeholder={t('search_foods')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-full focus:border-indigo-300 
                        focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
            />
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-700"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Category filters with animations */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CategoryButton category="protein" label={t('protein_foods')} />
          <CategoryButton category="carbs" label={t('carb_foods')} />
          <CategoryButton category="extras" label={t('extra_foods')} />
        </motion.div>
      </div>
      
      {/* Show filter results statistics */}
      {!loading && (
        <motion.div 
          className="mb-3 text-sm text-indigo-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('showing_x_foods', { count: filteredFoods.length })}
          {activeCategory && (
            <span className="ml-1">
              ({t('category')}: {t(activeCategory)})
            </span>
          )}
        </motion.div>
      )}
      
      {/* Grid with filtered foods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <FoodGrid 
          foods={filteredFoods} 
          onDragStart={onDragStart} 
          loading={loading} 
        />
      </motion.div>
    </div>
  );
} 