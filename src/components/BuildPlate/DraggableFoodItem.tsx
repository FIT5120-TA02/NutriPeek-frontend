"use client";

/**
 * DraggableFoodItem Component
 * A reusable component for displaying draggable food items
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDraggable } from '@dnd-kit/core';
import { DraggableFoodItemProps } from './types';
import { getFoodImageUrl } from '@/utils/assetHelpers';

/**
 * DraggableFoodItem component with tooltip and drag capabilities
 */
export default function DraggableFoodItem({ 
  food, 
  onDragStart, 
  showTooltip = false 
}: DraggableFoodItemProps) {
  const t = useTranslations('BuildPlate');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Set up draggable with dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `dragfood-${encodeURIComponent(JSON.stringify(food))}`,
    data: food,
  });
  
  // Fallback images by category
  const fallbackImages = {
    protein: getFoodImageUrl('bread'),
    carbs: getFoodImageUrl('rice'),
    extras: getFoodImageUrl('apple'),
  };
  
  // Define background colors based on food category
  const categoryColors = {
    protein: "bg-red-50",
    carbs: "bg-yellow-50",
    extras: "bg-green-50"
  };
  
  const bgColor = categoryColors[food.category as keyof typeof categoryColors] || "bg-gray-50";
  
  // Apply styles for both regular and dragging states
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.5 : 1, // Make original item semi-transparent when dragging
  } : undefined;
  
  // Handle drag start with custom image
  const handleCustomDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Create a custom drag image element
    const dragImage = new Image();
    dragImage.src = imageError ? fallbackImages[food.category as keyof typeof fallbackImages] : food.imageUrl;
    dragImage.width = 80;
    dragImage.height = 80;
    
    // Hide the drag image initially to avoid flicker
    // This won't be visible in the DOM
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    document.body.appendChild(dragImage);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, 40, 40);
    
    // Store food data in transfer
    const encodedFood = encodeURIComponent(JSON.stringify(food));
    e.dataTransfer.setData('text/plain', `dragfood-${encodedFood}`);
    
    // Call the provided onDragStart handler
    onDragStart(e, food);
    
    // Clean up the temporary drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 100);
  };

  // Don't initiate drag if this is already being dragged (prevents picking up other foods)
  const preventUnwantedDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab border border-gray-200 rounded-lg overflow-hidden ${bgColor} p-2 h-24 
                hover:shadow-md hover:scale-105 transition-all duration-200 
                ${isDragging ? 'pointer-events-none' : ''}`}
      draggable={!isDragging} // Only allow dragging if not already being dragged
      onDragStart={handleCustomDragStart}
      onDragOver={preventUnwantedDrag}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => showTooltip && setTooltipVisible(false)}
    >
      <div className="flex flex-col items-center h-full relative">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          </div>
        )}
        
        {/* Image container */}
        <div className="flex-1 w-full flex items-center justify-center mb-1">
          <img
            src={imageError ? fallbackImages[food.category as keyof typeof fallbackImages] : food.imageUrl}
            alt={food.name}
            className="object-contain max-h-[50px] max-w-full"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImageError(true);
            }}
            draggable={false} // Prevent default browser drag behavior
          />
        </div>
        
        {/* Food name */}
        <div className="w-full mt-auto">
          <p className="font-medium text-xs text-center text-gray-800 line-clamp-2">
            {food.name}
          </p>
        </div>
        
        {/* Tooltip */}
        {tooltipVisible && !isDragging && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 
                        bg-white rounded-lg shadow-lg text-xs text-gray-700 w-40 z-30">
            <p className="font-semibold text-center mb-1">{food.name}</p>
            <p className="text-gray-500 capitalize text-center">{food.category}</p>
            <div className="mt-1 pt-1 border-t border-gray-100">
              {food.nutrients.energy_kj != null && (
                <p className="text-xs">{t('energy')}: {food.nutrients.energy_kj} kJ</p>
              )}
              {food.nutrients.protein_g != null && (
                <p className="text-xs">{t('protein')}: {food.nutrients.protein_g}g</p>
              )}
              {food.nutrients.carbohydrate_g != null && (
                <p className="text-xs">{t('carbs')}: {food.nutrients.carbohydrate_g}g</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 