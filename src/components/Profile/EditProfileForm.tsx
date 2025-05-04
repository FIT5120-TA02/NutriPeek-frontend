'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import { EditProfileFormProps } from './types';
import AvatarSelector from './AvatarSelector';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { toast } from 'sonner';

/**
 * EditProfileForm component
 * Form for editing existing child profiles
 */
export default function EditProfileForm({ child, onSave, onCancel }: EditProfileFormProps) {
  const [editedChild, setEditedChild] = useState({ ...child });
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const handleChange = (field: keyof typeof editedChild, value: string | number) => {
    setEditedChild(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset avatar when gender changes
    if (field === 'gender' && value !== editedChild.gender) {
      setEditedChild(prev => ({
        ...prev,
        avatarNumber: 1
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!editedChild.name.trim() || !editedChild.age || !editedChild.gender) {
      toast.error("Please complete all required fields.");
      return;
    }
    
    // Ensure we're passing a clean object with trimmed name
    const cleanedChild = {
      ...editedChild,
      name: editedChild.name.trim()
    };
    
    onSave(cleanedChild);
  };

  // Define age options with icons
  const ageOptions = [5, 6, 7, 8, 9, 10, 11, 12].map(num => ({
    label: `${num} years`,
    value: String(num),
  }));
  
  // Define gender options with icons
  const genderOptions = [
    { 
      label: "Male", 
      value: "male",
      leadingIcon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-5 h-5 text-indigo-600" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="10" cy="14" r="5" />
          <path d="M21 3L13 11" />
          <path d="M16 3H21V8" />
        </svg>
      )
    },
    { 
      label: "Female", 
      value: "female",
      leadingIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14V20" />
          <path d="M9 17H15" />
        </svg>
      )
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Preview and Selector */}
      <div className="flex flex-col items-center mb-2">
        <div onClick={() => setShowAvatarSelector(!showAvatarSelector)}>
          <ChildAvatar 
            name={editedChild.name} 
            gender={editedChild.gender} 
            avatarNumber={editedChild.avatarNumber}
            size={120}
            clickable
          />
        </div>
        <button 
          type="button"
          className="mt-2 text-sm text-blue-600 hover:underline"
          onClick={() => setShowAvatarSelector(!showAvatarSelector)}
        >
          {showAvatarSelector ? 'Hide Options' : 'Change Avatar'}
        </button>
      </div>
      
      {/* Avatar Selector */}
      {showAvatarSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <AvatarSelector 
            gender={editedChild.gender}
            selectedAvatar={editedChild.avatarNumber}
            onSelect={(avatarNum) => handleChange('avatarNumber', avatarNum)}
          />
        </motion.div>
      )}
      
      {/* Form Fields */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Child Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={editedChild.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="border rounded-lg pl-10 px-3 py-2.5 w-full focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition"
            placeholder="Name"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Age</label>
        <Dropdown
          value={editedChild.age}
          onChange={(value) => handleChange('age', value)}
          options={ageOptions}
          placeholder="Select Age"
          leadingIcon={(
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          )}
        />
      </div>
      
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Gender</label>
        <Dropdown
          value={editedChild.gender}
          onChange={(value) => handleChange('gender', value)}
          options={genderOptions}
          placeholder="Select Gender"
          leadingIcon={genderOptions.find(option => option.value === editedChild.gender)?.leadingIcon || (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <motion.button 
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-500 text-white px-5 py-2.5 rounded-full hover:bg-green-600 flex-1 font-medium"
        >
          Save
        </motion.button>
        <motion.button 
          type="button"
          onClick={onCancel} 
          whileHover={{ scale: 1.05 }}
          className="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-full hover:bg-gray-100 flex-1"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
} 