import React from "react";

const ReturnsAndRefunds = () => (
  <div className="container py-12">
    <h1 className="text-3xl font-bold mb-4">Returns & Refunds</h1>
    <p className="text-gray-600 max-w-2xl mb-4">
      We want you to be satisfied with your purchase. If you are not, you may be eligible for a return or refund under the following conditions:
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Eligibility</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Returns must be initiated within 30 days of delivery</li>
      <li>Products must be unused and in original packaging</li>
      <li>Proof of purchase is required</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">How to Return a Product</h2>
    <ol className="list-decimal pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Contact our support team at <a href="mailto:support@electrify.com" className="text-electrify-500 underline">support@electrify.com</a></li>
      <li>Provide your order details and reason for return</li>
      <li>Follow the instructions provided by our team</li>
    </ol>
    <h2 className="text-xl font-semibold mt-8 mb-2">Refunds</h2>
    <p className="text-gray-600 max-w-2xl mb-4">
      Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed to your original payment method within 7 business days.
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Non-returnable Items</h2>
    <ul className="list-disc pl-6 text-gray-600 max-w-2xl mb-4">
      <li>Gift cards</li>
      <li>Personalized products</li>
      <li>Opened software</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Return Shipping</h2>
    <p className="text-gray-600 max-w-2xl mb-4">Return shipping costs are the responsibility of the customer unless the product is defective or incorrect.</p>
    <p className="text-gray-600 max-w-2xl mt-8">
      For questions, contact <a href="mailto:support@electrify.com" className="text-electrify-500 underline">support@electrify.com</a>.
    </p>
  </div>
);

export default ReturnsAndRefunds; 