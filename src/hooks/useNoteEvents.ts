import { useState, useEffect, useCallback } from 'react';
import { NutritionalNote } from '@/types/notes';
import noteService from '@/libs/NoteService';

/**
 * Custom hook for managing nutritional notes with real-time updates
 * Listens for note-related events (create, update, delete) and keeps the UI in sync
 * 
 * @returns {object} Object containing:
 *   - notes: Array of nutritional notes
 *   - loading: Boolean indicating if notes are being loaded
 *   - deleteNote: Function to delete a note by ID
 *   - deleteAllNotes: Function to delete all notes
 */
export function useNoteEvents() {
  const [notes, setNotes] = useState<NutritionalNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all notes - used for both initial load and event handling
  const fetchNotes = useCallback(() => {
    const savedNotes = noteService.getAllNotes();
    setNotes(savedNotes);
    setLoading(false);
  }, []);

  // Delete single note by ID
  const deleteNote = useCallback((noteId: string | number) => {
    return noteService.deleteNote(noteId);
  }, []);

  // Delete all notes
  const deleteAllNotes = useCallback(() => {
    return noteService.deleteAllNotes();
  }, []);

  // Initial load of notes and set up event listeners
  useEffect(() => {
    // Initial load
    fetchNotes();

    // Handler for when a new note is created
    const handleNoteCreated = (event: CustomEvent<{ note: NutritionalNote }>) => {
      const { note } = event.detail;
      setNotes(prevNotes => [note, ...prevNotes]);
    };

    // Handler for when a note is updated
    const handleNoteUpdated = (event: CustomEvent<{ note: NutritionalNote }>) => {
      const { note } = event.detail;
      setNotes(prevNotes => {
        return prevNotes.map(n => n.id === note.id ? note : n);
      });
    };

    // Handler for when a note is deleted
    const handleNoteDeleted = (event: CustomEvent<{ noteId: string | number }>) => {
      const { noteId } = event.detail;
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
    };

    // Handler for when all notes are deleted
    const handleAllNotesDeleted = () => {
      setNotes([]);
    };

    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nutriNotes') {
        fetchNotes();
      }
    };

    // Add event listeners
    window.addEventListener('noteCreated', handleNoteCreated as EventListener);
    window.addEventListener('noteUpdated', handleNoteUpdated as EventListener);
    window.addEventListener('noteDeleted', handleNoteDeleted as EventListener);
    window.addEventListener('allNotesDeleted', handleAllNotesDeleted);
    window.addEventListener('storage', handleStorageChange);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('noteCreated', handleNoteCreated as EventListener);
      window.removeEventListener('noteUpdated', handleNoteUpdated as EventListener);
      window.removeEventListener('noteDeleted', handleNoteDeleted as EventListener);
      window.removeEventListener('allNotesDeleted', handleAllNotesDeleted);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchNotes]);

  return {
    notes,
    loading,
    deleteNote,
    deleteAllNotes
  };
} 