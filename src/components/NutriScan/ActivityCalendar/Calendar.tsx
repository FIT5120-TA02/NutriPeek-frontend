'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityEntry } from '@/api/types';
import { nutripeekApi } from '@/api/nutripeekApi';
import ActivityTimeBlock from './ActivityTimeBlock';
import ActivityTimeDialog from './ActivityTimeDialog';
import ActivityGroup from './ActivityGroup';
import { activityIntensityMap, groupActivitiesByCategory, intensityColorMap } from './activityData';

interface ActivityCalendarProps {
  selectedActivities: ActivityEntry[];
  setSelectedActivities: React.Dispatch<React.SetStateAction<ActivityEntry[]>>;
  childAge?: number;
}

interface ScheduledActivity extends ActivityEntry {
  id: string;
  startTime: string;
}

/**
 * ActivityCalendar - A component that displays and manages a day's activities in a visual timeline
 * 
 * This component renders a 24-hour calendar view that allows users to:
 * - Select activities from categorized cards on the right
 * - Add activities to specific time slots
 * - Edit activity duration by dragging
 * - Remove activities from the calendar
 * - View the breakdown of their child's daily activities
 * 
 * Note: PAL (Physical Activity Level) calculation is not performed by this component.
 * The parent component should trigger PAL calculation when needed using the selectedActivities.
 */
