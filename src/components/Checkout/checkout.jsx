import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProduct, fetchCharm, BASE_URL, getAuthData, fetchJNTLocations  } from '../../utils/api';

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
    receiver_phone: '',
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isShowingLoader, setIsShowingLoader] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const orderDataRef = useRef(null);
  const [midtransToken, setMidtransToken] = useState(null);
  const [isPaymentStarted, setIsPaymentStarted] = useState(false);
  const [jntLocations, setJntLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [areaCodeError, setAreaCodeError] = useState(null);
  const [selectedJNTLocation, setSelectedJNTLocation] = useState(null);

  useEffect(() => {
    const loadJNTLocations = async () => {
      setIsLoadingLocations(true);
      setLocationsError(null);
      try {
        const locations = await fetchJNTLocations();
        setJntLocations(locations);
        setFilteredLocations(locations); // Initialize filtered locations
      } catch (error) {
        console.error('Failed to load JNT locations:', error);
        setLocationsError(error.message);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadJNTLocations();
  }, []);

  const handleCityChange = (e) => {
    const { value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      city: value,
      destAreaCode: '' // Reset area code when city changes
    }));
    
    // Filter locations based on city input
    if (value) {
      setFilteredLocations(filterLocationsByCity(jntLocations, value));
    } else {
      setFilteredLocations(jntLocations);
    }
    
    setShowCityDropdown(true);
    setFormTouched(true);
  };

  const handleCitySelect = (city) => {
    setShippingAddress(prev => ({
      ...prev,
      city,
      destAreaCode: '' // Reset area code when city changes
    }));
    
    // Filter locations based on selected city
    setFilteredLocations(filterLocationsByCity(jntLocations, city));
    setShowCityDropdown(false);
  };

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
    
    if (name === 'destAreaCode' && !shippingAddress.city) {
      setAreaCodeError("Please select a city/kabupaten first");
      return;
    } else {
      setAreaCodeError(null);
    }

    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
  };
  
  const handleAreaCodeChange = (e) => {
    const selectedKecamatanJNT = e.target.value;

    // Find the full location object
    const location = jntLocations.find(loc => 
      loc.kabupaten_kota === shippingAddress.city && 
      loc.kecamatan_jnt === selectedKecamatanJNT
    );

    if (location) {
      setSelectedJNTLocation(location);
      setShippingAddress(prev => ({ ...prev, destAreaCode: selectedKecamatanJNT }));
    } else {
      setSelectedJNTLocation(null);
    }

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
      if (!shippingAddress.city) {
      setShippingError("Please select a city/kabupaten first");
      return;
    }
    if (!shippingAddress.destAreaCode) {
      setShippingError("Please select an area code");
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
        // cusName: "SPARKLORE",
        // productType: "EZ"
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
      // Concatenate the address fields
      const fullAddress = [
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.province,
        shippingAddress.postal_code
      ].filter(Boolean).join(', ');

      const payload = {
        shipping_address: fullAddress,
        cart_item_ids: selectedItemIds,
        shipping_cost: shippingFee
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

  const createJNTOrder = async (orderId) => {
    try {
      const destinationCode = selectedJNTLocation?.kode_kota_jnt?.trim();
      const receiverArea = selectedJNTLocation?.kode_jnt_receiver_area?.trim();

      if (!destinationCode || !receiverArea) {
        throw new Error("JNT destination codes are missing. Please select a valid city and area code.");
      }

      // Build full address
      const fullAddress = [
        shippingAddress.address,
        shippingAddress.city,
        selectedJNTLocation.kecamatan, // Human-readable kecamatan
        shippingAddress.province,
        shippingAddress.postal_code
      ].filter(Boolean).join(', ');

       // Format phone: convert 8xx → +628xx
      const formatPhone = (phone) => {
        if (!phone) return '';
        // Remove any non-digit characters first
        const digitsOnly = phone.replace(/\D/g, '');
        // Add +62 prefix to numbers starting with 8
        return digitsOnly.startsWith('8') ? `+62${digitsOnly}` : phone;
      };

      // Calculate values
      const productTotal = Math.round(subtotal);
      const totalCOD = Math.round(subtotal + shippingFee);

      const jntPayload = {
        orderid: orderId.toString(),
        receiver_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim(),
        receiver_phone: formatPhone(shippingAddress.receiver_phone), // This will convert 8xx to +628xx
        receiver_addr: fullAddress,
        receiver_zip: shippingAddress.postal_code,
        destination_code: destinationCode,     // ✅ kode_kota_jnt (e.g., "TPK")
        receiver_area: receiverArea,          // ✅ kode_jnt_receiver_area (e.g., "TPK001")
        item_name: cartItems.map(item => item.name).join(','),
        cod: '',             // disable cod bro wkwk
        goodsvalue: productTotal.toString()   // Product value only
      };

      console.log('Sending to /api/jnt/order/:', jntPayload);

      const response = await fetch(`${BASE_URL}/api/jnt/order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData()?.token}`
        },
        body: JSON.stringify(jntPayload)
      });

      console.log('Response from /api/jnt/order/:', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from /api/jnt/order/:', errorData);
        throw new Error(errorData.message || "Failed to create JNT order");
      }

      const data = await response.json();
      console.log('Data from /api/jnt/order/:', data);

      if (data.success && data.detail && data.detail.length > 0) {
        const orderDetail = data.detail[0];

        if (orderDetail.status === "Sukses" && orderDetail.awb_no) {
          return orderDetail.awb_no;
        }

        if (orderDetail.status === "Error") {
          const reason = orderDetail.reason || "Unknown error";
          console.error('JNT order creation failed:', reason);

          // Friendly Indonesian error messages
          if (reason.includes("Kecamatan Penerima Error")) {
            setPaymentError("Alamat pengiriman tidak dikenali oleh JNT. Pastikan kecamatan sudah benar.");
          } else if (reason.includes("Orderid tidak boleh sama")) {
            if (orderDetail.existing_awbno) {
              return orderDetail.existing_awbno; // ✅ Reuse existing AWB
            }
            setPaymentError("Pesanan ini sudah pernah dibuat sebelumnya.");
          } else {
            setPaymentError(`Gagal membuat resi: ${reason}`);
          }
          return null;
        }
      }

      setPaymentError("Respons tidak valid dari JNT.");
      return null;
    } catch (error) {
      console.error('Error in createJNTOrder:', error);
      setPaymentError("Gagal terhubung ke layanan pengiriman. Kontak Kami untuk tindak lanjut konfirmasi pengiriman ke sparkloremanagement@gmail.com");
      return null;
    }
  };

  // Process payment with Midtrans
  // const processPayment = async () => {
  //   setIsProcessingPayment(true);
  //   setPaymentError(null);

  //   try {
  //     // First create the order
  //     const orderData = await createOrder();
      
  //     // Prepare item details for Midtrans
  //     const itemDetails = cartItems.map(item => {
  //       let prefix = '';
  //       if (item.source_type === 'product') prefix = 'PID-';
  //       else if (item.source_type === 'gift_set') prefix = 'GSID-';
  //       else if (item.source_type === 'charms_only') prefix = 'CID-';
        
  //       return {
  //         id: `${prefix}${item.id}`,
  //         name: item.name,
  //         price: item.price,
  //         quantity: item.quantity
  //       };
  //     });

  //     // Add shipping as an item if shipping fee > 0
  //     if (shippingFee > 0) {
  //       itemDetails.push({
  //         id: 'SHIPPING',
  //         name: 'Shipping Fee',
  //         price: shippingFee,
  //         quantity: 1
  //       });
  //     }

  //     // Prepare payload for Midtrans
  //     const payload = {
  //       order_id: orderData.order_id.toString(),
  //       gross_amount: orderData.total_price + shippingFee,
  //       email: shippingAddress.email,
  //       first_name: shippingAddress.first_name,
  //       last_name: shippingAddress.last_name,
  //       phone: shippingAddress.phone,
  //       address: shippingAddress.address,
  //       city: shippingAddress.city,
  //       postal_code: shippingAddress.postal_code,
  //       country: "IDN",
  //       item_details: itemDetails
  //     };

  //     console.log('Sending to /api/midtrans/token/:', payload);

  //     const response = await fetch(`${BASE_URL}/api/midtrans/token/`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${getAuthData()?.token}`
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     console.log('Response from /api/midtrans/token/:', response);

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       console.error('Error response from /api/midtrans/token/:', errorData);
  //       throw new Error(errorData.message || "Failed to process payment");
  //     }

  //     const paymentData = await response.json();
  //     console.log('Data from /api/midtrans/token/:', paymentData);
      
  //     // Redirect to Midtrans payment page
  //     window.location.href = paymentData.redirect_url;
      
  //   } catch (error) {
  //     console.error('Error in processPayment:', error);
  //     setPaymentError(error.message);
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  useEffect(() => {
    const script = document.createElement('script');
    // Force production URL since sandbox is giving 404 errors
    script.src = 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', "Mid-client-SRDTyOygqxWGAyy7");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // const processPayment = async () => {
  //   setIsProcessingPayment(true);
  //   setPaymentError(null);
  //   setIsRedirectingToPayment(false);


  //   try {
  //     // First create the order
  //     const orderData = await createOrder();
      
  //     // Prepare item details for Midtrans
  //     const itemDetails = cartItems.map(item => {
  //       let prefix = '';
  //       if (item.source_type === 'product') prefix = 'PID-';
  //       else if (item.source_type === 'gift_set') prefix = 'GSID-';
  //       else if (item.source_type === 'charms_only') prefix = 'CID-';
        
  //       // Truncate name to 50 characters max for Midtrans
  //       const truncatedName = item.name.length > 50 
  //         ? `${item.name.substring(0, 47)}...` 
  //         : item.name;
        
  //       // Ensure price is an integer (Midtrans requirement)
  //       const price = Math.round(item.price);
        
  //       return {
  //         id: `${prefix}${item.id}`,
  //         name: truncatedName,
  //         price: price,
  //         quantity: item.quantity
  //       };
  //     });

  //     // Add shipping as an item if shipping fee > 0
  //     if (shippingFee > 0) {
  //       itemDetails.push({
  //         id: 'SHIPPING',
  //         name: 'Shipping',
  //         price: Math.round(shippingFee),
  //         quantity: 1
  //       });
  //     }

  //     // Calculate the exact total from items
  //     const itemsTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  //     // Prepare payload for Midtrans
  //     const payload = {
  //       order_id: orderData.order_id.toString(),
  //       gross_amount: itemsTotal, // Use calculated total
  //       email: shippingAddress.email,
  //       first_name: shippingAddress.first_name,
  //       last_name: shippingAddress.last_name,
  //       phone: shippingAddress.phone,
  //       address: shippingAddress.address,
  //       city: shippingAddress.city,
  //       postal_code: shippingAddress.postal_code,
  //       country: "IDN",
  //       item_details: itemDetails
  //     };

  //     console.log('Sending to /api/midtrans/token/:', payload);

  //     const response = await fetch(`${BASE_URL}/api/midtrans/token/`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${getAuthData()?.token}`
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       console.error('Error response from /api/midtrans/token/:', errorData);
  //       throw new Error(errorData.error || errorData.message || "Failed to process payment");
  //     }

  //     const paymentData = await response.json();
  //     console.log('Data from /api/midtrans/token/:', paymentData);

  //     // Set redirecting state and navigate to loading page
  //     setIsRedirectingToPayment(true);
  //     navigate('/payment-processing', { state: { orderId: orderData.order_id } });
      
  //     // Redirect to Midtrans payment page
  //     // window.location.href = paymentData.redirect_url;
  //     window.open(paymentData.redirect_url, '_blank');
      
  //   } catch (error) {
  //     console.error('Error in processPayment:', error);
  //     setPaymentError(error.message || "Failed to process payment. Please try again.");
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  // Validation function for all required fields
  
  // const processPayment = async () => {
  //   setIsProcessingPayment(true);
  //   setPaymentError(null);

  //   try {
  //     setIsShowingLoader(true);
  //     setShowConfirmModal(false);
  //     // First create the order
  //     const orderData = await createOrder();
  //     orderDataRef.current = orderData;
      
  //     // Prepare item details for Midtrans
  //     const itemDetails = cartItems.map(item => {
  //       let prefix = '';
  //       if (item.source_type === 'product') prefix = 'PID-';
  //       else if (item.source_type === 'gift_set') prefix = 'GSID-';
  //       else if (item.source_type === 'charms_only') prefix = 'CID-';
        
  //       // Truncate name to 50 characters max for Midtrans
  //       const truncatedName = item.name.length > 50 
  //         ? `${item.name.substring(0, 47)}...` 
  //         : item.name;
        
  //       // Ensure price is an integer (Midtrans requirement)
  //       const price = Math.round(item.price);
        
  //       return {
  //         id: `${prefix}${item.id}`,
  //         name: truncatedName,
  //         price: price,
  //         quantity: item.quantity
  //       };
  //     });

  //     // Add shipping as an item if shipping fee > 0
  //     if (shippingFee > 0) {
  //       itemDetails.push({
  //         id: 'SHIPPING',
  //         name: 'Shipping',
  //         price: Math.round(shippingFee),
  //         quantity: 1
  //       });
  //     }

  //     // Calculate the exact total from items
  //     const itemsTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  //     // Prepare payload for Midtrans
  //     const payload = {
  //       order_id: orderData.order_id.toString(),
  //       gross_amount: itemsTotal, // Use calculated total
  //       email: shippingAddress.email,
  //       first_name: shippingAddress.first_name,
  //       last_name: shippingAddress.last_name,
  //       phone: shippingAddress.phone,
  //       address: shippingAddress.address,
  //       city: shippingAddress.city,
  //       postal_code: shippingAddress.postal_code,
  //       country: "IDN",
  //       item_details: itemDetails
  //     };

  //     console.log('Sending to /api/midtrans/token/:', payload);

  //     const response = await fetch(`${BASE_URL}/api/midtrans/token/`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${getAuthData()?.token}`
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       console.error('Error response from /api/midtrans/token/:', errorData);
  //       throw new Error(errorData.error || errorData.message || "Failed to process payment");
  //     }

  //     const paymentData = await response.json();
  //     console.log('Data from /api/midtrans/token/:', paymentData);

  //     // Check if snap.js is loaded
  //     if (typeof window.snap === 'undefined') {
  //       throw new Error('Payment gateway failed to load');
  //     }

  //     console.log('Midtrans token:', paymentData.token);
    
  //   // Force production environment
  //   window.snap.pay(paymentData.token, {
  //     onSuccess: (result) => {
  //       console.log('Payment success', result);
  //       navigate('/payment-success', { state: { orderId: orderData.order_id } });
  //     },
  //     onPending: (result) => {
  //       console.log('Payment pending', result);
  //       navigate('/payment-pending', { state: { orderId: orderData.order_id } });
  //     },
  //     onError: (error) => {
  //       console.log('Payment error', error);
  //       setPaymentError('Payment failed. Please try again.');
  //       setIsShowingLoader(false);
  //     },
  //     onClose: () => {
  //       console.log('User closed Midtrans popup');
  //       setIsShowingLoader(false);
  //       setShowCancelConfirmation(true);
  //     }
  //   });

  //   } catch (error) {
  //     console.error('Payment process error:', error);
  //     setPaymentError(error.message || "Something went wrong.");
  //     setIsShowingLoader(false);
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      setIsShowingLoader(true);
      setShowConfirmModal(false);

      let orderData = orderDataRef.current;
      let token = midtransToken;

      // Step 1: Only create order & fetch token if not already done
      if (!orderData || !token) {
        // Create order if not already created
        if (!orderData) {
          orderData = await createOrder();
          orderDataRef.current = orderData;
        }

        // Fetch Midtrans token if not already fetched
        const itemDetails = cartItems.map(item => {
          let prefix = '';
          if (item.source_type === 'product') prefix = 'PID-';
          else if (item.source_type === 'gift_set') prefix = 'GSID-';
          else if (item.source_type === 'charms_only') prefix = 'CID-';

          const truncatedName = item.name.length > 50 
            ? `${item.name.substring(0, 47)}...` 
            : item.name;

          const price = Math.round(item.price);

          return {
            id: `${prefix}${item.id}`,
            name: truncatedName,
            price: price,
            quantity: item.quantity
          };
        });

        if (shippingFee > 0) {
          itemDetails.push({
            id: 'SHIPPING',
            name: 'Shipping',
            price: Math.round(shippingFee),
            quantity: 1
          });
        }

        const itemsTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const payload = {
          order_id: orderData.order_id.toString(),
          gross_amount: itemsTotal,
          email: shippingAddress.email,
          first_name: shippingAddress.first_name,
          last_name: shippingAddress.last_name,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postal_code,
          country: "IDN",
          item_details: itemDetails,
          callback_url: window.location.origin + "/payment-callback", // or your domain
          finish_redirect_url: window.location.origin + "/payment-callback"
        };

        const response = await fetch(`${BASE_URL}/api/midtrans/token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthData()?.token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || "Failed to process payment");
        }

        const paymentData = await response.json();
        token = paymentData.token;
        setMidtransToken(token); // Cache token
      }

      // Step 2: Use cached token to open Midtrans popup
      if (typeof window.snap === 'undefined') {
        throw new Error('Payment gateway failed to load');
      }

      console.log('Reusing Midtrans token:', token);

      window.snap.pay(token, {
        onSuccess: async (result) => {
          const awbNumber = await createJNTOrder(orderData.order_id);
          const trackingNumber = awbNumber || orderData.order_id;
          navigate(`/track-order/${trackingNumber}`, {
            state: { orderId: orderData.order_id, awbNumber, paymentStatus: 'success' }
          });
        },
        onPending: async (result) => {
          console.log('Payment pending', result);
          
          // ✅ Create JNT order so shipment is ready
          // const awbNumber = await createJNTOrder(orderData.order_id);

          // ✅ Do NOT navigate — just close loader and let user stay
          setIsShowingLoader(false);
          setShowCancelConfirmation(true);

          // Optional: Show a toast or modal to inform user
          alert(
            `Your order is pending payment. Please complete the bank transfer.\n` +
            `Order ID: ${orderData.order_id}\n` +
            `Complete the payment to proceed with shipping by pressing the "Place My Order" button again.`
          );

          // Optionally, you can open a modal instead of alert
          // Or set a state like setPaymentStatus('pending')
        },
        onError: (error) => {
          console.log('Payment error', error);
          setPaymentError('Payment failed. Please try again.');
          setIsShowingLoader(false);
        },
        onClose: () => {
          console.log('User closed Midtrans popup');
          setIsShowingLoader(false);
          setShowCancelConfirmation(true);
          // Do NOT clear token here — let user retry
        }
      });

    } catch (error) {
      console.error('Payment process error:', error);
      setPaymentError(error.message || "Something went wrong.");
      setIsShowingLoader(false);
    } finally {
      setIsProcessingPayment(false);
    };
  };
  
  
  const isFormValid = () => {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'receiver_phone', 
      'address', 'city', 'postal_code', 'province', 'destAreaCode'
    ];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        return false;
      }
    }

    if (!selectedJNTLocation) {
      return false; // Must have valid JNT location
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      return false;
    }

    // Check if phone starts with 8 (Indonesian mobile) and has at least 7 digits
    const phoneDigits = shippingAddress.receiver_phone.replace(/\D/g, '');
    if (!shippingAddress.receiver_phone.startsWith('8') || phoneDigits.length < 7) {
      return false;
    }

    // Shipping fee
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
    setShowConfirmModal(true); // Show confirmation modal
  };

  const handleConfirmOrder = () => {
    setIsPaymentStarted(true); // Lock the form
    processPayment(); // proceed with payment
  };

  const handleCancelOrder = () => {
    setShowConfirmModal(false);
  };

 const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    navigate('/'); // ✅ Goes to homepage as defined in main.jsx
  };

  const handleKeepShopping = () => {
    setShowCancelConfirmation(false);
    // That's all — do nothing else
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

  const getUniqueCities = (locations) => {
    const cities = new Set();
    locations.forEach(location => {
      cities.add(location.kabupaten_kota);
    });
    return Array.from(cities).sort();
  };

  const filterLocationsByCity = (locations, city) => {
    if (!city) return locations;
    return locations.filter(location => 
      location.kabupaten_kota.toLowerCase().includes(city.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfaf3] p-6 text-[#3b322c]">
      <div className="max-w-6xl mx-auto">
        
        
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Your Order</h3>
              <p className="text-sm text-gray-600 mb-6">
                You will not be able to change your order after placing it. 
                Are you sure you want to proceed?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 
                            hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="px-4 py-2 rounded-lg bg-[#e9d6a9] text-black 
                            hover:bg-[#c4b182] transition-colors shadow-sm"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Loading Spinner */}
        {isShowingLoader && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-t-[#e9d6a9] border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700">Processing your order...</p>
            </div>
          </div>
        )}

        {showCancelConfirmation && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Cancel Order?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel your order? You won&apos;t be able to recover it.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleKeepShopping}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 
                            hover:bg-gray-100 transition-colors"
                >
                  Continue Checkout
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white 
                            hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}


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
                    className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                    required
                    disabled={isPaymentStarted} 
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={shippingAddress.last_name}
                    onChange={handleAddressChange}
                    placeholder="Last Name *"
                    className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                    required
                    disabled={isPaymentStarted} 
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={shippingAddress.email}
                  onChange={handleAddressChange}
                  placeholder="Email *"
                  className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                  required
                  disabled={isPaymentStarted} 
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
                  className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                  required
                  disabled={isPaymentStarted} 
                />
                <div className="flex items-center mb-2">
                  {/* Prefix Box */}
                  <div className="flex items-center justify-center px-3 h-11 bg-[#f6efe2] border border-[#e8dcc5] rounded-l-lg text-gray-700 text-sm font-medium">
                    +62
                  </div>

                  {/* Input Field */}
                  <input
                    type="tel"
                    name="receiver_phone"
                    value={shippingAddress.receiver_phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!/^\d*$/.test(value) && value !== '') return;
                      const digitsOnly = value.replace(/\D/g, '');
                      setShippingAddress(prev => ({ ...prev, receiver_phone: digitsOnly }));
                      setFormTouched(true);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!value) return;
                      if (!value.startsWith('8')) {
                        setFormError("Indonesian mobile numbers should start with 8");
                      }
                    }}
                    placeholder="811678977 *"
                    className={`flex-1 h-11 border rounded-r-lg px-4 bg-[#fdfaf3] transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#e8dcc5] focus:border-[#d6c9ab]
                      ${isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#e8dcc5]'
                    } ${formError && formError.includes('phone') ? 'border-red-500 focus:ring-red-300' : ''}`}
                    required
                    disabled={isPaymentStarted}
                  />
                </div>

                {/* Error Message */}
                {shippingAddress.receiver_phone && !shippingAddress.receiver_phone.startsWith('8') && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    Indonesian mobile numbers should start with 8
                  </p>
                )}


                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleCityChange}
                        onFocus={() => setShowCityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                        placeholder="City/Kabupaten *"
                        className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                          isPaymentStarted 
                            ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                            : 'border-[#f2e9d5]'
                        }`}
                        required
                        disabled={isPaymentStarted} 
                      />
                      {showCityDropdown && !isPaymentStarted && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                          {getUniqueCities(jntLocations)
                            .filter(city => city.toLowerCase().includes(shippingAddress.city.toLowerCase()))
                            .map((city, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleCitySelect(city)}
                              >
                                {city}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                  <div className="relative">
                    <select
                      name="destAreaCode"
                      value={shippingAddress.destAreaCode}
                      onChange={handleAreaCodeChange}
                      onClick={() => {
                        if (!shippingAddress.city) {
                          setAreaCodeError("Please select a city/kabupaten first");
                        }
                      }}
                      className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                        isPaymentStarted 
                          ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                          : 'border-[#f2e9d5]'
                      } ${
                        !shippingAddress.city ? 'cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={isPaymentStarted || isLoadingLocations || !shippingAddress.city}
                    >
                      <option value="">Select Area Code *</option>
                      {filteredLocations.map((location) => (
                        <option key={location.id} value={location.kecamatan_jnt}>
                          {location.kecamatan_jnt}
                        </option>
                      ))}
                    </select>
                    {isLoadingLocations && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {areaCodeError && !shippingAddress.city && (
                      <div className="text-red-500 text-xs mt-1">{areaCodeError}</div>
                    )}
                  </div>
                {locationsError && (
                  <div className="text-red-500 text-sm mb-3">
                    Failed to load area codes. Please try refreshing the page.
                  </div>
                )}

                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleAddressChange}
                    placeholder="Province *"
                    className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                    required
                    disabled={isPaymentStarted} 
                  />
                  <input
                    type="text"
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleAddressChange}
                    placeholder="Postal Code *"
                    className={`w-full border rounded-md px-4 py-2 mb-3 bg-[#fdfaf3] ${
                      isPaymentStarted 
                        ? 'border-gray-200 cursor-not-allowed text-gray-500' 
                        : 'border-[#f2e9d5]'
                    }`}
                    required
                    disabled={isPaymentStarted} 
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
                  disabled={isCalculatingShipping || !shippingAddress.city || !shippingAddress.destAreaCode || isPaymentStarted}
                  className={`w-full bg-[#e9d6a9] py-2 rounded-md mb-3 ${
                    isCalculatingShipping || isPaymentStarted
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[#e3c990]'
                  }`}
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