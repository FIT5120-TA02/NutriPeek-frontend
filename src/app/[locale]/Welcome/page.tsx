'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import nutriPeekLogo from '@/../public/nutripeek.png';
import {
  HeroSection,
  FeatureSection,
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
  const [showNavbar, setShowNavbar] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  // Section IDs for navigation
  const sectionIds = [
    'hero',
    'features',
    'benefits',
    'use-cases',
    'tools',
    'faq',
    'footer'
  ];

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const pageHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const currentSection = Math.round(scrollTop / pageHeight);
      setActiveSection(Math.min(currentSection, sectionIds.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds.length]);

  // Show navbar after a delay for a cleaner initial experience
  useEffect(() => {
    const timer = setTimeout(() => setShowNavbar(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <FloatingEmojisLayout 
      emojisCount={20}
      backgroundClasses="min-h-screen flex flex-col w-full bg-gradient-to-b from-green-50 to-green-100"
    >
      {/* Section navigation dots */}
      <SectionIndicator totalSections={sectionIds.length} sections={sectionIds} />

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
          <FeatureSection />
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

      {/* Navigation Bar */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: showNavbar ? 0 : -100, 
          opacity: showNavbar ? 1 : 0 
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <Link href="/Welcome" className="flex items-center space-x-2">
            <Image
              src={nutriPeekLogo}
              alt="NutriPeek Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold text-gray-800 tracking-tight">NutriPeek</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors">
            Profile
          </Link>
          <Link href="/BuildPlate" className="text-gray-600 hover:text-green-600 transition-colors">
            Build Plate
          </Link>
          <Link
            href="/NutriScan"
            className="ml-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Launch Scan
          </Link>
        </nav>
      </motion.header>

      {/* Floating Scroll Indicator - only visible on first section */}
      <AnimatePresence>
        {activeSection === 0 && (
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
        )}
      </AnimatePresence>
    </FloatingEmojisLayout>
  );
}