"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Props = {
  params: {
    locale: string;
  };
};

export default function WelcomePage({ params }: Props) {
  const { locale } = params;
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

      <p className="text-xl font-medium text-black leading-relaxed mb-6 whitespace-pre-line">
        {"plan healthy\nand fun\nlunches for\nyour\nchildren"}
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-xl">
        {emojis.map((emoji, index) => (
          <span key={index} className="text-2xl md:text-3xl">{emoji}</span>
        ))}
      </div>

      <Link href={`/${locale}/homepage`}>
        <Button
          className="text-lg px-8 py-5 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
        >
          Get Started Now
        </Button>
      </Link>
    </div>
  );
}