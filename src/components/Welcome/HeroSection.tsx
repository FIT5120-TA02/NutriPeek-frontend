'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowCircleRight } from 'phosphor-react';
import nutriPeekLogo from '@/../public/nutripeek.png';
import SectionContainer from './SectionContainer';

/**
 * Hero section component
 * Displays the main headline, logo, and call-to-action
 * Designed for visual impact when users first land on the page
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <SectionContainer className="justify-center items-center">
      <div className="flex flex-col items-center justify-center text-center px-4" ref={containerRef}>
        <motion.div 
          className="flex items-center mb-4 sm:mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <Image
            src={nutriPeekLogo}
            alt="NutriPeek Logo"
            width={60}
            height={60}
            className="object-contain mr-3 w-[50px] h-[50px] sm:w-[70px] sm:h-[70px]"
            priority
          />
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-600 leading-tight tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            NutriPeek
          </motion.h1>
        </motion.div>

        <motion.p 
          className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 leading-relaxed text-center max-w-2xl mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          Peek inside your fridge. Pack smarter lunches.
          <br/>
          <span className="text-base sm:text-lg text-green-700">
            Nutritional insights for your children's meals
          </span>
        </motion.p>

        <motion.div
          className="mt-6 sm:mt-8 mb-8 sm:mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white py-2 px-6 sm:py-3 sm:px-10 rounded-full shadow-lg text-base sm:text-xl font-semibold flex items-center gap-2"
          >
            Explore Features
            <ArrowCircleRight size={20} weight="bold" />
          </motion.button>
        </motion.div>
      </div>
    </SectionContainer>
  );
}