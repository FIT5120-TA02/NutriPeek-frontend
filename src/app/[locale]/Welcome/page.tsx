'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Baby, CameraRotate, UsersThree, ArrowCircleRight } from 'phosphor-react';
import nutriPeekLogo from '@/../public/nutripeek.png';

export default function WelcomePage() {
  const router = useRouter();
  const [showNavbar, setShowNavbar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.className = "min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100";
    const timer = setTimeout(() => setShowNavbar(true), 2000);
    
    return () => {
      document.body.className = "";
      clearTimeout(timer);
    };
  }, []);

  const emojis = [
    "🍇", "🍎", "🍪", "🍕", "🍣", "🥑", "🍞",
    "🍔", "🍉", "🍍", "🥗", "🥛", "🍗",
    "🍑", "🥒", "🍓", "🍊", "🥦", "🥝", "🍌",
    "🍆", "🥬", "🧀", "🥕", "🫐", "🍅", "🥭"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Generate random positions only on client-side
  const generateRandomEmojis = () => {
    if (!mounted) return [];
    
    // Create more emojis to make them more frequent
    const moreEmojis = [...emojis, ...emojis, ...emojis].slice(0, 50);
    
    return moreEmojis.map((emoji, index) => {
      const randomX = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      const randomX2 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
      const randomY2 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight * 2 : 2000);
      
      // Calculate random size between 1 and 2.5
      const randomSize = 1 + Math.random() * 1.5;
      
      // Calculate random speed/duration between 12 and 25 seconds
      const randomDuration = 12 + Math.random() * 13;
      
      return (
        <motion.div
          key={`emoji-${index}`}
          className="fixed text-5xl select-none pointer-events-none"
          style={{
            zIndex: -1,
            fontSize: `${randomSize}rem`
          }}
          initial={{ 
            x: randomX, 
            y: -100,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            x: [randomX, randomX2, randomX],
            y: [0, randomY, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, randomSize * 60, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: randomDuration, 
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          {emoji}
        </motion.div>
      );
    });
  };

  // Create a floating emoji background component
  const FloatingEmojisBackground = () => {
    if (!mounted) return null;
    
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
        {generateRandomEmojis()}
      </div>
    );
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 bg-gradient-to-b from-green-50 to-green-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
      >
        {/* Floating Background - Available throughout the page */}
        <FloatingEmojisBackground />

        <motion.div 
          className="flex items-center mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <Image
            src={nutriPeekLogo}
            alt="NutriPeek Logo"
            width={70}
            height={70}
            className="object-contain mr-3"
            priority
          />
          <motion.h1 
            className="text-5xl md:text-6xl font-extrabold text-green-600 leading-tight tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            NutriPeek
          </motion.h1>
        </motion.div>

        <motion.p 
          className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed text-center max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          Peek inside your fridge. Pack smarter lunches.
          <br/>
          <span className="text-lg text-green-700">
            Nutritional insights for your children's meals
          </span>
        </motion.p>

        <motion.div
          className="mt-8 mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white py-3 px-10 rounded-full shadow-lg text-xl font-semibold flex items-center gap-2"
          >
            Explore Features
            <ArrowCircleRight size={24} weight="bold" />
          </motion.button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 w-full flex justify-center"
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-green-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 256 256">
              <path d="M205.66,117.66a8,8,0,0,0-11.32,0L128,183.31,61.66,117.66a8,8,0,0,0-11.32,11.32l72,71.33a8,8,0,0,0,11.32,0l72-71.33A8,8,0,0,0,205.66,117.66Z"></path>
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-green-700"
            variants={item}
          >
            Discover What NutriPeek Can Do
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-green-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Baby size={32} weight="fill" className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-green-800">Create Child Profiles</h3>
              <p className="text-gray-600 mb-6 text-center">Easily add your children's preferences, allergies and dietary needs for personalized nutritional recommendations.</p>
              <Link href="/profile" className="block text-center">
                <motion.button 
                  className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Manage Profiles
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                  </svg>
                </motion.button>
              </Link>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-green-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CameraRotate size={32} weight="fill" className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-green-800">Scan Your Fridge</h3>
              <p className="text-gray-600 mb-6 text-center">Take photos of your food or ingredients to instantly analyze nutritional content and get personalized recommendations.</p>
              <Link href="/NutriScan" className="block text-center">
                <motion.button 
                  className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch Scan
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                  </svg>
                </motion.button>
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-green-200 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <UsersThree size={32} weight="fill" className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-green-800">Manage Nutrition</h3>
              <p className="text-gray-600 mb-6 text-center">Get insights on nutritional gaps and recommendations to ensure your children get balanced, healthy meals.</p>
              <Link href="/profile" className="block text-center">
                <motion.button 
                  className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Profiles
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                  </svg>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            className="mt-20 text-center"
            variants={item}
          >
            <Link href="/NutriScan">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-12 rounded-full shadow-lg text-xl font-semibold"
              >
                Start Your Food Journey
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Navigation Bar */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: showNavbar ? 0 : -100, 
          opacity: showNavbar ? 1 : 0 
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <Link href="/Welcome" className="flex items-center space-x-2">
            <Image
              src={nutriPeekLogo}
              alt="NutriPeek Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold text-gray-800 tracking-tight">NutriPeek</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors">
            Profile
          </Link>
          <Link
            href="/NutriScan"
            className="ml-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Launch Scan
          </Link>
        </nav>
      </motion.header>
    </>
  );
}