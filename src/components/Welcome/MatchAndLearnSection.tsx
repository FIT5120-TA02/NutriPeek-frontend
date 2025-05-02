'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GameController } from 'phosphor-react';
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
    <SectionContainer id="match-learn" backgroundClasses="bg-gradient-to-b from-orange-50/30 to-purple-50/30 relative">
      {/* Visual connection elements - connection to previous section */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-32 bg-gradient-to-b from-orange-200 to-purple-200"></div>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-purple-200 z-10 animate-pulse"></div>
      
      {/* Connection label - previous */}
      <div className="absolute top-21 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100 text-xs font-medium text-purple-600">
        Previous Feature
      </div>
      
      {/* Up arrow indicator */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 rotate-180 z-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <path d="M12 17L5 10H19L12 17Z" fill="#f97316" />
        </svg>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl overflow-hidden py-12 px-6 lg:px-12 shadow-md border border-purple-100">
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-12">
          {/* Text Content Side */}
          <motion.div 
            className="lg:w-5/12"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <GameController size={36} weight="duotone" className="text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Match & Learn Game</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Make learning about nutrition fun with our educational memory card game.
              Children develop healthy food awareness while enjoying interactive gameplay.
            </p>
            
            <ul className="space-y-3">
              {[
                "Learn about different food groups through play",
                "Test knowledge with nutrition-based quizzes",
                "Reinforces healthy eating concepts"
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center gap-3 text-gray-700"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                >
                  <span className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                    {index + 1}
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Card Game Visual Representation */}
          <motion.div 
            className="lg:w-7/12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
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
                      <span className="text-4xl text-white font-bold">?</span>
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
              className="mt-6 bg-white py-2 px-4 rounded-full mx-auto max-w-xs flex justify-center shadow-sm border border-purple-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
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