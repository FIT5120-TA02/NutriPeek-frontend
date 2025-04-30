'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface BackButtonProps {
  label?: string;
  href?: string;
}

export default function BackButton({ label = 'Back to Building', href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex justify-start mb-6">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-200 to-purple-300 text-indigo-900 font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow-md transition duration-200"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {label}
      </button>
    </div>
  );
}