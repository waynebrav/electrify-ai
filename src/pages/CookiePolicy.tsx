import React from "react";

const CookiePolicy = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      We use cookies to enhance your experience on Electrify. This policy explains what cookies are, how we use them, and your choices.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Types of Cookies We Use</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Essential cookies for site functionality</li>
      <li>Analytics cookies to understand usage</li>
      <li>Marketing cookies for personalized offers</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Cookie Table</h2>
    <table className="w-full text-left mb-4 border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Cookie Name</th>
          <th className="p-2">Purpose</th>
          <th className="p-2">Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2">session_id</td>
          <td className="p-2">Maintains user session</td>
          <td className="p-2">Session</td>
        </tr>
        <tr>
          <td className="p-2">_ga</td>
          <td className="p-2">Google Analytics tracking</td>
          <td className="p-2">2 years</td>
        </tr>
        <tr>
          <td className="p-2">cookie_consent</td>
          <td className="p-2">Stores cookie preferences</td>
          <td className="p-2">1 year</td>
        </tr>
      </tbody>
    </table>
    <h2 className="text-xl font-semibold mt-8 mb-2">Withdrawing Consent</h2>
    <p className="text-gray-600 max-w-2xl mb-4">You can withdraw your consent at any time by changing your browser settings or contacting us at privacy@electrify.com.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Your Choices</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Manage cookie preferences in your browser</li>
      <li>Opt out of non-essential cookies</li>
    </ul>
    <p className="text-gray-600 max-w-2xl mt-8">
      For questions, contact <a href="mailto:privacy@electrify.com" className="text-electrify-500 underline">privacy@electrify.com</a>.
    </p>
  </div>
);

export default CookiePolicy; 