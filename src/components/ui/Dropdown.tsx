'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownOption {
  label: string;
  value: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  error?: string;
}

/**
 * Modern styled dropdown component with support for icons
 * Includes animations and custom styling
 */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  leadingIcon,
  trailingIcon,
  className = "",
  disabled = false,
  error
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center justify-between w-full px-4 py-2.5 text-left bg-white border rounded-lg 
        ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-300'} 
        ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:border-green-400 cursor-pointer'} 
        ${error ? 'border-red-300 ring-2 ring-red-100' : ''}
        focus:outline-none transition-all duration-150 ${className}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {leadingIcon && <span className="text-gray-500">{leadingIcon}</span>}
          
          <span className={`truncate ${!value ? 'text-gray-500' : 'text-gray-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center">
          {trailingIcon && <span className="mr-2 text-gray-500">{trailingIcon}</span>}
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            <ul className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-green-50 
                  ${value === option.value ? 'bg-green-50 text-green-700' : 'text-gray-800'}`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <div className="flex items-center gap-2">
                    {option.leadingIcon && (
                      <span className="flex-shrink-0 text-gray-500">{option.leadingIcon}</span>
                    )}
                    <span>{option.label}</span>
                  </div>

                  <div className="flex items-center">
                    {option.trailingIcon && (
                      <span className="text-gray-500">{option.trailingIcon}</span>
                    )}
                    {value === option.value && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-4 h-4 ml-2 text-green-600" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
