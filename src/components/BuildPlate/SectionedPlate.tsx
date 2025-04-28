"use client";

/**
 * SectionedPlate Component
 * Displays a lunchbox plate with sections where users can place food items
 * Enhanced with child-friendly visuals and animations
 */
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X } from 'phosphor-react';
import { motion } from 'framer-motion';
import { 
  DndContext, 
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable, 
  DragEndEvent,
  DragStartEvent,
  DragOverEvent
} from '@dnd-kit/core';

import { SectionedPlateProps, PlateSection, PlacedFood, PlateFood } from './types';
import { PLATE_SECTIONS } from './constants';
import { findSectionAtPosition } from './utils';
import { getPlateImageUrl } from '@/utils/assetHelpers';

// CSS for enhanced visual effects
const enhancedAnimations = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes pulse-border {
    0% {
      border-color: rgba(147, 197, 253, 0.5);
      box-shadow: 0 0 0 0 rgba(147, 197, 253, 0.5);
    }
    50% {
      border-color: rgba(59, 130, 246, 0.7);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    }
    100% {
      border-color: rgba(147, 197, 253, 0.5);
      box-shadow: 0 0 0 0 rgba(147, 197, 253, 0.5);
    }
  }
  
  .pulse-border {
    animation: pulse-border 1.5s infinite;
  }
  
  .float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  .plate-container {
    position: relative;
  }
  
  .plate-container:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 10%;
    width: 80%;
    height: 15px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 50%;
    z-index: -1;
    filter: blur(5px);
  }
