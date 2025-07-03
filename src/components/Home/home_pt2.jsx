import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { isLoggedIn, addToCart, BASE_URL } from "../../utils/api";
import Snackbar from '../snackbar.jsx';

// Helper: format IDR currency
const formatIDR = (value) =>
  "Rp " +
  Number(value)
    .toLocaleString("id-ID", { maximumFractionDigits: 2 })
    .replace(/,/g, ".");

const HomePart2 = () => {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  // Hover logic for showing the second image
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Calculate the countdown from now to end_time
  useEffect(() => {
    if (!campaign || !campaign.end_time) return;

    const endTime = new Date(campaign.end_time).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = endTime - now;
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setCountdown({
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      } else {
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaign]);

  // Fetch discount campaign
  useEffect(() => {
    const fetchDiscountCampaign = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/discount-campaigns/`);
        if (!response.ok) throw new Error("Failed to fetch discount campaign");
        const data = await response.json();

        // Find the currently running or upcoming campaign
        const now = new Date();
        const active = data.find((c) => new Date(c.end_time) > now && c.items && c.items.length > 0);
        setCampaign(active || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountCampaign();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await addToCart(productId, { quantity: 1 });
      setSnackbarMessage('Item added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

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

  if (isLoading) {
    return (
      <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem] flex justify-center items-center h-64">
        <p>Loading special offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem] flex justify-center items-center h-64">
        <p>Error: {error}</p>
      </div>
    );
  }

  // No campaign or no items
  if (!campaign || !campaign.items || campaign.items.length === 0) {
    return (
      <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem]">
        <h2 className="text-2xl md:text-5xl mb-5 md:mb-0">SPECIAL OFFER</h2>
        <div className="text-center py-10">
          <p>No special offers available at the moment</p>
        </div>
      </div>
    );
  }

  // Display the first campaign found
  return (
    <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem]">
      <div className="flex justify-between px-3 md:px-[2rem] items-center">
        <h2 className="text-2xl md:text-5xl mb-5 md:mb-0">SPECIAL OFFER</h2>
        <div className="block md:flex items-center justify-between">
          <div className="text-sm md:text-2xl font-medium mr-3 md:mr-10">ENDS IN</div>
          <div className="text-right">
            <div className="flex justify-end space-x-2 md:space-x-4">
              <span className="text-2xl font-mono">{countdown.days}</span>
              <span className="text-2xl font-mono">{countdown.hours}</span>
              <span className="text-2xl font-mono">{countdown.minutes}</span>
              <span className="text-2xl font-mono">{countdown.seconds}</span>
            </div>
            <div className="flex justify-end space-x-2 md:space-x-4 mt-1">
              <span className="text-xs">Days</span>
              <span className="text-xs">Hrs</span>
              <span className="text-xs">Mins</span>
              <span className="text-xs">Secs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 md:gap-6 mt-6">
        {campaign.items.map((item, index) => {
          const p = item.product;
          const discountType = item.discount_type;
          const discountValue = parseFloat(item.discount_value || "0");
          const originalPrice = parseFloat(p.price);

          let discountedPrice = originalPrice;
          let discountLabel = "";
          if (discountType === "percent") {
            discountedPrice = originalPrice * (1 - discountValue / 100);
            discountLabel = `${discountValue}% OFF`;
          } else if (discountType === "amount") {
            discountedPrice = discountValue;
            const percent =
              originalPrice > 0
                ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                : 0;
            discountLabel = `${percent}% OFF`;
          }

          // Hover and show second image logic
          const isHovered = hoveredProductId === p.id;
          const imageList = p.images && p.images.length > 0 ? p.images : [{ image_url: p.image }];
          // If hovered and there is a second image, show it, else show first image
          const showImageIdx = isHovered && imageList.length > 1 ? 1 : 0;
          const currentImage = imageList[showImageIdx] ? imageList[showImageIdx].image_url : '../../assets/default/banner_home.jpeg';

          return (
            <div
              key={p.id}
              className={`transition-all duration-200 bg-[#F9F5EE] rounded-lg ${
                p.stock === 0 ? 'opacity-70' : 'cursor-pointer'
              } ${isHovered ? 'shadow-xl scale-[1.04] z-20' : ''}`}
              style={{
                padding: "0.75rem",
                border: "none",
                outline: "none",
                background: isHovered ? "#f9f5ee" : "#F9F5EE",
                boxShadow: isHovered
                  ? "0 4px 32px 0 rgba(176,157,131,.18), 0 1.5px 4px 0 rgba(176,157,131,.22), 0 0.5px 1.5px 0 rgba(176,157,131,.16)"
                  : "none",
                transform: isHovered ? "scale(1.04)" : "scale(1)",
                transition:
                  "box-shadow 0.18s cubic-bezier(.4,2,.6,1), transform 0.18s cubic-bezier(.4,2,.6,1), background 0.2s"
              }}
              onClick={() => p.stock > 0 && handleProductClick(p.id)}
              onMouseEnter={() => setHoveredProductId(p.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <div className="relative w-full" style={{
                aspectRatio: "1 / 1",
                minHeight: 0,
                background: "#f7f3e9"
              }}>
                {/* Show only the currentImage */}
                <img
                  src={currentImage}
                  alt={p.name}
                  className={`rounded-lg w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-500 ${p.stock === 0 ? 'grayscale' : ''} opacity-100 z-10`}
                  style={{
                    pointerEvents: "none",
                    aspectRatio: "1 / 1",
                    transition: 'opacity 0.5s cubic-bezier(0.45,0.05,0.55,0.95)'
                  }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '../../assets/default/banner_home.jpeg';
                  }}
                />
                {/* Dark overlay on hover */}
                <div
                  className={`absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none
                    transition duration-300
                    ${isHovered ? "bg-black/60" : "bg-black/0"}`}
                  style={{
                    transition: "background-color 0.3s cubic-bezier(0.45,0.05,0.55,0.95)",
                    aspectRatio: "1 / 1"
                  }}
                />
                {/* Stock Status Badge */}
                {p.stock === 0 ? (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    SOLD OUT
                  </div>
                ) : p.stock < 10 ? (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
                    LOW STOCK
                  </div>
                ) : null}
                {/* Discount Badge */}
                {discountLabel && (
                  <div className="absolute top-2 right-2 bg-[#c3a46f] text-white text-xs font-bold px-2 py-1 rounded z-20">
                    {discountLabel}
                  </div>
                )}
                {/* Only show add to cart button if product is in stock */}
                {p.stock > 0 && (
                  <div className="absolute bottom-2 right-2 bg-[#faf7f0] p-2 rounded-sm shadow z-20">
                    <button
                      className="p-2 rounded-full border-2 border-[#e8d6a8] bg-[#faf7f0]"
                      onClick={(e) => handleAddToCart(p.id, e)}
                    >
                      <Plus size={12} color="#e8d6a8" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-lg font-semibold">{p.name}</h3>
              <span className="text-sm text-[#e8d6a8] px-2 py-1 rounded-md border-3 border-[#e8d6a8]">
                {p.label && p.label.toUpperCase()}
              </span>
              <div className="flex justify-center items-center mt-2">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <span key={i} className={i < Math.round(p.rating) ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                <span className="ml-2">({parseFloat(p.rating).toFixed(1)})</span>
              </div>
              <p className="text-red-500 text-lg open-sans-text">{formatIDR(discountedPrice)}</p>
              <p className="text-gray-400 line-through open-sans-text">{formatIDR(originalPrice)}</p>
            </div>
          );
        })}
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />

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
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePart2;