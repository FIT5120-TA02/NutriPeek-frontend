"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FoodItemDisplay, EditableFoodItem, MealType, MealImage } from "./types";
import { IngredientsList } from "./FoodIngredients";
import { useNutrition } from "../../contexts/NutritionContext";
import storageService from "@/libs/StorageService";
import { motion, AnimatePresence } from "framer-motion";
import { ChildProfile } from "@/types/profile";
import { Calendar } from "./ActivityCalendar";
import { ActivityEntry, type ActivityResult, type ChildEnergyRequirementsResponse } from "@/api/types";
import { nutripeekApi } from "@/api/nutripeekApi";
import { MealResultCard } from "./Meal";
import MobileCarousel, { CarouselItem } from "@/components/ui/MobileCarousel";
import useDeviceDetection from "@/hooks/useDeviceDetection";
import { toast } from "sonner";
import { getMealTitle } from "./utils";
import { STORAGE_KEYS, STORAGE_DEFAULTS } from "@/types/storage";
import { FoodItem } from "@/types/notes";
import InfoPopup from "@/components/ui/InfoPopup";
import AddProfilePopup from "./AddProfilePopup";
import ChildAvatar from "@/components/ui/ChildAvatar";

interface ResultsSectionProps {
  mealImages: MealImage[];
  onMealTypeChange: (index: number, newType: MealType) => void;
  toggleView: () => void;
}

