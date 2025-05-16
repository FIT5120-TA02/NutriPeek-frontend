'use client';

import { motion } from "framer-motion";
import React from 'react';
import { useRouter } from 'next/navigation';
import NoteCard from '@/components/Note/NoteCard';
import { NutritionalNote } from '@/types/notes';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import { useNoteEvents } from '@/hooks/useNoteEvents';
import { toast } from 'sonner';
import { showConfirmDialog } from "@/components/ui/ConfirmDialog";
import SeasonalFoodCTA from '@/components/SeasonalFood/SeasonalFoodCTA';

export default function MyNotePage() {
  const router = useRouter();
  // Use the custom hook to manage notes with real-time updates
  const { notes, loading, deleteNote, deleteAllNotes } = useNoteEvents();

  const handleDeleteNote = (noteId: string | number) => {
    const success = deleteNote(noteId);
    if (success) {
      toast.success("Note deleted successfully");
    }
  };

  const handleDeleteAllNotes = async () => {
    // Ask for confirmation before deleting all notes
    await showConfirmDialog({
      message: "Are you sure you want to delete all notes? This action cannot be undone.",
      header: "Clear All Notes",
      onConfirm: () => {
        const success = deleteAllNotes();
        if (success) {
          toast.success("All notes have been deleted");
        } else {
          toast.error("Failed to delete notes");
        }
      },
      confirmLabel: "Clear All",
      confirmButtonClass: "bg-red-600 border-none hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
    });
  };

  const handleNavigateToScan = () => {
    router.push('/NutriScan');
  };

  const handleNavigateToSeasonalFood = () => {
    router.push('/SeasonalFood');
  };

  // Render skeleton loading state
  const renderLoading = () => (
    <div className="w-full px-6 py-20 max-w-7xl mx-auto">
      <div className="h-8 w-60 bg-gray-200 animate-pulse rounded mx-auto mb-10"></div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 h-64 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div 
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.img 
          src="/images/empty-notes.png" 
          alt="No notes found" 
          className="w-40 h-40 mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onError={(e) => {
            // Fallback if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center mb-4 text-green-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          No Nutrition Notes Yet!
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-md mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Let's discover what nutrients your child needs. Start by scanning some food items!
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={handleNavigateToScan}
            className="px-6 py-3 bg-green-500 text-white rounded-full font-medium shadow-md hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Scan Food Now 🍎
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SeasonalFoodCTA 
              variant="button" 
              size="large" 
              color="blue" 
              label="Find Seasonal Foods"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  // Render notes list
  const renderNotesList = () => (
    <div className="w-full px-6 py-20 max-w-7xl mx-auto">
      <motion.div 
        className="flex flex-col sm:flex-row justify-center items-center mb-8 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-green-700 text-center mb-4 sm:mb-0">My Nutrition Notes</h1>
        
        <div className="sm:absolute sm:right-0 flex items-center space-x-2">
          <SeasonalFoodCTA 
            variant="iconButton" 
            size="medium" 
            color="blue" 
            toolTip="Find seasonal foods and local farmers markets" 
          />
          
          <motion.button
            onClick={handleDeleteAllNotes}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1 px-3 py-1 rounded-full border border-red-200 hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear All
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {notes.map((note, index) => {
          const child = { 
            name: note.childName, 
            gender: note.childGender,
            age: note.childAge
          };

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NoteCard
                note={note}
                onDelete={() => handleDeleteNote(note.id)}
                child={child}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  // Render content based on state
  const renderContent = () => {
    if (loading) return renderLoading();
    if (notes.length === 0) return renderEmptyState();
    return renderNotesList();
  };

  return (
    <FloatingEmojisLayout
      emojisCount={20}
      backgroundClasses="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100"
    >
      {renderContent()}
    </FloatingEmojisLayout>
  );
}