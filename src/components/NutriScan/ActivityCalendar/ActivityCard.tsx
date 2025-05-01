import React from 'react';

interface ActivityCardProps {
  activity: string;
  description?: string;
  intensity: 'low' | 'medium' | 'high';
  onSelect: (activity: string) => void;
}

/**
 * ActivityCard - A draggable card representing an activity that can be added to the calendar
 * 
 * This component displays activity information and allows the user to drag it to the calendar.
 */
export default function ActivityCard({
  activity,
  description,
  intensity,
  onSelect
}: ActivityCardProps) {
  // Determine color based on intensity
  const getIntensityColor = () => {
    switch (intensity) {
      case 'low':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'high':
        return 'border-red-300 bg-red-50 text-red-800';
      default:
        return 'border-blue-300 bg-blue-50 text-blue-800';
    }
  };

  // Get intensity label
  const getIntensityLabel = () => {
    switch (intensity) {
      case 'low':
        return 'Low Intensity';
      case 'medium':
        return 'Medium Intensity';
      case 'high':
        return 'High Intensity';
      default:
        return '';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border-2 shadow-sm cursor-pointer transition-transform hover:shadow-md hover:-translate-y-1 ${getIntensityColor()}`}
      onClick={() => onSelect(activity)}
    >
      <h3 className="font-medium text-sm mb-1">{activity}</h3>
      
      {description && (
        <p className="text-xs mb-2 line-clamp-2">{description}</p>
      )}
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-50">
          {getIntensityLabel()}
        </span>
        <span className="text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </div>
    </div>
  );
} 