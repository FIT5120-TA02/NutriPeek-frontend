'use client';

import { useState, useEffect } from 'react';
import { EditableFoodItem } from '../types';
import IngredientItem from './IngredientItem';
import AddIngredientForm from './AddIngredientForm';

interface IngredientsListProps {
  ingredients: EditableFoodItem[];
  onIngredientsChange: (ingredients: EditableFoodItem[]) => void;
  onCalculateGap: (ingredientIds: string[]) => void;
}

/**
 * Component to display and manage the list of food ingredients
 */
export default function IngredientsList({
  ingredients,
  onIngredientsChange,
  onCalculateGap
}: IngredientsListProps) {
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Debug when component renders or ingredients change
  useEffect(() => {
    console.log('[IngredientsList] Component rendered with ingredients:', ingredients);
  }, [ingredients]);

  // Generate a unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Remove an ingredient from the list using uniqueId for reliable identification
  const handleRemoveIngredient = (id: string | undefined, index: number) => {
    console.log('[IngredientsList] Removing ingredient:', { id, index, ingredient: ingredients[index] });
    
    // Use uniqueId for identification when available, fallback to index
    const itemToRemove = ingredients[index];
    
    // If this is a quantity item (×N), we may want to just reduce the quantity
    if (itemToRemove.quantity && itemToRemove.quantity > 1) {
      // Create a copy of the ingredients array
      const updatedIngredients = [...ingredients];
      
      // Reduce quantity by 1
      updatedIngredients[index] = {
        ...itemToRemove,
        quantity: itemToRemove.quantity - 1,
        // Don't update name as quantity will be displayed separately
      };
      
      console.log('[IngredientsList] Reducing quantity, updated ingredients:', updatedIngredients);
      onIngredientsChange(updatedIngredients);
    } else {
      // Regular removal (no quantity or quantity = 1)
      const updatedIngredients = ingredients.filter((item, i) => 
        // If the item has a uniqueId, use that for comparison
        (itemToRemove.uniqueId && item.uniqueId !== itemToRemove.uniqueId) || 
        // If no uniqueId (like for initial detected items), use index
        (!itemToRemove.uniqueId && i !== index)
      );
      
      console.log('[IngredientsList] Removing completely, updated ingredients:', updatedIngredients);
      onIngredientsChange(updatedIngredients);
    }
  };

  // Remove all of a specific ingredient at once
  const handleRemoveAllIngredients = (id: string | undefined, index: number) => {
    console.log('[IngredientsList] Removing all of ingredient:', { id, index, ingredient: ingredients[index] });
    
    const itemToRemove = ingredients[index];
    
    // Remove the ingredient completely regardless of quantity
    const updatedIngredients = ingredients.filter((item, i) => 
      // If the item has a uniqueId, use that for comparison
      (itemToRemove.uniqueId && item.uniqueId !== itemToRemove.uniqueId) || 
      // If no uniqueId (like for initial detected items), use index
      (!itemToRemove.uniqueId && i !== index)
    );
    
    console.log('[IngredientsList] After removing all, updated ingredients:', updatedIngredients);
    onIngredientsChange(updatedIngredients);
  };

  // Add a new ingredient to the list with a uniqueId
  const handleAddIngredient = (newIngredient: EditableFoodItem) => {
    console.log('[IngredientsList] Adding new ingredient:', newIngredient);
    
    // Check if the same ingredient already exists
    const existingIndex = ingredients.findIndex(item => 
      item.id === newIngredient.id
    );
    
    if (existingIndex >= 0) {
      // Ingredient exists, increase quantity
      const existingItem = ingredients[existingIndex];
      const currentQuantity = existingItem.quantity || 1;
      const newQuantity = currentQuantity + (newIngredient.quantity || 1);
      
      // Create an updated array
      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        // Don't update name as quantity will be displayed separately
        // Update nutrients if they exist
        nutrients: existingItem.nutrients ? 
          Object.entries(existingItem.nutrients).reduce((acc, [key, value]) => {
            // Calculate new nutrient value based on quantity ratio
            acc[key] = (value / currentQuantity) * newQuantity;
            return acc;
          }, {} as Record<string, number>) : 
          existingItem.nutrients
      };
      
      console.log('[IngredientsList] Increasing quantity of existing, updated ingredients:', updatedIngredients);
      onIngredientsChange(updatedIngredients);
    } else {
      // New ingredient, add with uniqueId
      const ingredientWithUniqueId = {
        ...newIngredient,
        uniqueId: generateUniqueId(),
        quantity: newIngredient.quantity || 1
      };
      
      const updatedIngredients = [...ingredients, ingredientWithUniqueId];
      console.log('[IngredientsList] Adding brand new, updated ingredients:', updatedIngredients);
      onIngredientsChange(updatedIngredients);
    }
    
    setIsAddingIngredient(false);
  };

  // Handle the calculate gap button click
  const handleCalculateGap = () => {
    // Extract IDs from ingredients that have them
    // Note: The actual expansion of IDs based on quantity happens in ResultsSection
    const ingredientIds = ingredients
      .filter(item => item.id)
      .map(item => item.id as string);
    
    if (ingredientIds.length > 0) {
      console.log('[IngredientsList] Calculating gap with ingredientIds:', ingredientIds);
      onCalculateGap(ingredientIds);
    }
  };

  return (
    <div className="w-full">
      {/* Add ingredient form or button */}
      {isAddingIngredient ? (
        <AddIngredientForm 
          onAddIngredient={handleAddIngredient} 
          onCancel={() => setIsAddingIngredient(false)} 
        />
      ) : (
        <button
          onClick={() => {
            console.log('[IngredientsList] Add ingredient button clicked');
            setIsAddingIngredient(true);
          }}
          className="w-full mb-3 flex items-center justify-center gap-1 py-1.5 px-3 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Ingredient
        </button>
      )}

      {/* Ingredients list */}
      {ingredients.length === 0 ? (
        <div className="flex justify-center items-center h-24 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No ingredients available</p>
        </div>
      ) : (
        <div className="max-h-[250px] overflow-y-auto pr-1">
          <ul className="divide-y divide-gray-200">
            {ingredients.map((item, index) => (
              <IngredientItem 
                key={item.uniqueId || `ingredient-${index}`} 
                item={item}
                index={index}
                onRemove={handleRemoveIngredient} 
                onRemoveAll={handleRemoveAllIngredients}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}