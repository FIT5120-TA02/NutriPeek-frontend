'use client';

import React, { useEffect, useState } from 'react';
import { nutripeekApi } from '@/api/nutripeekApi';
import { mapNutrientNameToDbField } from '@/utils/nutritionMappings';
import { getFoodImageUrl } from '@/utils/assetHelpers';
import storageService from '@/libs/StorageService';

interface NutrientInfo {
  name: string;
  unit: string;
  gap: number;
  recommended_intake?: number;
  current_intake?: number;
}

interface RecommendationComparisonProps {
  missingNutrients: NutrientInfo[];
}

interface FoodRecommendation {
  nutrient: string;
  foodCategories: string[];
}

interface SelectedFood {
  id: string;
  name: string;
  imageUrl?: string;
  weight: number;
}


const NOTES_KEY = 'nutri_notes';

export default function RecommendationComparison({
  missingNutrients,
}: RecommendationComparisonProps) {
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  useEffect(() => {
    async function fetchGroupedRecommendations() {
      const allRecs: FoodRecommendation[] = [];

      for (const nutrient of missingNutrients) {
        const dbField = mapNutrientNameToDbField(nutrient.name);
        if (!dbField) continue;

        try {
          const recs = await nutripeekApi.getRecommendedFoods(dbField, 10);
          if (!Array.isArray(recs)) continue;

          const categories = Array.from(
            new Set(recs.map((r) => r.food_category).filter(Boolean))
          );

          if (categories.length > 0) {
            allRecs.push({ nutrient: nutrient.name, foodCategories: categories });
          }
        } catch (error) {
          console.error(`fetch recommendations for ${nutrient.name} failed`, error);
        }
      }

      setRecommendations(allRecs);
    }

    fetchGroupedRecommendations();
  }, [missingNutrients]);

  const handleSaveToNote = () => {
    if (missingNutrients.length === 0 || selectedFoods.length === 0) {
      alert('Please select at least one food item.');
      return;
    }

    const prev = storageService.getLocalItem({ key: NOTES_KEY, defaultValue: [] });

    const note = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      selectedFoods: selectedFoods.map((cat) => ({
        id: cat,
        name: cat,
        imageUrl: getFoodImageUrl(cat),
      })),
      nutrient_gaps: missingNutrients.reduce((acc, item) => {
        acc[item.name] = {
          gap: item.gap,
          unit: item.unit,
          recommended_intake: item.recommended_intake,
          current_intake: item.current_intake,
        };
        return acc;
      }, {} as Record<string, NutrientInfo>)
    };

    storageService.setLocalItem(NOTES_KEY, [...prev, note]);
    alert('Saved to My Notes!');
  };

  const toggleFood = (food: string) => {
    setSelectedFoods((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const orderedList = missingNutrients
    .filter((n) => n.recommended_intake && n.recommended_intake > 0)
    .sort((a, b) => {
      const percA = (a.current_intake! / a.recommended_intake!) * 100;
      const percB = (b.current_intake! / b.recommended_intake!) * 100;
      return percA - percB;
    });

  return (
    <div className="max-h-[70vh] overflow-y-auto px-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Missing Nutrients</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {orderedList.map((nutrient) => {
          const percentage = nutrient.recommended_intake! > 0
            ? (nutrient.current_intake! / nutrient.recommended_intake!) * 100
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
                <div className="h-full bg-red-400" style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {nutrient.current_intake?.toFixed(2)} {nutrient.unit}
              </div>

              {isOpen && matchingRecommendation && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 italic mb-1">Click to select:</p>
                  <ul className="flex flex-wrap gap-2">
                    {matchingRecommendation.foodCategories.map((cat) => (
                      <li
                        key={cat}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFood(cat);
                        }}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-sm cursor-pointer transition ${selectedFoods.includes(cat) ? 'bg-green-100 border-green-400' : 'bg-gray-100'}`}
                      >
                        <img src={getFoodImageUrl(cat)} alt={cat} className="w-5 h-5 object-contain" />
                        <span className="capitalize">{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleSaveToNote}
          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
        >
          Save Selected to Note
        </button>
      </div>
    </div>
  );
}


















