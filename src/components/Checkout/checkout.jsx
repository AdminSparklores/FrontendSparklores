import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProduct, fetchCharm, BASE_URL, getAuthData } from '../../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for cart items
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
    sendSiteCode: 'JAKARTA',
    destAreaCode: ''
  });

  // Shipping fee state
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  
  // Order state
  const [orderId, setOrderId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Newsletter logic
  const [showNewsletterCheckbox, setShowNewsletterCheckbox] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [formError, setFormError] = useState(null);
  const [formTouched, setFormTouched] = useState(false);

  // Check newsletter subscription when email changes
  useEffect(() => {
    const fetchNewsletterStatus = async () => {
      setShowNewsletterCheckbox(false);
      setNewsletterError("");
      setNewsletterChecked(false);

      if (!shippingAddress.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
        setShowNewsletterCheckbox(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/newsletters/`);
        if (!res.ok) throw new Error("Failed to check newsletter subscriptions");
        const data = await res.json();
        const userSubscribed = data.some(item =>
          (item.user_email || item.email) &&
          (item.user_email || item.email).toLowerCase() === shippingAddress.email.toLowerCase()
        );
        setShowNewsletterCheckbox(!userSubscribed);
      } catch (err) {
        setNewsletterError("Failed to check newsletter subscription");
        setShowNewsletterCheckbox(false);
      }
    };
    fetchNewsletterStatus();
  }, [shippingAddress.email]);

  // Handle shipping address input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
  };

  // Fetch item details when component mounts
  useEffect(() => {
    const fetchItemDetails = async () => {
      const selectedItems = location.state?.selectedItems || [];
      try {
        if (selectedItems.length > 0) {
          const enhancedItems = await Promise.all(
            selectedItems.map(async (item) => {
              try {
                // Only fetch product details if it's a product (not gift set or charms only)
                let productDetails = {};
                if (item.source_type === 'product' && item.productId) {
                  try {
                    productDetails = await fetchProduct(item.productId || item.id);
                  } catch (error) {
                    console.error(`Failed to fetch product ${item.productId}:`, error);
                    productDetails = {
                      name: item.name || 'Product',
                      images: item.image ? [{ image_url: item.image }] : []
                    };
                  }
                } else {
                  productDetails = {
                    name: item.name || (item.source_type === 'gift_set' ? 'Gift Set' : 'Charms'),
                    images: item.image ? [{ image_url: item.image }] : []
                  };
                }

                let charmDetails = [];
                if (item.charms && item.charms.length > 0) {
                  if (typeof item.charms[0] === 'object') {
                    charmDetails = item.charms;
                  } else {
                    charmDetails = item.charms.map(image => ({ image }));
                  }
                }
                
                return {
                  ...item,
                  id: item.id,
                  name: productDetails.name,
                  image: (productDetails.images && productDetails.images.length > 0) 
                    ? productDetails.images[0].image_url 
                    : item.image || 'https://via.placeholder.com/100',
                  price: item.price,
                  originalPrice: item.originalPrice,
                  discount: item.discount,
                  quantity: item.quantity,
                  charms: charmDetails,
                  message: item.message || "",
                  source_type: item.source_type
                };
              } catch (error) {
                console.error('Error processing item:', item.id, error);
                return {
                  ...item,
                  name: item.name || 'Product',
                  image: item.image || 'https://via.placeholder.com/100',
                  price: item.price || 0,
                  originalPrice: item.originalPrice || item.price || 0,
                  discount: item.discount || 0,
                  quantity: item.quantity || 1,
                  charms: item.charms || [],
                  message: item.message || "",
                  source_type: item.source_type || 'product'
                };
              }
            })
          );
          setCartItems(enhancedItems);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [location.state]);

  // Calculate prices
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.discount && item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const total = subtotal + shippingFee;

  // Format currency for display
  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Calculate total weight (assuming 1kg per item for simplicity)
  const calculateTotalWeight = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Check shipping fee
   const checkShippingFee = async () => {
    if (!shippingAddress.destAreaCode || !shippingAddress.city) {
      setShippingError("Please enter city and area code to calculate shipping");
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const weight = calculateTotalWeight();
      const payload = {
        weight: weight.toString(),
        sendSiteCode: shippingAddress.sendSiteCode,
        destAreaCode: shippingAddress.destAreaCode,
        cusName: "SPARKLORE",
        productType: "EZ"
      };

      console.log('Sending to /api/jnt/tariff/:', payload);

      const response = await fetch(`${BASE_URL}/api/jnt/tariff/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData()?.token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response from /api/jnt/tariff/:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from /api/jnt/tariff/:', errorData);
        throw new Error(errorData.message || "Failed to calculate shipping fee");
      }

      const data = await response.json();
      console.log('Data from /api/jnt/tariff/:', data);

      if (data.is_success === "true") {
        const costData = JSON.parse(data.content);
        if (costData.length > 0) {
          setShippingFee(parseInt(costData[0].cost));
        } else {
          throw new Error("No shipping options available");
        }
      } else {
        throw new Error(data.message || "Failed to calculate shipping fee");
      }
    } catch (error) {
      console.error('Error in checkShippingFee:', error);
      setShippingError(error.message);
      setShippingFee(0);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Create order and get order ID
  const createOrder = async () => {
    try {
      const selectedItemIds = cartItems.map(item => item.id);
      const payload = {
        shipping_address: shippingAddress.address,
        cart_item_ids: selectedItemIds
      };

      console.log('Sending to api/selective_checkout/:', payload);

      const response = await fetch(`${BASE_URL}/api/selective_checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData()?.token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response from /selective_checkout/:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from /selective_checkout/:', errorData);
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      console.log('Data from /selective_checkout/:', data);
      
      setOrderId(data.order_id);
      setTotalPrice(data.total_price);
      return data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      setPaymentError(error.message);
      throw error;
    }
  };

  // Process payment with Midtrans
  const processPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // First create the order
      const orderData = await createOrder();
      
      // Prepare item details for Midtrans
      const itemDetails = cartItems.map(item => {
        let prefix = '';
        if (item.source_type === 'product') prefix = 'PID-';
        else if (item.source_type === 'gift_set') prefix = 'GSID-';
        else if (item.source_type === 'charms_only') prefix = 'CID-';
        
        return {
          id: `${prefix}${item.id}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        };
      });

      // Add shipping as an item if shipping fee > 0
      if (shippingFee > 0) {
        itemDetails.push({
          id: 'SHIPPING',
          name: 'Shipping Fee',
          price: shippingFee,
          quantity: 1
        });
      }

      // Prepare payload for Midtrans
      const payload = {
        order_id: orderData.order_id.toString(),
        gross_amount: orderData.total_price + shippingFee,
        email: shippingAddress.email,
        first_name: shippingAddress.first_name,
        last_name: shippingAddress.last_name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postal_code: shippingAddress.postal_code,
        country: "IDN",
        item_details: itemDetails
      };

      console.log('Sending to /api/midtrans/token/:', payload);

      const response = await fetch(`${BASE_URL}/api/midtrans/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData()?.token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response from /api/midtrans/token/:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from /api/midtrans/token/:', errorData);
        throw new Error(errorData.message || "Failed to process payment");
      }

      const paymentData = await response.json();
      console.log('Data from /api/midtrans/token/:', paymentData);
      
      // Redirect to Midtrans payment page
      window.location.href = paymentData.redirect_url;
      
    } catch (error) {
      console.error('Error in processPayment:', error);
      setPaymentError(error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Validation function for all required fields
  const isFormValid = () => {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone', 
      'address', 'city', 'postal_code', 'province', 'destAreaCode'
    ];
    
    // Check all required fields are filled
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        return false;
      }
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      return false;
    }
    
    // Validate phone number (minimum 10 digits)
    if (shippingAddress.phone.replace(/\D/g, '').length < 10) {
      return false;
    }
    
    // Shipping fee must be calculated
    if (shippingFee <= 0) {
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = () => {
    setFormTouched(true);
    if (!isFormValid()) {
      setFormError("Please fill in all required fields and calculate shipping fee");
      return;
    }
    setFormError(null);
    processPayment();
  };

  useEffect(() => {
    if (formTouched) {
      if (!isFormValid()) {
        setFormError("Please fill in all required fields and calculate shipping fee");
      } else {
        setFormError(null);
      }
    }
  }, [shippingAddress, shippingFee, formTouched]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf3] flex items-center justify-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfaf3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No items selected for checkout</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#e9d6a9] px-4 py-2 rounded-md hover:bg-[#e3c990]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf3] p-6 text-[#3b322c]">
      <div className="max-w-6xl mx-auto">
        <nav className="text-sm text-[#c9c3bc] mb-4">
          Home {'>'} Your Cart {'>'} <span className="text-[#3b322c] font-medium">Checkout</span>
        </nav>

        <div className='border border-[#f2e9d5] rounded-xl p-6 bg-white'>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold">Checkout</h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Contact Information</h3>
                </div>
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="first_name"
                    value={shippingAddress.first_name}
                    onChange={handleAddressChange}
                    placeholder="First Name *"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={shippingAddress.last_name}
                    onChange={handleAddressChange}
                    placeholder="Last Name *"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={shippingAddress.email}
                  onChange={handleAddressChange}
                  placeholder="Email *"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                {showNewsletterCheckbox && (
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={newsletterChecked}
                      onChange={e => setNewsletterChecked(e.target.checked)}
                      disabled={newsletterLoading}
                    />
                    <span className='ms-[0.5rem]'>Mail me about exclusive offer.</span>
                    {newsletterLoading && (
                      <span className="ml-2 text-xs text-gray-500">Processing...</span>
                    )}
                  </label>
                )}
                {newsletterError && (
                  <div className="text-xs text-red-500 mt-1">{newsletterError}</div>
                )}
              </div>

              <div>
                <h3 className="font-medium mt-4 mb-2">Shipping Address</h3>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  placeholder="Address *"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="Phone Number * (e.g., 08123456789)"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City *"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                  <input
                    type="text"
                    name="destAreaCode"
                    value={shippingAddress.destAreaCode}
                    onChange={handleAddressChange}
                    placeholder="Area Code * (e.g., KALIDERES)"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleAddressChange}
                    placeholder="Province *"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                  <input
                    type="text"
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleAddressChange}
                    placeholder="Postal Code *"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600">Country</label>
                  <input
                    type="text"
                    value="Indonesia (IDN)"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#fdfaf3] cursor-not-allowed"
                    disabled
                  />
                </div>
                
                {/* Shipping Fee Check Button */}
                <button
                  onClick={checkShippingFee}
                  disabled={isCalculatingShipping || !shippingAddress.city || !shippingAddress.destAreaCode}
                  className={`w-full bg-[#e9d6a9] py-2 rounded-md mb-3 ${isCalculatingShipping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e3c990]'}`}
                >
                  {isCalculatingShipping ? 'Calculating...' : 'Check Shipping Fee'}
                </button>
                
                {shippingError && (
                  <div className="text-red-500 text-sm mb-3">{shippingError}</div>
                )}
                
                {shippingFee > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Shipping Fee:</span>
                      <span className="font-bold">{formatCurrency(shippingFee)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {paymentError && (
                <div className="text-red-500 text-sm mb-3">{paymentError}</div>
              )}
              
              {formError && (
                <div className="text-red-500 text-sm mb-3">{formError}</div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Your Orders</h3>

              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm">x{item.quantity}</p>
                    
                    {item.discount > 0 && item.originalPrice ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-[#b87777]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-400 text-sm line-through">
                            {formatCurrency(item.originalPrice * item.quantity)}
                          </p>
                          <span className="text-xs bg-[#c3a46f] text-white px-1 rounded">
                            {item.discount}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="font-semibold text-[#b87777]">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    )}
                    {item.charms && item.charms.length > 0 && (
                      <>
                        <p className="text-sm mt-2">Charm Selection</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.charms.map((charm, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <img 
                                src={charm.image || charm} 
                                alt={charm.name || `Charm ${index}`}
                                className="w-10 h-10 object-contain border border-[#f2e9d5] rounded-sm p-1"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = "https://via.placeholder.com/40";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {item.message && (
                      <>
                        <p className="text-sm mt-2 text-start text-gray-600">Special Message</p>
                        <p className="text-xs italic">"{item.message}"</p>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#f2e9d5] text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee > 0 ? formatCurrency(shippingFee) : "Not calculated"}</span>
                </div>
                
                <div className="flex justify-between font-semibold pt-2 border-t border-[#f2e9d5]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="w-full bg-[#e9d6a9] text-lg font-medium py-3 mt-6 rounded-md hover:bg-[#e3c990] transition-colors disabled:opacity-50"
            onClick={handlePlaceOrder}
            disabled={!isFormValid() || isProcessingPayment}
          >
            {isProcessingPayment ? 'Processing...' : 'Place My Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;