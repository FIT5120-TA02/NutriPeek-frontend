'use client';

import { useState, useMemo } from 'react';
import UnitFormatter from '@/components/UnitFormatter/UnitFormatter';

interface NutrientData {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
}

interface AllNutrientsViewProps {
  gaps: Record<string, NutrientData>;
}

export default function AllNutrientsView({ gaps }: AllNutrientsViewProps) {
  const [sortBy, setSortBy] = useState<'name' | 'percentage'>('percentage');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'deficient' | 'excess' | 'optimal'>('all');

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
    let result = Object.values(gaps);

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
  }, [gaps, sortBy, searchTerm, filterBy]);

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
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Nutrients</option>
            <option value="deficient">Deficient</option>
            <option value="optimal">Optimal</option>
            <option value="excess">Excess</option>
          </select>
          
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="percentage">Sort by Level</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500">
        Showing {filteredAndSortedNutrients.length} of {Object.values(gaps).length} nutrients
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
              
              return (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{nutrient.name}</h3>
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
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 