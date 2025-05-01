'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import nutriPeekLogo from '@/../public/nutripeek.png';

export default function Navbar() {
  const pathname = usePathname();
  const isHiddenPage = pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isHiddenPage) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md shadow-md">
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

      <>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors">Profile</Link>
          <Link href="/MyNote" className="text-gray-600 hover:text-green-600 transition-colors">Notes</Link>
          <Link href="/BuildPlate" className="text-gray-600 hover:text-green-600 transition-colors">Build Plate</Link>
          <Link href="/MatchAndLearn" className="text-gray-600 hover:text-green-600 transition-colors">Match & Learn</Link>
          <Link href="/Activity" className="text-gray-600 hover:text-green-600 transition-colors">Activity</Link>
          <Link href="/NutriGap" className="text-gray-600 hover:text-green-600 transition-colors">NutriGap</Link>
          <Link
            href="/NutriScan"
            className="ml-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Launch Scan
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-green-600 focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-4 md:hidden z-50">
            <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
            <Link href="/BuildPlate" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Build Plate</Link>
            <Link href="/MyNote" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>My Notes</Link>
            <Link href="/Activity" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Activity</Link>
            <Link href="/NutriGap" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>NutriGap</Link>
            <Link
              href="/NutriScan"
              className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Launch Scan
            </Link>
          </div>
        )}
      </>
    </header>
  );
}