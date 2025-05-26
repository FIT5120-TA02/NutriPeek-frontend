'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'phosphor-react';
import { ChildProfile } from '@/components/Profile/types';
import Dropdown from '@/components/ui/Dropdown';
import AvatarSelector from '@/components/Profile/AvatarSelector';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { toast } from 'sonner';

interface AddProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: ChildProfile) => void;
}

/**
 * AddProfilePopup component
 * A popup that allows users to add new child profiles directly from the NutriScan page
 * Contains the form content inline for a cleaner, single-card design
 */
export default function AddProfilePopup({ isOpen, onClose, onAddProfile }: AddProfilePopupProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('7');
  const [gender, setGender] = useState('male');
  const [avatarNumber, setAvatarNumber] = useState(1);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Handle click on the background to close the popup
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the background, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !age || !gender) {
      toast.error("Please complete all required fields.");
      return;
    }
    
    const childData: ChildProfile = {
      name: name.trim(),
      age,
      gender,
      avatarNumber,
    };
    
    onAddProfile(childData);
    
    // Reset form
    setName('');
    setAge('7');
    setGender('male');
    setAvatarNumber(1);
    setShowAvatarSelector(false);

    // Close the popup
    onClose();
  };

  // Define age options
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-[2px] p-4 cursor-pointer"
          onClick={handleBackgroundClick}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto cursor-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the popup content
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <motion.h3 
                className="text-2xl font-bold text-green-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Add New Child Profile
              </motion.h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close popup"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Form Content */}
            <motion.div 
              className="p-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Avatar Preview and Selector */}
                <div className="flex flex-col items-center mb-2">
                  <div onClick={() => setShowAvatarSelector(!showAvatarSelector)}>
                    <ChildAvatar 
                      name={name || 'Preview'} 
                      gender={gender || 'male'} 
                      avatarNumber={avatarNumber}
                      size={100}
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
                      gender={gender || 'male'}
                      selectedAvatar={avatarNumber}
                      onSelect={setAvatarNumber}
                    />
                  </motion.div>
                )}
                
                {/* Name Field */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Child Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border rounded-lg pl-10 px-3 py-2.5 w-full focus:ring-2 focus:ring-green-300 focus:border-green-500 outline-none transition"
                      placeholder="Enter child's name"
                      required
                    />
                  </div>
                </div>

                {/* Age Field */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Age <span className="text-red-500">*</span></label>
                  <Dropdown
                    value={age}
                    onChange={setAge}
                    placeholder="Select Age"
                    options={ageOptions}
                    leadingIcon={(
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    )}
                  />
                </div>

                {/* Gender Field */}
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                  <Dropdown
                    value={gender}
                    onChange={(value) => {
                      setGender(value);
                      // Reset avatar number when gender changes
                      setAvatarNumber(1);
                    }}
                    placeholder="Select Gender"
                    options={genderOptions}
                    leadingIcon={genderOptions.find(option => option.value === gender)?.leadingIcon || (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, backgroundColor: "#22c55e" }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 w-full transition-colors font-medium text-lg shadow-md"
                >
                  Save Child Profile
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 