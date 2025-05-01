'use client';

import React from 'react';
import { getEnergyStatus } from './useTargetEnergy';

interface Props {
  mealEnergyKJ: number;
  targetEnergyKJ: number; 
}

export default function EnergyComparisonPanel({ mealEnergyKJ, targetEnergyKJ }: Props) {
  const status = getEnergyStatus(mealEnergyKJ, targetEnergyKJ);

  let label = '';
  let color = '';
  let message = '';

  switch (status) {
    case 'meets':
      label = ' Meets Target';
      color = 'text-green-600';
      message = 'Your meal energy meets today\'s requirement.';
      break;
    case 'below':
      label = ' Below Target';
      color = 'text-yellow-600';
      message = 'Your meal is low in energy. Consider adding a snack.';
      break;
    case 'above':
      label = ' Above Target';
      color = 'text-blue-600';
      message = 'This meal exceeds today\'s energy needs.';
      break;
    default:
      label = 'Unknown';
      color = 'text-gray-500';
  }

  return (
    <div className="mt-6 p-4 rounded-lg border shadow-sm bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Energy Feedback</h3>
      <p className={`font-bold ${color}`}>{label}</p>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="text-xs mt-2 text-gray-500">
        Meal Energy: {mealEnergyKJ} kJ | Target: {targetEnergyKJ} kJ
      </div>
    </div>
  );
}
