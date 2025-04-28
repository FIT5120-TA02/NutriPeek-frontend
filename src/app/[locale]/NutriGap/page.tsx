'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NutrientGapResponse } from '../../../api/types';
import { useNutrition } from '../../../contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import storageService from '@/libs/StorageService';

import NutrientSummary from '@/components/NutriGapChart/NutrientSummary';
import NutrientGapOverview from '@/components/NutriGapChart/NutrientGapBarChart';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { ingredientIds, clearIngredientIds, selectedChildId } = useNutrition();
  const [results, setResults] = useState<NutrientGapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const CHILDREN_KEY = 'user_children';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            setResults(JSON.parse(storedResults));
            return;
          }
          setError('No ingredients selected');
          return;
        }

        const childProfiles = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] }) as ChildProfile[];
        if (!childProfiles || childProfiles.length === 0) {
          setError('No child profile found');
          return;
        }

        const profileIndex = selectedChildId !== null ? selectedChildId : 0;
        const childProfile = childProfiles[profileIndex];
        if (!childProfile) {
          setError('Selected child profile not found');
          return;
        }

        setSelectedChild(childProfile);

        const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10),
            gender: apiGender,
          },
          ingredient_ids: ingredientIds,
        });

        setResults(result);
      } catch (error) {
        console.error('Error calculating nutritional gap:', error);
        setError('Failed to calculate nutritional gap. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [ingredientIds, selectedChildId]);

  const handleScanAgain = () => {
    clearIngredientIds();
    router.push('/NutriScan');
  };

  const handleViewRecommendations = () => {
    router.push('/NutriRecommend');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-palette-secondary-light">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={handleScanAgain}
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Scan Food
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-palette-secondary-light">
        <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
        <p className="text-gray-600">Please scan some food items first.</p>
        <button
          onClick={handleScanAgain}
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Scan Food
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#ECF9F2]">
      <div className="max-w-7xl mx-auto pt-32 px-6 lg:px-20">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Nutritional Gap Analysis
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Side: Summary */}
          <div className="flex-1 flex">
            <div className="flex flex-col justify-between w-full bg-white rounded-2xl shadow-md p-8">
              <NutrientSummary 
                results={results}
                childName={selectedChild?.name}
                childGender={selectedChild?.gender}
                onViewRecommendations={handleViewRecommendations}
              />
            </div>
          </div>

          {/* Right Side: Nutrient Gap Overview */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="w-full bg-white rounded-2xl shadow-md p-8 flex flex-col h-full">
              <NutrientGapOverview gaps={results.nutrient_gaps} />
            </div>
          </div>
        </div>

        {/* Buttons at bottom */}
        <div className="flex flex-col md:flex-row gap-6 justify-center mt-12">
          <button
            onClick={handleScanAgain}
            className="w-full md:w-auto px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-lg font-semibold"
          >
            Scan Another Food
          </button>
        </div>

      </div>
    </div>
  );
}




