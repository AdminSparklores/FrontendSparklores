import React from "react";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
  return (
    <div className="bg-[#f8f4ed] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Refund Policy</h1>
        
        <div className="bg-white p-6 rounded-lg border border-[#e5cfa4] shadow-sm mb-8">
          <div className="space-y-6">
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">Returns & Exchanges</h3>
              <p className="text-gray-600 mt-2">
                We accept returns within 14 days of delivery. Items must be unused, in their original condition, and in the original packaging.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">Refund Process</h3>
              <p className="text-gray-600 mt-2">
                Once we receive your return, we'll inspect it and notify you of the refund status. If approved, refunds will be processed to the original payment method within 5-10 business days.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">Damaged or Defective Items</h3>
              <p className="text-gray-600 mt-2">
                If you receive a damaged or defective item, please contact us immediately at <a href="mailto:sparkloremanagement@gmail.com" className="text-[#b87777]">sparkloremanagement@gmail.com</a> with photos of the product and packaging.
              </p>
            </div>
            
            <div className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-700">Non-Refundable Items</h3>
              <p className="text-gray-600 mt-2">
                Certain items like sale products or personalized items cannot be returned unless they arrive damaged or defective.
              </p>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-center space-x-4">
          <Link 
            to="/faq" 
            className="bg-[#e5cfa4] text-gray-900 font-semibold py-2 px-6 rounded-md hover:bg-[#d4bf8f] transition-colors inline-block shadow-sm"
          >
            View FAQ
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

export default RefundPolicy;