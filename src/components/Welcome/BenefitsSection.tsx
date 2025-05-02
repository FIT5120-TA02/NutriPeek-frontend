'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Barbell, UserFocus, ShieldCheck } from 'phosphor-react';
import SectionContainer from './SectionContainer';
import MobileCarousel, { CarouselItem } from '../ui/MobileCarousel';

/**
 * Benefits section component
 * Showcases the key benefits users get from using NutriPeek
 * Uses icons and cards to emphasize the value proposition
 */
export default function BenefitsSection() {
  const [isMobile, setIsMobile] = useState(false);
  
  const benefits = [
    {
      title: "Smarter Nutrition for Active Kids",
      description: "Dynamically matches nutrition recommendations to your child's activity levels, optimizing energy balance and supporting healthy development.",
      icon: <Barbell size={48} weight="duotone" className="text-blue-500" />,
    },
    {
      title: "Personalized to Each Child",
      description: "Creates custom meal suggestions tailored to your child's unique profile, dietary needs, and activity patterns for precise nutritional support.",
      icon: <UserFocus size={48} weight="duotone" className="text-purple-500" />,
    },
    {
      title: "Peace of Mind",
      description: "Ensure lunch boxes meet nutritional requirements with confidence, backed by evidence-based recommendations.",
      icon: <ShieldCheck size={48} weight="duotone" className="text-green-500" />,
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

  // Generate carousel items for mobile
  const carouselItems: CarouselItem[] = benefits.map((benefit, index) => ({
    key: index,
    content: (
      <Card className="h-full bg-white/80 backdrop-blur-sm border border-white/20">
        <div className="flex flex-col items-center text-center h-full p-5">
          <div className="mb-4 p-3 rounded-full bg-green-50/60">
            {benefit.icon}
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">{benefit.title}</h3>
          <p className="text-sm text-gray-600">{benefit.description}</p>
        </div>
      </Card>
    )
  }));

  return (
    <SectionContainer>
      <motion.div 
        className="text-center mb-6 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-2 md:mb-4">Smart Nutrition, Personalized</h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          NutriPeek delivers tailored nutrition guidance that adapts to your child's unique needs, activity levels, and dietary requirements.
        </p>
      </motion.div>

      {/* Desktop View - Grid Layout */}
      {!isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex h-full"
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm hover:shadow-xl border border-white/20">
                <div className="flex flex-col items-center text-center h-full p-6">
                  <div className="mb-6 p-4 rounded-full bg-green-50/60">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Mobile View - Carousel */
        <div className="md:hidden">
          <MobileCarousel 
            items={carouselItems}
            className="mb-4"
          />
        </div>
      )}

      <motion.div 
        className={`${isMobile ? 'mt-6' : 'mt-12'} text-center`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <p className={`${isMobile ? 'text-xs' : 'text-lg'} text-green-700 font-medium italic`}>
          "NutriPeek transformed how we approach nutrition for our active children, making personalized meal planning effortless and effective."
        </p>
      </motion.div>
    </SectionContainer>
  );
}