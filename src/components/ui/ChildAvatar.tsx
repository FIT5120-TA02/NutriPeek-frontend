'use client';

import React from 'react';

interface ChildAvatarProps {
  name: string;
  gender?: string;
  size?: number; // diameter in px
}

export default function ChildAvatar({ name, gender = 'male', size = 100 }: ChildAvatarProps) {
  const displayName = name.trim();
  const normalizedGender = (gender || '').toLowerCase();

  const bgColor =
    normalizedGender === 'female'
      ? 'bg-gradient-to-br from-pink-400 to-fuchsia-600'
      : 'bg-gradient-to-br from-blue-500 to-blue-700';

  const calculatedFontSize = Math.min(size * 0.28, 24);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${bgColor}`}
      style={{
        width: size,
        height: size,
        fontSize: calculatedFontSize,
        textAlign: 'center',
        padding: '0 4px',
        lineHeight: 1.2
      }}
    >
      {displayName}
    </div>
  );
}


