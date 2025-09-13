import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { fetchProduct, fetchAllCharms, isLoggedIn, addToCart } from "../../utils/api";
import Snackbar from '../snackbar.jsx';

// Import your metal sound effect
import metalSfx from "../../assets/audio/metal_sfx2.mp3";

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Math.round(amount));
};

// Custom hook to detect iOS
const useIsIOS = () => {
  useEffect(() => {
    // This detection is reliable for iOS devices (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    return () => {}; // no cleanup needed
  }, []);

  // Return true if iOS device
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Calculate charm discount based on the number of charms selected
const calculateCharmDiscount = (charmCount) => {
  switch (charmCount) {
    case 1:
      return 5000;
    case 2:
      return 10000;
    case 3:
      return 30000;
    case 4:
      return 30000;
    case 5:
      return 30000;
    default:
      return 0;
  }
};

// Get discount explanation text
const getDiscountExplanation = (charmCount, discountAmount) => {
  if (discountAmount === 0) return null;
  
  const explanations = {
    1: "Discount applied: -5,000 IDR for 1 charm",
    2: "Discount applied: -5,000 IDR per charm (total -10,000 IDR)",
    3: "Discount applied: -30,000 IDR for 3 charms bundle",
    4: "Discount applied: -30,000 IDR for 4 charms bundle",
    5: "Discount applied: -30,000 IDR for 5 charms bundle"
  };
  
  return explanations[charmCount] || `Discount applied: -${formatIDR(discountAmount).replace('Rp', '').trim()}`;
};

const ProductDetailCharmBar = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isIOS = useIsIOS();

  // Charm customizer state
  const [baseImage, setBaseImage] = useState('');
  const [charmCount, setCharmCount] = useState(2);
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedCharms, setSelectedCharms] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [charmsData, setCharmsData] = useState([]);
  const [charmLoading, setCharmLoading] = useState(true);

  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  // --- CHAIN ONLY/0 CHARMS INTEGRATION START ---
  useEffect(() => {
    if (charmCount === 0) {
      setSelectedCharms({});
      setSelectedTab(0);
    } else if (selectedTab < 1 || selectedTab > charmCount) {
      setSelectedTab(1);
    }
  }, [charmCount]);
  // --- CHAIN ONLY/0 CHARMS INTEGRATION END ---

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

  // Audio ref for metal sound effect
  const metalAudioRef = useRef(null);
  useEffect(() => {
    metalAudioRef.current = new Audio(metalSfx);
    metalAudioRef.current.volume = 0.5;
  }, []);
  const playMetalSound = () => {
    if (metalAudioRef.current) {
      metalAudioRef.current.currentTime = 0;
      metalAudioRef.current.play();
    }
  };

  // Login popup state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  // Check login state on mount and when auth changes
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
    const fetchData = async () => {
      try {
        const productData = await fetchProduct(productId);
        setProduct(productData);

        if (productData.charms) {
          if (productData.images && productData.images.length > 0) {
            setBaseImage(productData.images[productData.images.length - 1].image_url);
          }
          const charms = await fetchAllCharms();
          setCharmsData(charms);
        }

        setLoading(false);
        setCharmLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setCharmLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Get available charm counts based on product restrictions
  const getAvailableCharmCounts = () => {
    const counts = [0]; // Chain only is always available
    
    if (product.is_charm_max3) {
      counts.push(1, 2, 3);
    } else if (product.is_charm_max5) {
      counts.push(1, 2, 3, 4, 5);
    } else {
      // Default to all options if no specific limit is set
      counts.push(1, 2, 3, 4, 5);
    }
    
    return counts;
  };

  // getCharmPosition is now based on product?.is_charm_spreadable and per-category positioning
  const getCharmPosition = (index, total) => {
    const baseSize = '17%';
    if (!product) return {
      width: baseSize,
      height: baseSize,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%) rotate(0deg)'
    };

    // ---- iOS ADJUSTMENTS: Lift charm positions slightly for better visual alignment ----
    const iosOffset = isIOS ? -0.10 : 0; // -6% offset to lift charms up (adjust as needed)

    // ---- NECKLACE POSITIONS ----
    // Default positions (is_charm_spreadable === false)
    const necklaceDefaultPositions = {
      1: [{ left: '52%', top: '70%', rotation: 0 }],
      2: [
        { left: '50%', top: '70%', rotation: 0 },
        { left: '55%', top: '70%', rotation: 0 }
      ],
      3: [
        { left: '45%', top: '69%', rotation: 30 },
        { left: '52%', top: '70%', rotation: 0 },
        { left: '59%', top: '69%', rotation: -35 }
      ],
      4: [
        { left: '32%', top: '63%', rotation: 75 },
        { left: '46%', top: '70%', rotation: 0 },
        { left: '55%', top: '70%', rotation: 0 },
        { left: '70%', top: '63%', rotation: -75 }
      ],
      5: [
        { left: '43%', top: '69%', rotation: 20 },
        { left: '52%', top: '70%', rotation: 0 },
        { left: '60%', top: '69%', rotation: -20 },
        { left: '70%', top: '63%', rotation: -75 },
        { left: '32%', top: '63%', rotation: 73 }
      ]
    };
    // Spread positions (is_charm_spreadable === true)
    const necklaceSpreadPositions = {
       1: [{ left: '50%', top: '57%', rotation: 0 }],
        2: [
          { left: '50%', top: '57%', rotation: 0 },
          { left: '66%', top: '54%', rotation: 0 }
        ],
        3: [
          { left: '33%', top: '54%', rotation: 0 },
          { left: '50%', top: '57%', rotation: 0 },
          { left: '66%', top: '54%', rotation: 0 }
        ],
        4: [
          { left: '18%', top: '43%', rotation: 0 },
          { left: '33%', top: '54%', rotation: 0 },
          { left: '50%', top: '57%', rotation: 0 },
          { left: '66%', top: '54%', rotation: 0 }
        ],
        5: [
          { left: '18%', top: '43%', rotation: 0 },
          { left: '33%', top: '54%', rotation: 0 },
          { left: '50%', top: '57%', rotation: 0 },
          { left: '81%', top: '45%', rotation: 0 },
          { left: '66%', top: '54%', rotation: 0 }
        ]
      };

    // ---- BRACELET POSITIONS ----
    // Default positions (is_charm_spreadable === false)
    const braceletDefaultPositions = {
      1: [{ left: '50%', top: '59%', rotation: 0 }],
      2: [
        { left: '45%', top: '59%', rotation: 15 },
        { left: '55%', top: '59%', rotation: -15 }
      ],
      3: [
        { left: '43%', top: '58%', rotation: 30 },
        { left: '50%', top: '59%', rotation: 0 },
        { left: '57%', top: '58%', rotation: -30 }
      ],
      4: [
        { left: '45%', top: '59%', rotation: 30 },
        { left: '55%', top: '59%', rotation: -30 },
        { left: '43%', top: '44%', rotation: -225 },
        { left: '55%', top: '44%', rotation: -135 }
      ],
      5: [
        { left: '57%', top: '58%', rotation: -30 },
        { left: '50%', top: '60%', rotation: 0 },
        { left: '43%', top: '58%', rotation: 30 },
        { left: '58%', top: '43%', rotation: -135 },
        { left: '43%', top: '43%', rotation: -225 },
      ]
    };
    // Spread positions (is_charm_spreadable === true)
    const braceletSpreadPositions = {
      1: [{ left: '49%', top: '58%', rotation: 0 }],
      2: [
        { left: '49%', top: '58%', rotation: 0 },
        { left: '65%', top: '57%', rotation: 0 }
      ],
      3: [
        { left: '33%', top: '57%', rotation: 0 },
        { left: '49%', top: '58%', rotation: 0 },
        { left: '65%', top: '57%', rotation: 0 }
      ],
      4: [
        { left: '33%', top: '57%', rotation: 0 },
        { left: '49%', top: '58%', rotation: 0 },
        { left: '65%', top: '57%', rotation: 0 },
        { left: '93%', top: '59%', rotation: 0 }
      ],
      5: [
        { left: '33%', top: '57%', rotation: 0 },
        { left: '46%', top: '57%', rotation: 20 },
        { left: '65%', top: '57%', rotation: 0 },
        { left: '93%', top: '59%', rotation: 0 },
        { left: '53%', top: '57%', rotation: -20 }
      ]
    };

    // ---- APPLY IOS OFFSET TO EACH POSITION ----
    const applyIosOffset = (positions) => {
      if (!isIOS) return positions;

      const adjusted = {};
      Object.keys(positions).forEach(key => {
        adjusted[key] = positions[key].map(pos => ({
          ...pos,
          top: `${Math.max(20, parseFloat(pos.top) + iosOffset * 100)}%` // Adjust top: e.g., 82% → 76%
        }));
      });
      return adjusted;
    };

    const adjustedNecklaceDefault = applyIosOffset(necklaceDefaultPositions);
    const adjustedBraceletDefault = applyIosOffset(braceletDefaultPositions);

    // ---- SELECT THE POSITION BY CATEGORY ----
    const isSpreadable = product.is_charm_spreadable;
    let posList;

    if (product.category === "bracelet") {
      posList = isSpreadable ? braceletSpreadPositions : braceletDefaultPositions;
    } else if (product.category === "necklace") {
      posList = isSpreadable ? necklaceSpreadPositions : necklaceDefaultPositions;
    } else {
      // fallback: use necklace logic for unknown category
      posList = isSpreadable ? necklaceSpreadPositions : necklaceDefaultPositions;
    }

    const pos = (posList[total] && posList[total][index]) || { left: '50%', top: '50%', rotation: 0 };

    return {
      width: baseSize,
      height: baseSize,
      left: pos.left,
      top: pos.top,
      transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`
    };
  };


  // Group charms by category, then by label
  const groupCharmsByCategoryAndLabel = () => {
    const grouped = {};
    charmsData.forEach(charm => {
      const category = charm.category;
      const label = charm.label ? charm.label.toLowerCase() : "others";

      if (!grouped[category]) {
        grouped[category] = {
          gold: [],
          "rose gold": [],
          silver: [],
          others: [],
        };
      }

      if (label === "gold") {
        grouped[category].gold.push(charm);
      } else if (label === "silver") {
        grouped[category].silver.push(charm);
      } else if (label === "rose gold") {
        grouped[category]["rose gold"].push(charm);
      } else {
        grouped[category].others.push(charm);
      }
    });
    return grouped;
  };

  // Calculate total price with discount
  const calculateTotalPrice = () => {
    let total = parseFloat(product?.price) || 0;
    
    // Add charm prices
    for (let i = 1; i <= charmCount; i++) {
      const charmPrice = parseFloat(selectedCharms[i]?.price);
      if (!isNaN(charmPrice)) {
        total += charmPrice;
      }
    }
    
    // Apply discount based on number of charms selected
    const discount = calculateCharmDiscount(charmCount);
    return Math.max(0, total - discount);
  };

  // Calculate base price (without discount)
  const calculateBasePrice = () => {
    let total = parseFloat(product?.price) || 0;
    
    // Add charm prices
    for (let i = 1; i <= charmCount; i++) {
      const charmPrice = parseFloat(selectedCharms[i]?.price);
      if (!isNaN(charmPrice)) {
        total += charmPrice;
      }
    }
    
    return total;
  };

  // Play sound effect on charm select!
  const handleCharmSelect = (charm) => {
    // Prevent charm selection in chain-only mode
    if (charmCount === 0) return;

    setSelectedCharms((prev) => ({
      ...prev,
      [selectedTab]: charm,
    }));
    playMetalSound();
    if (selectedTab < charmCount) {
      setSelectedTab((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      // Get selected charm IDs
      const charmIds = [];
      for (let i = 1; i <= charmCount; i++) {
        if (selectedCharms[i]?.id) {
          charmIds.push(selectedCharms[i].id);
        }
      }

      // Prepare cart data
      const cartData = {
        quantity: 1,
        charms: charmIds
      };

      await addToCart(productId, cartData);
      setSnackbarMessage('Customized product added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to add to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  if (loading || charmLoading) {
    return (
      <div className="bg-[#faf7f0] min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#faf7f0] min-h-screen flex justify-center items-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!product?.charms) {
    return (
      <div className="bg-[#faf7f0] flex justify-center items-center lg:pt-[9rem]"></div>
    );
  }

  const groupedCharms = groupCharmsByCategoryAndLabel();
  const availableCharmCounts = getAvailableCharmCounts();
  const discountAmount = calculateCharmDiscount(charmCount);
  const basePrice = calculateBasePrice();
  const finalPrice = calculateTotalPrice();
  const discountExplanation = getDiscountExplanation(charmCount, discountAmount);

  return (
    <div className="bg-[#fdf9f0] py-[2rem]" id="product-detail-charm-bar" tabIndex={-1}>
      <audio ref={metalAudioRef} src={metalSfx} preload="auto" />
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

      <div className="font-sans px-6 pt-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-serif font-semibold mb-4">CUSTOMIZE YOUR CHARM</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {/* --- CHAIN ONLY/0 CHARMS BUTTON START --- */}
          <button
            key={0}
            onClick={() => {
              setCharmCount(0);
              setSelectedCharms({});
              setSelectedTab(0);
            }}
            className={clsx(
              "px-4 py-2 border rounded transition",
              charmCount === 0 ? "bg-[#e6d5a7]" : "bg-white"
            )}
          >
            Chain only
          </button>
          {/* --- CHAIN ONLY/0 CHARMS BUTTON END --- */}
          {availableCharmCounts.filter(count => count > 0).map((num) => (
            <button
              key={num}
              onClick={() => {
                setCharmCount(num);
                setSelectedTab(1);
                setSelectedCharms({});
              }}
              className={clsx(
                "px-4 py-2 border rounded transition",
                charmCount === num ? "bg-[#e6d5a7]" : "bg-white"
              )}
            >
              {num} Charm{num > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="bg-white rounded p-4 relative overflow-hidden" style={{ width: '100%', maxWidth: '500px',maxHeight: '500px', aspectRatio: '1/1' }}>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative" style={{ width: '100%', height: '100%' }}>
                <img
                  src={baseImage}
                  alt="Base"
                  className="absolute w-full h-full object-contain"
                  style={{ aspectRatio: '1/1' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '../../assets/default/basenecklace.png';
                  }}
                />
                {/* --- CHAIN ONLY/0 CHARMS CHARMS IMAGE HIDE START --- */}
                {charmCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {Array.from({ length: charmCount }, (_, i) => (
                      selectedCharms[i + 1] && (
                        <div
                          key={i}
                          className="absolute"
                          style={{
                            width: '33.33%',
                            height: '33.33%',
                            aspectRatio: '1/1',
                            zIndex: i + 1,
                            ...getCharmPosition(i, charmCount)
                          }}
                        >
                          <img
                            src={selectedCharms[i + 1].image}
                            alt={`Charm ${i + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '../../assets/default/basenecklace.png';
                            }}
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}
                {/* --- CHAIN ONLY/0 CHARMS CHARMS IMAGE HIDE END --- */}
              </div>
            </div>
          </div>

          <div className="flex-1" style={{ width: '100%', maxWidth: '500px',maxHeight: '500px', aspectRatio: '1/1' }}>
            <div className="mb-4">
              {/* Show original price with strikethrough if there's a discount */}
              {discountAmount > 0 && (
                <div className="text-lg text-gray-500 line-through">
                  {formatIDR(basePrice)}
                </div>
              )}
              
              {/* Final price */}
              <div className="text-2xl font-semibold">
                {formatIDR(finalPrice)}
              </div>
              
              {/* Discount explanation */}
              {discountExplanation && (
                <div className="text-sm text-green-600 mt-1">
                  {discountExplanation}
                </div>
              )}
            </div>

            {/* --- CHAIN ONLY/0 CHARMS TABS HIDE START --- */}
            {charmCount > 0 && (
              <div className="flex gap-2 mb-4">
                {Array.from({ length: charmCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTab(i + 1)}
                    className={clsx(
                      "px-4 py-1 rounded border",
                      selectedTab === i + 1 ? "bg-[#e6d5a7]" : "bg-white"
                    )}
                  >
                    Charm {i + 1}
                  </button>
                ))}
              </div>
            )}
            {/* --- CHAIN ONLY/0 CHARMS TABS HIDE END --- */}

            <button
              className="w-full bg-[#e6d5a7] text-center py-2 rounded mb-4 font-medium"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>

            {/* Charms grouped by category */}
            {charmCount > 0 && (
              <div className="space-y-4 md:max-h-[21vw] sm:max-h-[40vw] overflow-y-auto pr-2 mobile-charm-picker">
                {Object.entries(groupedCharms).map(([category, labels]) => (
                  <div key={category} className="mb-2">
                    <button
                      onClick={() => setOpenCategory(openCategory === category ? null : category)}
                      className="w-full flex justify-between items-center py-2 border-b"
                    >
                      <span>{category.replace(/_/g, ' ')}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openCategory === category && (
                      <div className="space-y-2">
                        {/* Section for Gold charms */}
                        {labels.gold.length > 0 && (
                          <div>
                            <h4 className="font-semibold pl-2">Gold</h4>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {labels.gold.map((charm) => (
                                <div 
                                  key={charm.id} 
                                  className="relative cursor-pointer group" 
                                  onClick={() => handleCharmSelect(charm)}
                                >
                                  <img
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '../../assets/default/basenecklace.png';
                                    }}
                                  />
                                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="absolute inset-0 opacity-0 group-hover:opacity-100 flex justify-center items-center text-white text-sm font-semibold transition">
                                    {charm.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section for Silver charms */}
                        {labels.silver.length > 0 && (
                          <div>
                            <h4 className="font-semibold pl-2">Silver</h4>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {labels.silver.map((charm) => (
                                <div 
                                  key={charm.id} 
                                  className="relative cursor-pointer group" 
                                  onClick={() => handleCharmSelect(charm)}
                                >
                                  <img
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '../../assets/default/basenecklace.png';
                                    }}
                                  />
                                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="absolute inset-0 opacity-0 group-hover:opacity-100 flex justify-center items-center text-white text-sm font-semibold transition">
                                    {charm.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section for Rose Gold charms */}
                        {labels["rose gold"].length > 0 && (
                          <div>
                            <h4 className="font-semibold pl-2">Rose Gold</h4>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {labels["rose gold"].map((charm) => (
                                <div 
                                  key={charm.id} 
                                  className="relative cursor-pointer group" 
                                  onClick={() => handleCharmSelect(charm)}
                                >
                                  <img
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '../../assets/default/basenecklace.png';
                                    }}
                                  />
                                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="absolute inset-0 opacity-0 group-hover:opacity-100 flex justify-center items-center text-white text-sm font-semibold transition">
                                    {charm.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section for Other charms */}
                        {labels.others.length > 0 && (
                          <div>
                            <h4 className="font-semibold pl-2">Others</h4>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {labels.others.map((charm) => (
                                <div 
                                  key={charm.id} 
                                  className="relative cursor-pointer group" 
                                  onClick={() => handleCharmSelect(charm)}
                                >
                                  <img
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '../../assets/default/basenecklace.png';
                                    }}
                                  />
                                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="absolute inset-0 opacity-0 group-hover:opacity-100 flex justify-center items-center text-white text-sm font-semibold transition">
                                    {charm.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* --- CHAIN ONLY/0 CHARMS CHARMS PICKER HIDE END --- */}
            {/* --- CHAIN ONLY/0 CHARMS MESSAGE SHOW START --- */}
            {charmCount === 0 && (
              <div className="text-gray-500 text-center py-8 italic">
                Chain only selected. No charms can be picked in this mode.
              </div>
            )}
            {/* --- CHAIN ONLY/0 CHARMS MESSAGE SHOW END --- */}
          </div>
        </div>
      </div>
      {/* Mobile-specific CSS */}
        <style jsx>{`
          @media (max-width: 768px) {
            .mobile-charm-picker {
              max-height: 350px !important;
              overflow-y: auto;
            }
          }
        `}</style>
    </div>
  );
};

export default ProductDetailCharmBar;