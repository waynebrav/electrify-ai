import React from "react";

const Blog = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Electrify Blog</h1>
    <p className="text-gray-600 max-w-2xl mb-8">
      Stay tuned for the latest news, tips, and updates from Electrify. Our blog is coming soon!
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Newsletter Signup</h2>
    <form className="mb-8 max-w-md">
      <input type="email" placeholder="Your email address" className="border p-2 rounded w-2/3 mr-2" />
      <button type="submit" className="bg-electrify-500 text-white px-4 py-2 rounded">Subscribe</button>
    </form>
    <h2 className="text-xl font-semibold mb-2">Featured Articles</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>How to Choose the Right Smart Home Devices <span className="block text-xs text-gray-400">by Jane Doe</span></li>
      <li>Top 10 Gadgets of 2025 <span className="block text-xs text-gray-400">by Alex Kimani</span></li>
      <li>Energy Efficiency Tips for Your Electronics <span className="block text-xs text-gray-400">by Samuel Lee</span></li>
    </ul>
    <div className="mt-6">
      <h3 className="font-semibold">About the Authors</h3>
      <ul className="mt-2 text-gray-600 text-sm">
        <li><span className="font-bold">Jane Doe:</span> CTO, passionate about smart home tech.</li>
        <li><span className="font-bold">Alex Kimani:</span> CEO, tech enthusiast and entrepreneur.</li>
        <li><span className="font-bold">Samuel Lee:</span> COO, expert in energy solutions.</li>
      </ul>
    </div>
    <p className="text-gray-500">More articles coming soon...</p>
  </div>
);

export default Blog; 