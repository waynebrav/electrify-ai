import React from "react";

const PrivacyPolicy = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      Your privacy is important to us. This policy explains how Electrify collects, uses, and protects your information.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Personal information (name, email, address, etc.)</li>
      <li>Order and payment details</li>
      <li>Usage data and cookies</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>To process orders and provide services</li>
      <li>To improve our website and offerings</li>
      <li>To communicate with you about your account or promotions</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Access, update, or delete your personal data</li>
      <li>Opt out of marketing communications</li>
      <li>Request information about our data practices</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">GDPR & CCPA Compliance</h2>
    <p className="text-gray-600 max-w-2xl mb-4">We comply with GDPR and CCPA regulations. You have the right to access, correct, or delete your data, and to request information about how your data is used.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Third-Party Services</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Google Analytics</li>
      <li>Stripe Payments</li>
      <li>Mailchimp</li>
    </ul>
    <p className="text-gray-600 max-w-2xl mt-8">
      For questions, contact <a href="mailto:privacy@electrify.com" className="text-electrify-500 underline">privacy@electrify.com</a>.
    </p>
  </div>
);

export default PrivacyPolicy; 