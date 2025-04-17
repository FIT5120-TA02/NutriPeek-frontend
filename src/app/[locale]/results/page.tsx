'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NutrientGapResponse } from '../../../api/types';
import { useNutrition } from '../../../contexts/NutritionContext';
import { nutripeekApi } from '../../../api/nutripeekApi';
import storageService from '@/libs/StorageService';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { ingredientIds, clearIngredientIds, selectedChildId } = useNutrition();
  const [results, setResults] = useState<NutrientGapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // If no ingredient IDs are in context, try to get from localStorage as fallback
        if (ingredientIds.length === 0) {
          const storedResults = localStorage.getItem('nutripeekGapResults');
          if (storedResults) {
            setResults(JSON.parse(storedResults));
            return;
          }
          setError('No ingredients selected');
          return;
        }

        // Get the selected child profile
        const childProfiles = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] }) as ChildProfile[];
        
        if (!childProfiles || childProfiles.length === 0) {
          setError('No child profile found');
          return;
        }

        // Use selected child index or default to 0
        const profileIndex = selectedChildId !== null ? selectedChildId : 0;
        const childProfile = childProfiles[profileIndex];
        
        if (!childProfile) {
          setError('Selected child profile not found');
          return;
        }

        // Store selected child for display
        setSelectedChild(childProfile);

        // Get gender in API format (boy/girl)
        const apiGender = childProfile.gender.toLowerCase() === 'female' ? 'girl' : 'boy';
        
        // Calculate nutrient gap using the API
        const result = await nutripeekApi.calculateNutrientGap({
          child_profile: {
            age: parseInt(childProfile.age, 10), // Convert string age to number
            gender: apiGender
          },
          ingredient_ids: ingredientIds
        });
        
        setResults(result);
      } catch (error) {
        console.error('Error calculating nutritional gap:', error);
        setError('Failed to calculate nutritional gap. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [ingredientIds, selectedChildId]);

  // Handle scan again button click
  const handleScanAgain = () => {
    clearIngredientIds();
    router.push('/NutriScan');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 pt-16 md:pt-20 max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-md animate-pulse">
          <div className="h-8 bg-blue-300 rounded w-3/4 mx-auto"></div>
        </div>
        
        {/* Summary Section Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-blue-200 rounded w-2/3 mb-2"></div>
              <div className="h-7 bg-blue-200 rounded w-1/2"></div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-red-200 rounded w-2/3 mb-2"></div>
              <div className="h-7 bg-red-200 rounded w-1/2"></div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-amber-200 rounded w-2/3 mb-2"></div>
              <div className="h-7 bg-amber-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        
        {/* Nutrient Details Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-4 py-2 text-left">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recommendations Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <div className="h-5 bg-red-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <ul className="space-y-2 pl-5">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="h-5 bg-amber-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <ul className="space-y-2 pl-5">
              {[...Array(2)].map((_, i) => (
                <li key={i} className="flex">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Action Button Skeleton */}
        <div className="flex justify-center">
          <div className="h-12 bg-blue-300 rounded-lg w-48 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!results && error) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-16 md:pt-20 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-6 mb-6 shadow-md w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Results</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 w-full flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button 
            onClick={handleScanAgain}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Scan Food
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 pt-16 md:pt-20 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 w-full flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6 text-center">We couldn't find any nutritional analysis results. Please scan some food items.</p>
          <button 
            onClick={handleScanAgain}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Scan Food
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-16 md:pt-20 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-6 mb-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center">Nutritional Gap Analysis</h1>
        {selectedChild && (
          <p className="text-center mt-2">
            Analysis for {selectedChild.name}, {selectedChild.age} years old
          </p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Total Calories</p>
            <p className="text-2xl font-bold">{results.total_calories?.toFixed(1) || 0} kJ</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 mb-1">Missing Nutrients</p>
            <p className="text-2xl font-bold">{results.missing_nutrients?.length || 0}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-amber-600 mb-1">Excess Nutrients</p>
            <p className="text-2xl font-bold">{results.excess_nutrients?.length || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Nutrient Details</h2>
        
        {Object.keys(results.nutrient_gaps).length === 0 ? (
          <p className="text-gray-500 text-center py-4">No nutrient information available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nutrient</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Recommended</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Current</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Gap</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(results.nutrient_gaps).map(([key, nutrient]) => (
                  <tr key={key}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{nutrient.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {nutrient.recommended_intake} {nutrient.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {nutrient.current_intake.toFixed(2)} {nutrient.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {nutrient.gap > 0 ? (
                        <span className="text-red-600">-{nutrient.gap.toFixed(2)} {nutrient.unit}</span>
                      ) : nutrient.gap < 0 ? (
                        <span className="text-amber-600">+{Math.abs(nutrient.gap).toFixed(2)} {nutrient.unit}</span>
                      ) : (
                        <span className="text-green-600">0 {nutrient.unit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {nutrient.gap > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Missing
                        </span>
                      ) : nutrient.gap < 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Excess
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        
        {results.missing_nutrients && results.missing_nutrients.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-red-700 mb-2">Missing Nutrients</h3>
            <p className="text-sm text-gray-600 mb-3">
              Consider adding foods rich in the following nutrients:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              {results.missing_nutrients.map(nutrientKey => {
                const nutrient = results.nutrient_gaps[nutrientKey];
                return nutrient ? (
                  <li key={nutrientKey} className="text-gray-700">
                    <span className="font-medium">{nutrient.name}</span>: {nutrient.gap.toFixed(2)} {nutrient.unit} needed
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
        
        {results.excess_nutrients && results.excess_nutrients.length > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-amber-700 mb-2">Excess Nutrients</h3>
            <p className="text-sm text-gray-600 mb-3">
              Consider moderating intake of foods high in:
            </p>
            <ul className="space-y-2 pl-5 list-disc">
              {results.excess_nutrients.map(nutrientKey => {
                const nutrient = results.nutrient_gaps[nutrientKey];
                return nutrient ? (
                  <li key={nutrientKey} className="text-gray-700">
                    <span className="font-medium">{nutrient.name}</span>: {Math.abs(nutrient.gap).toFixed(2)} {nutrient.unit} excess
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mb-12">
        <button 
          onClick={handleScanAgain}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Scan Another Food
        </button>
      </div>
    </div>
  );
}