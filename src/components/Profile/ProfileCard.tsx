'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import ChildAvatar from '@/components/ui/ChildAvatar';
import { ProfileCardProps, ChildProfile } from './types';
import EditProfileForm from './EditProfileForm';

/**
 * ProfileCard component
 * Displays a child profile card with avatar and details
 */
export default function ProfileCard({
  child,
  onEdit,
  onDelete,
  isEditing = false,
  onSave,
}: ProfileCardProps) {
  // Local editing state to handle form display
  const [isEditingLocal, setIsEditingLocal] = React.useState(false);

  // Update local state when prop changes
  React.useEffect(() => {
    setIsEditingLocal(isEditing);
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditingLocal(true);
    onEdit();
  };

  const handleSave = (updatedChild: ChildProfile) => {
    setIsEditingLocal(false);
    if (onSave) {
      onSave(updatedChild);
    }
  };

  const handleCancel = () => {
    setIsEditingLocal(false);
  };

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        isEditingLocal ? 'ring-2 ring-green-500 shadow-lg' : ''
      }`}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {isEditingLocal ? (
        <div className="p-5">
          <EditProfileForm 
            child={child}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-800 truncate">{child.name}</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-shrink-0">
              <ChildAvatar 
                name={child.name} 
                gender={child.gender}
                avatarNumber={child.avatarNumber || 1} 
                size={80}
              />
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="space-y-1 text-gray-600 text-sm">
                <p><span className="font-medium">Age:</span> {child.age} years</p>
                <p><span className="font-medium">Gender:</span> {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={handleEditClick}
              className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
} 