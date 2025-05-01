'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import {
  HeroSection,
  CoreFeaturesSection,
  PlateBuilderSection,
  MatchAndLearnSection,
  BenefitsSection,
  ApplyCasesSection,
  ToolsIntegrationSection,
  FAQSection,
  FooterSection,
  SectionIndicator
} from '@/components/landing';

/**
 * Welcome page component - Main landing page
 * 
 * Displays a seamless, full-screen section-based landing page with:
 * - Hero section with main value proposition
 * - Features section showing app capabilities
 * - Benefits, use cases, testimonials and more sections
 * - Fixed navigation that appears after delay
 * 
 * Each section takes 100% of viewport height for a modern, immersive experience
 */
export default function WelcomePage() {
  const [activeSection, setActiveSection] = useState(0);
  
  // Section IDs for navigation
  const sectionIds = [
    'hero',
    'features',
    'plate-builder',
    'match-and-learn',
    'benefits',
    'use-cases',
    'tools',
    'faq',
    'footer'
  ];

  // Determine which section is most visible in the viewport
  const determineActiveSection = useCallback(() => {
    // Get all section elements
    const sectionElements = sectionIds.map(id => document.getElementById(id));
    
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
  }, [sectionIds]);
  
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
          const sectionIndex = sectionIds.indexOf(sectionId);
          if (sectionIndex !== -1) {
            setActiveSection(sectionIndex);
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) snapObserver.observe(element);
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      sectionIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) snapObserver.unobserve(element);
      });
    };
  }, [sectionIds, determineActiveSection]);

  // Function to check if scroll indicator should be visible
  const shouldShowScrollIndicator = () => {
    // Hide in features sections (1,2,3) and footer (8)
    return activeSection !== 1 && 
           activeSection !== 2 && 
           activeSection !== 7 &&
           activeSection !== 8;
  };

  // Handle section change from SectionIndicator
  const handleSectionChange = (index: number) => {
    setActiveSection(index);
  };

  return (
    <FloatingEmojisLayout 
      emojisCount={20}
      backgroundClasses="min-h-screen flex flex-col w-full bg-gradient-to-b from-green-50 to-green-100"
    >
      {/* Section navigation dots */}
      <SectionIndicator 
        totalSections={sectionIds.length} 
        sections={sectionIds} 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      />

      {/* Scroll snap container */}
      <div 
        className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide"
        id="main-scroll-container"
      >
        {/* Using the new components with IDs for scrolling */}
        <div id="hero" className="snap-start snap-always w-full">
          <HeroSection />
        </div>
        <div id="features" className="snap-start snap-always w-full">
          <CoreFeaturesSection />
        </div>
        <div id="plate-builder" className="snap-start snap-always w-full">
          <PlateBuilderSection />
        </div>
        <div id="match-and-learn" className="snap-start snap-always w-full">
          <MatchAndLearnSection />
        </div>
        <div id="benefits" className="snap-start snap-always w-full">
          <BenefitsSection />
        </div>
        <div id="use-cases" className="snap-start snap-always w-full">
          <ApplyCasesSection />
        </div>
        <div id="tools" className="snap-start snap-always w-full">
          <ToolsIntegrationSection />
        </div>
        <div id="faq" className="snap-start snap-always w-full">
          <FAQSection />
        </div>
        <div id="footer" className="snap-start snap-always w-full">
          <FooterSection />
        </div>
      </div>

      {/* Floating Scroll Indicator - hidden in features sections and footer */}
      {shouldShowScrollIndicator() && (
        <AnimatePresence>
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-600 text-sm font-medium flex items-center gap-2"
              >
                <span>Scroll to explore</span>
                <motion.div 
                  animate={{ y: [0, 3, 0] }} 
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
        </AnimatePresence>
      )}
    </FloatingEmojisLayout>
  );
}