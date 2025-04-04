"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WelcomePage({ params }: Props) {
  const { locale } = await params;

  const emojis = [
    "🍎", "🥑", "🍪", "🍜", "🥗", "🍓", "🍊", "🍞",
    "🥥", "🥛", "🥦", "🍇", "🧃", "🍲", "🍗", "🥬",
    "🍖", "🥒", "🍉", "🥕"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-extrabold font-serif mb-4 text-black">
        LUNCHMATE
      </h1>

      <p className="text-xl font-medium text-black leading-loose mb-10">
        plan healthy<br />
        and fun<br />
        lunches for<br />
        your<br />
        children
      </p>

      <div className="relative w-[300px] h-[150px] mb-10">
        {emojis.map((emoji, index) => {
          const angle = (Math.PI * index) / (emojis.length - 1); 
          const radius = 120;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          return (
            <span
              key={index}
              className="absolute text-2xl md:text-3xl animate-bounce hover:scale-125 transition-transform duration-300 ease-in-out"
              style={{
                left: `${150 + x - 12}px`,
                top: `${y}px`,
              }}
            >
              {emoji}
            </span>
          );
        })}
      </div>

      <Link href={`/${locale}/homepage`}>
        <Button
          className="text-lg px-8 py-5 rounded-full bg-green-200 text-green-800 hover:bg-green-300 shadow-md hover:shadow-lg font-semibold transition-all duration-300 ease-in-out"
        >
          Get Started Now
        </Button>
      </Link>
    </div>
  );
}
