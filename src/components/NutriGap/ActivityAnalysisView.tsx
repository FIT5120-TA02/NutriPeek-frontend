'use client';

import React from 'react';
import { ActivityResult, ChildEnergyRequirementsResponse } from '@/api/types';
import InfoPopup from '@/components/ui/InfoPopup';

interface ActivityAnalysisViewProps {
  activityResult: ActivityResult | null;
  energyRequirements?: ChildEnergyRequirementsResponse | null;
}

/* Intensity color for activity detail rows */
const getIntensityStyle = (metyLevel: number) => {
  if (metyLevel > 6) return { dot: 'bg-red-400',    label: 'Vigorous', badge: 'bg-red-50 text-red-600'    };
  if (metyLevel > 3) return { dot: 'bg-amber-400',  label: 'Moderate', badge: 'bg-amber-50 text-amber-700' };
  return                    { dot: 'bg-blue-400',   label: 'Light',    badge: 'bg-blue-50 text-blue-600'   };
};

/* Clean up raw database activity name */
const cleanName = (raw: string) =>
  raw.split(',')[0].trim().replace(/^\w/, c => c.toUpperCase());

export default function ActivityAnalysisView({ activityResult, energyRequirements }: ActivityAnalysisViewProps) {
  if (!activityResult) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">No activity data recorded</h3>
        <p className="text-xs text-gray-400 max-w-xs">Go back to the NutriScan step and add today&rsquo;s activities to see energy analysis here.</p>
      </div>
    );
  }

  const pal = activityResult.pal;

  /* PAL status — plain English */
  const getPALStatus = (p: number) => {
    if (p < 1.4) return { label: 'Low activity',   color: 'text-amber-600',  bg: 'bg-amber-50',  fill: 'bg-amber-400',  tip: 'Try adding more movement to the day — even a 30-min walk makes a difference.' };
    if (p > 1.8) return { label: 'Very active',    color: 'text-blue-600',   bg: 'bg-blue-50',   fill: 'bg-blue-500',   tip: 'Great work! Make sure energy intake is enough to support this activity level.' };
    return              { label: 'Active',          color: 'text-emerald-600', bg: 'bg-emerald-50', fill: 'bg-emerald-500', tip: 'Perfect balance — keep up the current mix of activities.' };
  };

  const { label, color, bg, fill, tip } = getPALStatus(pal);

  /* Gauge: map PAL 1.0–2.5 → 0–100% */
  const gaugePct = Math.min(100, Math.max(0, ((pal - 1.0) / 1.5) * 100));

  const energyInfoContent = (
    <div className="max-w-[260px]">
      <p className="font-medium text-gray-800 mb-1">Daily energy target</p>
      <p className="text-xs text-gray-600">Estimated from the child&rsquo;s age, gender, and physical activity level (PAL) using Australian Dietary Guidelines.</p>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Activity level gauge ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-700">Activity Level</h2>
        </div>

        <div className={`${bg} rounded-2xl px-5 py-4`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className={`text-2xl font-bold ${color}`}>{pal.toFixed(2)}</span>
              <span className={`ml-2 text-sm font-semibold ${color}`}>{label}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">PAL score</span>
          </div>

          {/* Gauge track */}
          <div className="relative h-3 bg-white/60 rounded-full overflow-hidden mb-1">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-emerald-500 to-blue-500 rounded-full opacity-30 w-full" />
            <div className={`absolute inset-y-0 left-0 ${fill} rounded-full transition-all duration-700`} style={{ width: `${gaugePct}%` }} />
            {/* Ideal zone marker at 1.4–1.8 */}
            <div className="absolute inset-y-0 bg-white/40" style={{ left: '26.7%', width: '26.7%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-medium">
            <span>1.0 Sedentary</span>
            <span className="text-emerald-500">1.4–1.8 Ideal</span>
            <span>2.5 Very active</span>
          </div>

          <p className="text-xs text-gray-600 mt-3">{tip}</p>
        </div>
      </div>

      {/* ── Energy requirement ── */}
      {energyRequirements && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3.5 border border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm text-gray-600">Daily energy target</span>
            <InfoPopup content={energyInfoContent} position="top" iconSize={13} iconClassName="text-gray-400" />
          </div>
          <span className="font-bold text-gray-800">
            {energyRequirements.estimated_energy_requirement.toFixed(0)}{' '}
            <span className="text-xs font-normal text-gray-500">{energyRequirements.unit}</span>
          </span>
        </div>
      )}

      {/* ── Activity breakdown ── */}
      {activityResult.details.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-700">Today&rsquo;s Activities</h2>
            <span className="text-xs text-gray-400 ml-auto">
              {activityResult.total_mety_minutes ? `${Math.round(activityResult.total_mety_minutes)} METy-min total` : ''}
            </span>
          </div>

          <div className="space-y-2">
            {activityResult.details.map((activity, i) => {
              const { dot, label: intLabel, badge } = getIntensityStyle(activity.mety_level);
              return (
                <div key={i} className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-sm text-gray-800 flex-1 min-w-0 truncate">{cleanName(activity.activity)}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{intLabel}</span>
                    <span className="text-xs text-gray-400">
                      {activity.hours}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Intensity legend ── */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {[['bg-blue-400', 'Light'], ['bg-amber-400', 'Moderate'], ['bg-red-400', 'Vigorous']] .map(([c, t]) => (
          <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${c}`} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}