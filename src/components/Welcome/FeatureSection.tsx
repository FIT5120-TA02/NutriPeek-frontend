'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ChartPie, Barbell, Hamburger, ArrowRight } from 'phosphor-react';
import Card from '../ui/Card';
import SectionContainer from './SectionContainer';
import MobileCarousel, { CarouselItem } from '../ui/MobileCarousel';
import Link from 'next/link';

/**
 * Feature Section Component
 * Displays features in a grid on desktop and as a swipeable carousel on mobile
 */
export default function FeatureSection() {
  const [isMobile, setIsMobile] = useState(false);

  const features = [
    {
      title: "Image Recognition",
      description: "Instantly identify food items in your fridge with our smart AI image recognition technology.",
      icon: <Camera size={36} weight="duotone" className="text-green-500" />,
      color: "bg-green-50/70"
    },
    {
      title: "Nutritional Analysis",
      description: "Get detailed nutritional insights for better meal planning tailored to your child's specific needs.",
      icon: <ChartPie size={36} weight="duotone" className="text-blue-500" />,
      color: "bg-blue-50/70"
    },
    {
      title: "Physical Activity Analysis",
      description: "Track and analyze your child's activity levels to better understand their nutritional requirements.",
      icon: <Barbell size={36} weight="duotone" className="text-purple-500" />,
      color: "bg-purple-50/70"
    },
    {
      title: "Activity-Linked Meals",
      description: "Receive meal recommendations that adapt to your child's daily physical activity levels.",
      icon: <Hamburger size={36} weight="duotone" className="text-orange-500" />,
      color: "bg-orange-50/70"
    }
  ];

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

  // Generate carousel items
  const carouselItems: CarouselItem[] = features.map((feature, index) => ({
    key: index,
    content: (
      <Card className={`backdrop-blur-sm ${feature.color} border border-white/20`}>
        <div className="flex flex-col items-center text-center py-6 px-4">
          <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
            {feature.icon}
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </Card>
    )
  }));

  return (
    <SectionContainer id="features" backgroundClasses="bg-gradient-to-b from-white to-green-50/30 relative">
      {/* Visual connection elements */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-16 sm:h-24 bg-gradient-to-b from-green-200 to-orange-200 hidden sm:block"></div>
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-green-200 z-10 animate-pulse hidden sm:block"></div>
      
      {/* Connection label */}
      <div className="hidden sm:block absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-green-100 text-xs font-medium text-green-600">
        Next Feature
      </div>
      
      {/* Down arrow indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <path d="M12 17L5 10H19L12 17Z" fill="#f97316" />
        </svg>
      </div>
    
      {/* Main Features Header */}
      <motion.div 
        className="text-center mb-8 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-3 md:mb-4">Features You'll Love</h2>
        <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Discover how NutriPeek helps you create healthier lunch boxes for your children with these powerful features.
        </p>
      </motion.div>

      {/* Desktop View - Grid Layout */}
      {!isMobile && (
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full backdrop-blur-sm ${feature.color} border border-white/20 hover:border-green-200 hover:translate-y-[-5px] transition-all duration-300`}>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mobile View - Carousel */}
      {isMobile && (
        <div className="md:hidden">
          <MobileCarousel 
            items={carouselItems}
            className="mb-8"
          />
        </div>
      )}

      {/* CTA Button */}
      <motion.div
        className="flex justify-center mt-8 md:mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link href="/NutriScan" passHref>
          <motion.button
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Try NutriScan Now
            <ArrowRight size={20} weight="bold" />
          </motion.button>
        </Link>
      </motion.div>
    </SectionContainer>
  );
} 