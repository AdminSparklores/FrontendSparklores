import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BASE_URL, 
  validateReviewToken, 
  fetchOrderDetails, 
  submitReview,
  fetchAllProducts,
  fetchAllGiftSets,
  fetchAllCharms,
  submitReviewJSON
} from '../utils/api';
import ImageWithFallback from './ImageWithFallback';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [giftSets, setGiftSets] = useState([]);
  const [charms, setCharms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    rating: 0,
    review_text: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch all necessary data
  useEffect(() => {
    if (!token) {
      setError("Invalid review link - missing token");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all reference data first
        const [productsData, giftSetsData, charmsData] = await Promise.all([
          fetchAllProducts(),
          fetchAllGiftSets(),
          fetchAllCharms()
        ]);
        
        setProducts(productsData);
        setGiftSets(giftSetsData);
        setCharms(charmsData);

        // Validate token and get order details
        const { user_id, order_id, review_token } = await validateReviewToken(token);
        const orderData = await fetchOrderDetails(order_id, review_token);
        setOrder(orderData);

        // Prepare items for display with full details
        const orderItems = orderData.items.map(item => {
          // Handle product items
          if (item.product) {
            const product = productsData.find(p => p.id === item.product) || {};
            return {
              type: 'product',
              id: item.product,
              name: item.product_name || product.name || `Product #${item.product}`,
              quantity: item.quantity,
              image: product.images?.[0]?.image_url || 'https://via.placeholder.com/100',
              price: product.price || '0.00'
            };
          }
          
          // Handle gift set items
          if (item.gift_set) {
            const giftSet = giftSetsData.find(g => g.id === item.gift_set) || {};
            return {
              type: 'gift_set',
              id: item.gift_set,
              name: item.gift_set_name || giftSet.name || `Gift Set #${item.gift_set}`,
              quantity: item.quantity,
              image: giftSet.image_url || giftSet.image || 'https://via.placeholder.com/100',
              price: giftSet.price || '0.00'
            };
          }
          
          // Handle charm items
          if (item.charms && item.charms.length > 0) {
            const charmDetails = item.charms.map(charmItem => {
              const charm = charmsData.find(c => c.id === charmItem.charm) || {};
              return {
                id: charmItem.charm,
                name: charmItem.charm_name || charm.name || `Charm #${charmItem.charm}`,
                image: charm.image || 'https://via.placeholder.com/100'
              };
            });
            
            return {
              type: 'charms',
              charms: charmDetails,
              quantity: item.quantity,
              price: charmDetails.reduce((sum, charm) => sum + parseFloat(charm.price || 0), 0)
            };
          }
          
          return null;
        }).filter(Boolean);

        setItems(orderItems);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setForm((prev) => ({
        ...prev,
        image: e.target.files[0] || null
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleStarClick = (idx) => {
    setForm((prev) => ({
      ...prev,
      rating: idx + 1
    }));
  };

  const handleSubmitConfirmation = () => {
    if (isSubmitDisabled()) {
      setError("Please complete all required fields before submitting");
      return;
    }
    setShowConfirmation(true);
  };

 const handleConfirmSubmit = async () => {
  setShowConfirmation(false);
  setSubmitting(true);
  setError("");
  setSubmitSuccess(false);

  try {
    // console.log("Order items (raw):", order.items);
    
    // Debug: Let's see the full structure of each order item
    order.items.forEach((item, index) => {
      // console.log(`Item ${index} full structure:`, JSON.stringify(item, null, 2));
      if (item.charms && item.charms.length > 0) {
        // console.log(`Item ${index} charms:`, item.charms);
        item.charms.forEach((charm, charmIndex) => {
          // console.log(`  Charm ${charmIndex}:`, charm);
          // console.log(`  Charm keys:`, Object.keys(charm));
        });
      }
    });

    // ✅ Get IDs directly from the original order.items
    const productIds = order.items
      .filter(item => item.product)
      .map(item => item.product);

    const giftSetIds = order.items
      .filter(item => item.gift_set)
      .map(item => item.gift_set);

    // ✅ Extract charm IDs - use the actual charm ID (433), not the relationship ID (31)
    const charmIds = order.items
      .filter(item => item.charms && item.charms.length > 0)
      .flatMap(item => {
        return item.charms.map(charm => {
          // console.log('Processing charm:', charm);
          // console.log('Using charm.charm (actual charm ID):', charm.charm);
          // Based on the example format, we need the actual charm ID (433)
          return charm.charm || charm.charm_id;
        }).filter(id => id !== null);
      });

    // console.log("Submitting product_ids:", productIds);
    // console.log("Submitting charm_ids:", charmIds);
    // console.log("Submitting gift_set_ids:", giftSetIds);

    // ✅ If there's an image, use FormData; otherwise use JSON
    if (form.image) {
      // Use FormData for image upload
      const formData = new FormData();
      formData.append("token", token);
      formData.append("rating", form.rating);
      formData.append("review_text", form.review_text);
      formData.append("image", form.image);
      
      // ✅ Backend expects 'product_ids', 'charm_ids', 'gift_set_ids' as field names
      // ✅ For FormData with arrays, append each item separately
      productIds.forEach(id => formData.append("product_ids", id));
      charmIds.forEach(id => formData.append("charm_ids", id));
      giftSetIds.forEach(id => formData.append("gift_set_ids", id));

      // Debug: log actual payload
      for (let [key, value] of formData.entries()) {
        // console.log("FormData entry:", key, value);
      }

      await submitReview(formData);
    } else {
      // Use JSON for cleaner array handling when no image
      const jsonData = {
        token: token,
        rating: form.rating,
        review_text: form.review_text,
        product_ids: productIds,
        charm_ids: charmIds,
        gift_set_ids: giftSetIds
      };

      // console.log("JSON payload:", jsonData);
      await submitReviewJSON(jsonData);
    }

    setSubmitSuccess(true);
    setForm({
      rating: 0,
      review_text: '',
      image: null
    });

  } catch (err) {
    // console.error("Review submission error:", err);
    setError(err.message || "Failed to submit review. Please try again.");
  } finally {
    setSubmitting(false);
  }
  };


  const renderStars = () => {
    return (
      <div className="flex gap-1 mt-2 mb-4">
        {[0,1,2,3,4].map(idx => (
          <button
            type="button"
            key={idx}
            onClick={() => handleStarClick(idx)}
            className="focus:outline-none"
            aria-label={`Rate ${idx+1} stars`}
          >
            <svg
              className={`w-8 h-8 ${form.rating > idx ? 'text-[#e3c990] fill-[#e3c990]' : 'text-[#f2e9d5] fill-[#f2e9d5]'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <polygon points="10,2 12.6,7.6 18.7,8.2 14,12.4 15.3,18.4 10,15.3 4.7,18.4 6,12.4 1.3,8.2 7.4,7.6" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isSubmitDisabled = () => {
    // If order is not loaded or there's an error
    if (!order || error) return true;
    
    // If required fields are not filled
    if (!form.rating || !form.review_text.trim()) return true;
    
    return false;
  };

  const renderOrderItems = () => {
      if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e3c990]"></div>
      </div>
    );
  }

  if (!items || !items.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">You've already submitted a review for this order.</div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#e9d6a9] rounded-md text-[#3b322c] hover:bg-[#e3c990] transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

    return items.map((item, index) => {
      if (!item) return null;
      
      // Handle charm items
      if (item.type === 'charms') {
        return (
          <div key={`charms-${index}`} className="flex gap-4 mb-6 p-4 border border-[#f2e9d5] rounded-lg">
            <div className="w-24 h-24 bg-[#f2e9d5] rounded-md flex items-center justify-center overflow-hidden">
              {item.charms[0]?.image ? (
                <ImageWithFallback 
                  src={item.charms[0].image} 
                  alt={item.charms[0].name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/100';
                  }}
                />
              ) : (
                <span className="text-[#3b322c]">Charms</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">Custom Charm Set</h3>
              {item.charms && item.charms.length > 0 && (
                <ul className="list-disc list-inside text-sm mt-1">
                  {item.charms.map((charm, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {charm.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[#b87777] font-semibold">
                  Qty: {item.quantity || 1}
                </span>
                <span className="text-[#3b322c] font-medium">
                  Rp. {parseInt(item.price || 0).toLocaleString('id-ID')},00
                </span>
              </div>
            </div>
          </div>
        );
      }

      // Handle product and gift set items
      return (
        <div key={`${item.type}-${item.id}-${index}`} className="flex gap-4 mb-6 p-4 border border-[#f2e9d5] rounded-lg">
          <div className="w-24 h-24 bg-[#f2e9d5] rounded-md flex items-center justify-center overflow-hidden">
            {item.image ? (
              <ImageWithFallback 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100';
                }}
              />
            ) : (
              <span className="text-[#3b322c] capitalize">{item.type?.replace('_', ' ') || 'item'}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-lg">{item.name}</h3>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-[#b87777] font-semibold">
                Qty: {item.quantity || 1}
              </span>
              <span className="text-[#3b322c] font-medium">
                Rp. {parseInt(item.price || 0).toLocaleString('id-ID')},00
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#fdfaf3] p-6 text-[#3b322c]">
      <div className="max-w-6xl mx-auto">
        <nav className="text-sm text-[#c9c3bc] mb-4">
            Home {'>'} Orders {'>'} <span className="text-[#3b322c] font-medium">Review</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Form */}
            <div className="md:w-1/2 border border-[#f2e9d5] rounded-xl p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>

            {error && !token && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Thank you for your review! Your feedback has been submitted successfully.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitConfirmation(); }} encType="multipart/form-data">
                <div className="mb-3">
                <label className="block mb-1 font-medium">Your Rating</label>
                {renderStars()}
                </div>
                <div className="mb-3">
                <label className="block mb-1 font-medium" htmlFor="review_text">Your Review</label>
                <textarea
                    id="review_text"
                    name="review_text"
                    value={form.review_text}
                    onChange={handleChange}
                    placeholder="Share your experience with these products"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#fdfaf3] min-h-[80px]"
                    required
                />
                </div>
                <div className="mb-3">
                <label className="block mb-1 font-medium">Upload an image (optional)</label>

                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
                <label
                    htmlFor="image"
                    className="inline-block cursor-pointer bg-[#f2e9d5] hover:bg-[#e9d6a9] text-[#3b322c] text-sm font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Choose Image
                </label>

                {form.image && (
                    <ImageWithFallback
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded-md border border-[#e9d6a9]"
                    />
                )}
                </div>
                {error && (
                <div className="text-xs text-red-500 mb-2">{error}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#e9d6a9] text-lg font-medium py-3 mt-2 rounded-md hover:bg-[#e3c990] transition-colors disabled:opacity-50"
                  disabled={submitting || isSubmitDisabled()}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
            </div>

            {/* Right Side - Order Info */}
            <div className="md:w-1/2 border border-[#f2e9d5] rounded-xl p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-4">Your Order</h2>
            
            {/* Order Summary */}
            {order ? (
              <div className="mb-6 p-4 bg-[#fdfaf3] rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order #:</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{order.fulfillment_status}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Payment:</span>
                  <span className="capitalize">{order.payment_status}</span>
                </div>
                {order.shipping_address && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Shipping Address:</span>
                    <span className="text-right">{order.shipping_address}</span>
                  </div>
                )}
                <div className="border-t border-[#f2e9d5] my-3"></div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>Rp. {parseInt(order.total_price).toLocaleString('id-ID')},00</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-[#fdfaf3] rounded-lg">
                Loading order details...
              </div>
            )}

            {/* Product Info */}
            <h3 className="font-medium text-lg mb-3">Items in this order</h3>
            {renderOrderItems()}
            </div>
        </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Review Submission</h3>
              <p className="mb-6">Are you sure you want to submit this review? You won't be able to edit it after submission.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-[#3b322c] rounded-md text-[#3b322c] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-4 py-2 bg-[#e9d6a9] rounded-md text-[#3b322c] hover:bg-[#e3c990]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ReviewPage;