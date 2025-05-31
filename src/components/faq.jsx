import React from "react";
import { Link } from "react-router-dom";

const Faq = () => {
  return (
    <div className="bg-[#f8f4ed] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="bg-white p-6 rounded-lg border border-[#e5cfa4] shadow-sm mb-8">
          <div className="space-y-6">
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">How long does shipping take?</h3>
              <p className="text-gray-600 mt-2">
                Our standard shipping typically takes 3-5 business days. During peak seasons, there may be slight delays.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">Do you offer international shipping?</h3>
              <p className="text-gray-600 mt-2">
                Currently, we only ship within Indonesia. We're working to expand our shipping options in the future.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">How can I track my order?</h3>
              <p className="text-gray-600 mt-2">
                Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website or the courier's site.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">What payment methods do you accept?</h3>
              <p className="text-gray-600 mt-2">
                We accept Visa, Mastercard, BCA, Mandiri, and GoPay. All transactions are secure and encrypted.
              </p>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-center space-x-4">
          <Link 
            to="/refund-policy" 
            className="bg-[#e5cfa4] text-gray-900 font-semibold py-2 px-6 rounded-md hover:bg-[#d4bf8f] transition-colors inline-block shadow-sm"
          >
            View Refund Policy
          </Link>
          <Link 
            to="/" 
            className="bg-white text-gray-900 font-semibold py-2 px-6 rounded-md hover:bg-gray-100 transition-colors inline-block shadow-sm border border-[#e5cfa4]"
          >
            Back to Home
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Faq;