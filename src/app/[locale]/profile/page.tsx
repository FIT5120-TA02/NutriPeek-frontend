'use client';

<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useState, useRef } from "react";
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
import { toast } from "sonner";
import { showConfirmDialog } from "@/components/ui/ConfirmDialog";
import storageService from "@/libs/StorageService";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
<<<<<<< HEAD
=======
import { motion } from "framer-motion";
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

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
<<<<<<< HEAD
=======
  const [mounted, setMounted] = useState(false);
  
  // New child form state
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newChildGender, setNewChildGender] = useState('');
  const [newChildAllergies, setNewChildAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState('');
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

  const CHILDREN_KEY = "user_children";

  useEffect(() => {
<<<<<<< HEAD
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved) setChildren(saved);
=======
    setMounted(true);
    document.body.className = "min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100";
    
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved) setChildren(saved);
    
    return () => {
      document.body.className = "";
    };
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
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
<<<<<<< HEAD
=======
  
  const toggleAllergy = (value: string) => {
    if (newChildAllergies.includes(value)) {
      setNewChildAllergies(newChildAllergies.filter(item => item !== value));
    } else {
      setNewChildAllergies([...newChildAllergies, value]);
    }
  };
  
  const handleAddChild = () => {
    const newChild: ChildProfile = {
      name: newChildName.trim(),
      age: newChildAge,
      gender: newChildGender,
      allergies: otherAllergy.trim() 
        ? [...newChildAllergies, otherAllergy.trim()] 
        : newChildAllergies,
    };

    if (!newChild.name || !newChild.age || !newChild.gender) {
      toast.error("Please complete all required fields.");
      return;
    }

    setChildren([...children, newChild]);
    storageService.setLocalItem(CHILDREN_KEY, [...children, newChild]);
    
    // Reset form
    setNewChildName('');
    setNewChildAge('');
    setNewChildGender('');
    setNewChildAllergies([]);
    setOtherAllergy('');
    
    toast.success("Child profile added successfully!");
  };
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f

  const allergyOptions = [
    "Peanut", "Milk", "Egg", "Soy", "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
  ];

<<<<<<< HEAD
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
=======
  // Food emojis for background
  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🥑", "🍞",
    "🍔", "🍉", "🍍", "🥗", "🥛", "🍗",
    "🍑", "🥒", "🍓", "🍊", "🥦", "🥝", "🍌",
    "🍆", "🥬", "🧀", "🥕", "🫐", "🍅", "🥭"
  ];

  // Generate random positions only on client-side
  const generateRandomEmojis = () => {
    if (!mounted) return [];
    
    // Create more emojis to make them more frequent
    const moreEmojis = [...emojis, ...emojis].slice(0, 30);
    
    return moreEmojis.map((emoji, index) => {
      const randomX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      const randomX2 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY2 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      
      // Calculate random size between 1 and 2.5
      const randomSize = 1 + Math.random() * 1.5;
      
      // Calculate random speed/duration between 12 and 25 seconds
      const randomDuration = 12 + Math.random() * 13;
      
      return (
        <motion.div
          key={`emoji-${index}`}
          className="fixed text-5xl select-none pointer-events-none"
          style={{
            zIndex: -1,
            fontSize: `${randomSize}rem`
          }}
          initial={{ 
            x: randomX, 
            y: -100,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            x: [randomX, randomX2, randomX],
            y: [0, randomY, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, randomSize * 60, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: randomDuration, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          {emoji}
        </motion.div>
      );
    });
  };

  // Create a floating emoji background component
  const FloatingEmojisBackground = () => {
    if (!mounted) return null;
    
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
        {generateRandomEmojis()}
      </div>
    );
  };

  return (
    <>
      {/* Floating Background */}
      <FloatingEmojisBackground />
      
      <div className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center mb-10 text-green-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Child Profiles
        </motion.h1>
        
        <motion.div 
          className="flex flex-col lg:flex-row gap-8 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Left column - Add Child Form */}
          <div className="lg:w-1/3 w-full flex-shrink-0">
            <Card className="w-full sticky top-20 backdrop-blur-sm bg-white/90 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Add New Child</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">Child Name</label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Enter child's name"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Age</label>
                  <Dropdown
                    value={newChildAge}
                    onChange={setNewChildAge}
                    placeholder="Select Age"
                    options={[5,6,7,8,9,10,11,12].map(num => ({
                      label: `${num} years`,
                      value: String(num),
                    }))}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Gender</label>
                  <Dropdown
                    value={newChildGender}
                    onChange={setNewChildGender}
                    placeholder="Select Gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {allergyOptions.map((item) => (
                      <span
                        key={item}
                        onClick={() => toggleAllergy(item)}
                        className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${
                          newChildAllergies.includes(item)
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={otherAllergy}
                    onChange={(e) => setOtherAllergy(e.target.value)}
                    placeholder="Enter other allergy if any"
                    className="mt-2 border rounded px-3 py-2 w-full"
                  />
                </div>

                <motion.button
                  onClick={handleAddChild}
                  whileHover={{ scale: 1.02, backgroundColor: "#22c55e" }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 w-full transition-colors"
                >
                  Save Child Profile
                </motion.button>
              </div>
            </Card>
          </div>
          
          {/* Right column - Profiles List */}
          <div className="lg:w-2/3 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-800">
                {children.length > 0 ? 'Saved Profiles' : 'No Profiles Yet'}
              </h2>
              
              {children.length > 0 && (
                <motion.button
                  onClick={handleClearAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="w-full backdrop-blur-sm bg-white/90 shadow-lg">
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
                            <motion.button 
                              onClick={handleSave} 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                            >
                              Save
                            </motion.button>
                            <motion.button 
                              onClick={handleCancel} 
                              whileHover={{ scale: 1.05 }}
                              className="text-gray-600 hover:underline"
                            >
                              Cancel
                            </motion.button>
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
                            <motion.button
                              onClick={() => handleEdit(index)}
                              whileHover={{ scale: 1.05 }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Edit
                            </motion.button>

                            <motion.button
                              onClick={() => handleDelete(index)}
                              whileHover={{ scale: 1.05 }}
                              className="text-sm text-red-500 hover:underline"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="w-full flex flex-col items-center justify-center py-12 px-4 bg-white/50 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500 text-lg mb-4">No child profiles available.</p>
                <p className="text-gray-500">Add a profile using the form on the left.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
>>>>>>> 6d97d02bb0e3e6d7b6542f3a5b20492d23cc701f
  );
}
