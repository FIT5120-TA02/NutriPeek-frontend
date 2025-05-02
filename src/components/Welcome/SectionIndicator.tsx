'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SectionIndicatorProps {
  totalSections: number;
  sections: string[];
  activeSection: number;
  onSectionChange: (index: number) => void;
}

export default function SectionIndicator({ 
  totalSections, 
  sections, 
  activeSection, 
  onSectionChange 
}: SectionIndicatorProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check on initial load
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleDotClick = (index: number) => {
    onSectionChange(index);
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If mobile, don't render the component
  if (isMobile) return null;

  return (
    <motion.div 
      className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center gap-2 z-40"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <motion.button
          key={`section-dot-${index}`}
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
            activeSection === index 
              ? 'bg-green-500 scale-125 shadow-md' 
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to section ${index + 1}`}
          onClick={() => handleDotClick(index)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </motion.div>
  );
} 