'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ActivityInputForm from '@/components/ActivityTrack/ActivityInputForm';
import ActivityResultPanel from '@/components/ActivityTrack/ActivityResultPanel';
import EnergyComparisonPanel from '@/components/ActivityTrack/EnergyComparisonPanel';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { getAllActivities, calculatePAL } from '@/libs/activityApi';
import { ActivityEntry, ActivityResult, MetyActivity } from '@/types/activity';
import { ChildProfile } from '@/types/profile';
import storageService from '@/libs/StorageService';

export default function ActivityPage() {
  const [activities, setActivities] = useState<MetyActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActivityEntry[]>([]);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mealEnergy, setMealEnergy] = useState<number>(0);

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [childIndex, setChildIndex] = useState(0);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  useEffect(() => {
    const saved = storageService.getLocalItem({ key: 'user_children', defaultValue: [] });
    if (saved && saved.length > 0) {
      setChildren(saved);
      setChildIndex(0);
      setSelectedChild(saved[0]);
      localStorage.setItem('selectedChild', JSON.stringify(saved[0]));
    }
  }, []);

  const handlePrevChild = () => {
    const newIndex = (childIndex - 1 + children.length) % children.length;
    setChildIndex(newIndex);
    setSelectedChild(children[newIndex]);
    localStorage.setItem('selectedChild', JSON.stringify(children[newIndex]));
  };

  const handleNextChild = () => {
    const newIndex = (childIndex + 1) % children.length;
    setChildIndex(newIndex);
    setSelectedChild(children[newIndex]);
    localStorage.setItem('selectedChild', JSON.stringify(children[newIndex]));
  };

  const handleAvatarClick = () => {
    setResult(null);
    setSelectedActivities([]);
    setMealEnergy(0);
  };

  useEffect(() => {
    getAllActivities()
      .then((data) => setActivities(data))
      .catch(() => setError('Failed to fetch activity list.'));
  }, []);

  const handleCalculate = async (age: number, entries: ActivityEntry[]) => {
    setLoading(true);
    setError(null);
    setSelectedActivities(entries);
    try {
      const data = await calculatePAL(age, entries);
      setResult(data);
    } catch (e) {
      setError('Failed to calculate PAL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50 py-16 px-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Track Your Child's Daily Activities</h1>

        {selectedChild && (
          <div className="flex items-center justify-center gap-6 mb-6">
            <button onClick={handlePrevChild} className="text-gray-500 hover:text-black">
              <ChevronLeft size={28} />
            </button>
            <ChildAvatar
              name={selectedChild.name}
              gender={selectedChild.gender}
              size={80}
              onClick={handleAvatarClick}
            />
            <button onClick={handleNextChild} className="text-gray-500 hover:text-black">
              <ChevronRight size={28} />
            </button>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium">Enter Meal Energy (kJ)</label>
          <input
            type="number"
            value={mealEnergy}
            onChange={(e) => setMealEnergy(parseFloat(e.target.value))}
            className="border p-2 w-full"
          />
        </div>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        <ActivityInputForm
          activities={activities}
          onCalculate={handleCalculate}
          loading={loading}
          child={selectedChild}
        />

        {result && (
          <>
            <div className="mt-8">
              <ActivityResultPanel result={result} />
            </div>
            <div className="mt-6">
              <EnergyComparisonPanel result={result} mealEnergy={mealEnergy} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

