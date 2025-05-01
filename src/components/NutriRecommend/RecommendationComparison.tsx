'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { nutripeekApi } from '@/api/nutripeekApi';
import { mapNutrientNameToDbField } from '@/utils/nutritionMappings';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import storageService from '@/libs/StorageService';
import { NutrientRecommendation, NutrientGapDetails, type FoodRecommendation } from '@/api/types';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';

const NOTES_KEY = 'nutri_notes';

interface RecommendationComparisonProps {
  missingNutrients: NutrientGapDetails[];
}

interface FoodItem {
  name: string;
  imageUrl?: string;
  nutrients: Record<string, number>;
}

export default function RecommendationComparison({ missingNutrients }: RecommendationComparisonProps) {
  const [recommendations, setRecommendations] = useState<NutrientRecommendation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [foodMap, setFoodMap] = useState<Record<string, FoodItem>>({});

  useEffect(() => {
    async function fetchGroupedRecommendations() {
      const allRecommendations: NutrientRecommendation[] = [];
      const foodData: Record<string, FoodItem> = {};

      for (const nutrient of missingNutrients) {
        const dbField = mapNutrientNameToDbField(nutrient.name);
        if (!dbField) continue;

        try {
          const recs = await nutripeekApi.getRecommendedFoods(dbField, 10);
          if (!Array.isArray(recs)) continue;

          for (const rec of recs) {
            const name = rec.food_category;
            const rawValue = rec[dbField as keyof FoodRecommendation];
            if (!name || rawValue === undefined || rawValue === null) continue;

            const isMicrogram = nutrient.unit === 'μg';
            const value = (typeof rawValue === 'number' ? rawValue : 0) * (isMicrogram ? 1000 : 1);

            if (!foodData[name]) {
              foodData[name] = {
                name,
                nutrients: {},
                imageUrl: getFoodImageUrl(name),
              };
            }

            foodData[name].nutrients[nutrient.name] = value;
          }

          const foodCategories = Array.from(new Set(recs.map((r) => r.food_category).filter(Boolean)));
          if (foodCategories.length > 0) {
            allRecommendations.push({ nutrient: nutrient.name, foodCategories });
          }
        } catch (error) {
          console.error(`Failed to fetch recommendations for ${nutrient.name}:`, error);
        }
      }

      setRecommendations(allRecommendations);
      setFoodMap(foodData);
    }

    fetchGroupedRecommendations();
  }, [missingNutrients]);

  const toggleFood = (food: string) => {
    setSelectedFoods((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const selectedFoodItems: FoodItem[] = useMemo(
    () => selectedFoods.map((name) => foodMap[name]).filter(Boolean),
    [selectedFoods, foodMap]
  );

  const updatedNutrients = useMemo(() => {
    return missingNutrients.map((nutrient) => {
      const added = selectedFoodItems.reduce((acc, food) => acc + (food.nutrients[nutrient.name] || 0), 0);
      const updated = nutrient.current_intake + added;
      return {
        ...nutrient,
        current_intake: updated
      };
    });
  }, [missingNutrients, selectedFoodItems]);

  const handleSaveToNote = () => {
    if (selectedFoods.length === 0) {
      alert('Please select at least one food item.');
      return;
    }

    const previousNotes = storageService.getLocalItem({
      key: NOTES_KEY,
      defaultValue: [],
    }) as any[];

    const totalMetRatio = updatedNutrients.reduce((acc, n) => {
      if (n.recommended_intake > 0) {
        acc += Math.min(n.current_intake / n.recommended_intake, 1);
      }
      return acc;
    }, 0) / updatedNutrients.length;

    const selectedFoodItems = selectedFoods.map((category) => ({
      id: category,
      category,
      imageUrl: getFoodImageUrl(category),
      nutrients: foodMap[category]?.nutrients || {},
    }));

    const newNote = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      selectedFoods: selectedFoodItems,
      nutrient_gaps: updatedNutrients.reduce((acc, item) => {
        acc[item.name] = item;
        return acc;
      }, {} as Record<string, NutrientGapDetails>),
      totalMet: totalMetRatio * 100,
    };

    storageService.setLocalItem(NOTES_KEY, [...previousNotes, newNote]);
    alert('Saved to My Notes!');
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto px-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Missing Nutrients</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {missingNutrients.map((nutrient) => {
          const percentage = nutrient.recommended_intake > 0
            ? (nutrient.current_intake / nutrient.recommended_intake) * 100
            : 0;

          const matchingRecommendation = recommendations.find(
            (rec) => rec.nutrient === nutrient.name
          );
          const isOpen = expanded === nutrient.name;

          return (
            <div
              key={nutrient.name}
              className="w-full border rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : nutrient.name)}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">{nutrient.name}</span>
                <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 mt-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                <UnitFormatter value={nutrient.current_intake} unit={nutrient.unit} />
              </div>

              {isOpen && matchingRecommendation && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 italic mb-1">Click to select:</p>
                  <ul className="flex flex-wrap gap-2">
                    {matchingRecommendation.foodCategories.map((category: string) => (
                      <li
                        key={category}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFood(category);
                        }}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-sm cursor-pointer transition ${
                          selectedFoods.includes(category)
                            ? 'bg-green-100 border-green-400'
                            : 'bg-gray-100'
                        }`}
                      >
                        <img
                          src={getFoodImageUrl(category)}
                          alt={category}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="capitalize">{category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSaveToNote}
          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold transition"
        >
          Save Selected to Note
        </button>
      </div>
    </div>
  );
}




















