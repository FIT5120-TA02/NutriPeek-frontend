"use client";

/**
 * Nutrition Chart Component
 * Displays nutritional information with fun, child-friendly visuals
 */
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PlateSummary } from './types';

interface NutritionChartProps {
  summary: PlateSummary;
}

interface NutrientBarProps {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  icon?: string;
  index: number;
}

/**
 * Individual nutrient bar component with animation and icons
 */
function NutrientBar({ label, value, maxValue, unit, color, icon, index }: NutrientBarProps) {
  // Calculate percentage (capped at 100%)
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  return (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {icon && (
            <span className="mr-2 text-lg">{icon}</span>
          )}
          <span className="text-sm font-bold text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div 
          className={`h-4 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Nutrition chart component with enhanced visual design for children
 */
export default function NutritionChart({ summary }: NutritionChartProps) {
  const t = useTranslations('BuildPlate');
  
  // Define reference values for nutrients (simplified example)
  const maxValues = {
    energy: 1000, // kJ
    protein: 20,  // g
    fat: 30,      // g
    carbs: 60,    // g
    fibre: 10     // g
  };
  
  // Define fun background gradient colors for different nutrients
  const colors = {
    energy: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
    protein: 'bg-gradient-to-r from-red-500 to-red-400',
    fat: 'bg-gradient-to-r from-purple-500 to-purple-400',
    carbs: 'bg-gradient-to-r from-blue-500 to-blue-400',
    fibre: 'bg-gradient-to-r from-green-500 to-green-400'
  };
  
  // Fun icons for each nutrient
  const icons = {
    energy: '⚡',
    protein: '💪',
    fat: '🧈',
    carbs: '🍚',
    fibre: '🥦'
  };
  
  return (
    <div className="bg-transparent rounded-xl">
      {/* Nutrition Score Circle - Fixed alignment and enhanced with animation */}
      <div className="mb-6 text-center">
        <h3 className="text-sm uppercase text-indigo-600 font-bold mb-2">{t('nutrition_score')}</h3>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-28 h-28" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              className="text-gray-200" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            
            {/* Score circle - animated */}
            <motion.circle 
              className="text-gradient-circle" 
              strokeWidth="8" 
              strokeDasharray={251.2} /* 2 * π * 40 */
              strokeDashoffset={251.2 - (summary.nutritionScore / 100) * 251.2} 
              strokeLinecap="round" 
              stroke="url(#scoreGradient)" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (summary.nutritionScore / 100) * 251.2 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score number - centered perfectly with animation */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              {summary.nutritionScore}
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Nutrient Bars with Fun Icons */}
      <div className="space-y-1">
        <NutrientBar 
          label={t('energy')} 
          value={summary.totalEnergy} 
          maxValue={maxValues.energy} 
          unit="kJ" 
          color={colors.energy}
          icon={icons.energy}
          index={0}
        />
        
        <NutrientBar 
          label={t('protein')} 
          value={summary.totalProtein} 
          maxValue={maxValues.protein} 
          unit="g" 
          color={colors.protein}
          icon={icons.protein}
          index={1} 
        />
        
        <NutrientBar 
          label={t('fat')} 
          value={summary.totalFat} 
          maxValue={maxValues.fat} 
          unit="g" 
          color={colors.fat} 
          icon={icons.fat}
          index={2}
        />
        
        <NutrientBar 
          label={t('carbs')} 
          value={summary.totalCarbs} 
          maxValue={maxValues.carbs} 
          unit="g" 
          color={colors.carbs} 
          icon={icons.carbs}
          index={3}
        />
        
        <NutrientBar 
          label={t('fibre')} 
          value={summary.totalFibre} 
          maxValue={maxValues.fibre} 
          unit="g" 
          color={colors.fibre} 
          icon={icons.fibre}
          index={4}
        />
      </div>
      
      {/* Fun decoration */}
      <motion.div 
        className="mt-4 text-center text-sm text-indigo-600 font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {summary.nutritionScore >= 70 ? "Great job! 🎉" : 
         summary.nutritionScore >= 40 ? "Almost there! 👍" : "Let's add more foods! 🍎"}
      </motion.div>
    </div>
  );
} 