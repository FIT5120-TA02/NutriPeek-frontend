'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionContainer from './SectionContainer';
import nutriPeekLogo from '@/../public/nutripeek.png';
import { useRouter } from 'next/navigation';
import LegalPolicies, { useLegalPolicies } from '../LegalPolicy/LegalPolicies';

/**
 * Footer section component
 * Provides navigation links, social media, and contact information
 * Acts as the final call-to-action and info resource at the bottom of the page
 */
export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  
  // Use the legal policies hook to manage popup state
  const { 
    policyType, 
    isOpen, 
    openPrivacyPolicy, 
    openTermsOfService, 
    openCookiePolicy, 
    openDataUsagePolicy, 
    closePolicy 
  } = useLegalPolicies();

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
    <>
      <SectionContainer 
        backgroundClasses="bg-green-800"
        className="py-8 text-white"
        removeMinHeight={true} 
      >
        {/* Logo and Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
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
          <p className="text-green-200 text-sm">
            Empowering Australian parents to prepare healthier school lunches with confidence.
          </p>
        </motion.div>

        {/* Links section - side by side on all screens */}
        <motion.div 
          className="grid grid-cols-2 gap-x-4 gap-y-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-1.5">
              {[
                { name: 'Home', path: '/#hero' },
                { name: 'Product Video', path: '/#product-video' },
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
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Legal</h3>
            <ul className="space-y-1.5">
              {[
                { name: 'Privacy Policy', action: openPrivacyPolicy },
                { name: 'Terms of Service', action: openTermsOfService },
                { name: 'Cookie Policy', action: openCookiePolicy },
                { name: 'Data Usage', action: openDataUsagePolicy }
              ].map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={link.action}
                    className="text-green-200 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="border-t border-green-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-green-300 text-sm mb-4 sm:mb-0">
            © {currentYear} NutriPeek. All rights reserved.
          </p>
          <p className="text-green-300 text-sm">
            Made with ❤️ for Australian families
          </p>
        </div>
      </SectionContainer>
      
      {/* Legal Policy Popup */}
      {isOpen && policyType && (
        <LegalPolicies
          policyType={policyType}
          isOpen={isOpen}
          onClose={closePolicy}
        />
      )}
    </>
  );
}