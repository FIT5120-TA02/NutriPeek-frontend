'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    document.body.className = "min-h-screen flex flex-col bg-gradient-to-b from-green-200 via-blue-200 to-purple-200";
    return () => {
      document.body.className = "min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50";
    };
  }, []);

  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🍤", "🥑", "🍞",
    "🍔", "🍟", "🍉", "🍍", "🍚", "🥗", "🥛", "🍗",
    "🍑", "🥒", "🍓", "🍊"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.h1 
        className="text-5xl font-extrabold mb-4 text-black drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        NUTRIPEEK
      </motion.h1>

      <p className="text-xl font-semibold text-gray-700 leading-relaxed">
        Peek inside your fridge. Pack smarter lunches.
      </p>

      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mt-6">
        {emojis.map((emoji, index) => (
          <motion.span
            key={index}
            className="text-3xl md:text-4xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <motion.div 
        className="mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link href={`/PasswordGate`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-8 rounded-full shadow-lg hover:shadow-2xl text-lg font-semibold transition-all duration-300 ease-in-out"
          >
            Get Started Now
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
