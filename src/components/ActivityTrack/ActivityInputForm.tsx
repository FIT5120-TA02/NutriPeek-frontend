'use client';

import React, { useEffect, useState } from 'react';
import { ActivityEntry } from '@/types/activity';

interface Props {
  activities: string[];
  onCalculate: (age: number, entries: ActivityEntry[]) => void;
  loading: boolean;
  child: { age: number } | null;
}

export default function ActivityInputForm({ activities, onCalculate, loading, child }: Props) {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [duration, setDuration] = useState(1);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [groupedActivities, setGroupedActivities] = useState<Record<string, string[]>>({});

  // group all activities under "All"
  useEffect(() => {
    if (!Array.isArray(activities)) return;

    setGroupedActivities({
      All: activities,
    });
  }, [activities]);

  const handleAdd = () => {
    if (!selectedActivity || duration <= 0) return;
    setEntries([...entries, { name: selectedActivity, hours: duration }]);
    setSelectedActivity('');
    setDuration(1);
  };

  const handleSubmit = () => {
    if (!child?.age) {
      alert('No child age found in props');
      return;
    }
    onCalculate(child.age, entries);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Track Your Child's Daily Activities</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Add Activity</label>
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Select activity</option>
          {Object.entries(groupedActivities).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <label className="block text-sm font-medium">Duration (hours)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="border p-2 w-full"
          min={0.25}
          max={24}
          step={0.25}
        />

        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Activity
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Selected Activities:</h3>
          <ul className="list-disc list-inside">
            {entries.map((entry, idx) => (
              <li key={idx}>
                {entry.name} - {entry.hours} hours
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || entries.length === 0}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Activity Level'}
      </button>
    </div>
  );
}