export default function ActivityCalendar({
  selectedActivities,
  setSelectedActivities,
  childAge,
}: ActivityCalendarProps) {
  const [activities, setActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [groupedActivities, setGroupedActivities] = useState<Record<string, any>>({});
  const [selectedActivityName, setSelectedActivityName] = useState('');
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch available activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await nutripeekApi.getAllActivities();
        setActivities(response.activities);
        
        // Group activities by category
        const grouped = groupActivitiesByCategory(response.activities);
        setGroupedActivities(grouped);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Create time slots for the day (hourly)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, '0')}:00`;
  });

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Open the time dialog for a selected activity
  const handleSelectActivity = (activityName: string) => {
    setSelectedActivityName(activityName);
    setIsTimeDialogOpen(true);
  };
  
  // Add a new activity to the schedule
  const handleAddActivity = (activityName: string, startTime: string, hours: number) => {
    // Create new scheduled activity
    const newActivity: ScheduledActivity = {
      id: generateId(),
      name: activityName,
      hours,
      startTime
    };
    
    setScheduledActivities(prev => [...prev, newActivity]);
    
    // Also add to selected activities for API calculation
    setSelectedActivities(prev => [...prev, { name: activityName, hours }]);
  };

  // Update activity time or duration
  const handleUpdateActivity = (
    activity: ActivityEntry, 
    newStartTime: string, 
    id: string
  ) => {
    // Update scheduled activities
    setScheduledActivities(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, hours: activity.hours, startTime: newStartTime } 
          : item
      )
    );
    
    // Find the activity to update
    const activityToUpdate = scheduledActivities.find(item => item.id === id);
    
    if (!activityToUpdate) return;
    
    // Also update selected activities for API calculation
    setSelectedActivities(prev => {
      // First remove the old activity entry
      const filteredActivities = prev.filter(item => 
        !(item.name === activityToUpdate.name && 
          Math.abs(item.hours - activityToUpdate.hours) < 0.1)
      );
      
      // Then add the updated activity
      return [...filteredActivities, { name: activity.name, hours: activity.hours }];
    });
  };

  // Delete an activity
  const handleDeleteActivity = (id: string) => {
    const activityToDelete = scheduledActivities.find(item => item.id === id);
    
    if (!activityToDelete) return;
    
    // Remove from scheduled activities
    setScheduledActivities(prev => prev.filter(item => item.id !== id));
    
    // Also remove from selected activities for API calculation
    setSelectedActivities(prev => 
      prev.filter(item => 
        !(item.name === activityToDelete.name && 
          Math.abs(item.hours - activityToDelete.hours) < 0.1)
      )
    );
  };

  // Convert selectedActivities to scheduledActivities format when component loads
  useEffect(() => {
    if (selectedActivities.length > 0 && scheduledActivities.length === 0) {
      // Start distributing activities from 8:00 AM with 30-minute gaps
      let currentHour = 8;
      let currentMinute = 0;
      
      const scheduled = selectedActivities.map((activity, index) => {
        const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute === 0 ? '00' : '30'}`;
        
        // Move time forward for next activity
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
        
        // Skip over to next hour + add a gap after each activity
        currentHour += Math.floor(activity.hours);
        
        return {
          ...activity,
          id: generateId(),
          startTime
        };
      });
      
      setScheduledActivities(scheduled);
    }
  }, [selectedActivities]);

  // Format 24-hour time to 12-hour format
  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Activity Schedule</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Calendar Timeline - Left Side */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow flex flex-col">
          <div className="sticky top-0 z-10 flex text-sm font-medium bg-gray-100 p-3 border-b">
            <div className="w-20 text-gray-700">Time</div>
            <div className="flex-1 text-gray-700">Activities</div>
          </div>
          
          {/* Calendar grid */}
          <div className="relative overflow-y-auto h-[450px]">
            {timeSlots.map((timeSlot, index) => (
              <div 
                key={index}
                className={`flex relative h-[80px] border-b ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Time label */}
                <div className="w-20 p-2 flex items-start text-sm text-gray-600 sticky left-0 bg-inherit">
                  {formatTimeDisplay(timeSlot)}
                </div>
                
                {/* Activity area - empty grid cell */}
                <div className="flex-1 relative">
                  {/* AM/PM indicator at the half-hour mark */}
                  <div className="absolute left-0 right-0 top-[50%] border-t border-gray-200 border-dashed" />
                </div>
              </div>
            ))}
            
            {/* Activity blocks rendered on top of the grid */}
            {scheduledActivities.map((activity) => (
              <ActivityTimeBlock
                key={activity.id}
                activity={activity}
                startTime={activity.startTime}
                color={intensityColorMap[activityIntensityMap[activity.name] || 'medium']}
                onUpdate={(updatedActivity, newStartTime) => 
                  handleUpdateActivity(updatedActivity, newStartTime, activity.id)
                }
                onDelete={() => handleDeleteActivity(activity.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Activity Selection - Right Side */}
        <div className="w-full md:w-80 flex flex-col">
          {/* Activity Library */}
          <div className="bg-white border rounded-lg shadow p-4 space-y-4 overflow-y-auto h-[350px]">
            <h3 className="font-medium text-gray-800 mb-2">Activity Library</h3>
            
            {/* Search input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button 
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : Object.keys(groupedActivities).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No activities available</p>
            ) : (
              <div>
                {Object.entries(groupedActivities)
                  .filter(([category, activities]) => {
                    // Filter activities based on search term
                    if (!searchTerm) return true;
                    
                    // Check if any activity in this category matches the search term
                    return activities.some((activity: any) => 
                      activity.name.toLowerCase().includes(searchTerm.toLowerCase()));
                  })
                  .map(([category, activities], index) => {
                    // Filter activities within each category
                    const filteredActivities = searchTerm 
                      ? activities.filter((activity: any) => 
                          activity.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      : activities;
                      
                    // Only render category if it has activities after filtering
                    if (filteredActivities.length === 0) return null;
                    
                    return (
                      <ActivityGroup
                        key={index}
                        category={category}
                        activities={filteredActivities}
                        onSelectActivity={handleSelectActivity}
                      />
                    );
                  })
                  .filter(Boolean) // Remove null entries
                }
                
                {/* No search results message */}
                {searchTerm && 
                 Object.entries(groupedActivities)
                  .filter(([category, activities]) => {
                    return activities.some((activity: any) => 
                      activity.name.toLowerCase().includes(searchTerm.toLowerCase()));
                  }).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No activities found matching "{searchTerm}"
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Activity summary */}
          {scheduledActivities.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full h-[130px] overflow-y-auto">
              <h3 className="font-medium text-blue-800 mb-2">Activity Summary</h3>
              <div className="text-xs space-y-2">
                {scheduledActivities.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{activity.name}</span>
                    </div>
                    <div className="text-gray-500">
                      {activity.hours.toFixed(1)} hours
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 border-t border-blue-200">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total:</span>
                  <span>
                    {scheduledActivities.reduce((total, activity) => total + activity.hours, 0).toFixed(1)} hours
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Time selection dialog */}
      <ActivityTimeDialog
        activityName={selectedActivityName}
        isOpen={isTimeDialogOpen}
        onClose={() => setIsTimeDialogOpen(false)}
        onAddActivity={handleAddActivity}
      />
    </div>
  );
} 