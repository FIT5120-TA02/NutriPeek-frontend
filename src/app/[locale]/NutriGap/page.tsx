'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NutrientGapResponse, ActivityResult, ChildEnergyRequirementsResponse } from '../../../api/types';
import { useNutrition } from '../../../contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import storageService from '@/libs/StorageService';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import { toast } from 'sonner';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';

// Components
import ProfileSummary from '@/components/NutriGap/ProfileSummary';
import AnalysisTabs, { AnalysisType } from '@/components/NutriGap/AnalysisTabs';
import ImportantNutrientsDashboard from '@/components/NutriGap/ImportantNutrientsDashboard';
import AllNutrientsView from '@/components/NutriGap/AllNutrientsView';
import ActivityAnalysisView from '@/components/NutriGap/ActivityAnalysisView';
import SaveToNotesButton from '@/components/NutriGap/SaveToNotesButton';

export default function ResultsPage() {
  const router = useRouter();
  const { ingredientIds, clearIngredientIds, selectedChildId } = useNutrition();
  const [results, setResults] = useState<NutrientGapResponse | null>(null);
  const [activityResult, setActivityResult] = useState<ActivityResult | null>(null);
  const [energyRequirements, setEnergyRequirements] = useState<ChildEnergyRequirementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<AnalysisType>('nutrients');
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [isActivityEnabled, setIsActivityEnabled] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            setResults(JSON.parse(storedResults));
          } else {
            setError('No ingredients selected');
            return;
          }
        }

        const childProfiles = storageService.getLocalItem<ChildProfile[]>({ key: STORAGE_KEYS.CHILDREN_PROFILES, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.CHILDREN_PROFILES] });
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

        // Fetch nutrient gap if not already loaded from localStorage
        if (ingredientIds.length > 0) {

          // Filter out ingredient IDs that don't start with 'food-'
          const filteredIds = ingredientIds.filter(id => {
            if (!id.startsWith('food-')) {
              return id;
            }
          });

          const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
          const result = await nutripeekApi.calculateNutrientGap({
            child_profile: {
              age: parseInt(childProfile.age, 10),
              gender: apiGender,
            },
            ingredient_ids: filteredIds,
          });

          setResults(result);
          // Store results for later use
          localStorage.setItem('nutripeekGapResults', JSON.stringify(result));
        }

        // Check for activity result in localStorage
        const storedActivityResult = storageService.getLocalItem({ 
          key: STORAGE_KEYS.ACTIVITY_RESULT, 
          defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVITY_RESULT] 
        });

        if (storedActivityResult) {
          setActivityResult(storedActivityResult);
          setIsActivityEnabled(true);
          
          // Check for energy requirements based on activity level
          const storedEnergyRequirements = storageService.getLocalItem({ 
            key: STORAGE_KEYS.ENERGY_REQUIREMENTS, 
            defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
          });
          
          if (storedEnergyRequirements) {
            setEnergyRequirements(storedEnergyRequirements);
          }
        }
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

  const handleTabChange = (tab: AnalysisType) => {
    setCurrentTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-green-50">
        <div className="text-center w-full">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Analyzing nutrition data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-green-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleScanAgain}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Scan Food
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-green-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">Please scan some food items first.</p>
          <button
            onClick={handleScanAgain}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Scan Food
          </button>
        </div>
      </div>
    );
  }

  return (
    <FloatingEmojisLayout
      backgroundClasses="min-h-screen w-full bg-gradient-to-b from-green-50 to-green-100"
      emojisCount={20}
    >
      <div className="max-w-7xl mx-auto pt-24 pb-16 px-6 lg:px-8 w-full">
        
        {/* Title */}
        <div className="text-center mb-12 w-full">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Nutritional & Activity Analysis
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Review your child's nutrition and activity levels for personalized recommendations
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Left Side: Profile Summary */}
          <div className="lg:col-span-1">
            <ProfileSummary 
              profile={selectedChild}
              totalCalories={results.total_calories || 0}
              missingNutrients={results.missing_nutrients?.length || 0}
              excessNutrients={results.excess_nutrients?.length || 0}
              allNutrients={results.nutrient_gaps}
              activityPAL={activityResult?.pal}
              energyRequirements={energyRequirements}
              onViewRecommendations={handleViewRecommendations}
            />
          </div>

          {/* Right Side: Analysis Tabs and Content */}
          <div className="lg:col-span-2">
            <AnalysisTabs 
              currentTab={currentTab} 
              onTabChange={handleTabChange}
              isActivityEnabled={isActivityEnabled}
            >
              {currentTab === 'nutrients' && (
                <div className="space-y-8 w-full">
                  {/* Important Nutrients Dashboard */}
                  <ImportantNutrientsDashboard gaps={results.nutrient_gaps} />
                  
                  {/* Toggle Button for All Nutrients */}
                  <div className="flex justify-center w-full">
                    <button
                      onClick={() => setShowAllNutrients(!showAllNutrients)}
                      className="px-6 py-3 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {showAllNutrients ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Hide Detailed View
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          Show All Nutrients
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* All Nutrients View (Conditional) */}
                  {showAllNutrients && (
                    <AllNutrientsView 
                      gaps={results.nutrient_gaps} 
                      energyRequirements={energyRequirements}
                    />
                  )}
                </div>
              )}
              
              {currentTab === 'activity' && (
                <ActivityAnalysisView 
                  activityResult={activityResult}
                  energyRequirements={energyRequirements}
                />
              )}
            </AnalysisTabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 w-full">

          <SaveToNotesButton 
            results={results}
            childProfile={selectedChild}
            onSuccess={() => {
              toast.success("Analysis saved to notes successfully!")
              router.push('/Note')
            }}
            onError={(error) => toast.error("Failed to save analysis to notes. Please try again.")}
          />

          <button
            onClick={handleScanAgain}
            className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-lg font-semibold flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scan Another Food
          </button>
        </div>
      </div>
    </FloatingEmojisLayout>
  );
}




