'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActivityEntry } from '@/api/types';

interface ActivityTimeBlockProps {
  activity: ActivityEntry;
  startTime: string;
  color?: string;
  onUpdate: (activity: ActivityEntry, newStartTime: string) => void;
  onDelete: () => void;
}

/**
 * ActivityTimeBlock - A component that displays a draggable and resizable activity block
 * 
 * This component renders an activity block that can be:
 * - Dragged to change its start time
 * - Resized to change its duration
 * - Deleted from the schedule
 */
export default function ActivityTimeBlock({
  activity,
  startTime,
  color = 'blue',
  onUpdate,
  onDelete
}: ActivityTimeBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [duration, setDuration] = useState(activity.hours);
  const [tempHeight, setTempHeight] = useState<number | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const startDragPosRef = useRef<{ x: number; y: number } | null>(null);
  const initialHeightRef = useRef<number>(0);

  // Update local duration state when activity prop changes
  useEffect(() => {
    setDuration(activity.hours);
    setTempHeight(null); // Reset temp height when activity changes
  }, [activity.hours]);

  // Get color classes based on color prop
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'red':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'purple':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'pink':
        return 'bg-pink-100 border-pink-300 text-pink-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  // Convert startTime (e.g., "13:30") to grid rows 
  // where each row is 30 minutes (for positioning)
  const timeToRow = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 2 + (minutes === 30 ? 1 : 0);
  };

  // Convert row to time string (e.g., "13:30")
  const rowToTime = (row: number): string => {
    const hour = Math.floor(row / 2);
    const minute = row % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startDragPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent dragging when resizing
    setIsResizing(true);
    startDragPosRef.current = { x: e.clientX, y: e.clientY };
    
    if (blockRef.current) {
      initialHeightRef.current = blockRef.current.clientHeight;
    }
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !startDragPosRef.current) return;
    
    // Calculate drag distance and convert to rows
    const deltaY = e.clientY - startDragPosRef.current.y;
    const rowHeight = 40; // Height of a time slot in pixels
    const rowDelta = Math.round(deltaY / rowHeight);
    
    // Update position visually
    if (blockRef.current) {
      blockRef.current.style.transform = `translateY(${rowDelta * rowHeight}px)`;
    }
  };

  // Handle mouse move for resizing
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!isResizing || !startDragPosRef.current) return;
    
    // Calculate new height
    const deltaY = e.clientY - startDragPosRef.current.y;
    const rowHeight = 40; // Height of a time slot in pixels
    const heightDelta = Math.round(deltaY / rowHeight) * rowHeight;
    const newHeight = Math.max(rowHeight, initialHeightRef.current + heightDelta);
    
    // Store temporary height for visual feedback during resize
    setTempHeight(newHeight);
    
    // Calculate new duration (in hours)
    const newDuration = Math.max(0.5, newHeight / rowHeight * 0.5);
    setDuration(newDuration);
  };

  // Handle mouse up for dragging
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !startDragPosRef.current) return;
    
    // Calculate final position
    const deltaY = e.clientY - startDragPosRef.current.y;
    const rowHeight = 40; // Height of a time slot in pixels
    const rowDelta = Math.round(deltaY / rowHeight);
    
    // Convert current time + row delta to new time
    const currentRow = timeToRow(startTime);
    const newRow = Math.max(0, Math.min(47, currentRow + rowDelta)); // Clamp to valid range
    
    // Convert row back to time
    const newTime = rowToTime(newRow);
    
    // Update activity with new start time
    onUpdate({ ...activity, hours: duration }, newTime);
    
    // Reset visual state
    if (blockRef.current) {
      blockRef.current.style.transform = '';
    }
    
    setIsDragging(false);
    startDragPosRef.current = null;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse up for resizing
  const handleResizeMouseUp = () => {
    if (!isResizing) return;
    
    // Update activity with new duration
    onUpdate({ ...activity, hours: duration }, startTime);
    
    // Reset temporary height
    setTempHeight(null);
    
    setIsResizing(false);
    startDragPosRef.current = null;
    initialHeightRef.current = 0;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, []);

  // Calculate height based on duration (in hours)
  const getBlockHeight = () => {
    const rowHeight = 40; // Height of a time slot in pixels
    // Each 30 minutes (0.5 hours) is one row
    return duration * 2 * rowHeight; // Use current duration state instead of activity.hours
  };

  // Format time for display (12-hour format)
  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate end time based on start time and current duration
  const getEndTime = () => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    
    // Calculate total minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const durationMinutes = duration * 60; // Convert hours to minutes
    
    // Calculate end total minutes
    const endTotalMinutes = startTotalMinutes + durationMinutes;
    
    // Convert back to hours and minutes
    const endHours = Math.floor(endTotalMinutes / 60) % 24;
    const endMinutes = Math.floor(endTotalMinutes % 60);
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={blockRef}
      className={`absolute left-[80px] right-0 border rounded-md p-2 cursor-move transition-opacity
        ${getColorClasses()}
        ${isDragging ? 'opacity-75 z-10 shadow-md' : ''}
      `}
      style={{
        top: `${timeToRow(startTime) * 40}px`, // Position based on start time
        height: tempHeight !== null ? `${tempHeight}px` : `${getBlockHeight()}px`, // Use temp height during resize
        zIndex: isDragging || isResizing ? 10 : 5,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-medium block">{activity.name}</span>
          <span className="text-xs block mt-1">
            {formatTimeDisplay(startTime)} - {formatTimeDisplay(getEndTime())}
          </span>
        </div>
        <button
          className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-white hover:bg-opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-xs mt-1 font-medium">{duration.toFixed(1)} hours</div>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize rounded-b-md hover:bg-white hover:bg-opacity-30"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="w-10 h-1 bg-current mx-auto rounded-full opacity-60"></div>
      </div>
    </div>
  );
} 