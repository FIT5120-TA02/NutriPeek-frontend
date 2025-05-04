'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProfileListProps } from './types';
import ProfileCard from './ProfileCard';

/**
 * ProfileList component
 * Displays a list of child profiles with option to clear all
 */
export default function ProfileList({ children, onEdit, onDelete, onClearAll, editingIndex, onSave }: ProfileListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-green-800">
          {children.length > 0 ? 'Saved Profiles' : 'No Profiles Yet'}
        </h2>
        
        {children.length > 0 && (
          <motion.button
            onClick={onClearAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1 px-3 py-1 rounded-full border border-red-200 hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear All
          </motion.button>
        )}
      </div>
      
      {children.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-full"
            >
              <ProfileCard 
                child={child}
                onEdit={() => onEdit(index)}
                onDelete={() => onDelete(index)}
                isEditing={editingIndex === index}
                onSave={onSave ? (updatedChild) => onSave(updatedChild) : undefined}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="w-full flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-green-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-green-700 mb-2">No profiles yet</h3>
          <p className="text-gray-600 text-center max-w-xs">
            Create a child profile using the form to start personalizing their nutrition experience.
          </p>
        </motion.div>
      )}
    </div>
  );
} 