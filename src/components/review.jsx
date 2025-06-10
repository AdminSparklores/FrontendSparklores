import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, fetchProduct, getAuthData } from '../utils/api';

const STATIC_ORDER_ID = 3; // Changed to use order ID 3 as requested
const STATIC_PRODUCT_ID = 1; // static product id for now

const ReviewPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    user_name: '',
    rating: 0,
    review_text: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch product and order info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product
        const prod = await fetchProduct(STATIC_PRODUCT_ID);
        setProduct(prod);
        
        // Fetch order data
        const authData = getAuthData();
        if (!authData) {
          throw new Error("Authentication required");
        }
        
        const orderResponse = await fetch(`${BASE_URL}/api/orders/${STATIC_ORDER_ID}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`
          }
        });
        
        if (!orderResponse.ok) {
          throw new Error("Failed to load order data");
        }
        
        const orderData = await orderResponse.json();
        setOrder(orderData);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      }
    };
    fetchData();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSubmitSuccess(false);

    if (!form.user_name.trim() || !form.review_text.trim() || form.rating < 1) {
      setError("Please fill all fields and select a rating.");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_name", form.user_name);
      formData.append("rating", form.rating);
      formData.append("review_text", form.review_text);
      if (form.image) formData.append("image", form.image);
      formData.append("products", STATIC_PRODUCT_ID);
      formData.append("order", STATIC_ORDER_ID);

      const res = await fetch(`${BASE_URL}/api/reviews/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to submit review");
      }
      setSubmitSuccess(true);
      setForm({
        user_name: '',
        rating: 0,
        review_text: '',
        image: null
      });
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Style helper for stars
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

  // Format date for display
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

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                <label className="block mb-1 font-medium" htmlFor="user_name">Your Name</label>
                <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    value={form.user_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#fdfaf3]"
                    required
                />
                </div>
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
                    placeholder="Share your experience with this product"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#fdfaf3] min-h-[80px]"
                    required
                />
                </div>
                <div className="mb-3">
                <label className="block mb-1 font-medium">Upload an image</label>

                {/* Hidden input */}
                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />
                {/* Styled label as button */}
                <label
                    htmlFor="image"
                    className="inline-block cursor-pointer bg-[#f2e9d5] hover:bg-[#e9d6a9] text-[#3b322c] text-sm font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Choose Image
                </label>

                {form.image && (
                    <img
                    src={URL.createObjectURL(form.image)}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded-md border border-[#e9d6a9]"
                    />
                )}
                </div>
                {error && (
                <div className="text-xs text-red-500 mb-2">{error}</div>
                )}
                {submitSuccess && (
                <div className="text-xs text-green-600 mb-2">
                    Thank you for your review!
                </div>
                )}
                <button
                type="submit"
                className="w-full bg-[#e9d6a9] text-lg font-medium py-3 mt-2 rounded-md hover:bg-[#e3c990] transition-colors disabled:opacity-50"
                disabled={submitting}
                >
                {submitting ? "Submitting..." : "Submit Review"}
                </button>
            </form>
            </div>

            {/* Right Side - Order Info */}
            <div className="md:w-1/2 border border-[#f2e9d5] rounded-xl p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-4">Your Order</h2>
            
            {/* Order Summary */}
            {order && (
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
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Shipping Address:</span>
                  <span className="text-right">{order.shipping_address}</span>
                </div>
                <div className="border-t border-[#f2e9d5] my-3"></div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>Rp. {parseInt(order.total_price).toLocaleString('id-ID')},00</span>
                </div>
              </div>
            )}

            {/* Product Info */}
            {product ? (
                <div className="flex gap-4">
                <img
                    src={product.images?.[0]?.image_url || "https://via.placeholder.com/100"}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md border border-[#f2e9d5]"
                    onError={e => { e.target.onerror = null; e.target.src="https://via.placeholder.com/100"; }}
                />
                <div>
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    {/* <p className="text-sm">{product.description}</p> */}
                    <div className="mt-2 text-[#b87777] font-semibold">
                    Rp. {parseInt(product.price).toLocaleString('id-ID')},00
                    </div>
                </div>
                </div>
            ) : (
                <div className="text-red-500">{error || "Loading product..."}</div>
            )}
            </div>
        </div>
        </div>
    </div>
  );
};

export default ReviewPage;