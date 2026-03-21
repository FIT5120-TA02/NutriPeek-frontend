'use client';

import { useMemo } from 'react';
import InfoPopup from '@/components/ui/InfoPopup';
import { NutrientComparison } from '@/types/notes';
import RecommendedFoodsUtil from '@/utils/RecommendedFoodsUtil';
import { formatNumber } from '@/utils/formatters';

const PRIORITY_NUTRIENTS = ['Protein', 'Calcium', 'Iron', 'Vitamin C', 'Vitamin B12', 'Dietary Fibre'];

interface NutrientData {
  name: string;
  recommended_intake: number;
  current_intake: number;
  unit: string;
  gap: number;
}

interface ImportantNutrientsDashboardProps {
  gaps: Record<string, NutrientData>;
  nutrientComparisons?: NutrientComparison[];
}

const formatVal = (v: number) =>
  v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : Math.round(v).toString();

/* Color bands based on % of daily target */
const getBar = (pct: number) => {
  if (pct === 0)   return { bar: 'bg-gray-200',    badge: 'bg-gray-100 text-gray-500',     label: 'Not tracked' };
  if (pct < 30)    return { bar: 'bg-red-400',      badge: 'bg-red-100 text-red-600',       label: 'Very low'    };
  if (pct < 70)    return { bar: 'bg-amber-400',    badge: 'bg-amber-100 text-amber-700',   label: 'Low'         };
  if (pct <= 110)  return { bar: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-700', label: 'Good'      };
  return               { bar: 'bg-orange-400',   badge: 'bg-orange-100 text-orange-700', label: 'Excess'      };
};

export default function ImportantNutrientsDashboard({ gaps, nutrientComparisons = [] }: ImportantNutrientsDashboardProps) {
  const infoContent = (
    <div className="max-w-[280px]">
      <p className="font-medium text-gray-800 mb-1">How are gaps calculated?</p>
      <p className="text-xs text-gray-600 mb-2">Based on Australian Health Survey recommended daily intakes for the child's age and gender.</p>
      <ul className="text-xs text-gray-500 space-y-0.5">
        <li><span className="font-medium text-red-500">Very low / Low</span> — below 70% of target</li>
        <li><span className="font-medium text-emerald-600">Good</span> — 70–110% of target</li>
        <li><span className="font-medium text-orange-500">Excess</span> — above 110% of target</li>
      </ul>
    </div>
  );

  const priorityNutrients = useMemo(() => {
    const specified = PRIORITY_NUTRIENTS.map(k => gaps[k] ? { ...gaps[k], id: k } : null).filter(Boolean) as (NutrientData & { id: string })[];
    if (specified.length === PRIORITY_NUTRIENTS.length) return specified;
    return Object.entries(gaps)
      .map(([id, n]) => ({ ...n, id }))
      .sort((a, b) => (a.current_intake / (a.recommended_intake || 1)) - (b.current_intake / (b.recommended_intake || 1)))
      .slice(0, 6);
  }, [gaps]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-700">Key Nutrients</h2>
        <InfoPopup content={infoContent} position="bottom" iconSize={14} iconClassName="ml-auto text-gray-400 hover:text-gray-600" />
      </div>

      <div className="space-y-4">
        {priorityNutrients.map(nutrient => {
          const pct = nutrient.recommended_intake > 0
            ? Math.min(120, (nutrient.current_intake / nutrient.recommended_intake) * 100)
            : 0;
          const { bar, badge, label } = getBar(pct);

          // Recommended foods impact
          const impact = nutrientComparisons.length > 0
            ? RecommendedFoodsUtil.calculateNutrientImpact(nutrient.name, nutrientComparisons)
            : null;
          const projectedPct = impact && impact.percentageChange > 0
            ? Math.min(120, pct + impact.percentageChange)
            : null;

          return (
            <div key={nutrient.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{nutrient.name}</span>
                <div className="flex items-center gap-2">
                  {impact && impact.percentageChange > 0 && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                      +{formatNumber(impact.valueChange)}{impact.valueUnit} with recs
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{label}</span>
                  <span className="text-xs font-semibold text-gray-500 min-w-[2.5rem] text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                {/* Projected bar (behind current) */}
                {projectedPct !== null && (
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-200 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, projectedPct)}%` }}
                  />
                )}
                {/* Current bar */}
                <div
                  className={`absolute inset-y-0 left-0 ${bar} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
                {/* 100% target marker */}
                <div className="absolute inset-y-0 left-[83.3%] w-px bg-gray-300" />
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">
                  {formatVal(nutrient.current_intake)} {nutrient.unit} consumed
                </span>
                <span className="text-xs text-gray-400">
                  Target: {formatVal(nutrient.recommended_intake)} {nutrient.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
        {[
          ['bg-red-400',     'Very low (< 30%)'],
          ['bg-amber-400',   'Low (30–70%)'],
          ['bg-emerald-500', 'Good (70–110%)'],
          ['bg-orange-400',  'Excess (> 110%)'],
        ].map(([color, text]) => (
          <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}