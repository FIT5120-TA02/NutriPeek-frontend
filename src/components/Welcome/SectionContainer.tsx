'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SectionContainerProps {
  children: ReactNode;
  id?: string;
  className?: string;
  removeMinHeight?: boolean;
  backgroundClasses?: string;
}

/**
 * A container component for landing page sections
 * Provides consistent styling and animation for all sections
 * 
 * @param children - Content to render inside the section
 * @param id - Optional ID for scroll targeting
 * @param className - Additional CSS classes
 * @param removeMinHeight - Option to disable min-height:100vh for certain sections
 * @param backgroundClasses - Optional background classes to override default transparent background
 */
export default function SectionContainer({
  children,
  id,
  className = '',
  removeMinHeight = false,
  backgroundClasses = ''
}: SectionContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIfMobile();
    
    // Update on resize
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className={`
        relative 
        ${removeMinHeight ? '' : 'min-h-[100vh] h-auto md:h-screen'} 
        w-full 
        flex 
        flex-col 
        justify-center 
        items-center 
        ${isMobile ? 'pt-20 pb-8' : 'py-8 sm:py-12 md:py-16'}
        px-4 
        overflow-visible
        ${isMobile ? 'scroll-mt-20' : 'scroll-mt-8 sm:scroll-mt-16'}
        ${backgroundClasses}
        ${className}
      `}
    >
      <div className="container mx-auto max-w-7xl z-10 w-full">
        {children}
      </div>
    </motion.section>
  );
}