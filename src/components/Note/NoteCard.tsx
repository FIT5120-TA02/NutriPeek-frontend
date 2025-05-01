'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';
import { calculateGapSummary } from '@/components/Note/gapCalculator';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { FoodItem } from '@/types/notes';
import { NutrientInfo } from '@/api/types';

interface NoteCardProps {
  id: string;
  timestamp: number;
  selectedFoods?: FoodItem[];
  nutrient_gaps?: Record<string, NutrientInfo>;
  onDelete: (id: string) => void;
  child?: {
    name: string;
    gender: string;
  };
}

export default function NoteCard({
  id,
  timestamp,
  selectedFoods = [],
  nutrient_gaps = {},
  onDelete,
  child,
}: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formattedDate = (() => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'yyyy-MM-dd HH:mm');
  })();

  console.log('[DEBUG selectedFoods]', selectedFoods);
  const { totalMet, comparison } = calculateGapSummary({
    id,
    timestamp,
    selectedFoods,
    nutrient_gaps,
  });

  return (
    <motion.div
      layout
      initial={{ borderRadius: 16 }}
      className="relative w-full bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => setExpanded((prev) => !prev)}
    >
      <button
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <Trash2 size={18} />
      </button>

      <div className="flex items-center gap-4 mb-4">
        <ChildAvatar name={child?.name || 'N/A'} gender={child?.gender || 'male'} size={52} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{child?.name || 'Unknown'}</span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFoods.map((food) => (
                <div key={food.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                  {food.imageUrl && (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-6 h-6 object-contain rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">{food.name}</span>
                </div>
              ))}
            </div>

            <hr className="my-3" />
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Nutrient Replenishment Summary</h4>
            <div className="bg-white rounded-xl p-4 shadow w-full mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Total Met</span>
                <span className="text-sm font-semibold text-green-600">{totalMet.toFixed(1)}% Met</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${totalMet}%` }}
                />
              </div>
            </div>

            <button
              className="text-sm text-blue-500 mt-2 underline hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails((prev) => !prev);
              }}
            >
              {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  {comparison.map((item) => (
                    <div key={item.name} className="bg-gray-50 p-3 rounded-md border">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-500">{item.percentAfter.toFixed(1)}% Met</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Before: <UnitFormatter value={item.updated - item.added} unit={item.unit} /> → After:{' '}
                        <UnitFormatter value={item.updated} unit={item.unit} /> / Recommended:{' '}
                        <UnitFormatter value={item.recommended} unit={item.unit} />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



