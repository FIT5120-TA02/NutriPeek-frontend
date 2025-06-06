'use client';

import { useState, useMemo } from 'react';
import UnitFormatter from '@/utils/UnitFormatter';
import { ChildEnergyRequirementsResponse } from '@/api/types';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import { FunnelSimple, SortAscending } from 'phosphor-react';
import { NutrientComparison } from '@/types/notes';
import NutrientImpactIndicator from './NutrientImpactIndicator';
import RecommendedFoodsUtil from '@/utils/RecommendedFoodsUtil';
import { formatNumber } from '@/utils/formatters';

interface NutrientData {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
  isAdjustedForActivity?: boolean;
}

interface AllNutrientsViewProps {
  gaps: Record<string, NutrientData>;
  energyRequirements?: ChildEnergyRequirementsResponse | null;
  nutrientComparisons?: NutrientComparison[];
}

export default function AllNutrientsView({ 
  gaps, 
  energyRequirements,
  nutrientComparisons = [] 
}: AllNutrientsViewProps) {
  const [sortBy, setSortBy] = useState<'name' | 'percentage'>('percentage');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'deficient' | 'excess' | 'optimal'>('all');

  // Dropdown options
  const filterOptions: DropdownOption[] = [
    { label: 'All Nutrients', value: 'all' },
    { label: 'Deficient', value: 'deficient' },
    { label: 'Optimal', value: 'optimal' },
    { label: 'Excess', value: 'excess' }
  ];

  const sortOptions: DropdownOption[] = [
    { label: 'Sort by Level', value: 'percentage' },
    { label: 'Sort by Name', value: 'name' }
  ];

  // Identify the energy nutrient key
  const energyNutrientKey = useMemo(() => {
    return Object.keys(gaps).find(key => 
      gaps[key].name.toLowerCase().includes('energy')
    );
  }, [gaps]);
  
  // Apply energy adjustments if needed
  const adjustedGaps = useMemo(() => {
    if (!energyRequirements || !energyNutrientKey) return gaps;
    
    const adjustedGaps = { ...gaps };
    const baseEnergy = adjustedGaps[energyNutrientKey];
    const adjustedTarget = energyRequirements.estimated_energy_requirement;
    
    // Only adjust if the estimated requirement is higher
    if (adjustedTarget > baseEnergy.recommended_intake) {
      adjustedGaps[energyNutrientKey] = {
        ...baseEnergy,
        recommended_intake: adjustedTarget,
        gap: Math.max(0, adjustedTarget - baseEnergy.current_intake),
        isAdjustedForActivity: true // Add flag to track adjusted nutrients
      };
    }
    
    return adjustedGaps;
  }, [gaps, energyRequirements, energyNutrientKey]);

  const calculatePercentage = (nutrient: NutrientData) => {
    if (nutrient.recommended_intake === 0) return 0;
    return Math.min(200, Math.max(0, (nutrient.current_intake / nutrient.recommended_intake) * 100));
  };

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return 'bg-blue-400';
    if (percentage < 70) return 'bg-red-400';
    if (percentage < 90) return 'bg-yellow-400';
    if (percentage <= 110) return 'bg-green-400';
    return 'bg-amber-400';
  };

  const getStatusText = (percentage: number) => {
    if (percentage === 0) return 'Not Present';
    if (percentage < 70) return 'Deficient';
    if (percentage < 90) return 'Low';
    if (percentage <= 110) return 'Optimal';
    return 'Excess';
  };

  const filteredAndSortedNutrients = useMemo(() => {
    let result = Object.values(adjustedGaps);

    // Filter out alcohol and caffeine from the main nutrition view
    // These should be in notes section, not nutrition improvements
    result = result.filter(nutrient => 
      nutrient.name !== 'Alcohol(d)' && nutrient.name !== 'Caffeine'
    );

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(nutrient => 
        nutrient.name.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      result = result.filter(nutrient => {
        const percentage = calculatePercentage(nutrient);
        switch (filterBy) {
          case 'deficient':
            return percentage < 90;
          case 'excess':
            return percentage > 110;
          case 'optimal':
            return percentage >= 90 && percentage <= 110;
          default:
            return true;
        }
      });
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const percA = calculatePercentage(a);
        const percB = calculatePercentage(b);
        return percB - percA; // Sort by highest percentage first
      }
    });
  }, [adjustedGaps, sortBy, searchTerm, filterBy]);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">All Nutrients Detailed View</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search nutrients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          
          {/* Filter dropdown */}
          <div className="w-full sm:w-40">
            <Dropdown
              value={filterBy}
              onChange={(value) => setFilterBy(value as any)}
              options={filterOptions}
              placeholder="Filter"
              leadingIcon={<FunnelSimple size={18} />}
            />
          </div>
          
          {/* Sort dropdown */}
          <div className="w-full sm:w-40">
            <Dropdown
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={sortOptions}
              placeholder="Sort by"
              leadingIcon={<SortAscending size={18} />}
            />
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500">
        Showing {filteredAndSortedNutrients.length} of {Object.values(adjustedGaps).length} nutrients
      </p>
      
      {/* Nutrient List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {filteredAndSortedNutrients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No nutrients found matching your criteria.</div>
          ) : (
            filteredAndSortedNutrients.map((nutrient, index) => {
              const percentage = calculatePercentage(nutrient);
              const barColor = getBarColor(percentage);
              const statusText = getStatusText(percentage);
              const isAdjustedEnergy = energyNutrientKey && 
                nutrient.name.toLowerCase().includes('energy') && 
                (nutrient as any).isAdjustedForActivity;
              
              // Calculate nutrient impact from recommended foods if comparisons exist
              const nutrientImpact = nutrientComparisons.length > 0 
                ? RecommendedFoodsUtil.calculateNutrientImpact(nutrient.name, nutrientComparisons) 
                : { percentageChange: 0, valueChange: 0, valueUnit: '' };
              
              return (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${isAdjustedEnergy ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800">{nutrient.name}</h3>
                        {isAdjustedEnergy && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            Adjusted for Activity
                          </span>
                        )}
                        
                        {/* Show impact indicator if there's an improvement from recommended foods */}
                        <NutrientImpactIndicator 
                          nutrientName={nutrient.name}
                          impact={nutrientImpact}
                        />
                      </div>
                      <span className={`text-sm ${percentage < 90 ? 'text-red-500' : percentage > 110 ? 'text-amber-500' : 'text-green-500'}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Current</span>
                        <div className="font-medium">
                          <UnitFormatter value={nutrient.current_intake} unit={nutrient.unit} />
                        </div>
                      </div>
                      
                      <div className="text-gray-300 font-bold">|</div>
                      
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Target</span>
                        <div className="font-medium">
                          <UnitFormatter value={nutrient.recommended_intake} unit={nutrient.unit} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          {percentage > 0 ? `${Math.min(100, percentage).toFixed(1)}%` : 'Not Present'}
                        </span>
                      </div>
                      {nutrient.gap > 0 && (
                        <div>
                          <span className="text-xs font-semibold inline-block text-red-600">
                            Gap: <UnitFormatter value={nutrient.gap} unit={nutrient.unit} />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded-full">
                      <div
                        style={{ width: `${Math.min(100, percentage)}%` }}
                        className={`${barColor} rounded-full`}
                      ></div>
                      
                      {/* Show the impact from recommended foods as a striped overlay */}
                      {nutrientImpact.percentageChange > 0 && (
                        <div
                          style={{ 
                            width: `${nutrientImpact.percentageChange}%`, 
                            marginLeft: `-${nutrientImpact.percentageChange}%` 
                          }}
                          className={`${barColor} opacity-50 bg-gradient-to-r from-transparent via-green-300 to-green-300 rounded-full`}
                        ></div>
                      )}
                    </div>
                  </div>
                  
                  {isAdjustedEnergy && (
                    <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Target energy requirement increased due to high activity level.
                    </div>
                  )}
                  
                  {/* Show details of improvement if it exists */}
                  {nutrientImpact.percentageChange > 0 && (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Added {formatNumber(nutrientImpact.valueChange)}{nutrientImpact.valueUnit} (+{nutrientImpact.percentageChange.toFixed(1)}%) from recommended foods.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 