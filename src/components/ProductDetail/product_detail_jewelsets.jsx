import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL, isLoggedIn, addToCart } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';

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

const ProductDetailJewelSets = () => {
  const { productId } = useParams();
  const [giftSet, setGiftSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [mainIdx, setMainIdx] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [jewelSetProducts, setJewelSetProducts] = useState([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

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
        const response = await fetch(`${BASE_URL}/api/products/${productId}/`);
        if (!response.ok) throw new Error('Failed to fetch gift set');
        const data = await response.json();
        setGiftSet(data);

        // Fetch all jewel_set_products' data, if present
        if (Array.isArray(data.jewel_set_products) && data.jewel_set_products.length > 0) {
          // Fetch all product details in parallel
          const productFetches = data.jewel_set_products.map(id =>
            fetch(`${BASE_URL}/api/products/${id}/`).then((res) => res.ok ? res.json() : null)
          );
          const includedProducts = await Promise.all(productFetches);
          setJewelSetProducts(includedProducts.filter(Boolean));
        }

        // If you have an array of images, use that. Otherwise, fallback to a single image.
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

  // Handler for Add to Cart (checks login)
  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await addToCart(productId, { quantity: 1 });
      setSnackbarMessage('Jewel set added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to add jewel set to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
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

  // Parse details string to display as bullet points
  const getDetailsList = (detailsStr) => {
    if (!detailsStr) return [];
    return detailsStr
      .split(/\r?\n/)
      .map(line => line.replace(/^\s*-\s*/, '').trim())
      .filter(line => line.length > 0);
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

  // Details as bullets
  const detailList = getDetailsList(giftSet.details);

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

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 font-serif text-[#2d2a26]">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          Home &gt; <span className="text-gray-500">Jewel Sets</span> &gt; <span className="text-black font-medium">{giftSet.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Thumbnail Images */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 order-2 md:order-1">
            {thumbnails.map((src, idx) => (
              <img
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

          {/* Main Gift Set Image with arrows on hover */}
          <div
            className="flex-1 order-1 md:order-2 relative flex items-center justify-center group"
            onMouseEnter={() => setShowArrows(true)}
            onMouseLeave={() => setShowArrows(false)}
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
            <img
              src={mainImage}
              alt={giftSet.name}
              className="w-full max-w-lg rounded-lg shadow-md object-contain"
            />
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
              {giftSet.rating && (
                <span className="ml-4 text-sm text-yellow-500">★ {Number(giftSet.rating).toFixed(1)}</span>
              )}
            </div>
            <div className="md:hidden border-t border-gray-200 my-4"></div>
            <p className="text-base text-[#4d4a45] mb-4 leading-relaxed">
              {giftSet.description}
            </p>

            <div className="text-sm">
              <p className="mb-1 font-medium">Jewel Set Details</p>
              <ul className="list-disc pl-5 text-[#4d4a45]">
                {detailList.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
                <li>Material: {giftSet.label}</li>
              </ul>
              {jewelSetProducts.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 font-medium">Included Products:</p>
                  <ul className="list-disc pl-5 text-[#4d4a45]">
                    {jewelSetProducts.map((prod) => (
                      <li key={prod.id}>
                        <span className="font-semibold">{prod.name}</span>
                        <span className="block text-xs">
                          Category: {prod.category}, Material: {prod.label}, Price: {formatIDR(prod.price)}
                        </span>
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
    </div>
  );
};

export default ProductDetailJewelSets;