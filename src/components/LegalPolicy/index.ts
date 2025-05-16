// Export all legal policy components for easier imports

import LegalPolicies, { useLegalPolicies, PolicyType } from './LegalPolicies';
import LegalPolicyPopup from './LegalPolicyPopup';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  CookiePolicyContent, 
  DataUsageContent 
} from './PolicyContent';

export { 
  LegalPolicies,
  useLegalPolicies,
  LegalPolicyPopup,
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  CookiePolicyContent, 
  DataUsageContent 
};

export type { PolicyType }; 