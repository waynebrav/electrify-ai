import React from "react";

const HelpCenter = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Help Center</h1>
    <p className="text-gray-600 max-w-2xl mb-8">
      Need assistance? Browse our FAQs or contact our support team for help with your orders, products, or account.
    </p>
    <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li><strong>How do I track my order?</strong> Log in to your account and visit the Track Order page.</li>
      <li><strong>What is your return policy?</strong> See our Returns & Refunds page for details.</li>
      <li><strong>How can I contact support?</strong> Email us at <a href="mailto:support@electrify.com" className="text-electrify-500 underline">support@electrify.com</a>.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Contact Support</h2>
    <form className="mb-8 max-w-md">
      <input type="text" placeholder="Your Name" className="border p-2 rounded w-full mb-2" />
      <input type="email" placeholder="Your Email" className="border p-2 rounded w-full mb-2" />
      <textarea placeholder="How can we help you?" className="border p-2 rounded w-full mb-2" rows={3}></textarea>
      <button type="submit" className="bg-electrify-500 text-white px-4 py-2 rounded">Send</button>
    </form>
    <h2 className="text-xl font-semibold mb-2">Video Tutorials</h2>
    <div className="mb-8">
      <iframe width="360" height="215" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Sample Tutorial" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded"></iframe>
    </div>
    <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
    <p className="text-gray-600 max-w-2xl">
      For further assistance, please email <a href="mailto:support@electrify.com" className="text-electrify-500 underline">support@electrify.com</a> or call our hotline at (123) 456-7890.
    </p>
  </div>
);

export default HelpCenter; 