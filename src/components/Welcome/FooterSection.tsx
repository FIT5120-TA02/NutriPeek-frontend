'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionContainer from './SectionContainer';
import nutriPeekLogo from '@/../public/nutripeek.png';
import { useRouter } from 'next/navigation';

/**
 * Footer section component
 * Provides navigation links, social media, and contact information
 * Acts as the final call-to-action and info resource at the bottom of the page
 */
export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle navigation - either scroll or route
  const handleNavigation = (path: string) => {
    if (path.startsWith('/#')) {
      // It's an anchor link for the current page
      const sectionId = path.substring(2); // Remove /# to get the section id
      scrollToSection(sectionId);
    } else {
      // It's a different page route
      router.push(path);
    }
  };

  return (
    <SectionContainer 
      removeMinHeight={true} 
      backgroundClasses="bg-green-800"
      className="py-12 text-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Description */}
        <motion.div 
          className="col-span-1 md:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <div className="flex items-center justify-center w-6 h-6">
                <Image
                  src={nutriPeekLogo}
                  alt="NutriPeek Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h3 className="text-xl font-bold">NutriPeek</h3>
          </div>
          <p className="text-green-200 text-sm mb-4">
            Empowering Australian parents to prepare healthier school lunches with confidence.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { name: 'Home', path: '/#hero' },
              { name: 'Features', path: '/#features' },
              { name: 'Benefits', path: '/#benefits' },
              { name: 'Use Cases', path: '/#use-cases' },
              { name: 'Tools', path: '/#tools' },
              { name: 'FAQ', path: '/#faq' }
            ].map((link, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleNavigation(link.path)}
                  className="text-green-200 hover:text-white transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Legal */}
        <motion.div 
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            {[
              { name: 'Privacy Policy', path: '/' }, // TODO: Add privacy policy page
              { name: 'Terms of Service', path: '/' }, // TODO: Add terms of service page
              { name: 'Cookie Policy', path: '/' }, // TODO: Add cookie policy page
              { name: 'Data Usage', path: '/' } // TODO: Add data usage page
            ].map((link, index) => (
              <li key={index}>
                <Link 
                  href={link.path}
                  className="text-green-200 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="border-t border-green-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-green-300 text-sm mb-4 md:mb-0">
          © {currentYear} NutriPeek. All rights reserved.
        </p>
        <p className="text-green-300 text-sm">
          Made with ❤️ for Australian families
        </p>
      </div>
    </SectionContainer>
  );
}