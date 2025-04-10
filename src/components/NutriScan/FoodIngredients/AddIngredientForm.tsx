'use client';

import { useEffect, useState } from 'react';
import { nutripeekApi } from '../../../api/nutripeekApi';
import { FoodAutocompleteResponse, FoodNutrientResponse } from '../../../api/types';
import { EditableFoodItem } from '../types';

interface AddIngredientFormProps {
  onAddIngredient: (ingredient: EditableFoodItem) => void;
  onCancel: () => void;
}

/**
 * Form component for adding new ingredients with autocomplete search
 */
export default function AddIngredientForm({ onAddIngredient, onCancel }: AddIngredientFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodAutocompleteResponse[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodNutrientResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Perform search when searchTerm changes (with debounce)
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const results = await nutripeekApi.searchFoods(searchTerm);
        setSearchResults(results);
      } catch (err) {
        setError('Error searching for foods. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle food selection
  const handleSelectFood = async (food: FoodAutocompleteResponse) => {
    try {
      setIsLoading(true);
      setError(null);
      const foodDetails = await nutripeekApi.getFoodNutrients(food.id);
      setSelectedFood(foodDetails);
      setSearchResults([]);
    } catch (err) {
      setError('Error retrieving food details. Please try again.');
      console.error('Food details error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleAddIngredient = () => {
    if (!selectedFood) return;

    // Map from API food data to EditableFoodItem format
    const newIngredient: EditableFoodItem = {
      id: selectedFood.id,
      name: selectedFood.food_name,
      confidence: 1, // Custom added items get full confidence
      isCustomAdded: true,
      quantity: quantity, // Set the quantity explicitly
      nutrients: {
        ...(selectedFood.energy_with_fibre_kj != null && { 'Energy (kJ)': selectedFood.energy_with_fibre_kj * quantity }),
        ...(selectedFood.protein_g != null && { 'Protein (g)': selectedFood.protein_g * quantity }),
        ...(selectedFood.total_fat_g != null && { 'Total Fat (g)': selectedFood.total_fat_g * quantity }),
        ...(selectedFood.carbs_with_sugar_alcohols_g != null && { 'Carbs (g)': selectedFood.carbs_with_sugar_alcohols_g * quantity }),
        ...(selectedFood.dietary_fibre_g != null && { 'Dietary Fibre (g)': selectedFood.dietary_fibre_g * quantity })
      }
    };

    onAddIngredient(newIngredient);
    reset();
  };

  // Reset form
  const reset = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedFood(null);
    setQuantity(1);
    setError(null);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg mb-3">
      <h3 className="text-base font-medium text-gray-800 mb-2">Add New Ingredient</h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-md text-xs">
          {error}
        </div>
      )}

      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for food items..."
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Search results dropdown */}
        {searchResults.length > 0 && !selectedFood && (
          <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg text-sm">
            {searchResults.map((food) => (
              <li 
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
              >
                {food.food_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedFood && (
        <>
          <div className="mb-3 p-2 bg-white border border-gray-200 rounded-md">
            <h4 className="font-medium text-sm">{selectedFood.food_name}</h4>
            <div className="mt-1 text-xs text-gray-600">
              {selectedFood.food_category && <p className="text-xs">Category: {selectedFood.food_category}</p>}
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                {selectedFood.energy_with_fibre_kj != null && (
                  <div className="flex justify-between">
                    <span>Energy:</span>
                    <span>{(selectedFood.energy_with_fibre_kj * quantity).toFixed(1)} kJ</span>
                  </div>
                )}
                {selectedFood.protein_g != null && (
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>{(selectedFood.protein_g * quantity).toFixed(1)} g</span>
                  </div>
                )}
                {selectedFood.total_fat_g != null && (
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span>{(selectedFood.total_fat_g * quantity).toFixed(1)} g</span>
                  </div>
                )}
                {selectedFood.carbs_with_sugar_alcohols_g != null && (
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span>{(selectedFood.carbs_with_sugar_alcohols_g * quantity).toFixed(1)} g</span>
                  </div>
                )}
                {selectedFood.dietary_fibre_g != null && (
                  <div className="flex justify-between">
                    <span>Fibre:</span>
                    <span>{(selectedFood.dietary_fibre_g * quantity).toFixed(1)} g</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="quantity" className="block text-xs font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 bg-gray-200 rounded-l-md hover:bg-gray-300"
                disabled={quantity <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-1 w-12 text-center text-sm border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 bg-gray-200 rounded-r-md hover:bg-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleAddIngredient}
          disabled={!selectedFood}
          className={`px-3 py-1 text-xs text-white rounded-md transition ${
            selectedFood ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Add Ingredient
        </button>
      </div>
    </div>
  );
}