'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md w-full">
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/nutripeek.png"
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
        <Link href="/homepage" className="text-gray-600 hover:text-green-600 transition-colors">Nutrition</Link>
        <Link href="/aware-child" className="text-gray-600 hover:text-green-600 transition-colors">Aware Child</Link>
        <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors">Profile</Link>
        <Link
          href="/start"
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
        >
          Start Now
        </Link>
      </nav>

      <div className="md:hidden flex items-center">
        <button className="text-gray-600 hover:text-green-600 focus:outline-none">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
