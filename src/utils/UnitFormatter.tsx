'use client';

interface UnitFormatterProps {
  value: number;   // Gap value
  unit: string;    // Original unit (unused now, but kept for future)
}

function convertToMg(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'g':
      return value * 1000;
    case 'μg':
    case 'ug':
      return value / 1000;
    case 'mg':
    default:
      return value;
  }
}

export default function UnitFormatter({ value, unit }: UnitFormatterProps) {
  const mgValue = convertToMg(value, unit);
  const formattedValue = `${value > 0 ? '' : '-'}${Math.abs(mgValue).toFixed(2)} mg`;

  return (
    <span>
      {formattedValue}
    </span>
  );
}

