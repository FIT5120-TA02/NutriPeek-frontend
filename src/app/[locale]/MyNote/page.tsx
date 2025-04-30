'use client';

import React, { useEffect, useState } from 'react';
import storageService from '@/libs/StorageService';
import { NutrientGapResponse } from '@/api/types';
import NoteCard from '@/components/Note/NoteCard';

const NOTES_KEY = 'nutri_notes';
const CHILDREN_KEY = 'user_children';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies?: string[];
}

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

  if (notes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-gray-600">
        No saved analyses yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background px-6 py-20 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-palette-primary mb-10">My Nutrition Notes</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note, index) => {
          const child = children[index] || { name: 'Unknown', gender: 'male' };

          return note.nutrient_gaps ? (
            <NoteCard
              key={note.id || index}
              id={note.id}
              timestamp={note.timestamp}
              selectedFoods={note.selectedFoods}
              nutrient_gaps={note.nutrient_gaps}
              onDelete={() => deleteNote(index)}
              child={child}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}