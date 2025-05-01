import React, { useState } from 'react';
import ActivityCard from './ActivityCard';

interface ActivityData {
  name: string;
  description?: string;
  intensity: 'low' | 'medium' | 'high';
}

interface ActivityGroupProps {
  category: string;
  activities: ActivityData[];
  onSelectActivity: (activity: string) => void;
}

/**
 * ActivityGroup - A component that displays a group of related activities
 * 
 * This component organizes activities by category with a collapsible interface.
 */
export default function ActivityGroup({
  category,
  activities,
  onSelectActivity
}: ActivityGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between bg-gray-100 p-2 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-800">{category}</h3>
        <button className="text-gray-500 p-1">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-3 border border-gray-200 rounded-b-lg bg-white grid grid-cols-1 gap-2">
          {activities.map((activity, index) => (
            <ActivityCard
              key={index}
              activity={activity.name}
              description={activity.description}
              intensity={activity.intensity}
              onSelect={onSelectActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
} 