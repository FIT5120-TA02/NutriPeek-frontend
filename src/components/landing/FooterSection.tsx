'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramLogo, FacebookLogo, TwitterLogo, EnvelopeSimple } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * Footer section component
 * Provides navigation links, social media, and contact information
 * Acts as the final call-to-action and info resource at the bottom of the page
 */
export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <SectionContainer 
      removeMinHeight={true} 
      backgroundClasses="bg-green-800"
      className="py-12 text-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <span className="text-green-600 font-bold">NP</span>
            </div>
            <h3 className="text-xl font-bold">NutriPeek</h3>
          </div>
          <p className="text-green-200 text-sm mb-4">
            Empowering Australian parents to prepare healthier school lunches with confidence.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-green-300 transition-colors">
              <FacebookLogo size={24} weight="fill" />
            </a>
            <a href="#" className="text-white hover:text-green-300 transition-colors">
              <InstagramLogo size={24} weight="fill" />
            </a>
            <a href="#" className="text-white hover:text-green-300 transition-colors">
              <TwitterLogo size={24} weight="fill" />
            </a>
          </div>
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
              { name: 'Home', path: '/Welcome' },
              { name: 'Features', path: '/#features' },
              { name: 'Build Plate', path: '/BuildPlate' },
              { name: 'NutriScan', path: '/NutriScan' },
              { name: 'FAQ', path: '/#faq' }
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
              { name: 'Privacy Policy', path: '/privacy' },
              { name: 'Terms of Service', path: '/terms' },
              { name: 'Cookie Policy', path: '/cookies' },
              { name: 'Data Usage', path: '/data-usage' }
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

        {/* Contact */}
        <motion.div 
          className="col-span-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <div className="text-green-200 space-y-3">
            <p>Melbourne, Australia</p>
            <p>support@nutripeek.com.au</p>
            <div className="pt-4">
              <button className="flex items-center text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                <EnvelopeSimple size={20} className="mr-2" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
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