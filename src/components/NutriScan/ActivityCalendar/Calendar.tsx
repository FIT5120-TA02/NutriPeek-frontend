'use client';

import React, { useState } from 'react';
import { ActivityEntry } from '@/api/types';
import { CURATED_ACTIVITIES, ACTIVITY_CATEGORIES, CuratedActivity } from './activityData';

interface ActivityCalendarProps {
  selectedActivities: ActivityEntry[];
  setSelectedActivities: React.Dispatch<React.SetStateAction<ActivityEntry[]>>;
  childAge?: number;
}

type Category = typeof ACTIVITY_CATEGORIES[number] | 'All';

const INTENSITY_DOT: Record<string, string> = {
  low:    'bg-blue-400',
  medium: 'bg-amber-400',
  high:   'bg-red-400',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  'Rest & Screen Time': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  'Light Movement': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'Moderate Activity': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
    </svg>
  ),
  'Sports & Vigorous': (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const ALL_TABS: Category[] = ['All', ...ACTIVITY_CATEGORIES];

export default function ActivityCalendar({
  selectedActivities,
  setSelectedActivities,
}: ActivityCalendarProps) {
  const [activeTab, setActiveTab] = useState<Category>('All');

  /* ── helpers ── */
  const findSelected = (dbName: string) =>
    selectedActivities.find(a => a.name === dbName);

  const handleToggle = (activity: CuratedActivity) => {
    if (findSelected(activity.dbName)) {
      setSelectedActivities(prev => prev.filter(a => a.name !== activity.dbName));
    } else {
      setSelectedActivities(prev => [...prev, { name: activity.dbName, hours: 1 }]);
    }
  };

  const handleAdjust = (dbName: string, delta: number) => {
    setSelectedActivities(prev =>
      prev.map(a => {
        if (a.name !== dbName) return a;
        const next = Math.max(0.5, Math.round((a.hours + delta) * 2) / 2);
        return { ...a, hours: next };
      }),
    );
  };

  /* ── filtered list ── */
  const visible = activeTab === 'All'
    ? CURATED_ACTIVITIES
    : CURATED_ACTIVITIES.filter(a => a.category === activeTab);

  const totalHours = selectedActivities.reduce((s, a) => s + a.hours, 0);

  /* ── display name for a selected db activity ── */
  const getDisplayName = (dbName: string) =>
    CURATED_ACTIVITIES.find(a => a.dbName === dbName)?.displayName ?? dbName;

  const getIntensity = (dbName: string) =>
    CURATED_ACTIVITIES.find(a => a.dbName === dbName)?.intensity ?? 'medium';

  return (
    <div className="space-y-4 pt-4">

      {/* ── Selected chips ── */}
      {selectedActivities.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {selectedActivities.length} {selectedActivities.length === 1 ? 'activity' : 'activities'} &mdash; {totalHours.toFixed(1)} hrs total
            </span>
            <button
              onClick={() => setSelectedActivities([])}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedActivities.map(a => (
              <div
                key={a.name}
                className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full pl-3 pr-1 py-1"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INTENSITY_DOT[getIntensity(a.name)]}`} />
                <span className="text-xs font-medium text-gray-800 max-w-[120px] truncate">
                  {getDisplayName(a.name)}
                </span>
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={() => handleAdjust(a.name, -0.5)}
                    className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm leading-none"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-gray-800 min-w-[2.25rem] text-center">
                    {a.hours}h
                  </span>
                  <button
                    onClick={() => handleAdjust(a.name, 0.5)}
                    className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm leading-none"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleToggle(CURATED_ACTIVITIES.find(c => c.dbName === a.name)!)}
                  className="w-5 h-5 ml-0.5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Empty state prompt ── */
        <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-400">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Select activities your child did today. Duration can be adjusted after adding. This is optional but improves energy analysis accuracy.</span>
        </div>
      )}

      {/* ── Category tabs ── */}
      <div className="flex gap-1.5 flex-wrap">
        {ALL_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {CATEGORY_ICONS[tab]}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Activity chip grid ── */}
      <div className="flex flex-wrap gap-2">
        {visible.map(activity => {
          const isSelected = !!findSelected(activity.dbName);
          return (
            <button
              key={activity.dbName}
              onClick={() => handleToggle(activity)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isSelected ? (
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${INTENSITY_DOT[activity.intensity]}`} />
              )}
              {activity.displayName}
            </button>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {([['low', 'Sedentary'], ['medium', 'Moderate'], ['high', 'Vigorous']] as const).map(([i, label]) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${INTENSITY_DOT[i]}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}