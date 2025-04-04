'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";


export default async function WelcomePage({ params }: Props) {
  const { locale } = await params;
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
          <span
            key={index}
            className="text-2xl md:text-3xl animate-bounce hover:scale-125 transition-transform duration-300 ease-in-out"
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Show user info if available */}
      {userInfo && userInfo.name && (
        <div className="mb-4 p-3 bg-white/80 rounded-lg shadow-sm">
          <p className="text-sm">Welcome back, <strong>{userInfo.name}</strong>!</p>
          <button 
            onClick={removeUserInfo} 
            className="text-xs text-red-500 mt-1 hover:underline"
          >
            Clear user data
          </button>
        </div>
      )}

      <Link href={`/${locale}/homepage`}>
        <Button
          className="text-lg px-8 py-5 rounded-full bg-green-200 text-green-800 hover:bg-green-300 shadow-md hover:shadow-lg font-semibold transition-all duration-300 ease-in-out"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
}