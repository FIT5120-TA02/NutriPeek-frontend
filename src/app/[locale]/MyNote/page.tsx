'use client';

import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import storageService from '@/libs/StorageService';
import NoteCard from '@/components/Note/NoteCard';
import { NutritionalNote, isValidNote } from '@/types/notes';
import { ChildProfile } from '@/types/profile';
import FloatingEmojisLayout from '@/components/layouts/FloatingEmojisLayout';
import { useRouter } from 'next/navigation';

const NOTES_KEY = 'nutri_notes';
const CHILDREN_KEY = 'user_children';

export default function MyNotePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NutritionalNote[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);

  useEffect(() => {
    const savedNotes = storageService.getLocalItem({ key: NOTES_KEY, defaultValue: [] });
    const savedChildren = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    const filteredNotes = Array.isArray(savedNotes) ? savedNotes.filter(isValidNote) : [];

    setNotes(filteredNotes);
    setChildren(Array.isArray(savedChildren) ? savedChildren : []);
  }, []);

  const deleteNote = (noteId: string | number) => {
    const updated = notes.filter(note => note.id !== noteId);
    storageService.setLocalItem(NOTES_KEY, updated);
    setNotes(updated);
  };

  const handleNavigateToScan = () => {
    router.push('/NutriScan');
  };

  const renderContent = () => {
    if (notes.length === 0) {
      return (
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
                e.currentTarget.style.display = 'none';
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
    }

    return (
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
              gender: note.childGender 
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
                  nutrient_gaps={note.nutrient_gaps}
                  onDelete={() => deleteNote(note.id)}
                  child={child}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
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