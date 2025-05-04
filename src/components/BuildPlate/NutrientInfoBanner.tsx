"use client";

/**
 * NutrientInfoBanner Component
 * Specialized banner for displaying nutrient portion information
 * Used specifically in the BuildPlate feature to inform about nutritional data basis
 */
import { Info } from 'phosphor-react';
import { useTranslations } from 'next-intl';
import Banner from '../ui/Banner';

/**
 * A banner that informs users about nutrient information being based on per 100g edible portions
 * Displayed within the food selection grid for context relevance
 * Reappears on every page load to ensure users always see this important information
 */
export default function NutrientInfoBanner() {
  const t = useTranslations('BuildPlate');
  
  return (
    <Banner
      id="nutrient-portion-info"
      message={t('nutrient_portion_info') || 'Nutrition information shown is based on per 100g edible portion of each food.'}
      variant="info"
      icon={<Info size={22} weight="fill" className="text-blue-600" />}
      className="rounded-xl mb-2 border-blue-200"
      position="static"
      persistDismissal={false}
    />
  );
} 