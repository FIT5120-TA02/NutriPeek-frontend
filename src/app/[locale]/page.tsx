"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/utils/hooks/useStorage";
import { USER_INFO } from "@/utils/StorageKeys";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function WelcomePage({ params }: Props) {
  const [userInfo, setUserInfo, removeUserInfo] = useLocalStorage(USER_INFO);
  const [locale, setLocale] = useState<string>("en");

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const { locale: resolvedLocale } = await params;
      setLocale(resolvedLocale);
    };
    resolveParams();
  }, [params]);

  // Demo function to save user info
  const handleStartClick = () => {
    // Example: save a demo user info
    setUserInfo({
      id: "demo-user-123",
      name: "Demo User",
      age: 35,
      gender: "other"
    });
    console.log("User info saved:", userInfo);
  };

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
          onClick={handleStartClick}
          className="text-lg px-8 py-5 rounded-full bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg font-semibold transition-all"
        >
          Get Started Now
        </Button>
      </Link>
    </div>
  );
}