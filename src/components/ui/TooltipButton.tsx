'use client';

import { ReactNode, useState } from 'react';

interface TooltipButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  children: ReactNode;
}

/**
 * A button component that displays a tooltip when disabled and hovered
 */
export default function TooltipButton({
  onClick,
  className = '',
  disabled = false,
  disabledTooltip = 'This action is currently unavailable',
  children
}: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Classes for different states
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-opacity-90';
  const combinedClasses = `${className} ${disabledClasses}`;
  
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
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg w-max max-w-xs text-center whitespace-normal">
          {disabledTooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
} 