import React from 'react';

type CardVariant = 'default' | 'outline' | 'elevated' | 'highlight';

export type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'default':
        return 'bg-palette-secondary-light border border-white border-opacity-20';
      case 'outline':
        return 'bg-palette-secondary-light border-2 border-white';
      case 'elevated':
        return 'bg-palette-secondary-light border border-white border-opacity-20 shadow-md';
      case 'highlight':
        return 'bg-palette-secondary border border-white border-opacity-30';
      default:
        return 'bg-palette-secondary-light border border-white border-opacity-20';
    }
  };

  const hoverClasses = hoverable 
    ? 'hover:shadow-md hover:border-white hover:border-opacity-60 transition-all duration-200' 
    : '';

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${hoverClasses}
        rounded-lg p-4
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mb-3 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-palette-primary ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`text-sm text-palette-neutral-800 ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-3 border-t border-white border-opacity-20 ${className}`}>
    {children}
  </div>
); 