'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SectionIndicatorProps {
  totalSections: number;
  sections: string[];
}

export default function SectionIndicator({ totalSections, sections }: SectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState(0);

  // Debounced scroll handler for better performance
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const determineActiveSection = useCallback(() => {
    // Get all section elements
    const sectionElements = sections.map(id => document.getElementById(id));
    
    // Calculate which section is most visible in the viewport
    let maxVisibleSection = 0;
    let maxVisibleArea = 0;
    
    sectionElements.forEach((section, index) => {
      if (!section) return;
      
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section is visible in the viewport
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      
      // If this section has more visible area than previous maximum, update
      if (visibleHeight > maxVisibleArea) {
        maxVisibleArea = visibleHeight;
        maxVisibleSection = index;
      }
    });
    
    setActiveSection(maxVisibleSection);
  }, [sections]);
  
  useEffect(() => {
    // Main scroll handler
    const handleScroll = () => {
      requestAnimationFrame(() => {
        determineActiveSection();
      });
    };
    
    // More responsive scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle initial load
    determineActiveSection();
    
    // Handle section changes from snap scrolling
    const snapObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionId = entry.target.id;
          const sectionIndex = sections.indexOf(sectionId);
          if (sectionIndex !== -1) {
            setActiveSection(sectionIndex);
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all sections
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) snapObserver.observe(element);
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) snapObserver.unobserve(element);
      });
    };
  }, [sections, determineActiveSection]);

  const handleDotClick = (index: number) => {
    setActiveSection(index); // Immediately update active section when clicked
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center gap-3 z-40"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {Array.from({ length: totalSections }).map((_, index) => (
        <motion.button
          key={`section-dot-${index}`}
          className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
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