'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'phosphor-react';
import Dropdown from '@/components/ui/Dropdown';
import { activityIntensityMap, type ActivityIntensity } from './activityData';

interface TimeOption {
  label: string;
  value: string;
}

interface ActivityTimeDialogProps {
  activityName: string;
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activityName: string, startTime: string, duration: number) => void;
}

/**
 * ActivityTimeDialog - Enhanced dialog for selecting activity start time and duration
 * 
 * Features:
 * - Custom dropdown for time selection with better UX
 * - Quick duration buttons for common time periods
 * - Real-time end time calculation and preview
 * - Improved visual design and layout
 * - Better validation and user feedback
 * - Intensity-based color coding for activity names
 */
export default function ActivityTimeDialog({
  activityName,
  isOpen,
  onClose,
  onAddActivity
}: ActivityTimeDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  
  // Get activity intensity for color coding
  const activityIntensity: ActivityIntensity = activityIntensityMap[activityName] || 'medium';
  
  // Get intensity color classes
  const getIntensityColorClasses = (intensity: ActivityIntensity) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  // Get intensity label
  const getIntensityLabel = (intensity: ActivityIntensity) => {
    switch (intensity) {
      case 'low':
        return 'Low Intensity';
      case 'medium':
        return 'Medium Intensity';
      case 'high':
        return 'High Intensity';
      default:
        return 'Medium Intensity';
    }
  };

  // Get intensity icon
  const getIntensityIcon = (intensity: ActivityIntensity) => {
    switch (intensity) {
      case 'low':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'medium':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'high':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Generate time options from 00:00 to 23:30 in 30-minute intervals
  const timeOptions: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const timeValue = `${formattedHour}:${formattedMinute}`;
      
      const hour12 = hour % 12 || 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      const timeLabel = `${hour12}:${formattedMinute} ${period}`;
      
      timeOptions.push({ label: timeLabel, value: timeValue });
    }
  }

  // Quick duration options
  const quickDurations = [
    { label: '30 min', value: 0.5 },
    { label: '1 hour', value: 1 },
    { label: '1.5 hours', value: 1.5 },
    { label: '2 hours', value: 2 },
    { label: '3 hours', value: 3 },
  ];

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, durationHours: number) => {
    const [hours, minutes] = start.split(':').map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const endTotalMinutes = startTotalMinutes + (durationHours * 60);
    
    const endHours = Math.floor(endTotalMinutes / 60) % 24;
    const endMinutes = Math.floor(endTotalMinutes % 60);
    
    const hour12 = endHours % 12 || 12;
    const period = endHours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = endMinutes.toString().padStart(2, '0');
    
    return `${hour12}:${formattedMinutes} ${period}`;
  };

  // Format start time for display
  const formatStartTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Handle dialog submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity(activityName, startTime, duration);
    onClose();
  };

  // Handle quick duration selection
  const handleQuickDuration = (durationValue: number) => {
    setDuration(durationValue);
  };

  // Reset form when dialog opens with a new activity
  useEffect(() => {
    if (isOpen) {
      setStartTime('09:00');
      setDuration(1);
    }
  }, [isOpen, activityName]);

  // Handle background click to close
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] cursor-pointer"
          onClick={handleBackgroundClick}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl cursor-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.h2 
                className="text-xl font-bold text-green-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Schedule Activity
              </motion.h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Activity Name with Intensity Color Coding */}
            <motion.div 
              className={`mb-6 p-4 rounded-lg border ${getIntensityColorClasses(activityIntensity)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">
                  {activityName}
                </h3>
                <div className="flex items-center gap-1">
                  {getIntensityIcon(activityIntensity)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getIntensityLabel(activityIntensity)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-medium">
                  {activityIntensity.toUpperCase()}
                </span>
              </div>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Start Time Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time
                </label>
                <Dropdown
                  value={startTime}
                  onChange={setStartTime}
                  options={timeOptions}
                  placeholder="Select start time"
                  leadingIcon={<Clock size={20} className="text-gray-400" />}
                />
              </motion.div>
              
              {/* Duration Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Duration
                </label>
                
                {/* Quick Duration Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {quickDurations.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleQuickDuration(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        duration === option.value
                          ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Fine-tune Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Fine-tune duration:</span>
                    <span className="font-medium text-green-700">
                      {duration} {duration === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={duration}
                      onChange={(e) => setDuration(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30 min</span>
                      <span>5 hours</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Time Preview */}
              <motion.div
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Activity Schedule Preview
                </h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Start:</span>
                    <span className="font-medium">{formatStartTime(startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End:</span>
                    <span className="font-medium">{calculateEndTime(startTime, duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {duration} {duration === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                </div>
              </motion.div>
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Add to Schedule
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 