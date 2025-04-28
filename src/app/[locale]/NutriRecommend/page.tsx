'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse } from '@/api/types';
import RecommendationComparison from '@/components/NutriGapChart/RecommendationComparison';
import FoodGroupDetails from '@/components/NutriGapChart/FoodGroupDetails';
import { useRouter } from 'next/navigation';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

interface Nutrient {
  name: string;
  gap: number;
  unit: string;
}

export default function NutriRecommendPage() {
  const { ingredientIds, selectedChildId, clearIngredientIds } = useNutrition();
  const router = useRouter();
  const [results, setResults] = useState<NutrientGapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [processedNutrients, setProcessedNutrients] = useState<{
    missingNutrients: Nutrient[];
    excessNutrients: Nutrient[];
  }>({ missingNutrients: [], excessNutrients: [] });

  const CHILDREN_KEY = 'user_children';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            const parsed = JSON.parse(storedResults);
            setResults(parsed);
            processNutrients(parsed);
            return;
          }
          setError('No ingredients selected');
          return;
        }

        const childProfiles = storageService.getLocalItem({
          key: CHILDREN_KEY,
          defaultValue: []
        }) as ChildProfile[];
        if (!childProfiles.length) {
          setError('No child profile found');
          return;
        }

        const profileIndex = selectedChildId ?? 0;
        const childProfile = childProfiles[profileIndex];
        if (!childProfile) {
          setError('Selected child profile not found');
          return;
        }
        setSelectedChild(childProfile);

        const apiGender =
          childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10),
            gender: apiGender
          },
          ingredient_ids: ingredientIds
        });

        setResults(result);
        processNutrients(result);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [ingredientIds, selectedChildId]);

  const processNutrients = (data: NutrientGapResponse) => {
    if (!data.nutrient_gaps) return;
    const list = Object.entries(data.nutrient_gaps).map(([name, info]) => ({
      name,
      gap: info?.gap ?? 0,
      unit: info?.unit ?? ''
    }));
    setProcessedNutrients({
      missingNutrients: list.filter(n => n.gap < 0),
      excessNutrients: list.filter(n => n.gap > 0)
    });
  };

  const handleScanAgain = () => {
    clearIngredientIds();
    router.push('/NutriScan');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No recommendation data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-palette-secondary-light px-4 pt-24 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto">
   
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-palette-primary">
            Nutrition Insights
          </h1>
          {selectedChild && (
            <p className="text-gray-600 mt-2">
              Personalized for {selectedChild.name}, {selectedChild.age} years old
            </p>
          )}
        </div>

   
        <div className="flex flex-col lg:flex-row gap-10">
 
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm flex flex-col h-full">
            <h2 className="text-2xl font-semibold text-palette-primary mb-4">
              Comparison Against Standard Guidelines
            </h2>
            <RecommendationComparison
              missingNutrients={processedNutrients.missingNutrients}
              excessNutrients={processedNutrients.excessNutrients}
            />
          </div>

   
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm flex flex-col h-full">
            <h2 className="text-2xl font-semibold text-palette-primary mb-4">
              Detailed Food Group Information
            </h2>
            <FoodGroupDetails gaps={results.nutrient_gaps} />
          </div>
        </div>

     
        <div className="flex justify-center mt-12">
          <button
            onClick={handleScanAgain}
            className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-lg font-semibold"
          >
            Scan Another Food
          </button>
        </div>
      </div>
    </div>
  );
}

