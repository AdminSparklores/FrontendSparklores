import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthData, BASE_URL, subscribeToNewsletter } from '../../utils/api';

// Checkbox component
const Checkbox = ({ id, ...props }) => (
  <input
    type="checkbox"
    id={id}
    className="h-4 w-4 rounded border-[#e3d5c5] text-[#3a2e2a] focus:ring-[#3a2e2a]"
    {...props}
  />
);

const FinalCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    sameAddress: true,
    differentAddress: false
  });

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No order details found</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#3a2e2a] text-white px-4 py-2 rounded-md hover:bg-[#2c221f]"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `Rp. ${amount.toLocaleString('id-ID')},00`;
  };

  // Calculate totals
  const subtotal = orderDetails.subtotal || orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = orderDetails.shippingCost || orderDetails.shipping?.price || 0;
  const total = orderDetails.total || (subtotal + shippingCost);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle payment submission, now also does newsletter subscribe if opted in
  const handlePayment = async () => {
    setIsSubmitting(true);
    setNewsletterError('');
    try {
      const authData = getAuthData();
      if (!authData) {
        throw new Error('User not authenticated');
      }

      // Subscribe to newsletter if opted in and email present
      if (orderDetails.newsletterOptIn && orderDetails.shippingAddress?.email) {
        setNewsletterSubmitting(true);
        try {
          await subscribeToNewsletter(orderDetails.shippingAddress.email);
        } catch (err) {
          setNewsletterError('Failed to subscribe to newsletter.'); // Allow order to proceed
        }
        setNewsletterSubmitting(false);
      }

      // Prepare order data for API
      const productIds = orderDetails.items.map(item => {
        const id = item.id || item.productId;
        return typeof id === 'string' ? parseInt(id, 10) : id;
      }).filter(id => !isNaN(id));

      if (productIds.length === 0) {
        throw new Error('No valid product IDs found in order');
      }

      const calculatedSubtotal = orderDetails.items.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0);
      const calculatedTotal = calculatedSubtotal + parseFloat(shippingCost);

      const orderData = {
        products: productIds,
        total_price: parseFloat(calculatedTotal.toFixed(2)),
        status: 'pending',
        shipping_address: orderDetails.shippingAddress?.address || 'Address not provided',
        shipping_cost: parseFloat(shippingCost.toFixed(2)),
        user: authData.user.id,
        subtotal: parseFloat(calculatedSubtotal.toFixed(2))
      };

      const response = await fetch(`${BASE_URL}api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.detail ||
                             responseData.message ||
                             (responseData.errors ? JSON.stringify(responseData.errors) : 'Failed to place order');
        throw new Error(errorMessage);
      }

      const orderId = responseData.id;

      navigate('/track-order', {
        state: {
          orderId,
          orderDetails: {
            ...orderDetails,
            status: 'Processing',
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          }
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] px-6 py-10 font-serif text-[#3a2e2a]">
      <div className="max-w-6xl mx-auto border border-[#f4e8d7] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fffaf3]">
        {/* Left - Order Summary */}
        <div className="space-y-8">
          <h1 className="text-2xl font-semibold">Order Summary</h1>
          
          {/* Shipping Info */}
          <div className="bg-[#f9f2e6] p-4 rounded-lg">
            <h2 className="font-medium mb-2">Shipping Information</h2>
            <p className="text-sm">{orderDetails.shipping?.name || 'Standard'} Delivery ({orderDetails.shipping?.description || 'Est. 3-5 days'})</p>
            <p className="text-sm mt-1">{formatCurrency(shippingCost)}</p>
          </div>

          {/* Products */}
          {orderDetails.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <img 
                src={item.image || (item.name.includes('Bracelet') ? "/bracelet.jpg" : "/ring.jpg")} 
                alt={item.name}
                className="w-24 h-24 rounded-md object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/100";
                }}
              />
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-700">x{item.quantity}</p>
                <p className="text-md font-medium mt-1">{formatCurrency(item.price * item.quantity)}</p>
                {item.charms && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Charm Selection</p>
                    <div className="flex gap-1">
                      {item.charms.map((charm, i) => (
                        <img 
                          key={i} 
                          src={charm.image || charm} 
                          alt={charm.name || `Charm ${i}`} 
                          className="w-6 h-6"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/24";
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {item.message && (
                  <div className="mt-3 text-sm italic text-gray-700">
                    <p>"{item.message}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <hr className="my-4 border-[#e3d5c5]" />

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Right - Payment */}
        <div className="bg-[#edd4a7] rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Payment Details</h3>
            <div className="text-2xl">{orderDetails.payment?.icon || "💳"}</div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {newsletterError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-2">
              {newsletterError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm">Name on Card</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="Jane Doe"
                className="w-full mt-1 p-2 rounded-md border border-[#e3d5c5] bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full mt-1 p-2 rounded-md border border-[#e3d5c5] bg-white"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm">Exp. Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 rounded-md border border-[#e3d5c5] bg-white"
                  required
                  min={new Date().toISOString().slice(0, 7)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="***"
                  className="w-full mt-1 p-2 rounded-md border border-[#e3d5c5] bg-white"
                  required
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-md mt-4">Billing Address</h4>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox 
                    id="sameAddress" 
                    name="sameAddress"
                    checked={formData.sameAddress}
                    onChange={handleInputChange}
                  />
                  Same as shipping address
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox 
                    id="differentAddress" 
                    name="differentAddress"
                    checked={formData.differentAddress}
                    onChange={handleInputChange}
                  />
                  Use different address
                </label>
              </div>
            </div>
            <button 
              onClick={handlePayment}
              disabled={isSubmitting || newsletterSubmitting}
              className={`w-full mt-6 bg-[#3a2e2a] text-white py-3 rounded-md hover:bg-[#2c221f] transition ${isSubmitting || newsletterSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {(isSubmitting || newsletterSubmitting) ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCheckout;