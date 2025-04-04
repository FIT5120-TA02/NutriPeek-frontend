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

const allergyOptions = [
  "Peanut", "Milk", "Egg", "Soy", 
  "Wheat", "Fish", "Shellfish", "Tree nuts", "Chicken", "Celery"
];

export default function ProfilePage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const CHILDREN_KEY = "user_children";

  useEffect(() => {
    const saved = storageService.getLocalItem({ key: CHILDREN_KEY, defaultValue: [] });
    if (saved) setChildren(saved);
  }, []);

  const handleSave = (index: number, updatedChild: ChildProfile) => {
    const updatedChildren = [...children];
    updatedChildren[index] = updatedChild;
    setChildren(updatedChildren);
    storageService.setLocalItem(CHILDREN_KEY, updatedChildren);
    setEditIndex(null);
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
              title={child.name}
              actions={
                editIndex === index ? null : (
                  <button
                    onClick={() => setEditIndex(index)}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Edit
                  </button>
                )
              }
            >
              {editIndex === index ? (
                <EditForm
                  initialData={child}
                  onSave={(updatedChild) => handleSave(index, updatedChild)}
                  onCancel={() => setEditIndex(null)}
                />
              ) : (
                <>
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
                </>
              )}
            </Card>
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

function EditForm({
  initialData,
  onSave,
  onCancel
}: {
  initialData: ChildProfile;
  onSave: (updated: ChildProfile) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData.name);
  const [age, setAge] = useState(initialData.age);
  const [gender, setGender] = useState(initialData.gender);
  const [allergies, setAllergies] = useState(initialData.allergies);
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

    onSave({
      name,
      age,
      gender,
      allergies: finalAllergies
    });
  };

  return (
    <div className="flex flex-col space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-3 py-2"
        placeholder="Name"
      />
      <select
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select Age</option>
        {[5,6,7,8,9,10,11,12].map(num => (
          <option key={num} value={num}>{num} years</option>
        ))}
      </select>
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <div>
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
          placeholder="Other allergy"
          className="w-full border rounded px-3 py-2 mt-2"
        />
      </div>

      <div className="flex gap-4 mt-2">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
