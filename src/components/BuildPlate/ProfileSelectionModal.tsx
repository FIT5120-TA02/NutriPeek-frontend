import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X } from 'phosphor-react';
import storageService from '@/libs/StorageService';
import { ChildProfile } from '@/types/profile';

interface ProfileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSelect: (profile: ChildProfile, index: number) => void;
  selectedProfileIndex: number;
  onConfirm: () => void;
}

export default function ProfileSelectionModal({
  isOpen,
  onClose,
  onProfileSelect,
  selectedProfileIndex,
  onConfirm
}: ProfileSelectionModalProps) {
  const router = useRouter();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState<number>(selectedProfileIndex);
  
  const CHILDREN_KEY = "user_children";

  // Load child profiles
  useEffect(() => {
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved && saved.length > 0) {
      setChildProfiles(saved);
    }
  }, []);

  // When profiles are loaded or index changes, notify parent
  useEffect(() => {
    if (childProfiles.length > 0 && currentProfileIndex < childProfiles.length) {
      onProfileSelect(childProfiles[currentProfileIndex], currentProfileIndex);
    }
  }, [childProfiles, currentProfileIndex, onProfileSelect]);

  // Navigate to previous profile
  const handlePrevProfile = () => {
    if (childProfiles.length === 0) return;
    const newIndex = currentProfileIndex === 0 ? childProfiles.length - 1 : currentProfileIndex - 1;
    setCurrentProfileIndex(newIndex);
  };

  // Navigate to next profile
  const handleNextProfile = () => {
    if (childProfiles.length === 0) return;
    const newIndex = currentProfileIndex === childProfiles.length - 1 ? 0 : currentProfileIndex + 1;
    setCurrentProfileIndex(newIndex);
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Render current profile card
  const renderCurrentProfile = () => {
    if (childProfiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2 text-center">No child profiles available</p>
          <button
            onClick={() => router.push('/Profile')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
          >
            Create a Profile
          </button>
        </div>
      );
    }

    const profile = childProfiles[currentProfileIndex];
    return (
      <div className="flex flex-col items-center px-4">
        <motion.div 
          key={profile.name} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-md w-full"
        >
          <h3 className="text-xl font-semibold text-indigo-700 text-center mb-3">{profile.name}</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{profile.age} years</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium">{profile.gender}</span>
            </div>
            
            <div className="mt-3">
              <span className="text-gray-600 block mb-1">Allergies:</span>
              <div className="flex flex-wrap gap-1">
                {profile.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No allergies recorded</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        <p className="text-center text-gray-500 mt-3 text-sm">
          Analysis will be personalized for {profile.name}
        </p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-gray-600/50 to-gray-800/50 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-indigo-700 mb-6 text-center">
              Select Child Profile for Nutrition Analysis
            </h2>
            
            <div className="mb-6">
              {/* Carousel navigation */}
              {childProfiles.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={handlePrevProfile}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    disabled={childProfiles.length <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    {childProfiles.length > 0 ? `${currentProfileIndex + 1}/${childProfiles.length}` : ''}
                  </span>
                  
                  <button 
                    onClick={handleNextProfile}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    disabled={childProfiles.length <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Profile card */}
              <div className="py-4 min-h-[200px] flex items-center justify-center">
                {renderCurrentProfile()}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              {childProfiles.length === 0 ? (
                <button
                  onClick={() => router.push('/Profile')}
                  className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleConfirm}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
                    disabled={childProfiles.length === 0}
                  >
                    Confirm & View Nutrition
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 