`;

/**
 * SectionedPlate component with drag-and-drop zones
 */
export default function SectionedPlate({
  selectedFoods,
  plateSections = PLATE_SECTIONS,
  onRemoveFood,
  onFoodPositioned,
  readOnly = false
}: SectionedPlateProps) {
  const t = useTranslations('BuildPlate');
  const plateRef = useRef<HTMLDivElement>(null);
  const plateImageUrl = getPlateImageUrl('lunchbox');
  
  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Lower activation distance makes it easier to start dragging
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Lower delay for touch devices
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );
  
  // Track active (currently dragged) food
  const [activeFoodId, setActiveFoodId] = useState<string | null>(null);
  
  // Track active dragging source (from grid or from plate)
  const [dragSource, setDragSource] = useState<'grid' | 'plate' | null>(null);
  
  // Track the hover state for each section
  const [hoverSectionId, setHoverSectionId] = useState<string | null>(null);
  
  // Track if we're currently dragging an item (for UI feedback)
  const [isDragging, setIsDragging] = useState(false);
  
  // Internal state of placed foods with positions
  const [placedFoods, setPlacedFoods] = useState<PlacedFood[]>([]);
  
  // Update state when selectedFoods changes
  useEffect(() => {
    const allSelectedFoods = Object.values(selectedFoods).flat();
    console.log('SectionedPlate selectedFoods update:', { 
      readOnly, 
      mode: readOnly ? 'review' : 'build',
      allSelectedFoodsLength: allSelectedFoods.length, 
      allSelectedFoodIds: allSelectedFoods.map(f => f.instanceId)
    });
    
    // If in readOnly mode, just directly use the selectedFoods as they should already have positions
    if (readOnly) {
      // When in readOnly mode, we want to use exactly what the parent provides
      // without modifying instanceIds to prevent React key conflicts
      setPlacedFoods(allSelectedFoods);
      return;
    }
    
    // For build mode, we need to be more careful to avoid duplicates
    
    // First, check if we need to completely reset the state
    // This prevents duplicate foods when toggling between modes
    setPlacedFoods(currentPlacedFoods => {
      // Skip updates if nothing changed
      if (currentPlacedFoods.length > 0 && 
          currentPlacedFoods.length === allSelectedFoods.length && 
          allSelectedFoods.every(food => 
            currentPlacedFoods.some(placed => placed.instanceId === food.instanceId)
          )) {
        // The food arrays have the same items, no need to update
        return currentPlacedFoods;
      }
      
      // If we've switched modes or there's a real change, start fresh
      if (currentPlacedFoods.some(food => !allSelectedFoods.some(f => f.instanceId === food.instanceId)) ||
          allSelectedFoods.some(food => !currentPlacedFoods.some(f => f.instanceId === food.instanceId))) {
        console.log('Completely refreshing food items');
        return allSelectedFoods;
      }
      
      // Find new foods to add (this should rarely happen with the above checks)
      const newFoods = allSelectedFoods.filter(food => 
        !currentPlacedFoods.some(placed => placed.instanceId === food.instanceId)
      );
      
      // Add new foods with calculated positions
      if (newFoods.length > 0) {
        console.log('Adding new foods:', newFoods.map(f => f.instanceId));
        const newPlacedFoods = newFoods.map(food => {
          // Check if the food already has position and sectionId
          if (food.position && food.sectionId) {
            return food;
          }

          // Find an appropriate section based on food type
          const sectionId = getDefaultSectionId(food.category);
          
          // Find that section
          const section = plateSections.find(sec => sec.id === sectionId) || plateSections[0];
          
          // Generate a position within the section
          const { x, y } = section.position;
          // Add slight randomization for natural placement
          const randX = Math.random() * 10 - 5;
          const randY = Math.random() * 10 - 5;
          
          return {
            ...food,
            position: { 
              x: x + randX, 
              y: y + randY 
            },
            sectionId: section.id
          };
        });
        
        return [...currentPlacedFoods, ...newPlacedFoods];
      }
      
      // Remove foods that aren't selected anymore
      const filtered = currentPlacedFoods.filter(placed => 
        allSelectedFoods.some(food => food.instanceId === placed.instanceId)
      );
      if (currentPlacedFoods.length !== filtered.length) {
        console.log('Removed foods: before', currentPlacedFoods.length, 'after', filtered.length);
      }
      return filtered;
    });
  }, [selectedFoods, plateSections, readOnly]);
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    // Don't allow dragging in read-only mode
    if (readOnly) return;
    
    const { active } = event;
    const activeId = active.id as string;
    
    setActiveFoodId(activeId);
    setIsDragging(true);
    
    // Determine if dragging from grid or plate
    if (typeof activeId === 'string' && activeId.startsWith('dragfood-')) {
      setDragSource('grid');
    } else {
      setDragSource('plate');
    }
  };
  
  // Handle drag over to update the hover state
  const handleDragOver = (event: DragOverEvent) => {
    // Don't allow dragging in read-only mode
    if (readOnly) return;
    
    const { over } = event;
    
    if (!over) {
      setHoverSectionId(null);
      return;
    }
    
    const overId = over.id as string;
    
    // Check if we're over a plate section
    if (plateSections.some(section => section.id === overId)) {
      setHoverSectionId(overId);
    } else {
      setHoverSectionId(null);
    }
  };
  
  // Handle HTML5 drag events 
  const handleHTMLDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Don't process drags in read-only mode
    if (readOnly) return;
    
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleHTMLDrop = (e: React.DragEvent<HTMLDivElement>) => {
    // Don't process drops in read-only mode
    if (readOnly) return;
    
    e.preventDefault();
    setIsDragging(false);
    
    // Get the data from the drag operation
    const data = e.dataTransfer.getData('text/plain');
    
    // Check if it's our custom format
    if (!data || !data.startsWith('dragfood-')) {
      return;
    }
    
    try {
      // Extract food data
      const foodDataStr = data.replace('dragfood-', '');
      const foodData = JSON.parse(decodeURIComponent(foodDataStr)) as PlateFood;
      
      // Determine which section the drop happened in
      if (!plateRef.current) {
        return;
      }
      
      // Calculate position relative to plate
      const plateRect = plateRef.current.getBoundingClientRect();
      const x = ((e.clientX - plateRect.left) / plateRect.width) * 100;
      const y = ((e.clientY - plateRect.top) / plateRect.height) * 100;
      
      // Find which section this position is in
      const sectionId = findSectionAtPosition(x, y, plateSections);
      
      if (!sectionId) {
        return;
      }
      
      // Create new instance ID
      const instanceId = `${foodData.id}-instance-${Date.now()}`;
      
      // Get the section
      const section = plateSections.find(s => s.id === sectionId)!;
      
      // Calculate position within the section
      let posX = section.position.x;
      let posY = section.position.y;
      
      if (section.id === 'section1') {
        // For circular section, place randomly within 70% of radius
        const radius = section.position.width / 2 * 0.7;
        const angle = Math.random() * 2 * Math.PI; // Random angle
        const distance = Math.random() * radius; // Random distance within radius
        posX = section.position.x + Math.cos(angle) * distance;
        posY = section.position.y + Math.sin(angle) * distance;
      } else {
        // For rectangular sections, stay within 70% of the width/height
        const maxOffsetX = section.position.width * 0.35;
        const maxOffsetY = section.position.height * 0.35;
        posX = section.position.x + (Math.random() * 2 - 1) * maxOffsetX;
        posY = section.position.y + (Math.random() * 2 - 1) * maxOffsetY;
      }
      
      // Create a new placed food
      const newFood: PlacedFood = {
        ...foodData,
        instanceId,
        position: { x: posX, y: posY },
        sectionId
      };
      
      // Add to state
      setPlacedFoods(prev => [...prev, newFood]);
      
      // Notify parent
      if (onFoodPositioned) {
        onFoodPositioned(instanceId, { x: posX, y: posY }, sectionId);
      }
    } catch (error) {
      console.error('Error processing dropped food:', error);
    }
  };
  
  // Reset dragging state when leaving plate area
  const handleHTMLDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only reset if leaving the entire plate container
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };
  
  // Handle drag end for positioning
  const handleDragEnd = (event: DragEndEvent) => {
    // Don't process drags in read-only mode
    if (readOnly) return;
    
    const { active, over } = event;
    
    // Reset active states
    setActiveFoodId(null);
    setDragSource(null);
    setHoverSectionId(null);
    setIsDragging(false);
    
    // If not dropped on anything or not dropped on a section, return
    if (!over || !plateSections.some(section => section.id === over.id)) {
      return;
    }
    
    // Get the dragged food's ID and the target section
    const foodId = active.id as string;
    const targetSectionId = over.id as string;
    
    // Check if it's HTML5 drag and drop data
    if (typeof foodId === 'string' && foodId.startsWith('dragfood-')) {
      try {
        // This is a food being dragged from the grid
        const foodDataStr = foodId.replace('dragfood-', '');
        const foodData = JSON.parse(decodeURIComponent(foodDataStr)) as PlateFood;
                  
        // Create a new placed food
        const instanceId = `${foodData.id}-instance-${Date.now()}`;
        
        // Get the target section
        const targetSection = plateSections.find(s => s.id === targetSectionId);
        if (!targetSection) {
          return;
        }
        
        // Calculate a position within the section that keeps the food contained
        const { x, y, width, height } = targetSection.position;
        
        // Add slight randomization for natural placement, but keep within bounds
        // For circular section, we ensure the position is within the circle
        let posX = x;
        let posY = y;
        
        if (targetSection.id === 'section1') {
          // For circular section, place randomly within 70% of radius
          const radius = width / 2 * 0.7;
          const angle = Math.random() * 2 * Math.PI; // Random angle
          const distance = Math.random() * radius; // Random distance within radius
          posX = x + Math.cos(angle) * distance;
          posY = y + Math.sin(angle) * distance;
        } else {
          // For rectangular sections, stay within 70% of the width/height
          const maxOffsetX = width * 0.35;
          const maxOffsetY = height * 0.35;
          posX = x + (Math.random() * 2 - 1) * maxOffsetX;
          posY = y + (Math.random() * 2 - 1) * maxOffsetY;
        }
                  
        // Create a new food with the position
        const newFood: PlacedFood = {
          ...foodData,
          instanceId,
          position: { x: posX, y: posY },
          sectionId: targetSectionId
        };
        
        setPlacedFoods(prev => [...prev, newFood]);
      
        // Notify parent component
        if (onFoodPositioned) {
          onFoodPositioned(instanceId, { x: posX, y: posY }, targetSectionId);
        }
      } catch (error) {
        console.error('Error processing dragged food:', error);
      }
      return;
    }
    
    // Handle repositioning of existing foods
    const draggedFood = placedFoods.find(food => food.instanceId === foodId);
    if (!draggedFood) {
      return;
    }
    
    // Get the target section
    const targetSection = plateSections.find(s => s.id === targetSectionId);
    if (!targetSection) {
      return;
    }
    
    // Calculate a position within the section that keeps the food contained
    const { x, y, width, height } = targetSection.position;
    
    // Calculate a contained position based on section shape
    let posX = x;
    let posY = y;
    
    if (targetSection.id === 'section1') {
      // For circular section, place randomly within 70% of radius
      const radius = width / 2 * 0.7;
      const angle = Math.random() * 2 * Math.PI; // Random angle
      const distance = Math.random() * radius; // Random distance within radius
      posX = x + Math.cos(angle) * distance;
      posY = y + Math.sin(angle) * distance;
    } else {
      // For rectangular sections, stay within 70% of the width/height
      const maxOffsetX = width * 0.35;
      const maxOffsetY = height * 0.35;
      posX = x + (Math.random() * 2 - 1) * maxOffsetX;
      posY = y + (Math.random() * 2 - 1) * maxOffsetY;
    }
          
    // Update the food's position
    setPlacedFoods(prev => 
      prev.map(food => 
        food.instanceId === foodId 
          ? { ...food, position: { x: posX, y: posY }, sectionId: targetSectionId } 
          : food
      )
    );
    
    // Notify parent component
    if (onFoodPositioned) {
      onFoodPositioned(foodId, { x: posX, y: posY }, targetSectionId);
    }
  };
  
  // Handle removing a food item
  const handleRemoveFood = (foodInstanceId: string) => {
    // Don't allow removing in read-only mode
    if (readOnly) return;
    
    const food = placedFoods.find(f => f.instanceId === foodInstanceId);
    if (food) {
      // Call onRemoveFood with the specific food instanceId
      onRemoveFood(foodInstanceId, food.category);
      
      // Also update internal state to keep it in sync
      setPlacedFoods(prev => prev.filter(f => f.instanceId !== foodInstanceId));
    }
  };

  // Get default section ID based on food category
  const getDefaultSectionId = (category: string): string => {
    switch (category) {
      case 'protein':
        return 'section1'; // Left section
      case 'carbs':
        return 'section2'; // Top right
      case 'extras':
        return 'section3'; // Bottom right
      default:
        return 'section1';
    }
  };
  
  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // Disable all dnd functionality when in readOnly mode
      autoScroll={!readOnly}
    >
      <div className="mb-8">
        {/* Inject the enhanced animations CSS */}
        <style jsx global>{enhancedAnimations}</style>
        
        <div className="text-center mb-4">
          <motion.p 
            className="text-base text-indigo-600 font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {readOnly ? t('reviewing_lunchbox') : t('lunchbox_instructions')}
          </motion.p>
        </div>
        
        {/* Plate container with shadow effect and floating animation */}
        <motion.div
          ref={plateRef}
          className={`relative mx-auto w-full max-w-[600px] h-auto aspect-[600/420] plate-container float-animation ${readOnly ? 'pointer-events-none' : ''}`}
          data-testid="lunchbox-plate"
          onDragOver={!readOnly ? handleHTMLDragOver : undefined}
          onDragLeave={!readOnly ? handleHTMLDragLeave : undefined}
          onDrop={!readOnly ? handleHTMLDrop : undefined}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Plate background image */}
          <div className="relative w-full h-full">
            <Image
              src={plateImageUrl}
              alt={t('plate_title')}
              fill
              priority
              className="object-contain drop-shadow-lg"
            />
            
            {/* Section overlays to visualize drop zones - only show when not in readOnly mode */}
            {!readOnly && plateSections.map(section => (
              <PlateDropZone 
                key={section.id} 
                section={section} 
                isOver={hoverSectionId === section.id}
                isDragging={isDragging}
                dragSource={dragSource}
                t={t} 
              />
            ))}
          </div>
          
          {/* Placed food items - pass readOnly prop down */}
          {placedFoods.map((food, index) => {
            // Create a modified instanceId that's prefixed with the mode and includes an index
            // This ensures that even if we somehow get duplicate instanceIds, the rendered keys will be unique
            const modePrefix = readOnly ? 'review-' : 'build-';
            // Include index to guarantee uniqueness
            const uniqueKey = `${modePrefix}${food.instanceId}-index-${index}`;
            
            console.log('Rendering food item:', uniqueKey, food.name);
            return (
              <PlacedFoodItem
                key={uniqueKey}
                food={{...food, readOnly}}
                isActive={activeFoodId === food.instanceId}
                onRemove={() => handleRemoveFood(food.instanceId)}
              />
            )
          })}
          
          {/* Visual hint when plate is empty - only show when not in readOnly and plate is empty */}
          {!readOnly && placedFoods.length === 0 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <div className="bg-white bg-opacity-70 rounded-full px-6 py-3">
                <p className="text-lg text-indigo-600 font-medium">Drag foods here!</p>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <div className="text-center mt-4">
          <motion.p 
            className="text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {readOnly ? t('review_mode') : t('drag_to_position')}
          </motion.p>
        </div>
      </div>
    </DndContext>
  );
}

/**
 * Individual drop zone component for a section of the plate
 */
function PlateDropZone({ 
  section, 
  isOver,
  isDragging,
  dragSource,
  t 
}: { 
  section: PlateSection;
  isOver: boolean;
  isDragging: boolean;
  dragSource: 'grid' | 'plate' | null;
  t: (key: string) => string;
}) {
  const { setNodeRef } = useDroppable({
    id: section.id,
  });
  
  // Calculate position and size
  const { x, y, width, height } = section.position;
  const style = {
    left: `${x - width/2}%`,
    top: `${y - height/2}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
  
  // Set different shape and indicator styles based on section
  const isCircular = section.id === 'section1';
  const baseClasses = "absolute border-2 transition-all duration-200 flex items-center justify-center";
  const shapeClasses = isCircular ? "rounded-full" : "rounded-lg";
  
  // Enhanced visual feedback with animations
  let hoverClasses = "border-gray-300/20 bg-gray-200/5 border-dashed";
  let labelClasses = "opacity-0";
  
  if (isOver) {
    // Current section is being hovered over - strong highlight
    const sectionColor = section.id === 'section1' 
      ? "border-yellow-500 bg-yellow-100/40 shadow-yellow-200/50" 
      : section.id === 'section2' 
        ? "border-green-500 bg-green-100/40 shadow-green-200/50"
        : "border-blue-500 bg-blue-100/40 shadow-blue-200/50";
    
    hoverClasses = `${sectionColor} border-solid shadow-inner`;
    labelClasses = "opacity-100";
  } else if (isDragging && dragSource === 'grid') {
    // Dragging from grid but not over this section - show mild highlight
    hoverClasses = "border-blue-300/70 bg-blue-50/20 border-dashed pulse-border";
    labelClasses = "opacity-70";
  }
  
  return (
    <div
      ref={setNodeRef}
      className={`${baseClasses} ${shapeClasses} ${hoverClasses}`}
      style={style}
    >
      <div className={`text-center text-sm text-indigo-600 font-bold px-2 select-none transition-opacity ${labelClasses}`}>
        {isDragging ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {t('drop_here')}
          </motion.div>
        ) : ''}
      </div>
    </div>
  );
}

