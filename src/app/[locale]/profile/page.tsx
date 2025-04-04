'use client';

import { useEffect, useState } from "react";
import storageService from "@/libs/StorageService";
import Card from "@/components/ui/Card";

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

export default function ProfilePage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved) setChildren(saved);
  }, []);

  const handleUpdate = (index: number, updatedChild: ChildProfile) => {
    const updatedChildren = [...children];
    updatedChildren[index] = updatedChild;
    setChildren(updatedChildren);
    storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all saved child profiles?")) {
      storageService.removeLocalItem(CHILDREN_KEY);
      setChildren([]);
      alert("All child profiles have been cleared.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-16">
      <h1 className="text-3xl font-bold text-center mb-8">Child Profiles</h1>

      {children.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {children.map((child, index) => (
            <Card
              key={index}
              child={child}
              onUpdate={(updated) => handleUpdate(index, updated)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg mb-12">No child profiles available.</p>
      )}

      <button
        onClick={handleClear}
        className="bg-red-500 text-white font-semibold py-3 px-8 rounded-full hover:bg-red-600 transition-all duration-300 text-lg"
      >
        Clear All Profiles
      </button>
    </div>
  );
}
