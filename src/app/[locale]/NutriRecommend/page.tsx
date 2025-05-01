'use client';

import { useEffect, useState } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import storageService from '@/libs/StorageService';
import { nutripeekApi } from '@/api/nutripeekApi';
import { NutrientGapResponse, NutrientGapDetails } from '@/api/types';
import { NutritionalNote } from '@/types/notes';
import RecommendationComparison from '@/components/NutriRecommend/RecommendationComparison';
import { useRouter } from 'next/navigation';
import ChildAvatar from '@/components/ui/ChildAvatar';
import BackButton from '@/components/ui/BackButton';
import { ChildProfile } from '@/types/profile';
import { motion } from 'framer-motion';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';

interface ExtendedNutrientGapResponse extends Omit<NutrientGapResponse, 'missing_nutrients'> {
  missing_nutrients: NutrientGapDetails[];
  total_energy_kj?: number;
}

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

        const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';

        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10),
            gender: apiGender
          },
          ingredient_ids: ingredientIds
        });

        const missingNutrients = Object.entries(result.nutrient_gaps)
          .filter(([_, info]) => info.recommended_intake > 0 && info.current_intake / info.recommended_intake < 1)
          .map(([name, info]) => ({
            name,
            gap: info.gap,
            unit: info.unit,
            recommended_intake: info.recommended_intake,
            current_intake: info.current_intake
          }));

        const extendedResult: ExtendedNutrientGapResponse = {
          ...result,
          missing_nutrients: missingNutrients,
          total_energy_kj: result.total_calories
        };

        setResults(extendedResult);

        const previousNotes = storageService.getLocalItem({
          key: 'nutri_notes',
          defaultValue: [],
        }) as NutritionalNote[];

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
          selectedFoods: [],
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
    <FloatingEmojisLayout
      backgroundClasses="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100"
      emojisCount={15}
    >
      <div className="w-full px-6 py-20 max-w-7xl mx-auto">
        <BackButton href="/NutriGap" label=" Back to Gap Overview" />

        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Nutrition Gap Balance
        </motion.h1>

        {selectedChild && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ChildAvatar
              name={selectedChild.name}
              gender={selectedChild.gender}
              size={80}
            />
          </motion.div>
        )}

      <RecommendationComparison missingNutrients={results.missing_nutrients} />

        <div className="flex justify-center mt-12">
          <button
            onClick={handleScanAgain}
            className="px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-lg font-semibold"
          >
            Scan Another Food
          </button>
        </div>
      </div>
    </FloatingEmojisLayout>
  );
}


