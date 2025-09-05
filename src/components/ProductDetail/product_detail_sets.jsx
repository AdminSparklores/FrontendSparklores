import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL, isLoggedIn, addToCart, getAuthData } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';
import ImageWithFallback from '../ImageWithFallback.jsx';

// Helper: format IDR currency
const formatIDR = (amount) => {
  return "Rp " + Number(amount).toLocaleString("id-ID", { maximumFractionDigits: 2 }).replace(/,/g, ".");
};

const ArrowIcon = ({ direction = "left" }) => (
  <svg
    width="2em"
    height="2em"
    viewBox="0 0 24 24"
    fill="none"
    className="inline"
    style={{ display: 'block' }}
  >
    {direction === "left" ? (
      <path d="M15 18l-6-6 6-6" stroke="#b87777" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M9 6l6 6-6 6" stroke="#b87777" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const ProductDetailSets = () => {
  const { productId } = useParams();
  const [giftSet, setGiftSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [mainIdx, setMainIdx] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showPopup, setShowPopup] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');

  // Touch handling for swipe
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  useEffect(() => {
    setIsLoggedInState(isLoggedIn());
    const handleStorageChange = (e) => {
      if (e.key === 'authData') {
        setIsLoggedInState(isLoggedIn());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchGiftSet = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/gift-sets/${productId}/`);
        if (!response.ok) throw new Error('Failed to fetch gift set');
        const data = await response.json();
        setGiftSet(data);
        if (Array.isArray(data.images) && data.images.length > 0) {
          setMainImage(data.images[0].image_url || data.images[0].image || "");
          setMainIdx(0);
        } else {
          setMainImage(data.image_url || data.image || "");
          setMainIdx(0);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGiftSet();
  }, [productId]);

  const handleNoteSubmit = async (addMessage) => {
    try {
      const authData = getAuthData();
      if (!authData) throw new Error('Not authenticated');

      // Add to cart with the message (or null if skipping)
      await addToCart(null, { 
        gift_set: productId,
        quantity: 1,
        message: addMessage ? note : null
      });

      setShowNote(false);
      setShowPopup(false);
      setNote('');

      setSnackbarMessage(
        addMessage 
          ? 'Gift set added to cart with message!' 
          : 'Gift set added to cart!'
      );
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbarMessage(error.message || 'Failed to add to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  // Handler for Add to Cart (checks login)
  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    // Show the message popup first
    setShowPopup(true);
    setShowNote(true);
  };

  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  // Thumbnails array: support multiple images (array) or fallback to single image
  let thumbnails = [];
  if (giftSet) {
    if (Array.isArray(giftSet.images) && giftSet.images.length > 0) {
      thumbnails = giftSet.images.map(img => img.image_url || img.image);
    } else if (giftSet.image_url || giftSet.image) {
      thumbnails = [giftSet.image_url || giftSet.image];
    }
  }
  const totalImages = thumbnails.length;

  // If the mainImage is changed via thumbnail, update idx
  useEffect(() => {
    if (mainImage && thumbnails.length > 0) {
      const idx = thumbnails.indexOf(mainImage);
      if (idx !== -1) setMainIdx(idx);
    }
    // eslint-disable-next-line
  }, [mainImage]);

  const handlePrev = () => {
    if (totalImages === 0) return;
    const prevIdx = (mainIdx - 1 + totalImages) % totalImages;
    setMainIdx(prevIdx);
    setMainImage(thumbnails[prevIdx]);
  };
  const handleNext = () => {
    if (totalImages === 0) return;
    const nextIdx = (mainIdx + 1) % totalImages;
    setMainIdx(nextIdx);
    setMainImage(thumbnails[nextIdx]);
  };

  // Touch event handlers for swipe (mobile)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchEndX.current - touchStartX.current;
      if (Math.abs(diff) > 45) {
        if (diff < 0) {
          // Swipe left
          handleNext();
        } else {
          // Swipe right
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <div className='bg-[#faf7f0] flex justify-center items-center h-64'>
        <p>Loading set details...</p>
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

  if (!giftSet) {
    return (
      <div className='bg-[#faf7f0] flex justify-center items-center h-64'>
        <p>Gift set not found</p>
      </div>
    );
  }

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
          {showNote && (
            <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.8)] z-50">
              <div className="bg-[#fdfaf3] p-6 rounded-2xl border-2 border-black text-center max-w-lg w-full">
                <h2 className="text-2xl font-semibold text-[#3b322c]">Make It Extra Special</h2>
                <p className="mt-2 text-[#3b322c]">Write a special notes for someone you love!</p>

                <textarea
                  maxLength={65}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write it and we'll deliver!"
                  className="w-full mt-4 p-4 border border-[#e9d6a9] rounded-md bg-transparent text-[#3b322c] placeholder-[#3b322c] h-40 resize-none"
                ></textarea>
                <div className="text-right text-sm text-[#3b322c]">{note.length}/65</div>

                <div className="flex gap-4 justify-center mt-4">
                  <button 
                    onClick={() => handleNoteSubmit(true)} 
                    className="bg-[#e9d6a9] text-[#3b322c] font-medium py-2 px-6 rounded-md"
                  >
                    Add with Message
                  </button>
                  <button 
                    onClick={() => handleNoteSubmit(false)} 
                    className="border border-[#e9d6a9] text-[#3b322c] font-medium py-2 px-6 rounded-md"
                  >
                    Skip Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 font-serif text-[#2d2a26]">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          Home &gt; <span className="text-gray-500">Gift Sets</span> &gt; <span className="text-black font-medium">{giftSet.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Thumbnail Images For Desktop (md and up) */}
          {thumbnails.length > 0 && (
            <div
              className={`
                hidden md:flex md:flex-col gap-4 overflow-visible pb-2 order-2 md:order-1
              `}
            >
              {thumbnails.map((src, idx) => (
                <ImageWithFallback
                  key={idx}
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => {
                    setMainImage(src);
                    setMainIdx(idx);
                  }}
                  className={`flex-shrink-0 w-16 h-16 object-cover rounded cursor-pointer border ${idx === mainIdx ? 'border-[#b87777] ring-2 ring-[#b87777]' : 'border-gray-200 hover:border-gray-400'} transition`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Images For Mobile (sm only, always horizontal scrollable) */}
          {thumbnails.length > 0 && (
            <div
              className={`
                flex md:hidden gap-4 pb-2 order-2 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-[#e6d4a5] scrollbar-track-[#faf7f0]
              `}
              style={{
                WebkitOverflowScrolling: 'touch',
                minHeight: '64px',
                maxWidth: '100%',
              }}
            >
              {thumbnails.map((src, idx) => (
                <ImageWithFallback
                  key={idx}
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => {
                    setMainImage(src);
                    setMainIdx(idx);
                  }}
                  className={`flex-shrink-0 w-16 h-16 object-cover rounded cursor-pointer border ${idx === mainIdx ? 'border-[#b87777] ring-2 ring-[#b87777]' : 'border-gray-200 hover:border-gray-400'} transition`}
                />
              ))}
            </div>
          )}

          {/* Main Gift Set Image with arrows on hover and swipe support */}
          <div
            className="flex-1 order-1 md:order-2 relative flex items-center justify-center group touch-pan-x"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {totalImages > 1 && showArrows && (
              <button
                aria-label="Previous image"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 shadow-md rounded-full p-2 z-20 border border-[#e9d6a9] transition"
                style={{outline: 0}}
              >
                <ArrowIcon direction="left" />
              </button>
            )}
            <div className="aspect-square overflow-hidden rounded-md">
              <ImageWithFallback
                src={mainImage}
                alt={giftSet.name}
                className="w-full max-w-lg rounded-lg shadow-md object-contain"
                draggable={false}
              />
            </div>
            {totalImages > 1 && showArrows && (
              <button
                aria-label="Next image"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 shadow-md rounded-full p-2 z-20 border border-[#e9d6a9] transition"
                style={{outline: 0}}
              >
                <ArrowIcon direction="right" />
              </button>
            )}
          </div>

          {/* Gift Set Info */}
          <div className="flex-1 order-3">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">{giftSet.name}</h2>
            <div className="text-xs tracking-wider border border-[#f6e3b8] text-[#a9a9a9] px-2 py-0.5 inline-block mb-2">
              {giftSet.label ? giftSet.label.replace(/_/g, ' ').toUpperCase() : ""}
            </div>
            <div className="mb-4">
              <span className="text-lg font-bold">{formatIDR(giftSet.price)}</span>
            </div>
            <div className="md:hidden border-t border-gray-200 my-4"></div>
            <p className="text-base text-[#4d4a45] mb-4 leading-relaxed">
              {giftSet.description}
            </p>

            <div className="text-sm">
              <p className="mb-1 font-medium">Gift Set Details</p>
              <ul className="list-disc pl-5 text-[#4d4a45]">
                <li>Created: {new Date(giftSet.created_at).toLocaleString()}</li>
                <li>Products in Set: {giftSet.products ? giftSet.products.length : 0}</li>
              </ul>
              {Array.isArray(giftSet.products) && giftSet.products.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 font-medium">Included Products:</p>
                  <ul className="list-disc pl-5 text-[#4d4a45]">
                    {giftSet.products.map((prod) => (
                      <li key={prod.id}>
                        <span className="font-semibold">{prod.name}</span><br/>
                        <span className="text-xs">Category: {prod.category}, Material: {prod.label}, Price: {formatIDR(prod.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-10 md:block hidden">
          <button 
            onClick={handleAddToCart}
            className={`w-[53%] px-10 py-4 text-lg bg-[#f6e3b8] hover:opacity-90 text-[#2d2a26] font-medium rounded transition`}
          >
            Add to Cart
          </button>
        </div>
        <div className="mt-6 md:hidden order-4">
          <button 
            onClick={handleAddToCart}
            className={`w-full px-10 py-4 text-lg bg-[#f6e3b8] hover:opacity-90 text-[#2d2a26] font-medium rounded transition`}
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* Custom scrollbar styling (Tailwind CSS 'scrollbar-thin' etc. or add your custom CSS) */}
      <style>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-[#e6d4a5]::-webkit-scrollbar-thumb {
          background: #e6d4a5;
        }
        .scrollbar-track-[#faf7f0]::-webkit-scrollbar-track {
          background: #faf7f0;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailSets;