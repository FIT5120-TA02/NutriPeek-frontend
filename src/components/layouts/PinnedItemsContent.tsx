'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SeasonalFood } from '@/types/seasonal';
import seasonalFoodService from '@/libs/SeasonalFoodService';
import { NutritionalNote } from '@/types/notes';
import noteService from '@/libs/NoteService';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import CompactNoteCard from '@/components/Note/CompactNoteCard';
import NoteDetailPopup from '@/components/Note/NoteDetailPopup';
import FoodDetailPopup from '@/components/SeasonalFood/FoodDetailPopup';
import { toast } from 'sonner';
import { SeasonalFoodResponse } from '@/api/types';

export interface PinnedItemsContentProps {
  onFoodSelect?: (food: SeasonalFood) => void;
  onNoteSelect?: (note: NutritionalNote) => void;
  navbarHeight?: string;
}

/**
 * Content component for the pinned items sheet
 * Displays tabs for pinned foods and notes
 */
const PinnedItemsContent: React.FC<PinnedItemsContentProps> = ({
  onFoodSelect,
  onNoteSelect,
  navbarHeight = '72px',
}) => {
  const [pinnedFoods, setPinnedFoods] = useState<SeasonalFood[]>([]);
  const [notes, setNotes] = useState<NutritionalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNote, setSelectedNote] = useState<NutritionalNote | null>(null);
  const [selectedFood, setSelectedFood] = useState<SeasonalFoodResponse | null>(null);

  // Load data function - made reusable for event listeners
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load pinned foods
      const foods = seasonalFoodService.getAllPinnedFoods();
      setPinnedFoods(foods);

      // Load notes
      const userNotes = noteService.getAllNotes();
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading pinned data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for update events to refresh data
  useEffect(() => {
    const handlePinnedFoodsUpdated = () => {
      loadData();
    };
    
    window.addEventListener('pinnedFoodsUpdated', handlePinnedFoodsUpdated);
    window.addEventListener('storage', (e) => {
      if (e.key === 'pinnedSeasonalFoods') {
        loadData();
      }
    });
    
    return () => {
      window.removeEventListener('pinnedFoodsUpdated', handlePinnedFoodsUpdated);
      window.removeEventListener('storage', handlePinnedFoodsUpdated);
    };
  }, [loadData]);

  const handleUnpinFood = (event: React.MouseEvent, foodId: string) => {
    event.stopPropagation();
    seasonalFoodService.unpinSeasonalFood(foodId);
    setPinnedFoods(prev => prev.filter(food => food.id !== foodId));
    // Notify other components about the change
    window.dispatchEvent(new Event('pinnedFoodsUpdated'));
  };

  // Handle note deletion
  const handleDeleteNote = (noteId: string) => {
    try {
      const success = noteService.deleteNote(noteId);
      if (success) {
        // Update the notes list
        setNotes(prev => prev.filter(note => note.id.toString() !== noteId));
        toast.success("Note deleted successfully");
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error("An error occurred while deleting the note");
    }
  };

  // Handle food selection to show popup
  const handleFoodSelect = (food: SeasonalFood) => {
    // Convert SeasonalFood to SeasonalFoodResponse for the popup
    const foodResponse: SeasonalFoodResponse = {
      id: food.id,
      name: food.name,
      imageUrl: food.image || '',
      description: food.description || '',
      category: '',
      db_category: '',
      region: food.region || 'Unknown',
      availableMonths: food.seasons ? getMonthsFromSeasons(food.seasons) : [],
      nutritionalValue: food.nutritionalInfo ? formatNutritionalInfo(food.nutritionalInfo) : ''
    };
    
    setSelectedFood(foodResponse);
    if (onFoodSelect) {
      onFoodSelect(food);
    }
  };

  // Helper to convert seasons to months (approximate mapping)
  const getMonthsFromSeasons = (seasons: string[]): number[] => {
    const months: number[] = [];
    
    for (const season of seasons) {
      switch(season.toLowerCase()) {
        case 'spring':
          months.push(3, 4, 5);
          break;
        case 'summer':
          months.push(6, 7, 8);
          break;
        case 'autumn':
        case 'fall':
          months.push(9, 10, 11);
          break;
        case 'winter':
          months.push(12, 1, 2);
          break;
      }
    }
    
    // Return unique months
    return [...new Set(months)];
  };

  // Format nutritional info for display
  const formatNutritionalInfo = (info: any): string => {
    if (!info) return '';
    
    const parts = [];
    if (info.calories) parts.push(`Calories: ${info.calories}`);
    if (info.proteins) parts.push(`Proteins: ${info.proteins}g`);
    if (info.carbs) parts.push(`Carbs: ${info.carbs}g`);
    if (info.fats) parts.push(`Fats: ${info.fats}g`);
    if (info.fiber) parts.push(`Fiber: ${info.fiber}g`);
    
    return parts.join(', ');
  };

  // Empty state components
  const EmptyFoodsState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </div>
      <h4 className="text-gray-800 font-medium mb-1">No pinned foods yet</h4>
      <p className="text-gray-500 text-sm">
        Pin your favorite seasonal foods as you explore to make them easily accessible here.
      </p>
    </div>
  );

  const EmptyNotesState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h4 className="text-gray-800 font-medium mb-1">No nutritional notes yet</h4>
      <p className="text-gray-500 text-sm">
        Create notes to save nutritional information for your child's diet.
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className="px-4 py-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `flex-1 py-3 text-sm font-medium ${
                selected
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-green-600'
              }`
            }
          >
            Pinned Foods
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `flex-1 py-3 text-sm font-medium ${
                selected
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-green-600'
              }`
            }
          >
            Your Notes
          </Tab>
        </Tab.List>
        <Tab.Panels>
          {/* Pinned Foods Panel */}
          <Tab.Panel>
            {isLoading ? (
              <LoadingState />
            ) : pinnedFoods.length === 0 ? (
              <EmptyFoodsState />
            ) : (
              <div className="p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {pinnedFoods.map(food => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-green-200 hover:bg-green-50/30 transition-colors shadow-sm"
                      onClick={() => handleFoodSelect(food)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-16 h-16 object-cover rounded-md shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-green-50 rounded-md flex items-center justify-center text-2xl shadow-sm">
                              🍎
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{food.name}</h4>
                            <button
                              onClick={(e) => handleUnpinFood(e, food.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                              aria-label={`Remove ${food.name}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Available in: {food.seasons.join(', ')}
                          </div>
                          {food.region && (
                            <div className="text-xs text-gray-400 mt-1">
                              Region: {food.region}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Tab.Panel>

          {/* Notes Panel */}
          <Tab.Panel>
            {isLoading ? (
              <LoadingState />
            ) : notes.length === 0 ? (
              <EmptyNotesState />
            ) : (
              <div className="p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {notes.map(note => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CompactNoteCard 
                        note={note}
                        onClick={() => {
                          setSelectedNote(note);
                          onNoteSelect?.(note);
                        }}
                        onDelete={handleDeleteNote}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Note Detail Popup - Moved outside Tab.Group to ensure proper positioning */}
      {selectedNote && (
        <div className="fixed inset-0 z-[10000]">
          <NoteDetailPopup 
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            navbarHeight={navbarHeight}
          />
        </div>
      )}

      {/* Food Detail Popup - Moved outside Tab.Group to ensure proper positioning */}
      {selectedFood && (
        <div className="fixed inset-0 z-[10000]">
          <FoodDetailPopup 
            food={selectedFood}
            onClose={() => setSelectedFood(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PinnedItemsContent; 