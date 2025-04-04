'use client';

import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Card({ title, children, actions }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between w-full md:w-80">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-700">{title}</h2>
        {children}
      </div>
      {actions && (
        <div className="mt-4 flex justify-end space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}
