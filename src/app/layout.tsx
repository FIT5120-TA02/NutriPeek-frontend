'use client';

import { ReactNode } from 'react';
import '@/styles/global.css';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from 'sonner';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { NutritionProvider } from '@/contexts/NutritionContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50">
        <NutritionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center px-4">
            {children}
            <Toaster 
              position="top-center"
              richColors 
              expand={true}
              closeButton
            />
            <ConfirmDialogProvider />
          </main>
        </NutritionProvider>
      </body>
    </html>
  );
}