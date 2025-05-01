'use client';

import { ReactNode } from 'react';

interface TabCardProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export default function NutrientTabCard({ title, isActive, onClick, icon }: TabCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative cursor-pointer px-8 py-3 rounded-t-lg font-medium text-base
        flex items-center gap-2
        ${isActive 
          ? 'bg-white text-emerald-600 shadow-sm' 
          : 'bg-green-100 text-gray-600 hover:bg-green-50'
        }
        transition-all duration-200
      `}
    >
      {/* Trapezoid shape for active tab */}
      {isActive && (
        <div className="absolute -bottom-1 left-0 w-full h-1 bg-white rounded-t-lg z-10"></div>
      )}
      
      {/* Icon */}
      {icon && <span>{icon}</span>}
      
      {/* Title */}
      <span>{title}</span>
    </div>
  );
} 