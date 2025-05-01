'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import storageService from '@/libs/StorageService';
import { NutrientGapResponse } from '@/api/types';
import NoteCard from '@/components/Note/NoteCard';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

const NOTES_KEY = 'nutri_notes';
const CHILDREN_KEY = 'user_children';

const isValidNote = (note: any): note is NutrientGapResponse => {
  return (
    note &&
    typeof note.id === 'string' &&
    typeof note.timestamp === 'number' &&
    Array.isArray(note.selectedFoods) &&
    typeof note.nutrient_gaps === 'object'
  );
};

export default function MyNotePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NutrientGapResponse[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);

  useEffect(() => {
    const savedNotes = storageService.getLocalItem({ key: NOTES_KEY, defaultValue: [] });
    const savedChildren = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    const filteredNotes = Array.isArray(savedNotes) ? savedNotes.filter(isValidNote) : [];

    setNotes(filteredNotes);
    setChildren(Array.isArray(savedChildren) ? savedChildren : []);
  }, []);

  const deleteNote = (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    storageService.setLocalItem(NOTES_KEY, updated);
    setNotes(updated);
  };

  const handleNavigateToScan = () => {
    router.push('/NutriScan');
  };

  if (notes.length === 0) {
    return (
      <FloatingEmojisLayout backgroundClasses="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center text-gray-600">
        <motion.div
          className="flex flex-col items-center text-center px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/images/empty-notes.png"
            alt="No notes"
            className="w-40 h-40 mb-6"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h2 className="text-3xl font-bold text-green-700 mb-4">No Nutrition Notes Yet!</h2>
          <p className="text-gray-600 text-lg mb-6">
            Let’s discover what nutrients your child needs. Start by scanning some food items!
          </p>
          <button
            onClick={handleNavigateToScan}
            className="px-6 py-3 bg-green-500 text-white rounded-full font-medium shadow hover:bg-green-600 transition-transform transform hover:scale-105"
          >
            Scan Food Now 🍎
          </button>
        </motion.div>
      </FloatingEmojisLayout>
    );
  }

  return (
    <FloatingEmojisLayout
      emojisCount={20}
      backgroundClasses="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100"
    >
      <div className="w-full px-6 py-20 max-w-7xl mx-auto">
        {/* Added Back Button */}
        <BackButton to="/recommendation" label="Back to Recommendations" />

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
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {notes.map((note, index) => {
            const child = children[index] || { name: 'Unknown', gender: 'male' };

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NoteCard
                  id={note.id}
                  timestamp={note.timestamp}
                  selectedFoods={note.selectedFoods}
                  nutrient_gaps={note.nutrient_gaps}
                  onDelete={() => deleteNote(index)}
                  child={child}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </FloatingEmojisLayout>
  );
}