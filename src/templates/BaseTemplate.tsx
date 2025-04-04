'use client';

import React from 'react';

type BaseTemplateProps = {
  children: React.ReactNode;
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
};

export function BaseTemplate({ children, leftNav, rightNav }: BaseTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between px-6 py-4 border-b border-gray-200">

        <nav>
          <ul className="flex space-x-4 items-center">{leftNav}</ul>
        </nav>
        <nav>
          <ul className="flex space-x-4 items-center">{rightNav}</ul>
        </nav>
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
