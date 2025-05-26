'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowCircleRight, Eye, Heart, Sparkle } from 'phosphor-react';
import { useRouter } from 'next/navigation';
import nutriPeekLogo from '@/../public/nutripeek.png';
import SectionContainer from './SectionContainer';
import { getLandingPageAssetUrl } from '@/utils/assetHelpers';

/**
 * Hero section component
 * Displays the main headline, logo, and call-to-action
 * Designed for visual impact when users first land on the page
 */
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        type: "spring",
        bounce: 0.4
      }
    }
  };

  const fridgeVariants = {
    hidden: { opacity: 0, x: 100, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <SectionContainer className="justify-center items-center overflow-hidden">
      <motion.div 
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <motion.div 
            className="flex flex-col justify-center space-y-6 lg:space-y-8 text-center lg:text-left"
            variants={itemVariants}
          >
            {/* Logo and Title */}
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <motion.div variants={logoVariants}>
                <Image
                  src={nutriPeekLogo}
                  alt="NutriPeek Logo"
                  width={80}
                  height={80}
                  className="object-contain mr-4 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]"
                  priority
                />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-green-600 leading-tight tracking-tight"
                variants={itemVariants}
              >
                NutriPeek
              </motion.h1>
            </div>

            {/* Tagline with animated icons */}
            <motion.div 
              className="space-y-4"
              variants={itemVariants}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-green-600">Peek inside your fridge.</span>
                <span className="text-gray-800 ml-2">Pack smarter lunches.</span>
              </h2>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl font-medium text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              <span className="text-green-700 font-semibold">Nutritional insights</span> for your children's meals
              <motion.span 
                className="inline-block ml-2"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              >
                <Sparkle size={24} className="text-yellow-500" weight="fill" />
              </motion.span>
            </motion.p>

            {/* Feature highlights */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm sm:text-base"
              variants={itemVariants}
            >
              {['AI-Powered Scans', 'Nutritional Tracking', 'Smart Recommendations', 'Interactive Learning'].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {feature}
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="pt-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => {
                  router.push('/NutriScan');
                }}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "#22c55e",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 sm:py-4 sm:px-12 rounded-full shadow-xl text-lg sm:text-xl font-bold flex items-center gap-3 mx-auto lg:mx-0 transition-all duration-300"
              >
                <span>Launch Scan</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowCircleRight size={24} weight="bold" />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Column - Fridge Image */}
          <motion.div 
            className="flex justify-center lg:justify-end items-center relative"
            variants={fridgeVariants}
          >
            <motion.div
              className="relative"
              variants={floatingVariants}
              animate="animate"
            >
              <Image
                src={getLandingPageAssetUrl('fridge.png')}
                alt="Smart Fridge with NutriPeek"
                width={500}
                height={600}
                className="object-contain w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] h-auto drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-20"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>
    </SectionContainer>
  );
}