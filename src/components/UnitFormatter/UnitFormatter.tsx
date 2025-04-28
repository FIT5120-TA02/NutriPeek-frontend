'use client';

interface UnitFormatterProps {
  value: number;   // Gap value
  unit: string;    // Original unit (unused now, but kept for future)
}

export default function UnitFormatter({ value, unit }: UnitFormatterProps) {
  // Always normalize to mg, and format nicely
  const formattedValue = `${value > 0 ? '-' : ''}${Math.abs(value).toFixed(2)} mg`;

  return (
    <span>
      {formattedValue}
    </span>
  );
}

