'use client';

import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NoteCard from '@/components/Note/NoteCard';
import { NutritionalNote } from '@/types/notes';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import noteService from '@/libs/NoteService';

export default function MyNotePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NutritionalNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notes using the note service
    const savedNotes = noteService.getAllNotes();
    setNotes(savedNotes);
    setLoading(false);
  }, []);

  const deleteNote = (noteId: string | number) => {
    // Delete the note using the note service
    const success = noteService.deleteNote(noteId);
    if (success) {
      setNotes(noteService.getAllNotes());
    }
  };

  const handleNavigateToScan = () => {
    router.push('/NutriScan');
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
      </motion.div>
    </div>
  );

  // Render notes list
  const renderNotesList = () => (
    <div className="w-full px-6 py-20 max-w-7xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-center text-green-700 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Nutrition Notes
      </motion.h1>

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
                id={String(note.id)}
                timestamp={new Date(note.createdAt).getTime()}
                selectedFoods={note.selectedFoods || []}
                originalFoods={note.originalFoods || []}
                additionalFoods={note.additionalFoods || []}
                nutrient_gaps={note.nutrient_gaps}
                nutrientComparisons={note.nutrientComparisons}
                totalCalories={note.summary.totalCalories}
                missingCount={note.summary.missingCount}
                excessCount={note.summary.excessCount}
                onDelete={() => deleteNote(note.id)}
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