/**
 * Component for a food item placed on the plate
 */
function PlacedFoodItem({ 
  food, 
  isActive,
  onRemove 
}: { 
  food: PlacedFood;
  isActive: boolean;
  onRemove: () => void;
}) {
  // Get readOnly state from props
  const readOnly = food.readOnly || false;
  
  // Only set up draggable if not in readOnly mode
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: food.instanceId,
    data: food,
    disabled: readOnly
  });
  
  // Apply styles for dragging with enhanced animation
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    left: `${food.position.x}%`,
    top: `${food.position.y}%`,
    zIndex: isActive ? 999 : 10,
    opacity: isActive ? 0.85 : 1,
    filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 128, 0, 0.5))' : 'none',
  } : {
    left: `${food.position.x}%`,
    top: `${food.position.y}%`,
    zIndex: 10,
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      className={`absolute ${readOnly ? 'cursor-default' : 'cursor-grab'} group transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150`}
      style={style}
      {...(readOnly ? {} : listeners)}
      {...(readOnly ? {} : attributes)}
      initial={{ scale: 0, rotate: 10 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: readOnly ? 1 : 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative">
        <motion.div 
          className="w-20 h-20 flex items-center justify-center"
          whileHover={{ rotate: readOnly ? 0 : [-2, 2, -2, 0] }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={food.imageUrl}
            alt={food.name}
            className="object-contain max-h-[90%] max-w-[90%] drop-shadow-md filter brightness-105 contrast-105"
            draggable={false} // Prevent default browser drag behavior
          />
        </motion.div>
        
        {/* Food name on hover - enhanced with animation */}
        <motion.div 
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 px-2 py-1 rounded-md 
                     shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          initial={{ y: 5, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs font-bold text-indigo-700">{food.name}</p>
        </motion.div>
        
        {/* Enhanced remove button with animation - only show when not in readOnly mode */}
        {!readOnly && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full 
                      w-7 h-7 flex items-center justify-center shadow-md 
                      opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
            whileHover={{ scale: 1.2, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            aria-label="Remove food"
          >
            <X size={14} weight="bold" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
} 