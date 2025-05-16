'use client';

import React from 'react';
import { useLegalPolicies, LegalPolicies } from '@/components/LegalPolicy';

/**
 * Test page for legal policy popups
 * This page is just for testing and development purposes
 */
export default function LegalPolicyTestPage() {
  const { 
    policyType, 
    isOpen, 
    openPrivacyPolicy, 
    openTermsOfService, 
    openCookiePolicy, 
    openDataUsagePolicy, 
    closePolicy 
  } = useLegalPolicies();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Legal Policy Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Legal Policy Popups</h2>
          <p className="text-gray-600 mb-6">
            Click on the buttons below to test the different legal policy popups.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={openPrivacyPolicy}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              Open Privacy Policy
            </button>
            
            <button
              onClick={openTermsOfService}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              Open Terms of Service
            </button>
            
            <button
              onClick={openCookiePolicy}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              Open Cookie Policy
            </button>
            
            <button
              onClick={openDataUsagePolicy}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              Open Data Usage Policy
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>
              Each policy popup uses the same reusable <code className="bg-gray-100 px-1 rounded">LegalPolicyPopup</code> component
            </li>
            <li>
              Policies can be closed by clicking outside the popup, clicking the X button, or pressing the Escape key
            </li>
            <li>
              The content for each policy is defined in separate components for maintainability
            </li>
            <li>
              The <code className="bg-gray-100 px-1 rounded">useLegalPolicies</code> hook provides a clean API for managing popup state
            </li>
          </ul>
        </div>
      </div>
      
      {/* Render the legal policy popup if open */}
      {isOpen && policyType && (
        <LegalPolicies
          policyType={policyType}
          isOpen={isOpen}
          onClose={closePolicy}
        />
      )}
    </div>
  );
} 