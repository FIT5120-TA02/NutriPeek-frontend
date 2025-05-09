'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionContainer from './SectionContainer';

/**
 * ProductVideoSection component
 * 
 * Displays the product video with character avatars in an interactive layout
 * Features responsive design and animations to engage users
 */
export default function ProductVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Character avatar data - rearranged in order: father, mother, child, dog
  const characters = [
    { name: 'Father', src: `${process.env.NEXT_PUBLIC_CDN_URL}/avatars/father.png`, alt: 'Father avatar' },
    { name: 'Mother', src: `${process.env.NEXT_PUBLIC_CDN_URL}/avatars/mother.png`, alt: 'Mother avatar' },
    { name: 'Child', src: `${process.env.NEXT_PUBLIC_CDN_URL}/avatars/child.png`, alt: 'Child avatar' },
    { name: 'Dog', src: `${process.env.NEXT_PUBLIC_CDN_URL}/avatars/dog.png`, alt: 'Dog avatar' },
  ];

  return (
    <SectionContainer 
      id="product-video" 
      className="justify-center items-center"
      backgroundClasses="bg-gradient-to-b from-green-50 to-green-100"
    >
      <div className="flex flex-col items-center justify-center w-full" ref={containerRef}>
        {/* Characters above header in a single group */}
        <div className="flex justify-center w-full mb-4 sm:mb-6">
          <div className="flex items-end">
            {/* Father */}
            <div className="z-30">
              <Image
                src={characters[0].src}
                alt={characters[0].alt}
                width={isMobile ? 55 : isTablet ? 70 : 85}
                height={isMobile ? 55 : isTablet ? 70 : 85}
                className="object-contain drop-shadow-md"
              />
            </div>
            
            {/* Mother */}
            <div className="-ml-3 sm:-ml-4 z-20">
              <Image
                src={characters[1].src}
                alt={characters[1].alt}
                width={isMobile ? 50 : isTablet ? 65 : 80}
                height={isMobile ? 50 : isTablet ? 65 : 80}
                className="object-contain drop-shadow-md"
              />
            </div>
            
            {/* Child */}
            <div className="-ml-3 sm:-ml-4 z-10">
              <Image
                src={characters[2].src}
                alt={characters[2].alt}
                width={isMobile ? 45 : isTablet ? 55 : 70}
                height={isMobile ? 45 : isTablet ? 55 : 70}
                className="object-contain drop-shadow-md"
              />
            </div>
            
            {/* Dog */}
            <div className="-ml-2 sm:-ml-3 mt-2 sm:mt-3">
              <Image
                src={characters[3].src}
                alt={characters[3].alt}
                width={isMobile ? 35 : isTablet ? 45 : 60}
                height={isMobile ? 35 : isTablet ? 45 : 60}
                className="object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
        
        {/* Header */}
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 text-center mx-auto mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          See NutriPeek in Action
        </motion.h2>
        
        <motion.p
          className="text-base sm:text-lg text-gray-600 max-w-2xl text-center mb-6 md:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Watch how NutriPeek helps families make healthier meal choices with ease
        </motion.p>

        {/* Video container with constrained size */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Video Player with responsive constraints */}
          <motion.div 
            className="relative aspect-video overflow-hidden rounded-xl shadow-2xl bg-black/5 max-h-[60vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : isTablet ? '90%' : '85%',
              margin: '0 auto'
            }}
          >
            <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${videoLoaded ? 'hidden' : 'flex'}`}>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <iframe 
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/product_video/NutriPeek.mp4`}
              className="absolute inset-0 w-full h-full rounded-xl"
              title="NutriPeek Product Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
              style={{ opacity: videoLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
            />
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
} 