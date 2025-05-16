'use client';

import { useState, useEffect } from 'react';
import { SeasonalFood } from '@/types/seasonal';
import dynamic from 'next/dynamic';
import PinnedItemsContent from './PinnedItemsContent';
import { NutritionalNote } from '@/types/notes';

// Constant for sheet width to keep it consistent across the component
const SHEET_WIDTH = '350px';
// Constant for navbar height to match with the actual navbar
const NAVBAR_HEIGHT = '72px';

// Dynamically import the PullableSheet component
const DynamicPullableSheet = dynamic(() => import('@/components/ui/PullableSheet'), {
  ssr: false
});

/**
 * Layout component that adds a pullable sheet with a trapezoid-shaped handle
 * Can be included in the application layout to make pinned items accessible from anywhere
 * Creates a natural "pull from side" interaction pattern for users to access their saved items
 */
const PinnedItemsLayout = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openedFromSheet, setOpenedFromSheet] = useState(false);
  
  const handleFoodSelect = (food: SeasonalFood) => {    
    // Dispatch a custom event that components can listen for
    if (typeof window !== 'undefined') {
      // Set a flag in localStorage to indicate the popup was opened from the sheet
      localStorage.setItem('foodPopupSource', 'sheet');
      setOpenedFromSheet(true);
    }
  };

  const handleNoteSelect = (note: NutritionalNote) => {
    // When a note is selected, we'll just keep the sheet open
    // The popup for the note is managed within PinnedItemsContent
    if (typeof window !== 'undefined') {
      // Set a flag to indicate the popup was opened from the sheet
      localStorage.setItem('notePopupSource', 'sheet');
      setOpenedFromSheet(true);
    }
  };
  
  // Listen for popup-related events to keep sheet open only if opened from sheet
  useEffect(() => {
    const handlePopupClosed = () => {
      // Only keep sheet open if the popup was opened from the sheet
      const foodPopupSource = localStorage.getItem('foodPopupSource');
      const notePopupSource = localStorage.getItem('notePopupSource');
      
      if ((foodPopupSource === 'sheet' || notePopupSource === 'sheet') && openedFromSheet) {
        setIsSheetOpen(true);
      }
      
      // Clear the source flags
      localStorage.removeItem('foodPopupSource');
      localStorage.removeItem('notePopupSource');
      setOpenedFromSheet(false);
    };
    
    window.addEventListener('foodDetailPopupClosed', handlePopupClosed);
    window.addEventListener('noteDetailPopupClosed', handlePopupClosed);
    
    return () => {
      window.removeEventListener('foodDetailPopupClosed', handlePopupClosed);
      window.removeEventListener('noteDetailPopupClosed', handlePopupClosed);
    };
  }, [openedFromSheet, setIsSheetOpen]);

  return (
    <DynamicPullableSheet 
      isOpen={isSheetOpen}
      onOpenChange={setIsSheetOpen}
      title="Saved Items"
      handleLabel="Saved Items"
      handleColor="bg-green-500"
      sheetWidth={SHEET_WIDTH}
      navbarHeight={NAVBAR_HEIGHT}
    >
      <PinnedItemsContent 
        onFoodSelect={handleFoodSelect}
        onNoteSelect={handleNoteSelect}
        navbarHeight={NAVBAR_HEIGHT}
      />
    </DynamicPullableSheet>
  );
};

export default PinnedItemsLayout; 