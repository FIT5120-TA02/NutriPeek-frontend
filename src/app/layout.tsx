'use client';

import { ReactNode } from 'react';
import '@/styles/global.css';
import Navbar from '@/components/ui/Navbar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
