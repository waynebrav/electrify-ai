import React from "react";

const About = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">About Electrify</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      Electrify is your one-stop destination for all electronics needs. Founded with a passion for technology and innovation, we strive to bring the latest gadgets, smart home solutions, and professional-grade equipment to our customers.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Our Mission</h2>
    <p className="text-gray-600 max-w-2xl mb-4">
      To empower individuals and businesses by providing access to cutting-edge technology, exceptional service, and expert advice.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Our Vision</h2>
    <p className="text-gray-600 max-w-2xl mb-4">
      To be the leading electronics retailer known for quality, innovation, and customer satisfaction across the region.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Our Values</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl">
      <li>Customer Focus</li>
      <li>Innovation</li>
      <li>Integrity</li>
      <li>Quality</li>
      <li>Teamwork</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Meet the Team</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="CEO" className="mx-auto rounded-full h-20 w-20 mb-2" />
        <h3 className="font-bold">Alex Kimani</h3>
        <p className="text-gray-500 text-sm">Founder & CEO</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="CTO" className="mx-auto rounded-full h-20 w-20 mb-2" />
        <h3 className="font-bold">Jane Doe</h3>
        <p className="text-gray-500 text-sm">Chief Technology Officer</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="COO" className="mx-auto rounded-full h-20 w-20 mb-2" />
        <h3 className="font-bold">Samuel Lee</h3>
        <p className="text-gray-500 text-sm">Chief Operations Officer</p>
      </div>
    </div>
    <h2 className="text-xl font-semibold mt-8 mb-2">Customer Testimonials</h2>
    <div className="max-w-3xl">
      <blockquote className="border-l-4 border-electrify-500 pl-4 italic text-gray-700 mb-4">"Electrify made it so easy to upgrade my home with smart devices!" <span className="block text-sm text-gray-500">- Mary N.</span></blockquote>
      <blockquote className="border-l-4 border-electrify-500 pl-4 italic text-gray-700 mb-4">"Great service and fast delivery. Highly recommend!" <span className="block text-sm text-gray-500">- John K.</span></blockquote>
    </div>
  </div>
);

export default About; 