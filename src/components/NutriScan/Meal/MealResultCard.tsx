'use client';

import { useState } from 'react';
import { MealType, FoodItemDisplay } from '../types';
import { getMealTitle } from '../utils';

interface MealResultCardProps {
  mealType: MealType;
  imagePreviewUrl: string | null;
  detectedItems: FoodItemDisplay[];
  onMealTypeChange: (newType: MealType) => void;
}

export default function MealResultCard({
  mealType,
  imagePreviewUrl,
  detectedItems,
  onMealTypeChange
}: MealResultCardProps) {
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);


  // Get total number of items detected
  const totalItems = detectedItems.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 w-full">
      {/* Image with meal type overlay */}
      <div className="relative mb-4">
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt={`${getMealTitle(mealType)}`}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
        
        {/* Meal type badge/selector */}
        <div 
          className="absolute top-3 right-3 bg-white shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsTypeSelectionOpen(true)}
        >
          <span className={`w-3 h-3 rounded-full ${
            mealType === 'breakfast' ? 'bg-yellow-500' : 
            mealType === 'lunch' ? 'bg-green-500' : 
            mealType === 'dinner' ? 'bg-blue-500' : 
            'bg-gray-500'
          }`}></span>
          <span className="text-sm font-medium">{getMealTitle(mealType)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Meal type selection dropdown */}
        {isTypeSelectionOpen && (
          <div className="absolute top-12 right-3 bg-white shadow-lg rounded-lg p-2 z-10">
            <div className="relative">
              {/* Close button */}
              <button 
                className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-0.5 text-gray-600 hover:bg-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTypeSelectionOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Options */}
              <p className="text-xs text-gray-500 mb-1 px-2">Select meal type:</p>
              <div className="flex flex-col gap-1 min-w-[140px]">
                {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((type) => (
                  <button 
                    key={type} 
                    className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-left ${mealType === type ? 'bg-gray-100' : ''}`}
                    onClick={() => {
                      onMealTypeChange(type);
                      setIsTypeSelectionOpen(false);
                    }}
                  >
                    <span className={`w-3 h-3 rounded-full ${
                      type === 'breakfast' ? 'bg-yellow-500' : 
                      type === 'lunch' ? 'bg-green-500' : 
                      type === 'dinner' ? 'bg-blue-500' : 
                      'bg-gray-500'
                    }`}></span>
                    <span className="text-sm">{getMealTitle(type)}</span>
                    {mealType === type && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Detected items summary */}
      <div>
        <h3 className="font-semibold text-lg mb-2">{getMealTitle(mealType)}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} detected
        </p>
        
        {/* Item list preview (show up to 3) */}
        <ul className="space-y-1 mb-3">
          {detectedItems.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="min-w-2 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="truncate max-w-[calc(100%-3rem)]">{item.name}</span>
              {item.quantity && item.quantity > 1 && (
                <span className="text-xs bg-gray-100 px-1.5 rounded-full flex-shrink-0">x{item.quantity}</span>
              )}
            </li>
          ))}
          {detectedItems.length > 3 && (
            <li className="text-xs text-gray-500 pl-4">
              +{detectedItems.length - 3} more items
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 