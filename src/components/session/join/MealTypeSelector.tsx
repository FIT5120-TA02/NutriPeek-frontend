import React from "react";
import { MealType } from "../../../api/types";

interface MealTypeSelectorProps {
  selectedMealType: MealType;
  onChange: (mealType: MealType) => void;
  disabled: boolean;
}

const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedMealType,
  onChange,
  disabled,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Meal Type</label>
      <div className="grid grid-cols-3 gap-3">
        {(["breakfast", "lunch", "dinner"] as const).map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`py-3 px-4 rounded-lg border transition-colors ${
              selectedMealType === type
                ? "bg-blue-100 border-blue-500 text-blue-800"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            disabled={disabled}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MealTypeSelector;
