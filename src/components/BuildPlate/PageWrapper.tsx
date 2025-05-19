'use client';

import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import BuildPlateFeature from './BuildPlateFeature';

interface BuildPlateWrapperProps {
  title: string;
  description: string;
}

/**
 * Client-side wrapper for the BuildPlate page
 * Wraps the page content in the FloatingEmojisLayout
 * 
 * @param title - The page title from translations
 * @param description - The page description from translations
 */
export default function BuildPlateWrapper({ title, description }: BuildPlateWrapperProps) {
  return (
    <FloatingEmojisLayout>
      <main className="w-full min-h-screen pb-20 pt-20">
        <div className="container mx-auto px-4 pt-8">
          <h1 className="text-4xl font-bold text-green-600 mb-4 text-center">{title}</h1>
          <p className="text-gray-700 text-lg mb-8 text-center max-w-3xl mx-auto">{description}</p>
          
          {/* Use the client component with internationalization context */}
          <BuildPlateFeature />;
        </div>
      </main>
    </FloatingEmojisLayout>
  );
}