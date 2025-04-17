'use client';

import { ReactNode } from 'react';
import '@/styles/global.css';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from 'sonner';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
<<<<<<< HEAD
=======
import { NutritionProvider } from '@/contexts/NutritionContext';
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50">
<<<<<<< HEAD
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
=======
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
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
      </body>
    </html>
  );
}
<<<<<<< HEAD
=======


>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
