import React from "react";

const WarrantyInformation = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Warranty Information</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      All Electrify products come with a standard 1-year warranty covering manufacturing defects and hardware failures under normal use.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">What's Covered?</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Manufacturing defects</li>
      <li>Hardware failures under normal use</li>
      <li>Replacement of faulty parts</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">How to Make a Claim</h2>
    <p className="text-gray-600 max-w-2xl mb-4">
      Contact our support team with your order details and a description of the issue. We will guide you through the claim process.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Download Warranty Policy</h2>
    <a href="/warranty-policy.pdf" className="text-electrify-500 underline mb-4 inline-block">Download PDF</a>
    <h2 className="text-xl font-semibold mt-8 mb-2">Authorized Service Centers</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Nairobi Service Center – 123 Tech Ave, Nairobi</li>
      <li>Mombasa Service Center – 456 Coast Rd, Mombasa</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Need Help?</h2>
    <p className="text-gray-600 max-w-2xl">
      For warranty support, email <a href="mailto:support@electrify.com" className="text-electrify-500 underline">support@electrify.com</a>.
    </p>
  </div>
);

export default WarrantyInformation; 