'use client';

import React from 'react';
import FloatingEmojisLayout from '../../../components/layouts/FloatingEmojisLayout';
import FarmersMarketMap from '../../../components/SeasonalFood/FarmersMarketMap';

/**
 * SeasonalFood page component
 * Shows an interactive map of Australia with seasonal food information
 * and nearby farmers markets
 */
export default function SeasonalFoodPage() {
  return (
    <FloatingEmojisLayout 
      backgroundClasses="bg-gradient-to-b from-green-50 to-blue-50"
    >
      <main className="w-full min-h-screen pb-20 pt-20">
        <FarmersMarketMap />
      </main>
    </FloatingEmojisLayout>
  );
} 