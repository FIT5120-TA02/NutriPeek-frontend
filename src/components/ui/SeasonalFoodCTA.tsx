'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type SeasonalFoodCTAVariant = 'button' | 'link' | 'iconButton';
type SeasonalFoodCTASize = 'small' | 'medium' | 'large';
type SeasonalFoodCTAColor = 'blue' | 'green' | 'amber';

interface SeasonalFoodCTAProps {
  variant?: SeasonalFoodCTAVariant;
  size?: SeasonalFoodCTASize;
  color?: SeasonalFoodCTAColor;
  className?: string;
  showIcon?: boolean;
  label?: string;
  toolTip?: string;
  onClick?: () => void; // Custom onClick handler, otherwise will navigate to SeasonalFood page
}

/**
 * A reusable call-to-action component for navigating to the Seasonal Food page
 * 
 * @param variant - The visual style variant of the CTA ('button', 'link', or 'iconButton')
 * @param size - Size of the CTA element ('small', 'medium', 'large')
 * @param color - Color theme for the CTA ('blue', 'green', 'amber')
 * @param className - Additional custom CSS classes
 * @param showIcon - Whether to show the location icon
 * @param label - Custom label text for the CTA
 * @param toolTip - Optional tooltip text to show on hover
 * @param onClick - Optional custom onClick handler (otherwise navigates to SeasonalFood page)
 */
const SeasonalFoodCTA: React.FC<SeasonalFoodCTAProps> = ({
  variant = 'button',
  size = 'medium',
  color = 'blue',
  className = '',
  showIcon = true,
  label = 'Seasonal Foods',
  toolTip,
  onClick
}) => {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Button size classes
  const sizeClasses = {
    small: 'text-xs px-3 py-1',
    medium: 'text-sm px-4 py-2',
    large: 'text-base px-6 py-3'
  };
  
  // Color classes by variant
  const colorClasses = {
    button: {
      blue: 'bg-blue-500 text-white hover:bg-blue-600',
      green: 'bg-green-500 text-white hover:bg-green-600',
      amber: 'bg-amber-500 text-white hover:bg-amber-600'
    },
    link: {
      blue: 'text-blue-500 hover:text-blue-700',
      green: 'text-green-500 hover:text-green-700',
      amber: 'text-amber-500 hover:text-amber-700'
    },
    iconButton: {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
    }
  };
  
  // Variant classes
  const variantClasses = {
    button: 'rounded-full font-medium shadow-sm',
    link: 'underline font-medium',
    iconButton: 'rounded-full font-medium'
  };
  
  // Icon size based on button size
  const iconSizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };
  
  // Combine all classes
  const combinedClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${colorClasses[variant][color]}
    transition-colors
    ${showIcon ? 'flex items-center gap-1.5' : ''}
    ${className}
  `;
  
  // Handle click - either use custom handler or navigate to SeasonalFood page
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/SeasonalFood');
    }
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => toolTip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button 
        className={combinedClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        {showIcon && (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        {label}
      </motion.button>
      
      {/* Tooltip (if provided) */}
      {toolTip && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg w-max max-w-xs text-center z-50">
          {toolTip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default SeasonalFoodCTA; 