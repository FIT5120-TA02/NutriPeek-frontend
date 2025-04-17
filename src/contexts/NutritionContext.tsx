'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface NutritionContextType {
  ingredientIds: string[];
  addIngredientId: (id: string) => void;
  removeIngredientId: (id: string) => void;
  clearIngredientIds: () => void;
  selectedChildId: number | null;
  setSelectedChildId: (id: number | null) => void;
  setIngredientIds: (ids: string[]) => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

interface NutritionProviderProps {
  children: ReactNode;
}

export const NutritionProvider: React.FC<NutritionProviderProps> = ({ children }) => {
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(0); // Default to first child

  const addIngredientId = (id: string) => {
    setIngredientIds(prevIds => {
      if (!prevIds.includes(id)) {
        return [...prevIds, id];
      }
      return prevIds;
    });
  };

  const removeIngredientId = (id: string) => {
    setIngredientIds(prevIds => prevIds.filter(prevId => prevId !== id));
  };

  const clearIngredientIds = () => {
    setIngredientIds([]);
  };

  return (
    <NutritionContext.Provider 
      value={{ 
        ingredientIds, 
        addIngredientId, 
        removeIngredientId, 
        clearIngredientIds,
        selectedChildId,
        setSelectedChildId,
        setIngredientIds
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = (): NutritionContextType => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}; 