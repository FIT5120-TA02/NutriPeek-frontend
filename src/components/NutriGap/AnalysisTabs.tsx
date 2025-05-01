'use client';

import { useState, ReactNode } from 'react';
import NutrientTabCard from './NutrientTabCard';

// Icons for tabs
const NutrientIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export type AnalysisType = 'nutrients' | 'activity';

interface AnalysisTabsProps {
  currentTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
  children: ReactNode;
  isActivityEnabled?: boolean;
}

export default function AnalysisTabs({ 
  currentTab, 
  onTabChange, 
  children,
  isActivityEnabled = false 
}: AnalysisTabsProps) {
  
  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex mb-0 gap-2 relative z-10">
        <NutrientTabCard
          title="Nutrient Analysis"
          isActive={currentTab === 'nutrients'}
          onClick={() => onTabChange('nutrients')}
          icon={<NutrientIcon />}
        />
        
        {isActivityEnabled && (
          <NutrientTabCard
            title="Activity Analysis"
            isActive={currentTab === 'activity'}
            onClick={() => onTabChange('activity')}
            icon={<ActivityIcon />}
          />
        )}
      </div>
      
      {/* Content Area */}
      <div className="w-full bg-white rounded-xl rounded-tl-none shadow-md p-6 relative z-0">
        {children}
      </div>
    </div>
  );
} 