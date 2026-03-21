'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NutrientGapResponse, ActivityResult, ChildEnergyRequirementsResponse } from '../../../api/types';
import { useNutrition } from '../../../contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import storageService from '@/libs/StorageService';
import { ChildProfile } from '@/types/profile';
import { toast } from 'sonner';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';
import RecommendedFoodsUtil, { RecommendedFoodsImpact } from '@/utils/RecommendedFoodsUtil';
import { calculateNutritionScore, getNutritionScoreColorClasses } from '@/utils/NutritionScoreUtils';
import ChildAvatar from '@/components/ui/ChildAvatar';

// Components
import AnalysisTabs, { AnalysisType } from '@/components/NutriGap/AnalysisTabs';
import ImportantNutrientsDashboard from '@/components/NutriGap/ImportantNutrientsDashboard';
import AllNutrientsView from '@/components/NutriGap/AllNutrientsView';
import ActivityAnalysisView from '@/components/NutriGap/ActivityAnalysisView';
import SaveToNotesButton from '@/components/NutriGap/SaveToNotesButton';

export default function ResultsPage() {
  const router = useRouter();
  const { ingredientIds, clearIngredientIds, selectedChildId } = useNutrition();
  const [results,              setResults]              = useState<NutrientGapResponse | null>(null);
  const [activityResult,       setActivityResult]       = useState<ActivityResult | null>(null);
  const [energyRequirements,   setEnergyRequirements]   = useState<ChildEnergyRequirementsResponse | null>(null);
  const [loading,              setLoading]              = useState(true);
  const [error,                setError]                = useState<string | null>(null);
  const [selectedChild,        setSelectedChild]        = useState<ChildProfile | null>(null);
  const [currentTab,           setCurrentTab]           = useState<AnalysisType>('nutrients');
  const [showAllNutrients,     setShowAllNutrients]     = useState(false);
  const [isActivityEnabled,    setIsActivityEnabled]    = useState(false);
  const [recommendedFoodsData, setRecommendedFoodsData] = useState<RecommendedFoodsImpact>({
    hasRecommendedFoods: false,
    foodItems: [],
    nutrientComparisons: [],
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        if (ingredientIds.length === 0) {
          const stored = storageService.getLocalItem<NutrientGapResponse>({ key: STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS] });
          if (stored) { setResults(stored); }
          else { setError('No ingredients selected'); return; }
        }

        const profiles = storageService.getLocalItem<ChildProfile[]>({ key: STORAGE_KEYS.CHILDREN_PROFILES, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.CHILDREN_PROFILES] });
        if (!profiles?.length) { setError('No child profile found'); return; }

        const profile = profiles[selectedChildId ?? 0];
        if (!profile) { setError('Selected child profile not found'); return; }
        setSelectedChild(profile);

        if (ingredientIds.length > 0) {
          const filteredIds = ingredientIds.filter(id => !id.startsWith('food-'));
          const result = await nutripeekApi.calculateNutrientGap({
            child_profile: { age: parseInt(profile.age, 10), gender: profile.gender.toLowerCase() === 'female' ? 'girl' : 'boy' },
            ingredient_ids: filteredIds,
          });
          setResults(result);
          storageService.setLocalItem<NutrientGapResponse>(STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, result);
        }

        const storedActivity = storageService.getLocalItem({ key: STORAGE_KEYS.ACTIVITY_RESULT, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ACTIVITY_RESULT] });
        if (storedActivity) {
          setActivityResult(storedActivity);
          setIsActivityEnabled(true);
          const storedEnergy = storageService.getLocalItem({ key: STORAGE_KEYS.ENERGY_REQUIREMENTS, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS] });
          if (storedEnergy) setEnergyRequirements(storedEnergy);
        }

        setRecommendedFoodsData(RecommendedFoodsUtil.getRecommendedFoodsData());
      } catch {
        setError('Failed to calculate nutritional gap. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [ingredientIds, selectedChildId]);

  /* ── Score ── */
  const score = useMemo(() => {
    if (!results) return 0;
    const converted = Object.fromEntries(
      Object.entries(results.nutrient_gaps).map(([k, v]) => [k, { current_intake: v.current_intake, recommended_intake: v.recommended_intake, unit: v.unit }])
    );
    return calculateNutritionScore(converted, results.missing_nutrients?.length ?? 0, results.excess_nutrients?.length ?? 0);
  }, [results]);

  const scoreColors = getNutritionScoreColorClasses(score);

  /* ── Score label ── */
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';
  const scoreLabelColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-teal-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Analysing nutrition data…</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-lg font-semibold text-gray-800 mb-2">{error || 'No results found'}</h1>
          <p className="text-sm text-gray-500 mb-6">Please scan some food items first.</p>
          <button onClick={() => { clearIngredientIds(); router.push('/NutriScan'); }}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition text-sm font-medium">
            Scan Food
          </button>
        </div>
      </div>
    );
  }

  const missingCount = results.missing_nutrients?.length ?? 0;
  const excessCount  = results.excess_nutrients?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-20 pb-16 space-y-5">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-7 text-white shadow-md">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1.5">Step 3 — Your Results</p>
              <h1 className="text-2xl font-bold leading-snug">Nutrition & Activity Report</h1>

              {/* Child info row */}
              <div className="flex items-center gap-3 mt-3">
                <ChildAvatar
                  name={selectedChild?.name || 'Child'}
                  gender={selectedChild?.gender || 'male'}
                  avatarNumber={(selectedChild as any)?.avatarNumber || 1}
                  size={36}
                />
                <div>
                  <p className="font-semibold text-sm">{selectedChild?.name}</p>
                  <p className="text-xs opacity-75">{selectedChild?.age} years · {selectedChild?.gender}</p>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-2.5 mt-4">
                <div className="bg-white/15 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
                  <p className="text-lg font-bold">{(results.total_calories ?? 0).toFixed(0)}</p>
                  <p className="text-[10px] uppercase tracking-wide opacity-80">kJ today</p>
                </div>
                <div className="bg-white/15 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
                  <p className="text-lg font-bold text-red-300">{missingCount}</p>
                  <p className="text-[10px] uppercase tracking-wide opacity-80">Low nutrients</p>
                </div>
                <div className="bg-white/15 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
                  <p className="text-lg font-bold text-amber-200">{excessCount}</p>
                  <p className="text-[10px] uppercase tracking-wide opacity-80">Excess nutrients</p>
                </div>
                {isActivityEnabled && activityResult && (
                  <div className="bg-white/15 rounded-xl px-3.5 py-2 text-center min-w-[80px]">
                    <p className="text-lg font-bold">{activityResult.pal.toFixed(1)}</p>
                    <p className="text-[10px] uppercase tracking-wide opacity-80">Activity level</p>
                  </div>
                )}
              </div>
            </div>

            {/* Score circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${scoreColors.textColor}`}>{score}</span>
                  <p className="text-[9px] text-gray-400 leading-none mt-0.5">/ 100</p>
                </div>
              </div>
              <span className={`text-xs font-semibold mt-1.5 ${scoreLabelColor} bg-white/90 px-2 py-0.5 rounded-full`}>{scoreLabel}</span>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-10 -bottom-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* ── Main content card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Tabs */}
          <AnalysisTabs
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            isActivityEnabled={isActivityEnabled}
          >
            {/* ── Nutrients tab ── */}
            {currentTab === 'nutrients' && (
              <div className="px-6 py-5 space-y-6">
                <ImportantNutrientsDashboard
                  gaps={results.nutrient_gaps}
                  nutrientComparisons={recommendedFoodsData.nutrientComparisons}
                />

                {/* Show all nutrients toggle */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllNutrients(v => !v)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 border border-gray-200 hover:border-emerald-300 rounded-full px-4 py-2 transition-colors"
                  >
                    <svg className={`h-4 w-4 transition-transform ${showAllNutrients ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showAllNutrients ? 'Hide detailed breakdown' : 'Show all nutrients'}
                  </button>
                </div>

                {showAllNutrients && (
                  <AllNutrientsView
                    gaps={results.nutrient_gaps}
                    energyRequirements={energyRequirements}
                    nutrientComparisons={recommendedFoodsData.nutrientComparisons}
                  />
                )}
              </div>
            )}

            {/* ── Activity tab ── */}
            {currentTab === 'activity' && (
              <div className="px-6 py-5">
                <ActivityAnalysisView
                  activityResult={activityResult}
                  energyRequirements={energyRequirements}
                />
              </div>
            )}
          </AnalysisTabs>

          {/* ── CTA row ── */}
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary */}
              <button
                onClick={() => router.push('/NutriRecommend')}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Fill Nutrition Gaps
              </button>

              {/* Secondary */}
              <SaveToNotesButton
                results={results}
                childProfile={selectedChild}
                onSuccess={() => { toast.success('Analysis saved to notes.'); router.push('/Note'); }}
                onError={() => toast.error('Failed to save. Please try again.')}
                className="flex-1 py-3.5 border-2 border-teal-500 text-teal-600 hover:bg-teal-50 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              />

              {/* Tertiary */}
              <button
                onClick={() => { clearIngredientIds(); router.push('/NutriScan'); }}
                className="flex-1 py-3.5 border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan Another Meal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}