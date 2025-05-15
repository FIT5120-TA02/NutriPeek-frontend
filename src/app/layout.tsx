'use client';

import { ReactNode, useEffect, useState } from 'react';
import '@/styles/global.css';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from 'sonner';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { NutritionProvider } from '@/contexts/NutritionContext';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Import the PinnedItemsLayout component with no SSR to avoid hydration issues
const PinnedItemsLayout = dynamic(
  () => import('@/components/layouts/PinnedItemsLayout'),
  { ssr: false }
);

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showPinnedItems, setShowPinnedItems] = useState(true);
  
  // Paths where the pinned items layout should be hidden
  const excludedPaths = ['/', '/Welcome'];
  
  useEffect(() => {
    // Update the visibility based on current path
    setShowPinnedItems(!excludedPaths.includes(pathname));
  }, [pathname]);
  
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50">
        <NutritionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center pb-12">
            {children}
            <Toaster 
              position="top-center"
              richColors 
              expand={true}
              closeButton
            />
            <ConfirmDialogProvider />
            
            {/* Add the global pullable pinned items component, but only on allowed paths */}
            {showPinnedItems && <PinnedItemsLayout />}
          </main>
        </NutritionProvider>
      </body>
    </html>
  );
}
