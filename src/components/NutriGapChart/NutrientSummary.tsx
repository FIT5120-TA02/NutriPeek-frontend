'use client';

interface NutrientSummaryProps {
  results: any;
  childName?: string;
  childGender?: string;
  onViewRecommendations?: () => void;
}

export default function NutrientSummary({ results, childName, childGender, onViewRecommendations }: NutrientSummaryProps) {
  const avatarGradient = childGender?.toLowerCase() === 'female'
    ? 'from-pink-400 to-pink-600'
    : 'from-blue-500 to-blue-700';

  return (
    <div className="flex flex-col items-center rounded-xl p-8 mb-6 bg-white">
      {/* Avatar Circle */}
      <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r ${avatarGradient} rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold mb-6`}>
        {childName || 'Child'}
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-blue-600 mb-1">Total Calories</p>
          <p className="text-2xl font-bold">{results?.total_calories?.toFixed(1) || 0} kJ</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-red-600 mb-1">Missing Nutrients</p>
          <p className="text-2xl font-bold">{results?.missing_nutrients?.length || 0}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <p className="text-sm text-amber-600 mb-1">Excess Nutrients</p>
          <p className="text-2xl font-bold">{results?.excess_nutrients?.length || 0}</p>
        </div>
      </div>

      {/* View Full Recommendations Button */}
      <div className="w-full flex justify-center">
        <button
          onClick={onViewRecommendations}
          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-lg font-semibold"
        >
          View More Recommendations
        </button>
      </div>
    </div>
  );
}
