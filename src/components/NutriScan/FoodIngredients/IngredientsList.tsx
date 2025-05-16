'use client';

import { useState } from 'react';
import { EditableFoodItem } from '../types';
import IngredientItem from './IngredientItem';
import AddIngredientForm from './AddIngredientForm';

interface IngredientsListProps {
  ingredients: EditableFoodItem[];
  onIngredientsChange: (ingredients: EditableFoodItem[]) => void;
}

/**
 * Component to display and manage the list of food ingredients
 */
export default function IngredientsList({
  ingredients,
  onIngredientsChange,
}: IngredientsListProps) {
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Generate a unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Remove an ingredient from the list using uniqueId for reliable identification
  const handleRemoveIngredient = (id: string | undefined, index: number) => {    
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
      
      onIngredientsChange(updatedIngredients);
    } else {
      // Regular removal (no quantity or quantity = 1)
      const updatedIngredients = ingredients.filter((item, i) => 
        // If the item has a uniqueId, use that for comparison
        (itemToRemove.uniqueId && item.uniqueId !== itemToRemove.uniqueId) || 
        // If no uniqueId (like for initial detected items), use index
        (!itemToRemove.uniqueId && i !== index)
      );
      
      onIngredientsChange(updatedIngredients);
    }
  };

  // Increase ingredient quantity by 1
  const handleIncreaseIngredient = (id: string | undefined, index: number) => {
    const itemToIncrease = ingredients[index];
    
    // Create a copy of the ingredients array
    const updatedIngredients = [...ingredients];
    
    // Increase quantity by 1
    const currentQuantity = itemToIncrease.quantity || 1;
    const newQuantity = currentQuantity + 1;
    
    updatedIngredients[index] = {
      ...itemToIncrease,
      quantity: newQuantity,
      // Update nutrients if they exist
      nutrients: itemToIncrease.nutrients ? 
        Object.entries(itemToIncrease.nutrients).reduce((acc, [key, value]) => {
          // Calculate new nutrient value based on quantity ratio
          acc[key] = (value / currentQuantity) * newQuantity;
          return acc;
        }, {} as Record<string, number>) : 
        itemToIncrease.nutrients
    };
    
    onIngredientsChange(updatedIngredients);
  };

  // Remove all of a specific ingredient at once
  const handleRemoveAllIngredients = (id: string | undefined, index: number) => {    
    const itemToRemove = ingredients[index];
    
    // Remove the ingredient completely regardless of quantity
    const updatedIngredients = ingredients.filter((item, i) => 
      // If the item has a uniqueId, use that for comparison
      (itemToRemove.uniqueId && item.uniqueId !== itemToRemove.uniqueId) || 
      // If no uniqueId (like for initial detected items), use index
      (!itemToRemove.uniqueId && i !== index)
    );
    
    onIngredientsChange(updatedIngredients);
  };

  // Add a new ingredient to the list with a uniqueId
  const handleAddIngredient = (newIngredient: EditableFoodItem) => {    
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
      onIngredientsChange(updatedIngredients);
    } else {
      // New ingredient, add with uniqueId
      const ingredientWithUniqueId = {
        ...newIngredient,
        uniqueId: generateUniqueId(),
        quantity: newIngredient.quantity || 1
      };
      
      const updatedIngredients = [...ingredients, ingredientWithUniqueId];
      onIngredientsChange(updatedIngredients);
    }
    
    setIsAddingIngredient(false);
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
                onIncrease={handleIncreaseIngredient}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}