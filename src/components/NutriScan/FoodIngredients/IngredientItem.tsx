'use client';

import { EditableFoodItem } from '../types';
import { useState } from 'react';

interface IngredientItemProps {
  item: EditableFoodItem;
  index: number;
  onRemove: (id: string | undefined, index: number) => void;
  onRemoveAll?: (id: string | undefined, index: number) => void;
  onIncrease?: (id: string | undefined, index: number) => void;
}

/**
 * Component to display a single food ingredient with nutritional information 
 * and a remove button
 */
export default function IngredientItem({ 
  item, 
  index, 
  onRemove,
  onRemoveAll = onRemove, // Default to regular remove if not provided
  onIncrease
}: IngredientItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate confidence display or custom added badge
  const confidenceDisplay = item.isCustomAdded ? (
    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
      Added by you
    </span>
  ) : (
    <div className="text-sm text-gray-500">
      Confidence: {Math.round((item.confidence || 0) * 100)}%
    </div>
  );

  // Extract base name without quantity marker for display purposes
  const displayName = item.name.replace(/\s*\(×\d+\)$/, '');
  const quantity = item.quantity || 1;
  const hasQuantity = quantity > 1;

  return (
    <li className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div 
          className="flex-1 cursor-pointer mb-1 sm:mb-0" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-800">{displayName}</h3>
            {hasQuantity && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                ×{quantity}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center">
            {confidenceDisplay}
          </div>
        </div>
        
        {/* Controls for adjusting quantity */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {hasQuantity && (
            <span className="text-xs text-gray-500 hidden sm:inline">Qty: {quantity}</span>
          )}
          <div className="flex gap-1">
            {/* Increase button */}
            {onIncrease && (
              <button
                onClick={() => onIncrease(item.id, index)}
                className="flex items-center px-1.5 py-0.5 text-green-600 hover:bg-green-50 rounded-md transition-colors text-xs"
                aria-label="Add one"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">1</span>
              </button>
            )}
            
            {/* Decrease button (only show if quantity > 1) */}
            {hasQuantity && (
              <button
                onClick={() => onRemove(item.id, index)}
                className="flex items-center px-1.5 py-0.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                aria-label="Remove one"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">1</span>
              </button>
            )}
            
            {/* Remove all button (show different style if quantity is 1) */}
            {hasQuantity ? (
              <button
                onClick={() => onRemoveAll(item.id, index)}
                className="flex items-center px-1.5 py-0.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                aria-label="Remove all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">All</span>
              </button>
            ) : (
              <button
                onClick={() => onRemove(item.id, index)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Remove ingredient"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && item.nutrients && Object.keys(item.nutrients).length > 0 && (
        <div className="mt-2 ml-2 border-t border-gray-100 pt-2">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Nutritional Information:</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            {Object.entries(item.nutrients).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            {hasQuantity && (
              <div className="col-span-2 mt-1 pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  * Values for all {quantity} servings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}