'use client';

import React from 'react';
import Image from 'next/image';
import { getChildAvatarUrl } from '@/utils/assetHelpers';

interface ChildAvatarProps {
  name: string;
  gender?: string;
  avatarNumber?: number;
  size?: number; // diameter in px
  onChangeAvatar?: () => void;
  clickable?: boolean;
}

/**
 * ChildAvatar component for displaying child avatar images
 * Uses the new avatar system with multiple avatar options per gender
 */
export default function ChildAvatar({ 
  name, 
  gender = 'male', 
  avatarNumber = 1, 
  size = 100, 
  onChangeAvatar,
  clickable = false 
}: ChildAvatarProps) {
  const displayName = name.trim();
  const avatarUrl = getChildAvatarUrl(gender, avatarNumber);

  return (
    <div 
      className={`relative rounded-full overflow-hidden border-2 border-white shadow-md ${clickable ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size }}
      onClick={clickable ? onChangeAvatar : undefined}
    >
      <Image
        src={avatarUrl}
        alt={`${displayName}'s avatar`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
      
      {clickable && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-1/3 h-1/3"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      )}
    </div>
  );
}


