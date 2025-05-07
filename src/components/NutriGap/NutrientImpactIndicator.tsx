import { useMemo } from 'react';
import { formatNumber } from '@/utils/formatters';

interface NutrientImpactIndicatorProps {
  nutrientName: string;
  impact: {
    percentageChange: number;
    valueChange: number;
    valueUnit: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component that shows the impact of recommended foods on a nutrient
 */
export default function NutrientImpactIndicator({
  nutrientName,
  impact,
  size = 'md'
}: NutrientImpactIndicatorProps) {
  // Only show if there's an actual impact
  if (impact.percentageChange === 0 || impact.valueChange === 0) {
    return null;
  }

  // Determine styles based on size
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-xs px-1.5 py-0.5 ml-1',
          icon: 'h-3 w-3 mr-0.5',
          text: 'text-xs',
        };
      case 'lg':
        return {
          container: 'text-sm px-2.5 py-1 ml-2',
          icon: 'h-4 w-4 mr-1',
          text: 'text-sm',
        };
      default: // md
        return {
          container: 'text-xs px-2 py-0.5 ml-1.5',
          icon: 'h-3.5 w-3.5 mr-0.5',
          text: 'text-xs',
        };
    }
  }, [size]);

  return (
    <span 
      className={`inline-flex items-center rounded-full bg-green-100 text-green-700 ${sizeStyles.container}`}
      title={`${nutrientName} increased by ${impact.percentageChange.toFixed(1)}% (${formatNumber(impact.valueChange)}${impact.valueUnit}) from recommended foods`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${sizeStyles.icon} text-green-600`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
          clipRule="evenodd" 
        />
      </svg>
      <span className={sizeStyles.text}>
        +{impact.percentageChange.toFixed(1)}%
      </span>
    </span>
  );
} 