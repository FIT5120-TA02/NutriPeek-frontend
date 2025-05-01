'use client';

import React, { useState } from 'react';
import { ActivityEntry, MetyActivity } from '@/types/activity';
import { ChildProfile } from '@/types/profile';

interface Props {
  activities: MetyActivity[];
  onCalculate: (age: number, entries: ActivityEntry[]) => void;
  loading: boolean;
  child: ChildProfile | null;
  selectedActivities: ActivityEntry[];
  setSelectedActivities: React.Dispatch<React.SetStateAction<ActivityEntry[]>>;
}

export default function ActivityInputForm({
  activities,
  onCalculate,
  loading,
  child,
  selectedActivities,
  setSelectedActivities,
}: Props) {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [duration, setDuration] = useState(1);

  const handleAddActivity = () => {
    if (selectedActivity && duration > 0) {
      const newEntry: ActivityEntry = { name: selectedActivity, hours: duration };
      setSelectedActivities(prev => [...prev, newEntry]);
    }
  };

  const handleCalculateClick = () => {
    if (child?.age != null) {
      onCalculate(child.age, selectedActivities);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Track Your Child's Daily Activities</h2>

      {/* Activity Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Add Activity</label>
        <select
          className="border p-2 w-full"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">Select activity</option>
          {activities.map((activity, index) => (
            <option key={index} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Duration (hours)</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <button
        onClick={handleAddActivity}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Activity
      </button>

      {/* Show Selected Activities */}
      {selectedActivities.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">Selected Activities:</p>
          <ul className="list-disc list-inside">
            {selectedActivities.map((entry, index) => (
              <li key={index}>
                {entry.name} - {entry.hours} hours
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleCalculateClick}
        disabled={loading}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Activity Level'}
      </button>
    </div>
  );
}




