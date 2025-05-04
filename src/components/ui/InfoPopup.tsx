"use client";

/**
 * InfoPopup Component
 * A reusable tooltip-style component that shows additional information on hover
 */
import { useState, useRef, useEffect } from 'react';
import { Info } from 'phosphor-react';

interface InfoPopupProps {
  /** The information to display in the popup */
  content: React.ReactNode;
  /** Optional position of the popup */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional icon size */
  iconSize?: number;
  /** Optional custom icon */
  icon?: React.ReactNode;
  /** Optional custom class for the icon */
  iconClassName?: string;
}

export default function InfoPopup({
  content,
  position = 'top',
  iconSize = 16,
  icon,
  iconClassName = '',
}: InfoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Calculate position based on trigger element
  useEffect(() => {
    if (isVisible && iconRef.current && popupRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top':
          // Center horizontally, place above the icon
          x = iconRect.left + (iconRect.width / 2) - (popupRect.width / 2);
          y = iconRect.top - popupRect.height - 8;
          break;
        case 'bottom':
          // Center horizontally, place below the icon
          x = iconRect.left + (iconRect.width / 2) - (popupRect.width / 2);
          y = iconRect.bottom + 8;
          break;
        case 'left':
          // Center vertically, place to the left of the icon
          x = iconRect.left - popupRect.width - 8;
          y = iconRect.top + (iconRect.height / 2) - (popupRect.height / 2);
          break;
        case 'right':
          // Center vertically, place to the right of the icon
          x = iconRect.right + 8;
          y = iconRect.top + (iconRect.height / 2) - (popupRect.height / 2);
          break;
      }
      
      // Keep popup inside viewport
      x = Math.max(8, Math.min(x, window.innerWidth - popupRect.width - 8));
      y = Math.max(8, Math.min(y, window.innerHeight - popupRect.height - 8));
      
      setPopupPosition({ x, y });
    }
  }, [isVisible, position]);
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          iconRef.current && !iconRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="inline-flex items-center">
      {/* Trigger element */}
      <div
        ref={iconRef}
        className={`cursor-help inline-flex items-center justify-center text-indigo-500 hover:text-indigo-700 transition-colors ${iconClassName}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        role="button"
        aria-expanded={isVisible}
        tabIndex={0}
      >
        {icon || <Info size={iconSize} weight="fill" />}
      </div>
      
      {/* Popup content */}
      {isVisible && (
        <div
          ref={popupRef}
          className="absolute z-50 bg-white rounded-lg shadow-lg p-4 animate-fade-in border border-indigo-100"
          style={{
            position: 'fixed',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            maxWidth: 'max-content',
            width: 'auto'
          }}
        >
          <div className="text-sm text-gray-700">
            {content}
          </div>
        </div>
      )}
    </div>
  );
} 