export default function ResultsSection({ mealImages, onMealTypeChange, toggleView }: ResultsSectionProps) {
  const router = useRouter();
  const { setIngredientIds, setSelectedChildId } = useNutrition();

  const [ingredients,            setIngredients]            = useState<EditableFoodItem[]>([]);
  const [isCalculating,          setIsCalculating]          = useState(false);
  const [childProfiles,          setChildProfiles]          = useState<ChildProfile[]>([]);
  const [currentProfileIndex,    setCurrentProfileIndex]    = useState(0);
  const [selectedActivities,     setSelectedActivities]     = useState<ActivityEntry[]>([]);
  const [ingredientsInitialized, setIngredientsInitialized] = useState(false);
  const [showAddProfilePopup,    setShowAddProfilePopup]    = useState(false);
  const [showActivity,           setShowActivity]           = useState(false);

  const { isMobile, isTablet } = useDeviceDetection();
  const shouldUseCarousel = isMobile || isTablet;

  /* Load profiles */
  useEffect(() => {
    const saved = storageService.getLocalItem<ChildProfile[]>({
      key: STORAGE_KEYS.CHILDREN_PROFILES,
      defaultValue: STORAGE_DEFAULTS[STORAGE_KEYS.CHILDREN_PROFILES],
    });
    if (saved?.length) setChildProfiles(saved);
  }, []);

  const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const processedMealImages = mealImages.filter(
    (m) => m.file !== null && m.detectedItems && m.detectedItems.length > 0
  );

  /* Init ingredients from detected items */
  useEffect(() => {
    if (!processedMealImages.length || ingredientsInitialized) return;
    const all: FoodItemDisplay[] = processedMealImages.flatMap((m) => m.detectedItems ?? []);
    const map = new Map<string, EditableFoodItem>();
    all.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      if (map.has(key)) {
        const ex = map.get(key)!;
        const merged: Record<string, number> = { ...(ex.nutrients || {}) };
        if (item.nutrients) Object.entries(item.nutrients).forEach(([k, v]) => { merged[k] = (merged[k] || 0) + v; });
        map.set(key, { ...ex, quantity: (ex.quantity || 1) + (item.quantity || 1), nutrients: merged });
      } else {
        map.set(key, { ...item, quantity: item.quantity || 1, isCustomAdded: false, uniqueId: generateUniqueId() } as EditableFoodItem);
      }
    });
    setIngredients(Array.from(map.values()));
    setIngredientsInitialized(true);
  }, [processedMealImages, ingredientsInitialized]);

  /* Meal type change guard */
  const handleSafeMealTypeChange = (index: number, newType: MealType) => {
    const target = mealImages[index];
    const otherTypes = processedMealImages.filter((m) => m !== target).map((m) => m.mealType);
    if (otherTypes.includes(newType)) { toast.error(`A ${getMealTitle(newType)} image already exists.`); return; }
    onMealTypeChange(index, newType);
  };

  /* Add profile */
  const handleAddProfile = (profile: ChildProfile) => {
    try {
      const updated = [...childProfiles, profile];
      setChildProfiles(updated);
      storageService.setLocalItem<ChildProfile[]>(STORAGE_KEYS.CHILDREN_PROFILES, updated);
      setCurrentProfileIndex(updated.length - 1);
      toast.success(`Profile for ${profile.name} created.`);
    } catch { toast.error("Failed to create profile."); }
  };

  /* Calculate gap */
  const handleCalculateGap = async (ids: string[]) => {
    if (!ids.length) return;
    if (!childProfiles.length) { router.push("/Profile"); return; }
    try {
      setIsCalculating(true);
      const expandedIds: string[] = [];
      ingredients.forEach((item) => { if (item.id) for (let i = 0; i < (item.quantity || 1); i++) expandedIds.push(item.id); });
      setIngredientIds(expandedIds);
      setSelectedChildId(currentProfileIndex);
      storageService.setLocalItem<FoodItem[]>(STORAGE_KEYS.SCANNED_FOODS, ingredients.map((item) => ({
        id: item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        category: item.name.toLowerCase().includes("fruit") ? "Fruits" : item.name.toLowerCase().includes("vegetable") ? "Vegetables" : "Other",
        imageUrl: "", nutrients: item.nutrients || {}, selected: true, quantity: item.quantity || 1,
      })));
      if (selectedActivities.length) {
        const child = childProfiles[currentProfileIndex];
        const age   = parseInt(child.age, 10);
        const gender = child.gender.toLowerCase() === "female" || child.gender.toLowerCase() === "girl" ? "girl" : "boy";
        try {
          const result = await nutripeekApi.calculatePAL(age, selectedActivities);
          storageService.setLocalItem<ActivityResult>(STORAGE_KEYS.ACTIVITY_RESULT, result);
          storageService.setLocalItem<number>(STORAGE_KEYS.ACTIVITY_PAL, result.pal);
          storageService.setLocalItem<ActivityEntry[]>(STORAGE_KEYS.SELECTED_ACTIVITIES, selectedActivities);
          if (result.pal) {
            const energy = await nutripeekApi.getTargetEnergy(age, gender, result.pal);
            storageService.setLocalItem<ChildEnergyRequirementsResponse>(STORAGE_KEYS.ENERGY_REQUIREMENTS, energy);
          }
        } catch { console.error("Error calculating PAL"); }
      } else {
        [STORAGE_KEYS.ACTIVITY_RESULT, STORAGE_KEYS.ACTIVITY_PAL, STORAGE_KEYS.SELECTED_ACTIVITIES, STORAGE_KEYS.ENERGY_REQUIREMENTS]
          .forEach((k) => storageService.removeLocalItem(k));
      }
      router.push("/NutriGap");
    } catch { alert("Error preparing analysis. Please try again."); }
    finally { setIsCalculating(false); }
  };

  /* Carousel items */
  const carouselItems: CarouselItem[] = processedMealImages.map((meal, i) => ({
    key: `${meal.mealType}-${i}`,
    content: (
      <div className="px-2">
        <MealResultCard
          mealType={meal.mealType}
          imagePreviewUrl={meal.imagePreviewUrl}
          detectedItems={meal.detectedItems || []}
          onMealTypeChange={(t) => handleSafeMealTypeChange(mealImages.findIndex((m) => m === meal), t)}
        />
      </div>
    ),
  }));

  const canCalculate = ingredients.length > 0 && childProfiles.length > 0;

  return (
    <div className="w-full max-w-4xl space-y-5">

      {/* ─── Hero banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-7 text-white shadow-md">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1.5">Step 2 — Review</p>
          <h1 className="text-2xl font-bold leading-snug mb-1">Review & personalise your analysis</h1>
          <p className="text-sm opacity-75">Confirm detected ingredients, choose a child profile, then calculate the nutritional gap.</p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 -bottom-12 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* ─── Unified content card ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">

        {/* ── Section: Meals ── */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-700">Meals detected</h2>
            </div>
            <button
              onClick={toggleView}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add more
            </button>
          </div>

          {processedMealImages.length > 0 ? (
            shouldUseCarousel
              ? <MobileCarousel items={carouselItems} showControls showIndicators className="max-w-full" carouselItemClass="p-2" transitionType="slide" />
              : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedMealImages.map((meal, i) => (
                    <MealResultCard key={`${meal.mealType}-${i}`}
                      mealType={meal.mealType} imagePreviewUrl={meal.imagePreviewUrl}
                      detectedItems={meal.detectedItems || []}
                      onMealTypeChange={(t) => handleSafeMealTypeChange(mealImages.findIndex((m) => m === meal), t)}
                    />
                  ))}
                </div>
          ) : (
            <div className="bg-gray-50 rounded-xl px-6 py-8 text-center text-sm text-gray-400">
              No meals processed yet.
            </div>
          )}
        </div>

        {/* ── Section: Ingredients + Profile (2-col) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* Ingredients */}
          <div className="px-6 py-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-700">Ingredients</h2>
              <InfoPopup
                content={
                  <div className="max-w-[260px]">
                    <p className="font-medium text-gray-800 mb-1">About nutritional values</p>
                    <p className="text-xs text-gray-600">Values are per 100 g edible portion. Increasing quantity scales nutrients proportionally.</p>
                  </div>
                }
                position="bottom" iconSize={14} iconClassName="ml-auto text-gray-400 hover:text-gray-600"
              />
            </div>

            {ingredientsInitialized && (
              <button onClick={() => { setIngredients([]); setIngredientsInitialized(false); }}
                className="self-start mb-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Reset list
              </button>
            )}

            <div className="flex-1 min-h-[200px]">
              <IngredientsList ingredients={ingredients} onIngredientsChange={setIngredients} />
            </div>
          </div>

          {/* Child profile */}
          <div className="px-6 py-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-700">Child profile</h2>
            </div>

            {childProfiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">No child profiles yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Add a profile to personalise the analysis</p>
                </div>
                <button onClick={() => setShowAddProfilePopup(true)}
                  className="px-5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-full hover:bg-emerald-600 transition-colors shadow-sm">
                  Add profile
                </button>
              </div>
            ) : (
              <>
                {childProfiles.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setCurrentProfileIndex((p) => (p === 0 ? childProfiles.length - 1 : p - 1))}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex gap-1.5 flex-1 justify-center">
                      {childProfiles.map((_, i) => (
                        <button key={i} onClick={() => setCurrentProfileIndex(i)}
                          className={`rounded-full transition-all duration-200 ${i === currentProfileIndex ? "w-5 h-2 bg-emerald-500" : "w-2 h-2 bg-gray-200 hover:bg-gray-300"}`} />
                      ))}
                    </div>
                    <button onClick={() => setCurrentProfileIndex((p) => (p === childProfiles.length - 1 ? 0 : p + 1))}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div key={childProfiles[currentProfileIndex].name}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-4">
                    <ChildAvatar
                      name={childProfiles[currentProfileIndex].name}
                      gender={childProfiles[currentProfileIndex].gender}
                      avatarNumber={(childProfiles[currentProfileIndex] as any).avatarNumber || 1}
                      size={52}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{childProfiles[currentProfileIndex].name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{childProfiles[currentProfileIndex].age} years old · {childProfiles[currentProfileIndex].gender}</p>
                    </div>
                    <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                </AnimatePresence>

                <p className="text-xs text-gray-400 text-center mt-2">
                  Analysis personalised for {childProfiles[currentProfileIndex].name}
                </p>

                <button onClick={() => setShowAddProfilePopup(true)}
                  className="mt-3 text-xs text-emerald-600 hover:underline text-center font-medium">
                  + Add another profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Section: Activity (collapsible) ── */}
        <div>
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50/60 transition-colors"
          >
            <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Activity tracking</span>
                <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">Optional</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Add today&rsquo;s activities for a more accurate energy analysis</p>
            </div>
            {selectedActivities.length > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 font-semibold mr-1">
                {selectedActivities.length} added
              </span>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showActivity ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showActivity && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 border-t border-gray-100">
                  <Calendar
                    selectedActivities={selectedActivities}
                    setSelectedActivities={setSelectedActivities}
                    childAge={childProfiles[currentProfileIndex]?.age
                      ? parseInt(childProfiles[currentProfileIndex].age.toString())
                      : undefined}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Section: CTA ── */}
        <div className="px-6 py-5">
          <button
            onClick={() => {
              const ids = ingredients.filter((i) => i.id).map((i) => i.id as string);
              handleCalculateGap(ids);
            }}
            disabled={!canCalculate}
            className={`w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
              canCalculate
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md active:scale-[0.99]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Calculate Nutritional Analysis
          </button>

          <p className="text-center text-xs mt-2.5">
            {!canCalculate ? (
              <span className="text-gray-400">
                {ingredients.length === 0 ? "Add ingredients to continue" : "Create a child profile to continue"}
              </span>
            ) : selectedActivities.length > 0 ? (
              <span className="text-emerald-600 flex items-center justify-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Activity data included in analysis
              </span>
            ) : (
              <span className="text-gray-400">Tip: add activities above for a more complete energy analysis</span>
            )}
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      {isCalculating && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-gray-800">Calculating your analysis</p>
              <p className="text-sm text-gray-400 mt-0.5">This may take a few seconds…</p>
            </div>
          </div>
        </div>
      )}

      <AddProfilePopup isOpen={showAddProfilePopup} onClose={() => setShowAddProfilePopup(false)} onAddProfile={handleAddProfile} />
    </div>
  );
}