'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Hamburger, CaretRight } from 'phosphor-react';
import SectionContainer from './SectionContainer';
import { getFoodImageUrl, getPlateImageUrl } from '@/utils/assetHelpers';
import AvatarFeedback from '../BuildPlate/AvatarFeedback';

/**
 * Plate Builder Section Component
 * Showcases the interactive plate builder feature
 */
export default function PlateBuilderSection() {
  // Food items data with positions
  const foodItems = [
    { 
      name: 'apple', 
      alt: 'Fruit',
      position: 'top-4 right-8 md:right-8',
      size: 'w-12 h-12 md:w-16 md:h-16',
      animation: { y: [-8, 0] },
      duration: 2
    },
    { 
      name: 'chicken', 
      alt: 'Protein',
      position: 'bottom-8 left-12 md:left-12',
      size: 'w-10 h-10 md:w-14 md:h-14',
      animation: { y: [5, -5] },
      duration: 2.3
    },
    { 
      name: 'carrot', 
      alt: 'Vegetable',
      position: 'bottom-20 right-20 md:right-28',
      size: 'w-10 h-10 md:w-12 md:h-12',
      animation: { y: [0, 8] },
      duration: 2.5
    },
    { 
      name: 'broccoli', 
      alt: 'Vegetable',
      position: 'top-16 left-8 md:left-8',
      size: 'w-10 h-10 md:w-12 md:h-12',
      animation: { x: [-5, 5] },
      duration: 3
    },
    { 
      name: 'bread', 
      alt: 'Grain',
      position: 'top-24 right-16 md:top-38 md:right-20',
      size: 'w-10 h-10 md:w-14 md:h-14',
      animation: { y: [3, -3] },
      duration: 1.8
    },
    { 
      name: 'banana', 
      alt: 'Fruit',
      position: 'top-1 left-24 md:left-44',
      size: 'w-10 h-10 md:w-13 md:h-13',
      animation: { x: [5, -5] },
      duration: 2.7
    },
    { 
      name: 'egg', 
      alt: 'Protein',
      position: 'bottom-24 left-20 md:bottom-34 md:left-28',
      size: 'w-9 h-9 md:w-11 md:h-11',
      animation: { y: [-4, 4] },
      duration: 2.2
    },
    { 
      name: 'milk', 
      alt: 'Dairy',
      position: 'bottom-12 left-36 md:left-76',
      size: 'w-10 h-10 md:w-15 md:h-15',
      animation: { rotate: [-5, 5] },
      duration: 3.2
    }
  ];

  return (
    <SectionContainer id="plate-builder" backgroundClasses="bg-gradient-to-b from-green-50/30 to-orange-50/30 relative">
      {/* Visual connection elements - connection to previous section */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-16 sm:h-32 bg-gradient-to-b from-green-200 to-orange-200 hidden sm:block"></div>
      <div className="absolute top-10 sm:top-20 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-orange-200 z-10 animate-pulse hidden sm:block"></div>
      
      {/* Connection label - previous */}
      <div className="hidden sm:block absolute top-21 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-orange-100 text-xs font-medium text-orange-600">
        Previous Feature
      </div>
      
      {/* Up arrow indicator */}
      <div className="absolute top-8 sm:top-16 left-1/2 transform -translate-x-1/2 rotate-180 z-20 hidden sm:block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <path d="M12 17L5 10H19L12 17Z" fill="#22c55e" />
        </svg>
      </div>
      
      {/* Visual connection elements - connection to next section */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-16 sm:h-24 bg-gradient-to-b from-orange-200 to-purple-200 hidden sm:block"></div>
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-orange-200 z-10 animate-pulse hidden sm:block"></div>
      
      {/* Connection label - next */}
      <div className="hidden sm:block absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-orange-100 text-xs font-medium text-orange-600">
        Next Feature
      </div>
      
      {/* Down arrow indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <path d="M12 17L5 10H19L12 17Z" fill="#a855f7" />
        </svg>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-12 shadow-md border border-orange-100">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
          {/* Text Content Side */}
          <motion.div 
            className="lg:w-5/12 w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white p-2 md:p-3 rounded-full shadow-sm">
                <Hamburger size={28} weight="duotone" className="text-orange-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Interactive Plate Builder</h3>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Create balanced, nutritious meals with our intuitive drag-and-drop lunchbox builder. 
              Help your children visualize healthy meal portions while learning about nutrition.
            </p>
            
            <ul className="space-y-2 md:space-y-3 mb-6">
              {[
                "Drag and drop foods onto the plate",
                "Finish building your plate to see nutritional analysis",
                "Get personalized feedback on meal balance"
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                >
                  <span className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-xs md:text-sm">
                    {index + 1}
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>

            {/* CTA Button for Plate Builder */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-2 mb-6 md:mb-0"
            >
              <Link href="/BuildPlate" passHref>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors shadow-md"
                >
                  Try Building a Plate <CaretRight size={18} weight="bold" />
                </motion.button>
              </Link>
              <p className="text-xs text-gray-500 mt-2 hidden md:block">
                This is a demonstration. Try the full feature by clicking above.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Visual Plate Builder Representation - hidden on mobile */}
          <motion.div 
            className="lg:w-7/12 relative hidden md:block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Avatar Feedback - avatar only, no message bubble */}
            <motion.div 
              className="absolute -bottom-12 -right-12 transform scale-75 md:scale-90 origin-top-left z-30 hidden sm:block"
              initial={{ scale: 0.8 }}
              animate={{ scale: 0.85 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2
              }}
            >
              <AvatarFeedback 
                emotion="happy" 
              />
            </motion.div>

            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border-4 border-white mt-4 md:mt-8">
              {/* Lunchbox image container with fixed positioning */}
              <div className="relative aspect-video md:aspect-[16/10] w-full">
                <Image 
                  src={getPlateImageUrl('lunchbox')}
                  alt="Interactive Plate Builder Interface" 
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />
              </div>
              
              {/* Food items positioned closer to the lunchbox */}
              {foodItems.map((food, index) => (
                <motion.div 
                  key={index}
                  className={`absolute ${food.position} ${food.size} bg-white rounded-full shadow-lg p-1 md:p-1.5 flex items-center justify-center z-10`}
                  initial={food.animation}
                  animate={{ 
                    y: food.animation.y?.[1] || 0, 
                    x: food.animation.x?.[1] || 0,
                    rotate: food.animation.rotate?.[1] || 0
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: food.duration,
                    delay: index * 0.15
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-orange-100">
                    <Image 
                      src={getFoodImageUrl(food.name)}
                      alt={food.alt} 
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              ))}

              {/* Decorative elements */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 md:w-32 md:h-32 bg-orange-50 rounded-full -z-10"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 md:w-24 md:h-24 bg-green-50 rounded-full -z-10"></div>
            </div>

            {/* Nutritional indicator dots */}
            <div className="mt-3 md:mt-4 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-300"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
} 