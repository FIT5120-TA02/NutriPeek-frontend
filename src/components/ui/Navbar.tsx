'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import nutriPeekLogo from '@/../public/nutripeek.png';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center space-x-2">
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

      {/* Only show navigation if not on homepage */}
      {!isHomePage && (
        <>
          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/ChildInfo" className="text-gray-600 hover:text-green-600 transition-colors">Child Info</Link>
            <Link href="/aware-child" className="text-gray-600 hover:text-green-600 transition-colors">Aware Child</Link>
            <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors">Profile</Link>
            <Link
              href="/start"
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              Start Now
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-green-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center py-4 space-y-4 md:hidden z-50">
              <Link href="/ChildInfo" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Child Info</Link>
              <Link href="/aware-child" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Aware Child</Link>
              <Link href="/profile" className="text-gray-600 hover:text-green-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <Link
                href="/start"
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Now
              </Link>
            </div>
          )}
        </>
      )}
    </header>
  );
}

