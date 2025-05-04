'use client';

import React from 'react';
import Image from 'next/image';
import { getChildAvatarUrl } from '@/utils/assetHelpers';
import { AvatarSelectorProps } from './types';

/**
 * AvatarSelector component
 * Displays a grid of available avatars for selection based on gender
 */
export default function AvatarSelector({ gender, selectedAvatar, onSelect }: AvatarSelectorProps) {
  // Create an array of avatar numbers (1-5)
  const avatarNumbers = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Select an Avatar</h3>
      
      <div className="grid grid-cols-5 gap-3">
        {avatarNumbers.map((num) => (
          <div 
            key={num}
            className={`
              relative cursor-pointer rounded-full overflow-hidden
              transition-all duration-200 transform hover:scale-105
              ${selectedAvatar === num ? 'ring-4 ring-green-500' : 'ring-2 ring-transparent hover:ring-gray-300'}
            `}
            onClick={() => onSelect(num)}
          >
            <div className="aspect-square">
              <Image
                src={getChildAvatarUrl(gender, num)}
                alt={`Avatar option ${num}`}
                fill
                sizes="(max-width: 768px) 60px, 80px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 