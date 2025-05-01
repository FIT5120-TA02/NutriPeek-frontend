'use client';

import React from 'react';
import { ActivityResult } from '@/types/activity';

interface Props {
  result: ActivityResult;
}

export default function ActivityResultPanel({ result }: Props) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-green-700">Activity Level Result</h2>

      <div className="mb-4">
        <p className="text-gray-700 text-sm">Total METy-Minutes:</p>
        <p className="text-lg font-medium text-blue-600">{result.total_mety_minutes.toFixed(1)}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 text-sm">Physical Activity Level (PAL):</p>
        <p className="text-lg font-bold text-purple-700">{result.pal.toFixed(2)}</p>
      </div>

      <div>
        <p className="text-gray-700 font-medium mb-2">Activity Breakdown:</p>
        <div className="space-y-2">
          {result.details.map((item, index) => (
            <div key={index} className="border p-3 rounded-md bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">{item.activity}</p>
              <p className="text-sm text-gray-600">
                Hours: {item.hours} | METy Level: {item.mety_level} | METy-Minutes: {item.mety_minutes.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

