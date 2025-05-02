'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import UnitFormatter from '@/utils/UnitFormatter';

// Dynamically import the Chart component to prevent SSR issues
const Chart = dynamic(() => import('react-apexcharts').then((mod) => mod.default), { ssr: false });

// Add this check for chart availability
const isApexChartsAvailable = typeof window !== 'undefined';

// Specific nutrients to display
const PRIORITY_NUTRIENTS = [
  'Protein',
  'Calcium',
  'Iron',
  'Vitamin C',
  'Vitamin B12',
  'Dietary Fibre'
];

interface NutrientData {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
}

interface ImportantNutrientsDashboardProps {
  gaps: Record<string, NutrientData>;
}

// Utility function to format numbers in a more readable way
const formatNutrientValue = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  
  // For values less than 1, show more precision
  if (value < 1) {
    return value.toFixed(2);
  }
  
  // For values between 1 and 10, show one decimal place
  if (value < 10) {
    return value.toFixed(1);
  }
  
  // For values between 10 and 1000, round to whole number
  return Math.round(value).toString();
};

export default function ImportantNutrientsDashboard({ gaps }: ImportantNutrientsDashboardProps) {
  const calculatePercentage = (nutrient: NutrientData) => {
    if (nutrient.recommended_intake === 0) return 0;
    return Math.min(100, Math.max(0, (nutrient.current_intake / nutrient.recommended_intake) * 100));
  };

  const getStatusColor = (percentage: number) => {
    if (percentage === 0) return 'text-blue-500';
    if (percentage < 70) return 'text-red-500';
    if (percentage < 90) return 'text-yellow-500';
    if (percentage <= 110) return 'text-green-500';
    return 'text-amber-500';
  };

  const getStatusBgColor = (percentage: number) => {
    if (percentage === 0) return 'bg-blue-100';
    if (percentage < 70) return 'bg-red-100';
    if (percentage < 90) return 'bg-yellow-100';
    if (percentage <= 110) return 'bg-green-100';
    return 'bg-amber-100';
  };

  // Get the priority nutrients if they exist or fallback to top nutrients by gap
  const priorityNutrients = useMemo(() => {
    // Try to get the specified priority nutrients first
    const specified = PRIORITY_NUTRIENTS
      .map(key => {
        if (gaps[key]) {
          return {
            ...gaps[key],
            id: key,
            displayName: gaps[key].name
          };
        }
        return null;
      })
      .filter(n => n !== null);
    
    // If we have all specified nutrients, use them
    if (specified.length === PRIORITY_NUTRIENTS.length) {
      return specified as (NutrientData & { id: string, displayName: string })[];
    }
    
    // Otherwise, fall back to the top nutrients by gap
    const allNutrients = Object.entries(gaps).map(([key, nutrient]) => ({
      ...nutrient,
      id: key,
      displayName: nutrient.name
    }));
    
    return allNutrients
      .sort((a, b) => {
        const percA = calculatePercentage(a);
        const percB = calculatePercentage(b);
        return percA - percB; // Sort by lowest percentage first
      })
      .slice(0, 6) as (NutrientData & { id: string, displayName: string })[];
  }, [gaps]);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Key Nutrients Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Radar Chart - Takes up 2/3 of the space */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center lg:col-span-2">
          <h3 className="text-lg font-medium mb-4 text-center">Nutrient Balance</h3>
          
          <div className="w-full h-80 md:h-96 flex items-center justify-center">
            {isApexChartsAvailable && (
              <Chart
                options={{
                  chart: {
                    id: 'nutrient-radar',
                    toolbar: {
                      show: false
                    },
                    background: '#ffffff',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  },
                  xaxis: {
                    categories: priorityNutrients.map(nutrient => nutrient.displayName)
                  },
                  yaxis: {
                    max: 100,
                    min: 0,
                    tickAmount: 5,
                    labels: {
                      style: {
                        fontSize: '11px'
                      }
                    }
                  },
                  plotOptions: {
                    radar: {
                      size: 120,
                      polygons: {
                        strokeColors: '#e2e8f0',
                        connectorColors: '#e2e8f0'
                      }
                    }
                  },
                  colors: ['#10B981'],
                  markers: {
                    size: 5,
                    colors: ['#10B981'],
                    strokeWidth: 2,
                    strokeColors: '#ffffff',
                    hover: {
                      size: 7
                    }
                  },
                  dataLabels: {
                    enabled: true,
                    background: {
                      enabled: true,
                      borderRadius: 2,
                      padding: 3,
                      opacity: 0.9
                    },
                    style: {
                      fontSize: '12px',
                      fontWeight: 600
                    },
                    formatter: function(val: number) {
                      return val.toFixed(0) + '%';
                    }
                  },
                  fill: {
                    opacity: 0.3
                  },
                  stroke: {
                    width: 2
                  }
                }}
                series={[{
                  name: 'Nutrient Level',
                  data: priorityNutrients.map(nutrient => 
                    Math.min(100, calculatePercentage(nutrient))
                  )
                }]}
                type="radar"
                height="100%"
                width="100%"
              />
            )}
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-3">
            Higher percentage indicates better nutrition coverage
          </p>
        </div>
        
        {/* Right Side: Nutrient Status - Takes up 1/3 of the space with scrollable content */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col h-[580px]">
          <h3 className="text-lg font-medium mb-4 text-center">Nutrient Status</h3>
          
          {/* Scrollable Nutrient Cards Container with custom scrollbar */}
          <div className="overflow-y-auto pr-1.5 flex-grow scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent hover:scrollbar-thumb-emerald-300">
            <div className="flex flex-col gap-3 pb-1">
              {priorityNutrients.map((nutrient, index) => {
                const percentage = calculatePercentage(nutrient);
                const statusColor = getStatusColor(percentage);
                const statusBgColor = getStatusBgColor(percentage);
                
                return (
                  <div key={index} className="border border-gray-100 rounded-lg p-3.5 flex flex-col bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="font-medium text-gray-700">{nutrient.displayName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBgColor} ${statusColor} font-medium`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Current</div>
                        <div className="text-xs text-gray-500">
                          {formatNutrientValue(nutrient.current_intake)} <span className="text-gray-400">{nutrient.unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Target</div>
                        <div className="text-xs text-gray-500">
                          {formatNutrientValue(nutrient.recommended_intake)} <span className="text-gray-400">{nutrient.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 