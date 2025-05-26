'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChartPie, Barbell, Hamburger, ArrowRight } from 'phosphor-react';
import Card from '../ui/Card';
import SectionContainer from './SectionContainer';
import MobileCarousel, { CarouselItem } from '../ui/MobileCarousel';
import Link from 'next/link';

/**
 * Feature Section Component
 * Displays features in different layouts based on screen size:
 * - Desktop: horizontal timeline
 * - Tablet: 2x2 grid
 * - Mobile: swipeable carousel
 */
export default function FeatureSection() {
  const [viewportSize, setViewportSize] = useState('desktop');
  const [activeStep, setActiveStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const features = [
    {
      title: "Image Recognition",
      description: "Instantly identify food items in your fridge with our smart AI image recognition technology.",
      icon: <Camera size={28} weight="duotone" className="text-green-500" />,
      color: "bg-green-50/70",
      step: "Step 1",
      cta: "Scan your ingredients"
    },
    {
      title: "Physical Activity Tracker",
      description: "Track and log your child's daily activities to understand their energy expenditure and requirements.",
      icon: <Barbell size={28} weight="duotone" className="text-purple-500" />,
      color: "bg-purple-50/70",
      step: "Step 2",
      cta: "Log activity levels"
    },
    {
      title: "Nutritional Analysis",
      description: "Get detailed nutritional insights for better meal planning tailored to your child's specific needs.",
      icon: <ChartPie size={28} weight="duotone" className="text-blue-500" />,
      color: "bg-blue-50/70",
      step: "Step 3",
      cta: "Review nutritional gaps"
    },
    {
      title: "Smart Recommendations",
      description: "Receive meal suggestions that adapt to your child's nutritional needs and daily physical activity levels.",
      icon: <Hamburger size={28} weight="duotone" className="text-orange-500" />,
      color: "bg-orange-50/70",
      step: "Step 4",
      cta: "Get personalized recommendations"
    }
  ];

  // Check viewport size
  useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth < 768) {
        setViewportSize('mobile');
      } else if (window.innerWidth < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    // Check on mount
    checkViewport();
    
    // Update on resize
    window.addEventListener('resize', checkViewport);
    
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Set up cyclical animation of steps for desktop view
  useEffect(() => {
    if (viewportSize === 'desktop') {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start a new interval that cycles through steps
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % features.length);
      }, 3000);
      
      // Clean up on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [viewportSize, features.length]);

  // Generate carousel items for mobile view
  const carouselItems: CarouselItem[] = features.map((feature, index) => ({
    key: index,
    content: (
      <Card className={`backdrop-blur-sm ${feature.color} border border-white/20`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-1 bg-white/80 rounded-full px-3 py-0.5 text-xs font-medium text-green-700">
            {feature.step}
          </div>
          <div className="mb-3 p-2.5 bg-white rounded-full shadow-sm">
            {feature.icon}
          </div>
          <h3 className="text-base font-bold mb-1.5 text-gray-800">{feature.title}</h3>
          <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
          <div className={`mt-auto px-3 py-1 rounded-full text-xs font-medium ${
            activeStep === index 
              ? 'bg-green-100 text-green-700' 
              : 'bg-white/80 text-gray-500'
          }`}>
            {feature.cta}
          </div>
        </div>
      </Card>
    )
  }));

  // Render a single feature card (used for tablet and desktop)
  const renderFeatureCard = (feature: typeof features[0], index: number, isDesktop: boolean = false) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="h-full"
      >
        <Card 
          className={`${feature.color} border ${
            isDesktop && activeStep === index 
              ? 'border-green-300 shadow-md' 
              : 'border-white/20 shadow-sm'
          } backdrop-blur-sm transition-all duration-300 h-full`}
        >
          <div className="p-3 flex flex-col items-center text-center">
            <div className="mb-1 bg-white/80 rounded-full px-3 py-0.5 text-xs font-medium text-green-700">
              {feature.step}
            </div>
            <div className="mb-3 p-2.5 bg-white rounded-full shadow-sm">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold mb-1.5 text-gray-800 text-center text-wrap">{feature.title}</h3>
            <p className="text-xs text-gray-600 mb-2 text-center">{feature.description}</p>
            <div className={`mt-auto px-3 py-1 rounded-full text-xs font-medium text-center ${
              isDesktop && activeStep === index 
                ? 'bg-green-100 text-green-700' 
                : 'bg-white/80 text-gray-500'
            }`}>
              {feature.cta}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <SectionContainer id="features" backgroundClasses="bg-gradient-to-b from-white to-green-50/30 relative" nextIsMinHeight={true}>    
      {/* Main Features Header */}
      <motion.div 
        className="text-center mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-3 md:mb-4">How NutriPeek Works</h2>
        <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto px-4 mb-6">
          Discover our simple 4-step process to create healthier lunch boxes for your children based on both nutritional needs and physical activity.
        </p>
        
        {/* CTA Button */}
        <motion.div
          className="flex justify-center"
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
      </motion.div>

      {/* Desktop View - Horizontal Timeline Layout */}
      {viewportSize === 'desktop' && (
        <div className="hidden lg:block max-w-6xl mx-auto px-4 py-8">
          {/* Timeline Container */}
          <div className="relative flex justify-center items-center min-h-[50vh]">
            {/* Main Timeline Line */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-100 z-0"></div>
            
            {/* Features Container */}
            <div className="relative grid grid-cols-4 gap-6 w-full">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Card Content (Alternating Positions) */}
                  <motion.div
                    className={`relative w-full ${index % 2 === 0 ? 'order-first mb-10' : 'order-last mt-10'}`}
                    initial={{ opacity: 0, y: index % 2 === 0 ? -20 : 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: activeStep === index ? 1.05 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {renderFeatureCard(feature, index, true)}
                    
                    {/* Vertical Connection Line to Timeline */}
                    <div 
                      className={`absolute left-1/2 transform -translate-x-1/2 ${
                        index % 2 === 0 ? 'top-full' : 'bottom-full'
                      } h-6 w-0.5 bg-green-200 ${
                        activeStep === index ? 'opacity-100' : 'opacity-40'
                      }`}
                    ></div>
                  </motion.div>
                  
                  {/* Step Circle on Timeline - Alternate positions */}
                  {(index === 0 || index === 2) ? (
                    <motion.div 
                      className="relative z-10"
                      animate={{ 
                        scale: activeStep === index ? [1, 1.1, 1] : 1
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: activeStep === index ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                          activeStep === index 
                            ? 'bg-green-500 text-white ring-2 ring-green-200' 
                            : 'bg-white text-green-700 border-2 border-green-300'
                        } transition-all duration-300`}
                      >
                        <span className="text-base font-bold">{index + 1}</span>
                      </div>
                    </motion.div>
                  ) : (
                    // Empty space for steps 2 and 4 (at bottom)
                    <div className="h-10 w-full"></div>
                  )}
                  
                  {/* Empty space or circle (opposite of above) */}
                  {(index === 1 || index === 3) ? (
                    <motion.div 
                      className="relative z-10 mt-10"
                      animate={{ 
                        scale: activeStep === index ? [1, 1.1, 1] : 1
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: activeStep === index ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                          activeStep === index 
                            ? 'bg-green-500 text-white ring-2 ring-green-200' 
                            : 'bg-white text-green-700 border-2 border-green-300'
                        } transition-all duration-300`}
                      >
                        <span className="text-base font-bold">{index + 1}</span>
                      </div>
                    </motion.div>
                  ) : (
                    // Empty space for steps 1 and 3 (at top)
                    <div className="h-16 w-full"></div>  
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tablet View - Simple 2x2 Grid */}
      {viewportSize === 'tablet' && (
        <div className="hidden md:block lg:hidden px-4 py-6">
          <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex">
                {renderFeatureCard(feature, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile View - Carousel */}
      {viewportSize === 'mobile' && (
        <div className="md:hidden">
          <MobileCarousel 
            items={carouselItems}
            className="mb-6"
            autoAdvance={true}
            autoAdvanceInterval={4000}
            initialIndex={activeStep}
            onSlideChange={(index) => setActiveStep(index)}
          />
        </div>
      )}
    </SectionContainer>
  );
} 