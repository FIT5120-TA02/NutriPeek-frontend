'use client';

import Link from 'next/link';


export default function HomePage() {
  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🍤", "🥑", "🍞",
    "🍔", "🍟", "🍉", "🍍", "🍚", "🥗", "🥛", "🍗",
    "🍑", "🥒", "🍓", "🍊"
  ];

  return (
    <div className="text-center space-y-6">
      <h1 className="text-5xl font-extrabold mb-4 text-black">
        NUTRIPEEK
      </h1>

      <p className="text-xl font-semibold text-gray-700 leading-relaxed">
        Peek inside your fridge. Pack smarter lunches.
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mt-4">
        {emojis.map((emoji, index) => (
          <span key={index} className="text-2xl animate-bounce">
            {emoji}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/homepage" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-all">
          Get Started Now
        </Link>
      </div>
    </div>
  );
}
