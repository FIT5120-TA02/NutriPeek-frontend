import React from 'react';

/**
 * Privacy Policy content component
 */
export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4 text-gray-700">
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
        <p>
          NutriPeek is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Information We Don't Collect</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>We don't store any sensitive personal information in our database</li>
          <li>We don't store images of your food, fridge, or meals that you upload for analysis</li>
          <li>We don't use cookies to track your browsing behavior</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Storage</h3>
        <p>
          Some information is stored in your device's local storage to improve your user experience:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>User preferences and settings</li>
          <li>Recently viewed food items</li>
          <li>Pinned seasonal food items</li>
        </ul>
        <p className="mt-2">
          This information never leaves your device and is only accessible by the NutriPeek application on your device.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Image Processing</h3>
        <p>
          When you upload images for analysis:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Images are temporarily processed on our servers</li>
          <li>Images are immediately deleted after analysis is complete</li>
          <li>No images are stored permanently</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Children's Privacy</h3>
        <p>
          Our service is designed for parents and guardians. We do not knowingly collect personal information from children.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Changes to This Policy</h3>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@nutripeek.com.
        </p>
      </section>
    </div>
  );
}

/**
 * Terms of Service content component
 */
export function TermsOfServiceContent() {
  return (
    <div className="space-y-4 text-gray-700">
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
        <p>
          By accessing or using NutriPeek, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Service Description</h3>
        <p>
          NutriPeek is an application designed to help parents prepare healthier school lunches by providing nutrition information and recommendations. Our service includes food analysis, seasonal food information, and nutritional guidance.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">3. User Responsibilities</h3>
        <p>
          You are responsible for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Using the service in compliance with all applicable laws</li>
          <li>Ensuring any information you provide is accurate</li>
          <li>Maintaining the security of your device and account</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Intellectual Property</h3>
        <p>
          All content, features, and functionality of NutriPeek, including but not limited to text, graphics, logos, and software, are owned by NutriPeek and are protected by copyright, trademark, and other intellectual property laws.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Disclaimer of Warranties</h3>
        <p>
          NutriPeek is provided "as is" and "as available" without warranties of any kind. We do not guarantee that our service will be error-free or uninterrupted.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Limitation of Liability</h3>
        <p>
          NutriPeek shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Nutritional Information</h3>
        <p>
          While we strive to provide accurate nutritional information, our service should not be considered medical advice. Always consult healthcare professionals regarding dietary needs.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Modifications to Terms</h3>
        <p>
          We reserve the right to modify these terms at any time. We will notify users of significant changes by posting an updated version on our website.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Governing Law</h3>
        <p>
          These Terms shall be governed by the laws of Australia, without regard to its conflict of law provisions.
        </p>
      </section>
    </div>
  );
}

/**
 * Cookie Policy content component
 */
export function CookiePolicyContent() {
  return (
    <div className="space-y-4 text-gray-700">
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Cookie Policy</h3>
        <p>
          NutriPeek does not use cookies to collect or store any personal information about you or your activities.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">What Are Cookies?</h3>
        <p>
          Cookies are small text files that are placed on your device when you visit websites. They are widely used to make websites work more efficiently and provide information to the website owners.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Our No-Cookie Approach</h3>
        <p>
          We've designed NutriPeek to function without cookies. Instead of cookies, we use:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Local storage for saving user preferences and pinned items on your device only</li>
          <li>Temporary browser session storage when necessary</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Services</h3>
        <p>
          Our application may include links to external services that may use their own cookies. Please note that these are outside our control and are not covered by this cookie policy. We recommend reviewing the cookie policies of any external services you visit.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Updates to This Policy</h3>
        <p>
          We may update this cookie policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
        <p>
          If you have any questions about this Cookie Policy, please contact us at support@nutripeek.com.
        </p>
      </section>
    </div>
  );
}

/**
 * Data Usage content component
 */
export function DataUsageContent() {
  return (
    <div className="space-y-4 text-gray-700">
      <p>
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Use Your Data</h3>
        <p>
          At NutriPeek, we take your data privacy seriously. This policy explains how we handle any data related to your use of our application.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data We Process</h3>
        <p>
          We process the following types of data:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Food and meal images you upload for analysis (not stored)</li>
          <li>Search queries for food items</li>
          <li>User preferences and settings (stored only on your device)</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Process Your Data</h3>
        <p>
          When you use NutriPeek:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Images are temporarily processed on our servers for food recognition and nutritional analysis</li>
          <li>Images are immediately deleted after analysis is complete</li>
          <li>No personal data is retained in our database</li>
          <li>User preferences are stored only in your device's local storage</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Usage Statistics</h3>
        <p>
          We may collect anonymous usage statistics to improve our service, such as:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Popular food searches</li>
          <li>Feature usage patterns</li>
          <li>Application performance metrics</li>
        </ul>
        <p className="mt-2">
          These statistics contain no personally identifiable information and are used solely to enhance the NutriPeek experience.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Sharing</h3>
        <p>
          We do not share your data with third parties except when:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Required by law</li>
          <li>Necessary to protect our rights or safety</li>
          <li>Needed to fulfill our service obligations (e.g., using food database providers)</li>
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Security</h3>
        <p>
          We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Updates to This Policy</h3>
        <p>
          We may update this data usage policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
        <p>
          If you have any questions about how we use your data, please contact us at support@nutripeek.com.
        </p>
      </section>
    </div>
  );
} 