'use client';

import React from 'react';
import { ActivityResult, ChildEnergyRequirementsResponse } from '@/api/types';
import InfoPopup from '@/components/ui/InfoPopup';

interface ActivityAnalysisViewProps {
  activityResult: ActivityResult | null;
  energyRequirements?: ChildEnergyRequirementsResponse | null;
}

/**
 * ActivityAnalysisView - Component to display physical activity analysis
 * 
 * This component displays a detailed analysis of a child's physical activity level (PAL),
 * including a breakdown of activities, total METy-minutes, and an assessment of the activity level.
 * 
 * The ideal PAL is considered to be around 1.6 (moderate activity),
 * below 1.4 is considered low, and above 1.8 is considered high.
 * 
 * When energy requirements are provided, it also displays the estimated energy requirements
 * based on the child's activity level.
 */
export default function ActivityAnalysisView({ activityResult, energyRequirements }: ActivityAnalysisViewProps) {
  // Energy requirements explanation content for the InfoPopup
  const energyRequirementsContent = (
    <div className="max-w-[300px]">
      <p className="font-medium text-gray-800 mb-2">How is energy requirement calculated?</p>
      <p className="mb-2">
        Your child's estimated energy requirement is calculated by mapping their age, gender, and physical activity level (PAL) to established nutritional guidelines.
      </p>
      <p className="mb-2">
        We use data from the Australian Dietary Guidelines to determine the appropriate energy needs based on these factors. This provides a personalized daily calorie target that supports healthy growth and development while accounting for their unique activity patterns.
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Source: <a href="https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients/dietary-energy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Australian Dietary Guidelines</a>
      </p>
    </div>
  );

  // METy explanation content for the InfoPopup
  const metyExplanationContent = (
    <div className="max-w-[300px]">
      <p className="font-medium text-gray-800 mb-2">What is METy?</p>
      <p className="mb-2">
        METy (Youth Metabolic Equivalent) is a measurement unit for children's energy expenditure during physical activities. Unlike adult METs, METy values are specially adjusted for children's higher metabolic rates.
      </p>
      <p className="mb-2">
        <strong>How METy minutes work:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1 mb-2">
        <li>One METy represents a child's basal metabolic rate (energy at rest)</li>
        <li>Activities are rated as multiples of this baseline (e.g., 3 METy = 3× resting energy)</li>
        <li>METy-minutes = METy level × duration in minutes</li>
        <li>Higher METy-minutes indicate greater energy expenditure</li>
      </ul>
      <p className="mb-1">
        NutriPeek uses age-appropriate METy values to accurately assess your child's energy needs and activity patterns.
      </p>
    </div>
  );

  // If no activity result, show placeholder
  if (!activityResult) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
        <h3 className="text-xl font-medium mb-2">No Activity Data Available</h3>
        <p>Please track activities in the NutriScan step to see your activity analysis.</p>
      </div>
    );
  }

  // Calculate activity status based on PAL value
  const getActivityStatus = (pal: number) => {
    if (pal < 1.4) return { status: 'Low', color: 'text-yellow-500', message: 'Consider adding more physical activities to your day.' };
    if (pal > 1.8) return { status: 'High', color: 'text-blue-500', message: 'Great job staying active! Make sure to balance with proper rest.' };
    return { status: 'Moderate (Ideal)', color: 'text-green-500', message: 'Perfect! You\'re maintaining an ideal level of activity.' };
  };

  const { status, color, message } = getActivityStatus(activityResult.pal);

  return (
    <div className="w-full space-y-6">
      {/* PAL Status Card */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Physical Activity Level (PAL)</h3>
        
        <div className="flex items-center mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-8 border-gray-100">
            <span className={`text-2xl font-bold ${color}`}>{activityResult.pal.toFixed(2)}</span>
          </div>
          <div className="ml-6">
            <p className={`text-lg font-semibold ${color}`}>{status}</p>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-blue-500" 
              style={{ width: `${Math.min(100, ((activityResult.pal - 1.0) / (2.5 - 1.0)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>1.0 (Sedentary)</span>
            <span>1.6 (Ideal)</span>
            <span>2.5+ (Very Active)</span>
          </div>
        </div>
      </div>

      {/* Energy Requirements Card (shown when available) */}
      {energyRequirements && (
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold">Energy Requirements</h3>
            <InfoPopup 
              content={energyRequirementsContent}
              position="bottom"
              iconSize={18}
              iconClassName="ml-2 text-gray-400"
            />
          </div>
          
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">Based on the current activity level ({activityResult.pal.toFixed(2)}), the estimated energy requirement is:</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {energyRequirements.estimated_energy_requirement.toFixed(0)} {energyRequirements.unit}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p>This is an adjusted energy requirement based on your child's specific activity level. 
            The energy needs increase with higher activity levels.</p>
          </div>
        </div>
      )}

      {/* METy Minutes Card */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-semibold">Activity Intensity</h3>
          <InfoPopup 
            content={metyExplanationContent}
            position="bottom"
            iconSize={18}
            iconClassName="ml-2 text-gray-400"
          />
        </div>
        
        <p className="text-gray-600 mb-4">
          METy-minutes are a way to measure the energy used during physical activity.
        </p>
        
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{Math.round(activityResult.total_mety_minutes)}</div>
            <p className="text-gray-600">Total METy-Minutes</p>
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Activity Breakdown</h3>
        
        <div className="space-y-4">
          {activityResult.details.map((activity, index) => {
            // Determine intensity level based on METy level
            let intensityColor = 'bg-gray-100';
            if (activity.mety_level > 6) intensityColor = 'bg-blue-100';
            else if (activity.mety_level > 3) intensityColor = 'bg-green-100';
            else intensityColor = 'bg-yellow-100';
            
            return (
              <div 
                key={index} 
                className={`rounded-lg p-4 ${intensityColor} border`}
              >
                <div className="flex justify-between items-start">
                  <div className="max-w-[60%]">
                    <h4 className="font-medium text-gray-800 break-words">{activity.activity}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.hours} {activity.hours === 1 ? 'hour' : 'hours'}
                    </p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <span className="inline-block px-2 py-1 bg-white rounded-full text-sm font-medium whitespace-nowrap">
                      METy Level: {activity.mety_level.toFixed(1)}
                    </span>
                    <p className="text-sm mt-1 whitespace-nowrap">
                      {Math.round(activity.mety_minutes)} METy-minutes
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
        
        {activityResult.pal < 1.4 && (
          <div className="space-y-2">
            <p className="text-gray-700">Your child's activity level is on the lower side. Consider:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adding more outdoor play time</li>
              <li>Encouraging participation in sports or physical activities</li>
              <li>Reducing screen time</li>
              <li>Taking family walks or bike rides</li>
            </ul>
          </div>
        )}
        
        {activityResult.pal >= 1.4 && activityResult.pal <= 1.8 && (
          <div className="space-y-2">
            <p className="text-gray-700">Great job! Your child has a healthy activity level. To maintain:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Continue with the current mix of activities</li>
              <li>Ensure activities are enjoyable and sustainable</li>
              <li>Balance active time with sufficient rest</li>
              <li>Introduce variety to keep physical activity engaging</li>
            </ul>
          </div>
        )}
        
        {activityResult.pal > 1.8 && (
          <div className="space-y-2">
            <p className="text-gray-700">Your child is very active! Remember to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure adequate nutrition to support high activity levels</li>
              <li>Build in rest days to prevent burnout</li>
              <li>Watch for signs of overtraining</li>
              <li>Maintain a balance between physical activity and other aspects of development</li>
              {energyRequirements && (
                <li className="font-medium text-blue-700">
                  Increase energy intake to meet the higher energy requirements 
                  ({energyRequirements.estimated_energy_requirement.toFixed(0)} {energyRequirements.unit})
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 