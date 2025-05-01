'use client';

import React from 'react';

interface Props {
  activity: string | undefined;
  selected: boolean;
  onClick: (activity: string) => void;
}

export default function ActivityCard({ activity, selected, onClick }: Props) {
  const safeActivity = activity ?? 'N/A';

  return (
    <button
      type="button"
      className={`w-full text-left cursor-pointer border px-4 py-2 rounded-md shadow-sm text-sm transition
        ${selected ? 'bg-green-100 border-green-500 text-green-700 font-semibold' : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'}
      `}
      onClick={() => {
        if (typeof activity === 'string') onClick(activity);
      }}
    >
      {safeActivity}
    </button>
  );
}
