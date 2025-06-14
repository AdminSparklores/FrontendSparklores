import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { BASE_URL, isLoggedIn, addToCart } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';

// BASE IMAGES
import baseNecklace from "../../assets/default/basenecklace.png";

// Function to format numbers as Indonesian Rupiah
const formatIDR = (amount) => {
  return "Rp " + Number(amount).toLocaleString("id-ID", { maximumFractionDigits: 2 }).replace(/,/g, ".");
};

const ProductDetailCharm = () => {
  const { productId } = useParams();
  const [charm, setCharm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showCharms, setShowCharms] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [discountItem, setDiscountItem] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  // Login popup state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  // Auto-close Snackbar after 3 seconds
  useEffect(() => {
    let timer;
    if (showSnackbar) {
      timer = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSnackbar]);

  // Check login state on mount and when auth changes
  useEffect(() => {
    setIsLoggedInState(isLoggedIn());
    // Listen for storage changes for login state
    const handleStorageChange = (e) => {
      if (e.key === 'authData') {
        setIsLoggedInState(isLoggedIn());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchCharmAndDiscount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/charms/${productId}/`);
        if (!response.ok) throw new Error('Failed to fetch charm');
        const data = await response.json();
        setCharm(data);
        setMainImage(data.image);

        // Fetch discount campaigns and find if this charm is in a campaign
        const discountRes = await fetch(`${BASE_URL}/api/discount-campaigns/`);
        if (discountRes.ok) {
          const discountData = await discountRes.json();
          let found = null;
          for (const campaign of discountData) {
            if (campaign.items && campaign.items.length > 0) {
              const item = campaign.items.find((itm) => itm.product && itm.product.id == data.id);
              if (item) {
                found = item;
                break;
              }
            }
          }
          setDiscountItem(found);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCharmAndDiscount();
  }, [productId]);

  // Handler for Add to Cart (checks login)
  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await addToCart(null, { charms: [productId], quantity: 1 });
      setSnackbarMessage('Charm added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
      setShowPopup(true);
      setShowCharms(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to add charm to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  const handleAddOrSkipCharms = () => {
    setShowCharms(false);
    setShowNote(true);
  };

  const handleNoteSubmit = () => {
    setShowNote(false);
    setShowPopup(false);
    // Submit note here if needed
  };

  // Login Prompt Handler
  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  if (loading) {
    return (
      <div className='bg-[#faf7f0] flex justify-center items-center h-64'>
        <p>Loading charm details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[#faf7f0] flex justify-center items-center h-64'>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!charm) {
    return (
      <div className='bg-[#faf7f0] flex justify-center items-center h-64'>
        <p>Charm not found</p>
      </div>
    );
  }

  // Discount logic
  let displayPrice = parseFloat(charm.price);
  let oldPrice = null;
  let discountLabel = "";
  if (discountItem) {
    const discountType = discountItem.discount_type;
    const discountValue = parseFloat(discountItem.discount_value || "0");
    if (discountType === "percent") {
      displayPrice = displayPrice * (1 - discountValue / 100);
      oldPrice = parseFloat(charm.price);
      discountLabel = `${discountValue}% OFF`;
    } else if (discountType === "amount") {
      displayPrice = discountValue;
      oldPrice = parseFloat(charm.price);
      // percent = (original - discounted) / original * 100
      const percent = oldPrice > 0
        ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100)
        : 0;
      discountLabel = `${percent}% OFF`;
    }
  } else if (parseFloat(charm.discount || 0) > 0) {
    const discountValue = parseFloat(charm.discount);
    displayPrice = parseFloat(charm.price) * (1 - discountValue / 100);
    oldPrice = parseFloat(charm.price);
    discountLabel = `${discountValue}% OFF`;
  }

  // Create thumbnails array (using the same image for all thumbnails since the API only provides one image)
  const thumbnails = [charm.image];

  return (
    <div className='bg-[#faf7f0] relative'>
      {/* Login Prompt Popup */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to add items to your cart.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleCloseLoginPrompt}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                  onClick={handleCloseLoginPrompt}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />

      {/* Popup Overlay */}
      {showPopup && (
        <>
          {showCharms && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.8)] z-50">
              <div className="bg-[#fdfaf3] p-6 rounded-2xl border-2 border-black text-center max-w-xl w-full">
                <h2 className="text-2xl font-semibold text-[#3b322c]">SURPRISE!</h2>
                <p className="mt-2 text-[#3b322c]">You've unlocked limited edition charms</p>
                <div className="flex gap-4 justify-center mt-6">
                  <button onClick={handleAddOrSkipCharms} className="bg-[#e9d6a9] text-[#3b322c] font-medium py-2 px-6 rounded-md">Add to Cart</button>
                </div>
              </div>
            </div>
          )}

          {showNote && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.8)] z-50">
              <div className="bg-[#fdfaf3] p-6 rounded-2xl border-2 border-black text-center max-w-lg w-full">
                <h2 className="text-2xl font-semibold text-[#3b322c]">Make It Extra Special</h2>
                <p className="mt-2 text-[#3b322c]">Write a special note for someone you love!</p>

                <textarea
                  maxLength={65}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write it and we'll deliver!"
                  className="w-full mt-4 p-4 border border-[#e9d6a9] rounded-md bg-transparent text-[#3b322c] placeholder-[#3b322c] h-40 resize-none"
                ></textarea>
                <div className="text-right text-sm text-[#3b322c]">{note.length}/65</div>

                <div className="flex gap-4 justify-center mt-4">
                  <button onClick={handleNoteSubmit} className="bg-[#e9d6a9] text-[#3b322c] font-medium py-2 px-6 rounded-md">Add Note</button>
                  <button onClick={handleNoteSubmit} className="border border-[#e9d6a9] text-[#3b322c] font-medium py-2 px-6 rounded-md">Skip</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 font-serif text-[#2d2a26]">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          Home &gt; <span className="text-gray-500">Charms</span> &gt; <span className="text-black font-medium">{charm.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Thumbnail Images */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 order-2 md:order-1">
            {thumbnails.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Thumbnail ${idx + 1}`}
                onClick={() => setMainImage(src)}
                className="flex-shrink-0 w-16 h-16 object-cover rounded cursor-pointer border border-gray-200 hover:border-gray-400 transition"
              />
            ))}
          </div>

          {/* Main Charm Image */}
          <div className="flex-1 order-1 md:order-2">
            <img
              src={mainImage}
              alt={charm.name}
              className="w-full max-w-lg rounded-lg shadow-md"
            />
          </div>

          {/* Charm Info */}
          <div className="flex-1 order-3">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">{charm.name}</h2>
            <div className="text-xs tracking-wider border border-[#f6e3b8] text-[#a9a9a9] px-2 py-0.5 inline-block mb-2">
              {charm.category.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="mb-4">
              {discountLabel ? (
                <div>
                  <span className="text-lg font-bold text-red-500 mr-2">{formatIDR(displayPrice)}</span>
                  <span className="text-base line-through text-gray-400 mr-2">{formatIDR(charm.price)}</span>
                  <span className="text-xs font-semibold bg-[#c3a46f] text-white px-2 py-1 rounded">{discountLabel}</span>
                </div>
              ) : (
                <span className="text-lg font-bold">{formatIDR(charm.price)}</span>
              )}
            </div>
            <div className="md:hidden border-t border-gray-200 my-4"></div>
            <p className="text-base text-[#4d4a45] mb-4 leading-relaxed">
              {charm.description}
            </p>

            <div className="text-sm">
              <p className="mb-1 font-medium">Charm Details</p>
              <ul className="list-disc pl-5 text-[#4d4a45]">
                <li>Category: {charm.category.replace(/_/g, ' ')}</li>
                <li>Material: {charm.label || 'Not specified'}</li>
                <li>Stock: {charm.stock} available</li>
                <li>Rating: {charm.rating}/5</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-10 md:block hidden">
          <button 
            onClick={handleAddToCart}
            disabled={charm.stock === 0}
            className={`w-[53%] px-10 py-4 text-lg ${charm.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#f6e3b8] hover:opacity-90'} text-[#2d2a26] font-medium rounded transition`}
          >
            {charm.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        <div className="mt-6 md:hidden order-4">
          <button 
            onClick={handleAddToCart}
            disabled={charm.stock === 0}
            className={`w-full px-10 py-4 text-lg ${charm.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#f6e3b8] hover:opacity-90'} text-[#2d2a26] font-medium rounded transition`}
          >
            {charm.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailCharm;