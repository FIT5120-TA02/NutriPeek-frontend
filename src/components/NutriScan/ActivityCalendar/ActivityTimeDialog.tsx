'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
 * ActivityTimeDialog - A dialog for selecting activity start time and duration
 * 
 * This component allows the user to configure:
 * - Start time for the activity
 * - Duration of the activity
 */
export default function ActivityTimeDialog({
  activityName,
  isOpen,
  onClose,
  onAddActivity
}: ActivityTimeDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  
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
  
  // Handle dialog submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity(activityName, startTime, duration);
    onClose();
  };
  
  // Reset form when dialog opens with a new activity
  useEffect(() => {
    if (isOpen) {
      // Set default values for a new activity
      setStartTime('09:00');
      setDuration(1);
    }
  }, [isOpen, activityName]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-gray-600/50 to-gray-800/50 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-blue-700 mb-6 text-center">
              Schedule Activity: {activityName}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  id="startTime"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="duration"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="ml-2 text-gray-700 w-16 text-right">
                    {duration} {duration === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 