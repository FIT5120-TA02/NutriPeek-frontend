'use client';

import React, { useState } from 'react';
import { NutritionalNote } from '@/types/notes';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2, Printer } from 'lucide-react';
import ChildAvatar from '@/components/ui/ChildAvatar';
import NutritionScoreCard from './NutritionScoreCard';
// import PDFPreviewModal from '@/components/PDF/PDFPreviewModal';

interface CompactNoteCardProps {
  note: NutritionalNote;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

/**
 * A compact version of the NoteCard component for use in the pinned items sheet
 * Shows minimal information and functions as a button to open the full note details
 */
export default function CompactNoteCard({ note, onClick, onDelete }: CompactNoteCardProps) {
  // const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Format date to be more compact
  const formattedDate = (() => {
    const date = new Date(note.createdAt);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy');
  })();

  // Handle delete click without triggering the onClick of the card
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(note.id.toString());
    }
  };

  // Handle print click without triggering the onClick of the card
  // const handlePrint = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setShowPDFPreview(true);
  // };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-colors shadow-sm relative"
        onClick={onClick}
      >
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Print button (disabled for now) */}
          {/* <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
            onClick={handlePrint}
            aria-label={`Print ${note.childName}'s note`}
          >
            <Printer size={16} />
          </button> */}
          
          {/* Delete button */}
          {onDelete && (
            <button
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
              onClick={handleDelete}
              aria-label={`Delete ${note.childName}'s note`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <ChildAvatar
            name={note.childName || 'N/A'}
            gender={note.childGender || 'male'}
            size={40}
          />
          
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="font-medium text-gray-900 truncate">{note.childName}'s Nutrition</h4>
            <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
            
            {/* Simplified demographics */}
            <p className="text-xs text-gray-600 mt-1">
              {note.childAge && <span>{note.childAge}</span>}
              {note.childAge && note.childGender && <span> • </span>}
              {note.childGender && <span>{note.childGender}</span>}
            </p>
            
            {/* Key metrics row */}
            <div className="mt-2 grid grid-cols-3 gap-2 items-center">
              {/* Total Calories */}
              <div className="inline-flex items-center justify-center text-xs bg-blue-50 px-2 py-0.5 rounded-md h-auto">
                <span className="text-blue-600 font-medium mr-1">
                  {Math.round(note.nutrient_gaps?.total_calories || 0)}
                </span>
                <span className="text-blue-500">kJ</span>
              </div>
              
              {/* PAL Level if available */}
              {note.activityPAL && note.activityPAL > 0 ? (
                <div className="inline-flex items-center justify-center text-xs bg-purple-50 px-2 py-0.5 rounded-md whitespace-nowrap h-auto">
                  <span className="text-purple-600 font-medium mr-1">PAL</span>
                  <span className="text-purple-500">{note.activityPAL.toFixed(1)}</span>
                </div>
              ) : (
                <div className="flex-1"></div>
              )}
              
              {/* Compact score indicator */}
              <div className="flex justify-end">
                <NutritionScoreCard
                  allNutrients={note.nutrient_gaps.nutrient_gaps}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PDF Preview Modal (disabled for now)*/}
      {/* <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        note={note}
        onDownload={() => {
          setShowPDFPreview(false);
          // Optional: Show success message
        }}
      /> */}
    </>
  );
} 