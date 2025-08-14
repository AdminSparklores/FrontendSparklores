import React from 'react';
import { useLocation } from 'react-router-dom';

const PaymentProcessing = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-[#fdfaf3] flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e9d6a9] mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Processing Your Payment</h2>
        <p className="mb-6">Your payment is being processed. Please don't close this page.</p>
        {orderId && (
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessing;