"use client";

/**
 * FoodNutrientTable Component
 * Displays detailed nutritional breakdowns for each food
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { PlacedFood } from './types';
import { MagnifyingGlass, ArrowsCounterClockwise } from 'phosphor-react';

interface FoodNutrientTableProps {
  /** Foods placed on the plate */
  placedFoods: PlacedFood[];
}

/**
 * Food Nutrient Table component
 * Displays a detailed breakdown of each food's nutrient content
 */
export default function FoodNutrientTable({ placedFoods }: FoodNutrientTableProps) {
  const t = useTranslations('BuildPlate');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'energy' | 'protein' | 'fat' | 'carbs' | 'fibre'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Sort and filter foods
  const sortedAndFilteredFoods = [...placedFoods]
    .filter(food => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        food.name.toLowerCase().includes(searchLower) ||
        food.category.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'energy') {
        comparison = (a.nutrients.energy_kj || 0) - (b.nutrients.energy_kj || 0);
      } else if (sortBy === 'protein') {
        comparison = (a.nutrients.protein_g || 0) - (b.nutrients.protein_g || 0);
      } else if (sortBy === 'fat') {
        comparison = (a.nutrients.fat_g || 0) - (b.nutrients.fat_g || 0);
      } else if (sortBy === 'carbs') {
        comparison = (a.nutrients.carbohydrate_g || 0) - (b.nutrients.carbohydrate_g || 0);
      } else if (sortBy === 'fibre') {
        comparison = (a.nutrients.fiber_g || 0) - (b.nutrients.fiber_g || 0);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
  // Calculate totals
  const totals = placedFoods.reduce((acc, food) => {
    return {
      energy: acc.energy + (food.nutrients.energy_kj || 0),
      protein: acc.protein + (food.nutrients.protein_g || 0),
      fat: acc.fat + (food.nutrients.fat_g || 0),
      carbs: acc.carbs + (food.nutrients.carbohydrate_g || 0),
      fibre: acc.fibre + (food.nutrients.fiber_g || 0),
    };
  }, { energy: 0, protein: 0, fat: 0, carbs: 0, fibre: 0 });
  
  // Handle sorting
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Get category background color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'protein': return 'bg-red-100 text-red-800';
      case 'carbs': return 'bg-yellow-100 text-yellow-800';
      case 'extras': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with search and sort controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-bold text-indigo-700">{t('nutrient_breakdown')}</h3>
          
          {/* Search bar */}
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_foods')}
              className="pl-10 pr-4 py-2 w-full sm:w-60 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                {t('food')} {getSortIndicator('name')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                {t('category')} {getSortIndicator('category')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('energy')}
              >
                {t('energy')} (kJ) {getSortIndicator('energy')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('protein')}
              >
                {t('protein')} (g) {getSortIndicator('protein')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fat')}
              >
                {t('fat')} (g) {getSortIndicator('fat')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('carbs')}
              >
                {t('carbs')} (g) {getSortIndicator('carbs')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fibre')}
              >
                {t('fibre')} (g) {getSortIndicator('fibre')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredFoods.map((food) => (
              <motion.tr 
                key={food.instanceId}
                className="hover:bg-gray-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <img 
                    src={food.imageUrl} 
                    alt={food.name}
                    className="w-8 h-8 mr-3 object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-food.png';
                    }}
                  />
                  {food.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(food.category)}`}>
                    {food.category.charAt(0).toUpperCase() + food.category.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {food.nutrients.energy_kj?.toFixed(1) || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {food.nutrients.protein_g?.toFixed(1) || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {food.nutrients.fat_g?.toFixed(1) || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {food.nutrients.carbohydrate_g?.toFixed(1) || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {food.nutrients.fiber_g?.toFixed(1) || '—'}
                </td>
              </motion.tr>
            ))}
            
            {/* Total row */}
            <tr className="bg-indigo-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-800" colSpan={2}>
                {t('total')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-800">
                {totals.energy.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-800">
                {totals.protein.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-800">
                {totals.fat.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-800">
                {totals.carbs.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-indigo-800">
                {totals.fibre.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Empty state */}
      {sortedAndFilteredFoods.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            {searchTerm ? t('no_foods_found') : t('empty_plate')}
          </p>
        </div>
      )}
      
      {/* Footer with info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>{t('showing_items', { count: sortedAndFilteredFoods.length, total: placedFoods.length })}</span>
        <div className="flex items-center">
          <ArrowsCounterClockwise size={14} className="mr-1" />
          <span>{t('click_column_to_sort')}</span>
        </div>
      </div>
    </div>
  );
} 