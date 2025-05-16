'use client';

import React, { useEffect } from 'react';

interface LegalPolicyPopupProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Reusable popup component for displaying legal policies
 * Features a blurred background overlay and a dismissible card
 */
export default function LegalPolicyPopup({ title, onClose, children }: LegalPolicyPopupProps) {
  // Add escape key handler to close popup
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling of the body when popup is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Policy header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-green-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
        </div>
        
        {/* Policy content */}
        <div className="p-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  );
} 