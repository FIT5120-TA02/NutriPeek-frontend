'use client';

import React, { useEffect, useState } from 'react';
import { getTargetEnergy } from '@/libs/energyApi';
import { getEnergyStatus } from './useTargetEnergy';

interface Props {
  mealEnergyKJ: number;
  age: number;
  gender: string;
  pal: number;
}

export default function EnergyComparisonPanel({
  mealEnergyKJ,
  age,
  gender,
  pal,
}: Props) {
  const [targetEnergyKJ, setTargetEnergyKJ] = useState<number | null>(null);
  const [status, setStatus] = useState<'meets' | 'below' | 'above'>('meets');

  useEffect(() => {
    async function fetchEnergyTarget() {
      const target = await getTargetEnergy({ age, gender, pal });
      if (target !== null) {
        setTargetEnergyKJ(target);
        const statusResult = getEnergyStatus(mealEnergyKJ, target);
        setStatus(statusResult);
      }
    }

    if (age && gender && pal) {
      fetchEnergyTarget();
    }
  }, [mealEnergyKJ, age, gender, pal]);

  let label = '';
  let color = '';
  let message = '';

  switch (status) {
    case 'meets':
      label = '✔ Meets Target';
      color = 'text-green-600';
      message = 'Your meal energy meets today\'s requirement.';
      break;
    case 'below':
      label = '⬇ Below Target';
      color = 'text-yellow-600';
      message = 'Your meal is low in energy. Consider adding a snack.';
      break;
    case 'above':
      label = '⬆ Above Target';
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
        Meal Energy: {mealEnergyKJ} kJ | Target: {targetEnergyKJ ?? '--'} kJ
      </div>
    </div>
  );
}

