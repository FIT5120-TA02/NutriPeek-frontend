'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Leaf, Heart, MapPin, House, Hamburger } from 'phosphor-react';
import { Acorn, Avocado, Carrot } from '@phosphor-icons/react';
import SectionContainer from './SectionContainer';
import { getAuStateImageUrl } from '@/utils/assetHelpers';

/**
 * SeasonalFoodSection component
 * Showcase the Seasonal Foods feature on the landing page
 * Highlights benefits of eating seasonal foods and finding local farmers markets
 */
export default function SeasonalFoodSection() {
  const router = useRouter();

  const handleExploreSeasonalFoods = () => {
    router.push('/SeasonalFood');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const [isMobile, setIsMobile] = React.useState(false);
  
  // Check if the screen is mobile size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <SectionContainer 
      id="seasonal-food" 
      removeMinHeight={true}
      className="py-16 md:py-24 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Left side: Text content */}
        <motion.div 
          className={`w-full ${!isMobile ? 'md:w-1/2' : ''}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Discover Seasonal Foods <span className="text-green-600">&</span> Local Markets
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-6"
            variants={itemVariants}
          >
            Connect your nutrition recommendations with what's fresh, local, and in season. Find the perfect ingredients 
            for your child's nutrition needs at farmers markets near you.
          </motion.p>
          
          {/* Benefits list */}
          <motion.ul className="space-y-3 mb-8" variants={containerVariants}>
            {[
              { icon: <Leaf size={24} className="text-green-600" />, text: 'Higher nutritional value from freshly harvested produce' },
              { icon: <Heart size={24} className="text-red-500" />, text: 'Better taste and quality from seasonal foods' },
              { icon: <MapPin size={24} className="text-blue-600" />, text: 'Interactive map of nearby farmers markets' },
              { icon: <House size={24} className="text-green-700" />, text: 'Support local farmers and sustainable food systems' }
            ].map((item, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-3"
                variants={itemVariants}
              >
                <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                <span className="text-gray-700">{item.text}</span>
              </motion.li>
            ))}
          </motion.ul>
          
          <motion.div variants={itemVariants}>
            <button
              onClick={handleExploreSeasonalFoods}
              className="px-6 py-3 bg-green-500 text-white rounded-full font-medium shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Explore Seasonal Foods
            </button>
          </motion.div>
        </motion.div>
        
        {/* Right side: Illustration - Hidden on mobile */}
        {!isMobile && (
          <motion.div 
            className="w-full md:w-1/2 relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Image */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <img 
                  src={getAuStateImageUrl()} 
                  alt="Interactive map showing farmers markets and seasonal foods" 
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400/e6f4ea/1b873d?text=Seasonal+Foods+Map&font=montserrat";
                  }}
                />
              </div>
              
              {/* Floating food icons */}
              <motion.div 
                className="absolute top-40 right-30 bg-white p-2 rounded-full shadow-md z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                <Carrot size={24} className="text-orange-500" />
              </motion.div>
              <motion.div 
                className="absolute bottom-50 left-54 bg-white p-2 rounded-full shadow-md z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
              >
                <Avocado size={24} className="text-green-500" />
              </motion.div>
              <motion.div 
                className="absolute top-2/5 left-20 bg-white p-2 rounded-full shadow-md z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
              >
                <Acorn size={24} className="text-amber-600" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </SectionContainer>
  );
} 