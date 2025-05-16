'use client';

import React, { useState } from 'react';
import LegalPolicyPopup from './LegalPolicyPopup';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  CookiePolicyContent, 
  DataUsageContent 
} from './PolicyContent';

export type PolicyType = 'privacy' | 'terms' | 'cookie' | 'data';

interface LegalPoliciesProps {
  policyType: PolicyType;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component that displays the appropriate legal policy popup
 * based on the provided policy type
 */
export default function LegalPolicies({ policyType, isOpen, onClose }: LegalPoliciesProps) {
  // If not open, don't render anything
  if (!isOpen) return null;
  
  // Determine policy title based on type
  const getPolicyTitle = (): string => {
    switch (policyType) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms of Service';
      case 'cookie':
        return 'Cookie Policy';
      case 'data':
        return 'Data Usage';
      default:
        return 'Legal Policy';
    }
  };
  
  // Determine policy content based on type
  const getPolicyContent = (): React.ReactNode => {
    switch (policyType) {
      case 'privacy':
        return <PrivacyPolicyContent />;
      case 'terms':
        return <TermsOfServiceContent />;
      case 'cookie':
        return <CookiePolicyContent />;
      case 'data':
        return <DataUsageContent />;
      default:
        return <div>Policy content not found</div>;
    }
  };
  
  return (
    <LegalPolicyPopup
      title={getPolicyTitle()}
      onClose={onClose}
    >
      {getPolicyContent()}
    </LegalPolicyPopup>
  );
}

/**
 * Hook to handle legal policy popup state
 * Returns functions to open each policy type and close the popup
 */
export function useLegalPolicies() {
  const [policyType, setPolicyType] = useState<PolicyType | null>(null);
  
  const openPrivacyPolicy = () => setPolicyType('privacy');
  const openTermsOfService = () => setPolicyType('terms');
  const openCookiePolicy = () => setPolicyType('cookie');
  const openDataUsagePolicy = () => setPolicyType('data');
  const closePolicy = () => setPolicyType(null);
  
  return {
    policyType,
    isOpen: policyType !== null,
    openPrivacyPolicy,
    openTermsOfService,
    openCookiePolicy,
    openDataUsagePolicy,
    closePolicy
  };
} 