import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-white text-palette-primary hover:bg-opacity-90 hover:text-[#89BE63] focus:ring-white';
      case 'secondary':
        return 'bg-palette-secondary text-palette-primary hover:bg-opacity-90 hover:text-[#89BE63] focus:ring-palette-secondary';
      case 'outline':
        return 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#89BE63] hover:bg-opacity-80 focus:ring-white';
      case 'ghost':
        return 'bg-transparent text-white hover:bg-white hover:text-[#89BE63] hover:bg-opacity-80 focus:ring-white';
      default:
        return 'bg-white text-palette-primary hover:bg-opacity-90 hover:text-[#89BE63] focus:ring-white';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-sm';
      case 'md':
        return 'py-2 px-4 text-base';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  return (
    <button
      type={type}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        rounded-md font-medium transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-opacity-30 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}; 