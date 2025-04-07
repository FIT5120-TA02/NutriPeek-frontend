'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { showConfirmDialog } from "@/components/ui/ConfirmDialog";
import storageService from "@/libs/StorageService";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

export default function ProfilePage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editChild, setEditChild] = useState<ChildProfile | null>(null);

  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved) setChildren(saved);
  }, []);

  const handleClearAll = async () => {
    const confirmed = await showConfirmDialog({
      message: "Are you sure you want to clear all saved child profiles?",
      header: "Clear All Profiles",
      onConfirm: () => {
        storageService.removeLocalItem(CHILDREN_KEY);
        setChildren([]);
        toast.success("All child profiles have been cleared successfully!");
      }
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditChild(children[index]);
  };

  const handleSave = () => {
    if (editChild && editingIndex !== null) {
      const updatedChildren = [...children];
      updatedChildren[editingIndex] = editChild;
      setChildren(updatedChildren);
      storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
      setEditingIndex(null);
      setEditChild(null);
      toast.success("Child profile updated successfully!");
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditChild(null);
  };

  const handleDelete = async (index: number) => {
    const confirmed = await showConfirmDialog({
      message: "Are you sure you want to delete this child's profile?",
      header: "Delete Child",
      onConfirm: () => {
        const updatedChildren = [...children];
        updatedChildren.splice(index, 1);
        setChildren(updatedChildren);
        storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
        toast.success("Child profile deleted successfully!");
      }
    });
  };

  const allergyOptions = [
    "Peanut", "Milk", "Egg", "Soy", "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
  ];

  return (
    <div className="w-full flex flex-col items-center px-4 pt-16">
      <h1 className="text-3xl font-bold text-center mb-8">Child Profiles</h1>

      {children.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {children.map((child, index) => (
            <Card key={index}>
              {editingIndex === index ? (
                <div className="space-y-4">
                  <input
                    value={editChild?.name || ''}
                    onChange={(e) => setEditChild(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Name"
                  />
                  <Dropdown
                    value={editChild?.age || ''}
                    onChange={(value) => setEditChild(prev => prev ? { ...prev, age: value } : null)}
                    options={[5,6,7,8,9,10,11,12].map(num => ({ label: `${num} years`, value: String(num) }))}
                    placeholder="Select Age"
                  />
                  <Dropdown
                    value={editChild?.gender || ''}
                    onChange={(value) => setEditChild(prev => prev ? { ...prev, gender: value } : null)}
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" }
                    ]}
                    placeholder="Select Gender"
                  />
                  <div>
                    <p className="font-semibold text-sm mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {allergyOptions.map((item) => (
                        <span
                          key={item}
                          onClick={() => {
                            if (editChild?.allergies.includes(item)) {
                              setEditChild(prev => prev ? { ...prev, allergies: prev.allergies.filter(a => a !== item) } : null);
                            } else {
                              setEditChild(prev => prev ? { ...prev, allergies: [...prev.allergies, item] } : null);
                            }
                          }}
                          className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${
                            editChild?.allergies.includes(item)
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Save
                    </button>
                    <button onClick={handleCancel} className="text-gray-600 hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2 text-green-700">{child.name}</h2>
                  <p><strong>Age:</strong> {child.age} years</p>
                  <p><strong>Gender:</strong> {child.gender}</p>
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Allergies:</p>
                    <div className="flex flex-wrap gap-2">
                      {child.allergies.length > 0 ? (
                        child.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No allergies recorded</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(index)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg mb-12">No child profiles available.</p>
      )}

      <button
        onClick={handleClearAll}
        className="bg-red-500 text-white font-semibold py-3 px-8 rounded-full hover:bg-red-600 transition-all duration-300 text-lg"
      >
        Clear All Profiles
      </button>
    </div>
  );
}
