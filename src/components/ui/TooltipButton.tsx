'use client';

import { ReactNode, useState } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  children: ReactNode;
  position?: TooltipPosition;
}

/**
 * A button component that displays a tooltip when disabled and hovered
 */
export default function TooltipButton({
  onClick,
  className = '',
  disabled = false,
  disabledTooltip = 'This action is currently unavailable',
  children,
  position = 'top'
}: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Classes for different states
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-opacity-90';
  const combinedClasses = `${className} ${disabledClasses}`;
  
  // Dynamic tooltip positioning and styling based on position prop
  const tooltipPositionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  // Arrow positioning based on tooltip position
  const arrowPositionClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-t-transparent border-r-transparent border-l-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-l-transparent border-b-transparent'
  };
  
  return (
    <div 
      className="relative inline-block w-full sm:w-auto"
      onMouseEnter={() => disabled && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={disabled ? undefined : onClick}
        className={combinedClasses}
        onFocus={() => disabled && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        disabled={disabled}
        aria-disabled={disabled}
        style={{ width: '100%' }}
      >
        {children}
      </button>
      
      {disabled && showTooltip && (
        <div className={`absolute z-10 ${tooltipPositionClasses[position]} px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg w-max max-w-xs text-center whitespace-normal`}>
          {disabledTooltip}
          <div className={`absolute border-4 border-transparent ${arrowPositionClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
} 