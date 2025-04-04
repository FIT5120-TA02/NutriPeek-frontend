'use client';

import { useState } from 'react';

interface ChildProfile {
  name: string;
  age: string;
  gender: string;
  allergies: string[];
}

interface CardProps {
  child: ChildProfile;
  onUpdate: (updatedChild: ChildProfile) => void;
}

const allergyOptions = [
  "Peanut", "Milk", "Egg", "Soy", 
  "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
];

export default function Card({ child, onUpdate }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age);
  const [gender, setGender] = useState(child.gender);
  const [allergies, setAllergies] = useState(child.allergies);
  const [otherAllergy, setOtherAllergy] = useState('');

  const toggleAllergy = (item: string) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter((a) => a !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const handleSave = () => {
    let finalAllergies = [...allergies];
    if (otherAllergy.trim()) finalAllergies.push(otherAllergy.trim());

    onUpdate({ name, age, gender, allergies: finalAllergies });
    setOtherAllergy('');
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 w-full md:w-80">
      {isEditing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Name"
          />
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          >
            <option value="">Select Age</option>
            {[5,6,7,8,9,10,11,12].map((num) => (
              <option key={num} value={num}>{num} years</option>
            ))}
          </select>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <label className="font-semibold text-sm">Allergies</label>
          <div className="flex flex-wrap gap-2 my-2">
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
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Other allergy"
          />

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </>
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
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
