'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { showConfirmDialog } from "@/components/ui/ConfirmDialog";
import storageService from "@/libs/StorageService";
import { motion } from "framer-motion";
import FloatingEmojisLayout from "@/components/layouts/FloatingEmojisLayout";
import { ProfileForm, ProfileList, ChildProfile } from "@/components/Profile";

// Storage key for child profiles
const CHILDREN_KEY = "user_children";

// Type for compatibility with old profile data
interface LegacyChildProfile {
  name: string;
  age: string;
  gender: string;
  avatarNumber?: number;
}

/**
 * ProfilePage Component
 * Child profile management page for creating, viewing, editing, and deleting child profiles
 * Uses a modular component structure with separate components for form, list, and cards
 */
export default function ProfilePage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editChild, setEditChild] = useState<ChildProfile | null>(null);

  // Load saved children profiles from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = storageService.getLocalItem<LegacyChildProfile[]>({ key: CHILDREN_KEY, defaultValue: [] });
      if (saved && saved.length > 0) {
        // Ensure all children have the avatarNumber property
        const updatedChildren = saved.map(child => ({
          ...child,
          avatarNumber: child.avatarNumber || 1
        }));
        setChildren(updatedChildren as ChildProfile[]);
        storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
      }
    }
  }, []);

  /**
   * Handles clearing all child profiles
   */
  const handleClearAll = async () => {
    await showConfirmDialog({
      message: "Are you sure you want to clear all saved child profiles?",
      header: "Clear All Profiles",
      onConfirm: () => {
        storageService.removeLocalItem(CHILDREN_KEY);
        setChildren([]);
        toast.success("All child profiles have been cleared successfully!");
      },
      confirmLabel: "Clear All",
      confirmButtonClass: "bg-red-600 border-none hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
    });
  };

  /**
   * Handles editing a child profile
   */
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditChild(children[index]);
  };

  /**
   * Handles saving an edited child profile
   */
  const handleSave = (updatedChild: ChildProfile) => {
    if (editingIndex !== null) {
      const updatedChildren = [...children];
      updatedChildren[editingIndex] = updatedChild;
      setChildren(updatedChildren);
      storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
      setEditingIndex(null);
      setEditChild(null);
      toast.success("Child profile updated successfully!");
    }
  };

  /**
   * Handles canceling an edit
   */
  const handleCancel = () => {
    setEditingIndex(null);
    setEditChild(null);
  };

  /**
   * Handles deleting a child profile
   */
  const handleDelete = async (index: number) => {
    await showConfirmDialog({
      message: "Are you sure you want to delete this child's profile?",
      header: "Delete Child",
      onConfirm: () => {
        const updatedChildren = [...children];
        updatedChildren.splice(index, 1);
        setChildren(updatedChildren);
        storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
        toast.success("Child profile deleted successfully!");
      },
      confirmLabel: "Delete",
      confirmButtonClass: "bg-red-600 border-none hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors"
    });
  };
  
  /**
   * Handles adding a new child profile
   */
  const handleAddChild = (newChild: ChildProfile) => {
    setChildren([...children, newChild]);
    storageService.setLocalItem(CHILDREN_KEY, [...children, newChild]);
    toast.success("Child profile added successfully!");
  };

  return (
    <FloatingEmojisLayout>
      <div className="w-full max-w-6xl mx-auto px-4 pt-20 md:pt-24 pb-16 flex flex-col items-center justify-center min-h-screen">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-green-700 mt-2 md:mt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Child Profiles
        </motion.h1>
        
        <motion.div 
          className="flex flex-col lg:flex-row gap-6 md:gap-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Left column - Add Child Form */}
          <div className="lg:w-1/3 w-full flex-shrink-0">
            <ProfileForm onAddChild={handleAddChild} />
          </div>
          
          {/* Right column - Profiles List */}
          <div className="lg:w-2/3 w-full">
            <ProfileList
              children={children}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClearAll={handleClearAll}
              editingIndex={editingIndex}
              onSave={handleSave}
            />
          </div>
        </motion.div>
      </div>
    </FloatingEmojisLayout>
  );
}