"use client";

/**
 * Match & Learn Page Wrapper
 * Wraps the game component with necessary page layout
 * Enhanced with mobile-responsive design
 */
import React from 'react';
import MatchAndLearnGame from './MatchAndLearnGame';
import { PageWrapperProps } from './types';
import FloatingEmojisLayout from '../layouts/FloatingEmojisLayout';
import useDeviceDetection from '@/hooks/useDeviceDetection';

export default function PageWrapper({ title, description }: PageWrapperProps) {
  const { isMobile } = useDeviceDetection();
  
  return (
    <FloatingEmojisLayout emojisCount={isMobile ? 10 : 20}>
      <main className={`w-full min-h-screen pb-16 ${isMobile ? 'pt-14' : 'pt-20'}`}>
        <div className="container mx-auto px-4 pt-4">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-green-600 mb-4 text-center`}>
            {title}
          </h1>
          <p className={`text-gray-700 ${isMobile ? 'text-base mb-6' : 'text-lg mb-8'} text-center max-w-3xl mx-auto`}>
            {isMobile ? description.split('.')[0] + '.' : description}
          </p>
          
          {/* Use the client component with internationalization context */}
          <MatchAndLearnGame />
        </div>
      </main>
    </FloatingEmojisLayout>
  );
} 