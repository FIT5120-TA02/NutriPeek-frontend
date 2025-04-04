'use client';

import { useState, useEffect } from "react";
import storageService from "@/libs/StorageService";
import Dropdown from "@/components/ui/Dropdown";

// Define the structure of a child's profile
interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

// Main component for managing child information form
export default async function ChildInfoPage() {
  // State variables to manage form input fields
  const [childName, setChildName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState<string>('');

  // LocalStorage key
  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    // Placeholder for any side effects on mount (currently empty)
  }, []);

  // Save child information into localStorage
  const handleSave = () => {
    const newChild: ChildProfile = {
      name: childName.trim(),
      age,
      gender,
      allergies: otherAllergy.trim() ? [...allergies, otherAllergy.trim()] : allergies,
    };

    // Basic form validation
    if (!newChild.name || !newChild.age || !newChild.gender) {
      alert("Please complete all required fields.");
      return;
    }

    // Retrieve existing children profiles from localStorage
    const existingChildren = storageService.getLocalItem<ChildProfile[]>({
      key: CHILDREN_KEY,
      defaultValue: [],
    }) || [];

    // Update the list with the new child
    const updatedChildren = [...existingChildren, newChild];

    // Save updated list back to localStorage
    storageService.setLocalItem(CHILDREN_KEY, updatedChildren);

    alert("Child information saved!");

    // Clear form fields after saving
    setChildName('');
    setAge('');
    setGender('');
    setAllergies([]);
    setOtherAllergy('');
  };

  // Predefined allergy options
  const allergyOptions = [
    "Peanut", "Milk", "Egg", "Soy", 
    "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
  ];

  // Toggle selected allergy
  const toggleAllergy = (value: string) => {
    if (allergies.includes(value)) {
      setAllergies(allergies.filter(item => item !== value));
    } else {
      setAllergies([...allergies, value]);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center mb-6">Child Information</h1>

      <div className="space-y-4">
        {/* Child Name Input */}
        <div>
          <label className="block mb-1 font-semibold">Child Name</label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter child's name"
          />
        </div>

        {/* Age Selection using Dropdown */}
        <div>
          <label className="block mb-1 font-semibold">Age</label>
          <Dropdown
            value={age}
            onChange={setAge}
            placeholder="Select Age"
            options={[5,6,7,8,9,10,11,12].map(num => ({
              label: `${num} years`,
              value: String(num),
            }))}
          />
        </div>

        {/* Gender Selection using Dropdown */}
        <div>
          <label className="block mb-1 font-semibold">Gender</label>
          <Dropdown
            value={gender}
            onChange={setGender}
            placeholder="Select Gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />
        </div>

        {/* Allergy Multi-Select */}
        <div>
          <label className="block mb-1 font-semibold">Allergies</label>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map((item) => (
              <span
                key={item}
                onClick={() => toggleAllergy(item)}
                className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${
                  allergies.includes(item)
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Manual Input for Other Allergy */}
          <input
            type="text"
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            placeholder="Enter other allergy if any"
            className="mt-2 border rounded px-3 py-2 w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSave}
          className="mt-6 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
        >
          Save Child Information
        </button>
      </div>
    </div>
  );
}
