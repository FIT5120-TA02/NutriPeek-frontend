'use client';

import { useState, useEffect } from "react";
import storageService from "@/libs/StorageService";

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

export default function HomePage() {
  const [childName, setChildName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [otherAllergy, setOtherAllergy] = useState<string>('');

  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    // Nothing to load initially, just keep the form empty
  }, []);

  const handleSave = () => {
    const newChild: ChildProfile = {
      name: childName.trim(),
      age,
      gender,
      allergies: otherAllergy.trim() ? [...allergies, otherAllergy.trim()] : allergies,
    };

    if (!newChild.name || !newChild.age || !newChild.gender) {
      alert("Please complete all required fields.");
      return;
    }

    const existingChildren = storageService.getLocalItem<ChildProfile[]>({
      key: CHILDREN_KEY,
      defaultValue: [],
    }) || [];

    const updatedChildren = [...existingChildren, newChild];

    storageService.setLocalItem(CHILDREN_KEY, updatedChildren);

    alert("Child information saved!");

    // Clear the form
    setChildName('');
    setAge('');
    setGender('');
    setAllergies([]);
    setOtherAllergy('');
  };

  const allergyOptions = [
    "Peanut", "Milk", "Egg", "Soy", 
    "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
  ];

  const toggleAllergy = (value: string) => {
    if (allergies.includes(value)) {
      setAllergies(allergies.filter(item => item !== value));
    } else {
      setAllergies([...allergies, value]);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Child Information</h1>

      <div className="space-y-4">
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

        <div>
          <label className="block mb-1 font-semibold">Age</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Age</option>
            {[5,6,7,8,9,10,11,12].map((num) => (
              <option key={num} value={String(num)}>{num} years</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

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

          <input
            type="text"
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            placeholder="Enter other allergy if any"
            className="mt-2 border rounded px-3 py-2 w-full"
          />
        </div>

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
