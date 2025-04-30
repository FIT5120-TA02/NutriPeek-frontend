"use client";

/**
 * Match & Learn Page Wrapper
 * Wraps the game component with necessary page layout
 */
import React from 'react';
import MatchAndLearnGame from './MatchAndLearnGame';
import { PageWrapperProps } from './types';
import FloatingEmojisLayout from '../layouts/FloatingEmojisLayout';

export default function PageWrapper({ title, description }: PageWrapperProps) {
  return (
    <FloatingEmojisLayout emojisCount={20}>
      <main className="w-full min-h-screen pb-20 pt-20">
        <div className="container mx-auto px-4 pt-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4 text-center">{title}</h1>
          <p className="text-gray-700 text-lg mb-8 text-center max-w-3xl mx-auto">{description}</p>
          
          {/* Use the client component with internationalization context */}
          <MatchAndLearnGame />;
        </div>
      </main>
    </FloatingEmojisLayout>
  );
} 