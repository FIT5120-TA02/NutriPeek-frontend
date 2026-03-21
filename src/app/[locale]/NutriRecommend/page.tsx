'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNutrition } from '@/contexts/NutritionContext';
import { nutripeekApi } from '@/api/nutripeekApi';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/types/profile';
import storageService from '@/libs/StorageService';
import { ChildEnergyRequirementsResponse, type NutrientGapResponse, RecommendationType } from '@/api/types';
import {
  NutrientList,
  RecommendedFoods,
  SelectedFoods,
  LoadingSpinner,
  ErrorMessage,
  ExtendedNutrientGap,
  NutriRecommendService,
  RecommendationTypeToggle,
  RegionSelectionDialog
} from '@/components/NutriRecommend';
import { FoodItem } from '@/types/notes';
import TooltipButton from '@/components/ui/TooltipButton';
import { STORAGE_KEYS, STORAGE_DEFAULTS } from '@/types/storage';
import RecommendedFoodsUtil from '@/utils/RecommendedFoodsUtil';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { calculateNutritionScore, getNutritionScoreColorClasses } from '@/utils/NutritionScoreUtils';

export default function NutriRecommendPage() {
  const { ingredientIds, selectedChildId, clearIngredientIds } = useNutrition();
  const router = useRouter();

  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState<string | null>(null);
  const [selectedChild,      setSelectedChild]      = useState<ChildProfile | null>(null);
  const [missingNutrients,   setMissingNutrients]   = useState<ExtendedNutrientGap[]>([]);
  const [selectedFoods,      setSelectedFoods]      = useState<FoodItem[]>([]);
  const [activeNutrient,     setActiveNutrient]     = useState<string | null>(null);
  const [totalEnergy,        setTotalEnergy]        = useState<number | null>(null);
  const [energyRequirements, setEnergyRequirements] = useState<ChildEnergyRequirementsResponse | null>(null);
  const [hasAdjustedEnergy,  setHasAdjustedEnergy]  = useState(false);
  const [prevRecommendedFoods, setPrevRecommendedFoods] = useState<FoodItem[]>([]);
  const [recommendationType, setRecommendationType] = useState<RecommendationType>(RecommendationType.STANDARD);
  const [showRegionDialog,   setShowRegionDialog]   = useState(false);
  const [selectedRegion,     setSelectedRegion]     = useState<string | null>(null);
  const [hasNewSelections,   setHasNewSelections]   = useState(false);
  const [nutrientGapData,    setNutrientGapData]    = useState<NutrientGapResponse | null>(null);

  const processingRef = useRef<AbortController | null>(null);

  /* ── Base score (original scan, no added foods) ── */
  const baseScore = useMemo(() => {
    if (!nutrientGapData) return null;
    const converted = Object.fromEntries(
      Object.entries(nutrientGapData.nutrient_gaps).map(([k, v]) => [k, { current_intake: v.current_intake, recommended_intake: v.recommended_intake, unit: v.unit }])
    );
    return calculateNutritionScore(converted);
  }, [nutrientGapData]);

  /* ── Projected score ──
   * nutrientGapData already contains prevRecommendedFoods' contributions (after a save).
   * Only apply the NET DELTA vs prevRecommendedFoods so we never double-count:
   *   new food added       → +contribution
   *   pre-loaded food removed → -contribution
   *   quantity change      → ±delta × contribution
   *   unchanged pre-loaded → 0 (no change)
   */
  const projectedScore = useMemo(() => {
    if (!nutrientGapData) return null;
    const adjusted = Object.fromEntries(
      Object.entries(nutrientGapData.nutrient_gaps).map(([k, v]) => [k, { current_intake: v.current_intake, recommended_intake: v.recommended_intake, unit: v.unit }])
    );

    // Build a union of all food IDs across current and previous selections
    const allIds = new Set([
      ...selectedFoods.map(f => f.id),
      ...prevRecommendedFoods.map(f => f.id),
    ]);

    allIds.forEach(id => {
      const cur = selectedFoods.find(f => f.id === id);
      const prev = prevRecommendedFoods.find(f => f.id === id);
      const deltaQty = (cur?.quantity ?? 0) - (prev?.quantity ?? 0);
      if (deltaQty === 0) return;
      const food = cur ?? prev;
      if (!food?.nutrients) return;
      Object.entries(food.nutrients).forEach(([name, value]) => {
        if (adjusted[name]) {
          adjusted[name] = {
            ...adjusted[name],
            current_intake: Math.max(0, adjusted[name].current_intake + value * deltaQty),
          };
        }
      });
    });

    return calculateNutritionScore(adjusted);
  }, [nutrientGapData, selectedFoods, prevRecommendedFoods]);

  const processRecommendationsWithType = useCallback(async (
    result: NutrientGapResponse,
    type: RecommendationType,
    region?: string
  ): Promise<{ missingNutrients: ExtendedNutrientGap[], totalEnergy: number | null }> => {
    switch (type) {
      case RecommendationType.OPTIMIZED:
        return await NutriRecommendService.processOptimizedFoodResults(result);
      case RecommendationType.SEASONAL: {
        const seasonalRegion = region || selectedRegion || NutriRecommendService.getSelectedRegion();
        if (!seasonalRegion) return await NutriRecommendService.processNutrientGapResult(result);
        return await NutriRecommendService.processSeasonalFoodResults(result, seasonalRegion);
      }
      default:
        return await NutriRecommendService.processNutrientGapResult(result);
    }
  }, [selectedRegion]);

  const applyPreviousRecommendations = useCallback((
    nutrients: ExtendedNutrientGap[],
    previousFoods: FoodItem[]
  ): ExtendedNutrientGap[] => {
    if (!previousFoods.length) return nutrients;
    return nutrients.map(nutrient => ({
      ...nutrient,
      recommendedFoods: nutrient.recommendedFoods.map(food => {
        const match = previousFoods.find(s => s.id === food.id);
        return match ? { ...food, selected: true, quantity: match.quantity || 1 } : food;
      }),
    }));
  }, []);

  useEffect(() => {
    const region = NutriRecommendService.getSelectedRegion();
    if (region) setSelectedRegion(region);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (processingRef.current) processingRef.current.abort();
      const abort = new AbortController();
      processingRef.current = abort;

      try {
        setLoading(true);
        setError(null);

        const storedEnergy = storageService.getLocalItem<ChildEnergyRequirementsResponse>({
          key: STORAGE_KEYS.ENERGY_REQUIREMENTS,
          defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.ENERGY_REQUIREMENTS]
        });
        if (storedEnergy) setEnergyRequirements(storedEnergy);

        if (ingredientIds.length === 0) {
          const stored = storageService.getLocalItem<NutrientGapResponse>({ key: STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS, defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS] });
          if (!stored) { setError('No ingredients selected'); setLoading(false); return; }

          setNutrientGapData(stored);
          const { missingNutrients, totalEnergy, childProfile } = await NutriRecommendService.processStoredResultsWithType(stored, selectedChildId, recommendationType, selectedRegion || undefined);
          if (abort.signal.aborted) return;

          setMissingNutrients(missingNutrients);
          setTotalEnergy(totalEnergy);
          setSelectedChild(childProfile);
          setHasAdjustedEnergy(missingNutrients.some(n => n.isAdjustedForActivity && n.name.toLowerCase().includes('energy')));
          if (missingNutrients.length > 0) setActiveNutrient(missingNutrients[0].name);

          const rfData = RecommendedFoodsUtil.getRecommendedFoodsData();
          if (rfData.hasRecommendedFoods && rfData.foodItems.length > 0) {
            setPrevRecommendedFoods(rfData.foodItems);
            const preSelected = rfData.foodItems.map(f => ({ ...f, selected: true }));
            setSelectedFoods(preSelected);
            setMissingNutrients(applyPreviousRecommendations(missingNutrients, preSelected));
          }
          setLoading(false);
          return;
        }

        storageService.setLocalItem<string[]>(STORAGE_KEYS.SELECTED_INGREDIENT_IDS, ingredientIds);
        const childProfile = NutriRecommendService.getChildProfile(selectedChildId);
        if (!childProfile) { setError('No child profile found'); setLoading(false); return; }
        setSelectedChild(childProfile);

        const filteredIds = ingredientIds.filter(id => !id.startsWith('food-'));
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: { age: parseInt(childProfile.age, 10), gender: childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy' },
          ingredient_ids: filteredIds,
        });
        if (abort.signal.aborted) return;

        setNutrientGapData(result);
        const { missingNutrients, totalEnergy } = await processRecommendationsWithType(result, recommendationType, selectedRegion || undefined);
        if (abort.signal.aborted) return;

        setMissingNutrients(missingNutrients);
        setTotalEnergy(totalEnergy);
        setHasAdjustedEnergy(missingNutrients.some(n => n.isAdjustedForActivity && n.name.toLowerCase().includes('energy')));
        if (missingNutrients.length > 0) setActiveNutrient(missingNutrients[0].name);

        const rfData = RecommendedFoodsUtil.getRecommendedFoodsData();
        if (rfData.hasRecommendedFoods && rfData.foodItems.length > 0) {
          setPrevRecommendedFoods(rfData.foodItems);
          const preSelected = rfData.foodItems.map(f => ({ ...f, selected: true }));
          setSelectedFoods(preSelected);
          setMissingNutrients(applyPreviousRecommendations(missingNutrients, preSelected));
        }
      } catch (err) {
        if (!abort.signal.aborted) setError('Failed to load recommendations. Please try again.');
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { if (processingRef.current) processingRef.current.abort(); };
  }, [ingredientIds, selectedChildId, recommendationType, selectedRegion, processRecommendationsWithType, applyPreviousRecommendations]);

  const handleRecommendationTypeChange = async (newType: RecommendationType) => {
    if (newType === recommendationType) return;
    if (newType === RecommendationType.SEASONAL && !NutriRecommendService.hasSelectedRegion()) {
      setShowRegionDialog(true);
      return;
    }
    setLoading(true);
    setRecommendationType(newType);
  };

  const handleRegionSelect = (region: string) => {
    NutriRecommendService.saveSelectedRegion(region);
    setSelectedRegion(region);
    setShowRegionDialog(false);
    setLoading(true);
    setRecommendationType(RecommendationType.SEASONAL);
  };

  useEffect(() => {
    if (!prevRecommendedFoods.length && !selectedFoods.length) { setHasNewSelections(false); return; }
    if (!prevRecommendedFoods.length) { setHasNewSelections(selectedFoods.length > 0); return; }
    const hasNew = selectedFoods.some(cf => !prevRecommendedFoods.some(pf => pf.id === cf.id));
    const hasInc = selectedFoods.some(cf => { const pf = prevRecommendedFoods.find(p => p.id === cf.id); return pf ? (cf.quantity||1) > (pf.quantity||1) : false; });
    const hasDec = prevRecommendedFoods.some(pf => { const cf = selectedFoods.find(c => c.id === pf.id); return !cf || (cf.quantity||1) < (pf.quantity||1); });
    setHasNewSelections(hasNew || hasInc || hasDec);
  }, [selectedFoods, prevRecommendedFoods]);

  const handleToggleFood = (nutrientName: string, foodItem: FoodItem) => {
    setMissingNutrients(prev => prev.map(n => n.name !== nutrientName ? n : {
      ...n,
      recommendedFoods: n.recommendedFoods.map(f => f.id !== foodItem.id ? f : { ...f, selected: !f.selected }),
    }));
    setSelectedFoods(prev => {
      const idx = prev.findIndex(f => f.id === foodItem.id);
      return idx !== -1 ? prev.filter(f => f.id !== foodItem.id) : [...prev, { ...foodItem, selected: true }];
    });
  };

  const handleUpdateQuantity = (nutrientName: string, foodItem: FoodItem, quantity: number) => {
    setMissingNutrients(prev => prev.map(n => n.name !== nutrientName ? n : {
      ...n,
      recommendedFoods: n.recommendedFoods.map(f => f.id !== foodItem.id ? f : { ...f, quantity }),
    }));
    setSelectedFoods(prev => prev.map(f => f.id !== foodItem.id ? f : { ...f, quantity }));
  };

  useEffect(() => {
    if (!selectedFoods.length || !missingNutrients.length) return;
    const added: Record<string, number> = {};
    selectedFoods.forEach(food => {
      if (food.nutrients) Object.entries(food.nutrients).forEach(([k, v]) => {
        added[k] = (added[k] || 0) + v * (food.quantity || 1);
      });
    });
    setMissingNutrients(prev => prev.map(n => {
      const base = (n.current_intake / n.recommended_intake) * 100;
      if (!added[n.name]) return { ...n, updatedPercentage: base };
      return { ...n, updatedPercentage: ((n.current_intake + added[n.name]) / n.recommended_intake) * 100 };
    }));
  }, [selectedFoods, missingNutrients.length]);

  const [saving, setSaving] = useState(false);

  const handleSaveSelection = async () => {
    if (selectedFoods.length === 0 || saving) return;
    try {
      setSaving(true);
      await NutriRecommendService.saveSelectedFoods(selectedFoods);
      // Clear context so NutriGap loads the updated combined score from storage.
      // Do NOT re-save food IDs — NUTRIPEEK_GAP_RESULTS already includes them,
      // so pre-loading would cause double-counting on the next visit.
      clearIngredientIds();
      router.push('/Note');
    } catch {
      setSaving(false);
    }
  };

  const handleScanMore = () => { clearIngredientIds(); router.push('/NutriScan'); };

  if (loading) return <LoadingSpinner recommendationType={recommendationType} />;
  if (error)   return <ErrorMessage message={error} />;

  const GUIDE_STEPS = ['Pick a nutrient gap', 'Choose helpful foods', 'Save your plan'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-20 pb-16 space-y-5">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 px-8 py-7 text-white shadow-md">
          <div className="relative z-10">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1.5">Step 4 — Your Plan</p>
                <h1 className="text-2xl font-bold leading-snug">Fill Your Nutrition Gaps</h1>

                {/* Child info */}
                {selectedChild && (
                  <div className="flex items-center gap-3 mt-3">
                    <ChildAvatar
                      name={selectedChild.name}
                      gender={selectedChild.gender}
                      avatarNumber={(selectedChild as any).avatarNumber || 1}
                      size={36}
                    />
                    <div>
                      <p className="font-semibold text-sm">{selectedChild.name}</p>
                      <p className="text-xs opacity-75">{selectedChild.age} years · {selectedChild.gender}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Score + gap count */}
              <div className="flex-shrink-0 flex items-center gap-3">
                {/* Score circle — shows projectedScore (updates live as foods are added/removed) */}
                {projectedScore !== null && (() => {
                  const displayScore = projectedScore;
                  const scoreColors = getNutritionScoreColorClasses(displayScore);
                  const improvement = baseScore !== null && displayScore > baseScore ? displayScore - baseScore : 0;
                  return (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                        <div className="text-center">
                          <span className={`text-xl font-bold ${scoreColors.textColor}`}>{displayScore}</span>
                          <p className="text-[8px] text-gray-400 leading-none">/100</p>
                        </div>
                      </div>
                      {improvement > 0 ? (
                        <span className="text-[10px] font-semibold mt-1 bg-white/90 px-1.5 py-0.5 rounded-full text-emerald-600 block">
                          ↑{Math.round(improvement)} pts
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-70 mt-1 block">Score</span>
                      )}
                    </div>
                  );
                })()}

                {/* Gap count badge */}
                <div className="text-center bg-white/20 rounded-2xl px-4 py-3">
                  <p className="text-3xl font-bold">{missingNutrients.length}</p>
                  <p className="text-xs opacity-80 mt-0.5">gaps to address</p>
                </div>
              </div>
            </div>

            {/* 3-step mini guide */}
            <div className="flex items-center gap-1.5 mt-5">
              {GUIDE_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-1">
                  <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-white/30 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium leading-tight">{step}</span>
                  </div>
                  {i < 2 && (
                    <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-10 -bottom-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* ── Context chips row ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recommendation type toggle — compact */}
          <RecommendationTypeToggle
            selectedType={recommendationType}
            onTypeChange={handleRecommendationTypeChange}
            selectedRegion={selectedRegion}
          />

          {/* Seasonal context chip */}
          {recommendationType === RecommendationType.SEASONAL && selectedRegion && (
            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>
                {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} &middot; {new Date().toLocaleString('en-AU', { month: 'long' })}
              </span>
              <button onClick={() => setShowRegionDialog(true)} className="underline opacity-70 hover:opacity-100">
                Change
              </button>
            </div>
          )}

          {/* Energy adjusted chip */}
          {hasAdjustedEnergy && energyRequirements && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Energy target: {energyRequirements.estimated_energy_requirement.toFixed(0)} {energyRequirements.unit} (high activity)
            </div>
          )}

          {/* Previous foods chip */}
          {prevRecommendedFoods.length > 0 && !hasNewSelections && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {prevRecommendedFoods.length} foods from previous plan loaded
            </div>
          )}
        </div>

        {/* ── Main 2-panel layout ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left panel: step 1 + step 2 stacked ── */}
          <div className="lg:w-3/5 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Step 1 header */}
            <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-100 px-5 py-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex-shrink-0">1</span>
              <h2 className="text-sm font-semibold text-gray-700">Select a nutrient gap</h2>
              <span className="ml-auto text-xs text-gray-400">{missingNutrients.length} to address</span>
            </div>

            {/* Step 1 content */}
            <div className="p-4 max-h-[280px] overflow-y-auto">
              <NutrientList
                nutrients={missingNutrients}
                activeNutrient={activeNutrient}
                onSelectNutrient={setActiveNutrient}
              />
            </div>

            {/* Step 2 header */}
            <div className="flex items-center gap-2 bg-gray-50 border-t border-b border-gray-100 px-5 py-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex-shrink-0">2</span>
              <h2 className="text-sm font-semibold text-gray-700 truncate">
                {activeNutrient ? `Foods rich in ${activeNutrient}` : 'Choose foods to add'}
              </h2>
              {!activeNutrient && (
                <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Pick a gap above first
                </span>
              )}
            </div>

            {/* Step 2 content */}
            <div className="p-4 max-h-[380px] overflow-y-auto">
              <RecommendedFoods
                activeNutrient={activeNutrient}
                nutrients={missingNutrients}
                onToggleFood={handleToggleFood}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </div>
          </div>

          {/* ── Right panel: your plan (sticky) ── */}
          <div className="lg:w-2/5 w-full lg:sticky lg:top-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

            {/* Step 3 header */}
            <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-100 px-5 py-3">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex-shrink-0">3</span>
              <h2 className="text-sm font-semibold text-gray-700">Your food plan</h2>
              {selectedFoods.length > 0 && (
                <span className="ml-auto text-xs bg-teal-100 text-teal-700 rounded-full px-2.5 py-0.5 font-semibold">
                  {selectedFoods.length} added
                </span>
              )}
            </div>

            {/* Step 3 content */}
            <div className="p-4 flex-1">
              <SelectedFoods
                selectedFoods={selectedFoods}
                nutrients={missingNutrients}
                onRemoveFood={handleToggleFood}
              />
            </div>

            {/* CTA */}
            <div className="border-t border-gray-100 p-4 space-y-2">
              <TooltipButton
                onClick={handleSaveSelection}
                disabled={selectedFoods.length === 0 || !hasNewSelections || saving}
                disabledTooltip={
                  selectedFoods.length === 0
                    ? 'Select at least one food to save your plan'
                    : saving ? 'Saving…'
                    : 'No changes since last save.'
                }
                position="top"
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedFoods.length > 0 && hasNewSelections && !saving
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save food plan
                  </>
                )}
              </TooltipButton>

              <button
                onClick={handleScanMore}
                className="w-full py-2.5 border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan more food
              </button>
            </div>
          </div>
        </div>

        {/* Region Selection Dialog */}
        <RegionSelectionDialog
          visible={showRegionDialog}
          onHide={() => setShowRegionDialog(false)}
          onRegionSelect={handleRegionSelect}
        />
      </div>
    </div>
  );
}