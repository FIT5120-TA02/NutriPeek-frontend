'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse, NutrientGapDetails } from '@/api/types';
import { NutritionalNote } from '@/types/notes';
import RecommendationComparison from '@/components/NutriGapChart/RecommendationComparison';
import { useRouter } from 'next/navigation';
import ChildAvatar from '@/components/ui/ChildAvatar';
import BackButton from '@/components/ui/BackButton';
import { ChildProfile } from '@/types/profile';

interface ExtendedNutrientGapResponse extends Omit<NutrientGapResponse, 'missing_nutrients'> {
  missing_nutrients: NutrientGapDetails[];
  total_energy_kj?: number;
}

/**
 * NutriRecommend page component
 * 
 * Displays nutrition gap analysis and recommendations based on scanned food items
 * and the selected child's profile.
 */
export default function NutriRecommendPage() {
  const { ingredientIds, selectedChildId, clearIngredientIds } = useNutrition();
  const router = useRouter();
  const [results, setResults] = useState<ExtendedNutrientGapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const CHILDREN_KEY = 'user_children';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Check for stored results if no ingredients selected
        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            const parsed = JSON.parse(storedResults);
            setResults(parsed);
            return;
          }
          setError('No ingredients selected');
          return;
        }

        // Get child profiles from storage
        const childProfiles = storageService.getLocalItem({
          key: CHILDREN_KEY,
          defaultValue: []
        }) as ChildProfile[];

        if (!childProfiles.length) {
          setError('No child profile found');
          return;
        }

        // Get selected child profile
        const profileIndex = selectedChildId ?? 0;
        const childProfile = childProfiles[profileIndex];

        if (!childProfile) {
          setError('Selected child profile not found');
          return;
        }

        setSelectedChild(childProfile);

        // Map gender to API format
        const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';

        // Calculate nutrient gap
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10),
            gender: apiGender
          },
          ingredient_ids: ingredientIds
        });

        // Transform missing nutrients into detailed format
        const missingNutrients = Object.entries(result.nutrient_gaps)
          .filter(([_, info]) => info.recommended_intake > 0 && info.current_intake / info.recommended_intake < 1)
          .map(([name, info]) => ({
            name,
            gap: info.gap,
            unit: info.unit,
            recommended_intake: info.recommended_intake,
            current_intake: info.current_intake
          }));

        // Create extended response with typed missing nutrients
        const extendedResult: ExtendedNutrientGapResponse = { 
          ...result, 
          missing_nutrients: missingNutrients,
          total_energy_kj: result.total_calories 
        };
        
        setResults(extendedResult);

        // Save to nutritional notes
        const previousNotes = storageService.getLocalItem({
          key: 'nutri_notes',
          defaultValue: [],
        }) as NutritionalNote[];

        // Create a new nutritional note
        const newNote: NutritionalNote = {
          id: Date.now(),
          childName: childProfile.name,
          childGender: childProfile.gender,
          summary: {
            totalCalories: extendedResult.total_energy_kj,
            missingCount: missingNutrients.length,
            excessCount: result.excess_nutrients?.length ?? 0,
          },
          nutrient_gaps: result.nutrient_gaps,
          createdAt: new Date().toISOString(),
        };

        const updatedNotes = [...previousNotes, newNote];
        storageService.setLocalItem('nutri_notes', updatedNotes);

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [ingredientIds, selectedChildId]);

  const handleScanAgain = () => {
    clearIngredientIds();
    router.push('/NutriScan');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  if (!results) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-palette-secondary-light">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <BackButton href="/NutriGap" label=" Back " />
        </div>

        {/* Title & Avatar */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-palette-primary">Nutrition Gap Balance</h1>
          {selectedChild && (
            <div className="flex justify-center mt-4">
              <ChildAvatar
                name={selectedChild.name}
                gender={selectedChild.gender}
                size={80}
              />
            </div>
          )}
        </div>

        {/* Nutrient Cards */}
        <RecommendationComparison missingNutrients={results.missing_nutrients} />

        {/* CTA Button */}
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


