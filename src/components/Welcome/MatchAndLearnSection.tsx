'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { GameController, CaretRight } from 'phosphor-react';
import SectionContainer from './SectionContainer';
import { getFoodImageUrl } from '@/utils/assetHelpers';

/**
 * Match and Learn Section Component
 * Showcases the educational card game feature
 */
export default function MatchAndLearnSection() {
  const demoCards = [
    { id: 1, name: 'Apple', imageUrl: getFoodImageUrl('apple') },
    { id: 2, name: 'Carrot', imageUrl: getFoodImageUrl('carrot') },
    { id: 3, name: 'Chicken', imageUrl: getFoodImageUrl('chicken') },
    { id: 4, name: 'Broccoli', imageUrl: getFoodImageUrl('broccoli') }
  ];

  return (
    <SectionContainer id="match-and-learn" backgroundClasses="bg-gradient-to-b from-orange-50/30 to-purple-50/30 relative">
      {/* Visual connection elements - connection to previous section */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 sm:w-2 h-16 sm:h-32 bg-gradient-to-b from-orange-200 to-purple-200 hidden sm:block"></div>
      <div className="absolute top-10 sm:top-20 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-purple-200 z-10 animate-pulse hidden sm:block"></div>
      
      {/* Connection label - previous */}
      <div className="hidden sm:block absolute top-21 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100 text-xs font-medium text-purple-600">
        Previous Feature
      </div>
      
      {/* Up arrow indicator */}
      <div className="absolute top-8 sm:top-16 left-1/2 transform -translate-x-1/2 rotate-180 z-20 hidden sm:block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <path d="M12 17L5 10H19L12 17Z" fill="#f97316" />
        </svg>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl overflow-hidden py-8 sm:py-12 px-4 sm:px-6 lg:px-12 shadow-md border border-purple-100">
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-6 lg:gap-12">
          {/* Text Content Side */}
          <motion.div 
            className="lg:w-5/12 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white p-2 md:p-3 rounded-full shadow-sm">
                <GameController size={28} weight="duotone" className="text-purple-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Match & Learn Game</h3>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Make learning about nutrition fun with our educational memory card game.
              Children develop healthy food awareness while enjoying interactive gameplay.
            </p>
            
            <ul className="space-y-2 md:space-y-3 mb-6">
              {[
                "Learn about different food groups through play",
                "Test knowledge with nutrition-based quizzes",
                "Reinforces healthy eating concepts"
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-700"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                >
                  <span className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-xs md:text-sm">
                    {index + 1}
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>

            {/* CTA Button for Match & Learn */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-2 mb-6 md:mb-0"
            >
              <Link href="/MatchAndLearn" passHref>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors shadow-md"
                >
                  Try Match & Learn <CaretRight size={18} weight="bold" />
                </motion.button>
              </Link>
              <p className="text-xs text-gray-500 mt-2 hidden md:block">
                This is a demonstration. Try the full feature by clicking above.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Card Game Visual Representation - hidden on mobile */}
          <motion.div 
            className="lg:w-7/12 hidden md:block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-[280px] sm:max-w-md mx-auto">
              {demoCards.map((card, index) => (
                <div key={index} className="aspect-square perspective-500">
                  <motion.div 
                    className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer`}
                    initial={{ rotateY: 0 }}
                    whileHover={{ rotateY: 180 }}
                    whileTap={{ rotateY: 180 }}
                  >
                    {/* Card back */}
                    <div className="absolute w-full h-full backface-hidden rounded-xl shadow-md border-2 border-white 
                      bg-gradient-to-br from-purple-500 to-indigo-600
                      flex items-center justify-center">
                      <span className="text-2xl sm:text-4xl text-white font-bold">?</span>
                    </div>
                    
                    {/* Card front (food image) */}
                    <div className="absolute w-full h-full backface-hidden rounded-xl shadow-md border-2 p-2 
                      bg-white border-purple-200 rotate-y-180
                      flex flex-col items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center p-2 relative">
                        <Image 
                          src={card.imageUrl}
                          alt={card.name}
                          width={100}
                          height={100}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            {/* Score indicator */}
            <motion.div 
              className="mt-4 sm:mt-6 bg-white py-2 px-3 sm:px-4 rounded-full mx-auto max-w-[220px] sm:max-w-xs flex justify-center shadow-sm border border-purple-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex items-center gap-2 sm:gap-3 text-sm">
                <span className="text-purple-600 font-medium">Score:</span>
                <span className="px-2 py-1 bg-purple-100 rounded-md text-purple-700 font-bold">120</span>
                <div className="h-4 w-px bg-gray-200"></div>
                <span className="text-gray-600">Matches: 6</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
} 