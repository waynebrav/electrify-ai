import React from "react";

const TermsOfService = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      Please read these terms and conditions carefully before using Electrify.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">User Responsibilities</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Provide accurate and up-to-date information</li>
      <li>Use the website in accordance with applicable laws</li>
      <li>Maintain the confidentiality of your account</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Prohibited Activities</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Unauthorized access or use of the site</li>
      <li>Fraudulent or illegal activities</li>
      <li>Disrupting the website or services</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Limitation of Liability</h2>
    <p className="text-gray-600 max-w-2xl mb-4">
      Electrify is not liable for any damages arising from the use or inability to use our services. Use the site at your own risk.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Dispute Resolution</h2>
    <p className="text-gray-600 max-w-2xl mb-4">Any disputes arising from the use of our services will be resolved through arbitration in accordance with local laws.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Changes to Terms</h2>
    <p className="text-gray-600 max-w-2xl mb-4">We may update these terms from time to time. Users will be notified of significant changes via email or website notice.</p>
    <p className="text-gray-600 max-w-2xl mt-8">
      For questions, contact <a href="mailto:legal@electrify.com" className="text-electrify-500 underline">legal@electrify.com</a>.
    </p>
  </div>
);

export default TermsOfService; 