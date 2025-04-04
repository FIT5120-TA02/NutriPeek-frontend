'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function WelcomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🍤", "🥑", "🍞",
    "🍔", "🍟", "🍉", "🍍", "🍚", "🥗", "🥛", "🍗",
    "🍑", "🥒", "🍓", "🍊"
  ];

  return (
    <div className="text-center space-y-6">
      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-4 text-black">
        NUTRIPEEK
      </h1>

      {/* Subtitle */}
      <p className="text-xl font-semibold text-gray-700 leading-relaxed">
        Peek inside your fridge. Pack smarter lunches.
      </p>

      {/* Emojis */}
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

      {/* Get Started Button */}
      <div className="mt-6">
        <Link href={`/${locale}/homepage`}>
          <Button
            className="text-lg px-8 py-5 rounded-full bg-green-200 text-green-800 hover:bg-green-300 shadow-md hover:shadow-lg font-semibold transition-all duration-300 ease-in-out"
          >
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
