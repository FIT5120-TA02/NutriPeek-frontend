'use client';

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
