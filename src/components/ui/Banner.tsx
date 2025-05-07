"use client";

/**
 * Banner Component
 * A reusable notification banner that can be dismissed
 * Shows important information to users and persists until dismissed
 */
import React, { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import storageService from '@/libs/StorageService';
import { STORAGE_KEYS } from '@/types/storage';

export interface BannerProps {
  /** Unique ID for storing dismissal state in localStorage */
  id: string;
  /** Main message of the banner */
  message: string;
  /** Optional variant for styling (info, warning, success) */
  variant?: 'info' | 'warning' | 'success';
  /** Control whether banner should reset dismissal on new sessions */
  persistDismissal?: boolean;
  /** Custom class name for additional styling */
  className?: string;
  /** Optional icon to display before the message */
  icon?: React.ReactNode;
  /** Optional position styling (fixed, sticky, static) */
  position?: 'fixed' | 'sticky' | 'static';
}

/**
 * Banner Component
 * Displays an important notification that can be dismissed by the user
 */
export default function Banner({
  id,
  message,
  variant = 'info',
  persistDismissal = true,
  className = '',
  icon,
  position = 'static'
}: BannerProps) {
  // Track if banner has been dismissed
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Load dismissal state from storage on mount
  useEffect(() => {
    if (persistDismissal) {
      // Get the banner dismissal state from storage
      const allBannerDismissals = storageService.getLocalItem<Record<string, boolean>>({
        key: STORAGE_KEYS.BANNER_DISMISSED_PREFIX,
        defaultValue: {}
      });
      
      // Check if this specific banner has been dismissed
      if (allBannerDismissals && 
          allBannerDismissals[id as keyof typeof allBannerDismissals] === true) {
        setIsDismissed(true);
      }
    }
  }, [id, persistDismissal]);
  
  // Handle banner dismissal
  const handleDismiss = () => {
    setIsDismissed(true);
    
    // Store dismissal if persistence is enabled
    if (persistDismissal) {
      // Get current dismissal records
      const allBannerDismissals = storageService.getLocalItem<Record<string, boolean>>({
        key: STORAGE_KEYS.BANNER_DISMISSED_PREFIX,
        defaultValue: {}
      }) || {};
      
      // Update with this banner's dismissal
      const updatedDismissals = {
        ...allBannerDismissals,
        [id]: true
      };
      
      // Save back to storage
      storageService.setLocalItem(STORAGE_KEYS.BANNER_DISMISSED_PREFIX, updatedDismissals);
    }
  };
  
  // If dismissed, don't render anything
  if (isDismissed) {
    return null;
  }
  
  // Define variant-specific styles with gradients and modern appearance
  const variantStyles = {
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-blue-100/50',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 shadow-amber-100/50',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-emerald-100/50'
  };
  
  // Define position-specific styles
  const positionStyles = {
    fixed: 'fixed bottom-4 left-0 right-0 mx-auto max-w-4xl z-50',
    sticky: 'sticky top-4 z-50',
    static: ''
  };
  
  // Get the focus ring color based on variant
  const focusRingColor = variant === 'info' ? 'focus:ring-blue-400' : 
                         variant === 'warning' ? 'focus:ring-amber-400' : 
                         'focus:ring-green-400';
  
  return (
    <div 
      className={`${positionStyles[position]} w-full animate-fade-in`}
    >
      <div
        className={`relative px-4 py-3 border rounded-lg shadow-md flex items-center
                  backdrop-blur-sm backdrop-saturate-150
                  ${variantStyles[variant]} ${className}`}
        role="alert"
      >
        {/* Optional icon */}
        {icon && (
          <div className="flex-shrink-0 mr-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white bg-opacity-80 shadow-sm">
              {icon}
            </span>
          </div>
        )}
        
        {/* Banner message */}
        <p className="flex-grow text-sm md:text-base font-medium">{message}</p>
        
        {/* Dismiss button */}
        <button 
          onClick={handleDismiss}
          className={`ml-4 p-1.5 rounded-full hover:bg-white hover:bg-opacity-50 
                    transition-all duration-200 transform active:scale-95
                    focus:outline-none focus:ring-2 ${focusRingColor}`}
          aria-label="Dismiss"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
} 