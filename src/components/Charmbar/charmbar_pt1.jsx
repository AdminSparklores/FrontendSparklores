import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL, fetchProduct, isLoggedIn, addToCart, getAuthData } from "../../utils/api";
import Snackbar from '../snackbar.jsx';

// BASE IMAGES
import baseNecklace from "../../assets/default/basenecklace.png";

// Metal sound effect (you need to put a short .mp3/.wav file in your public/assets or src/assets)
import metalSfx from "../../assets/audio/metal_sfx2.mp3"; // <-- you must provide this file
import ImageWithFallback from "../ImageWithFallback.jsx";

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const useIsIOS = () => {
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // This detection is reliable for iOS devices (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOS);
  }, []); // Empty dependency array means this runs only once on mount
  
  return isIOS;
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

export default function CharmCustomizerFull() {
  const necklaceRef = useRef(null);
  const braceletRef = useRef(null);
  const recommendRef = useRef(null);
  const [baseImage, setBaseImage] = useState(baseNecklace);
  const [charmCount, setCharmCount] = useState(2); // keep default as 2 for now
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedCharms, setSelectedCharms] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [charmsData, setCharmsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState({
    charms: true,
    products: true
  });
  const [error, setError] = useState(null);
  const [selectedBaseProduct, setSelectedBaseProduct] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const navigate = useNavigate();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const isIOS = useIsIOS();

  // --- Metal sound effect ---
  const metalAudioRef = useRef(null);
  useEffect(() => {
    metalAudioRef.current = new Audio(metalSfx);
    metalAudioRef.current.volume = 0.5;
  }, []);

  const playMetalSound = () => {
    if (metalAudioRef.current) {
      // Restart sound on every trigger
      metalAudioRef.current.currentTime = 0;
      metalAudioRef.current.play();
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

  // Fetch charms and products data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch charms
        const charmsResponse = await fetch(`${BASE_URL}/api/charms/`);
        if (!charmsResponse.ok) throw new Error('Failed to fetch charms');
        const charmsData = await charmsResponse.json();
        setCharmsData(charmsData);

        // Fetch products
        const productsResponse = await fetch(`${BASE_URL}/api/products/`);
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProductsData(productsData);

        setLoading({ charms: false, products: false });
      } catch (err) {
        setError(err.message);
        setLoading({ charms: false, products: false });
      }
    };

    fetchData();
  }, []);

  // Helper function to get the last image URL from a product
  const getLastProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[product.images.length - 1].image_url;
    }
    return '../../assets/default/banner_home.jpeg';
  };

  // Helper function to get the first image URL from a product
  const getFirstProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return '../../assets/default/banner_home.jpeg';
  };

  // Filter products by category and charms:true
  const filterProductsByCategory = (category) => {
    return productsData
      .filter(product => product.category === category && product.charms === true)
      .map(product => ({
        id: product.id,
        img: getFirstProductImage(product),
        lastImg: getLastProductImage(product),
        text: product.name,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        stock: product.stock,
        category: product.category,
        is_charm_spreadable: product.is_charm_spreadable ?? false,
        is_charm_max3: product.is_charm_max3 ?? false,
        is_charm_max5: product.is_charm_max5 ?? false,
        discount: product.discount // <-- ADD THIS LINE
      }));
  };

  // Get available charm counts based on product restrictions
  const getAvailableCharmCounts = () => {
    const counts = [0]; // Chain only is always available
    if (selectedBaseProduct?.is_charm_max3) {
      counts.push(1, 2, 3);
    } else if (selectedBaseProduct?.is_charm_max5) {
      counts.push(1, 2, 3, 4, 5);
    } else {
      // Default to all options if no specific limit is set
      counts.push(1, 2, 3, 4, 5);
    }
    return counts;
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
          "rose_gold": [],
          silver: [],
          others: [],
        };
      }

      if (label === "gold") {
        grouped[category].gold.push(charm);
      } else if (label === "silver") {
        grouped[category].silver.push(charm);
      } else if (label === "rose_gold") {
        grouped[category]["rose_gold"].push(charm);
      } else {
        grouped[category].others.push(charm);
      }
    });
    return grouped;
  };

  const handleBaseProductSelect = (product) => {
    setSelectedBaseProduct(product);
    setBaseImage(product.lastImg);
  };

  const scroll = (ref, direction) => {
    const scrollByAmount = 260;
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -scrollByAmount : scrollByAmount,
        behavior: "smooth",
      });
    }
  };

  // Play metal sound and select charm
  const handleCharmSelect = (charm) => {
    setSelectedCharms((prev) => ({
      ...prev,
      [selectedTab]: charm,
    }));
    playMetalSound();
    if (selectedTab < charmCount) {
      setSelectedTab((prev) => prev + 1);
    }
  };

  // Helper function to get the correct price after discount (handles both discount_price and discount percentage)
  const getDiscountedPrice = (product) => {
    if (!product) return 0;
    
    // First, check if there's a fixed discount_price
    if (product.discount_price && parseFloat(product.discount_price) > 0) {
      return parseFloat(product.discount_price);
    }
    
    // Then, check if there's a percentage discount
    const discountPercent = parseFloat(product.discount || "0");
    if (discountPercent > 0) {
      const basePrice = parseFloat(product.price);
      return basePrice * (1 - discountPercent / 100);
    }
    
    // If no discount, return the regular price
    return parseFloat(product.price) || 0;
  };

  const BaseProductItem = ({ product }) => {
    // Helper function to calculate discounted price
    const getDisplayPrice = () => {
      const basePrice = parseFloat(product.price);
      const discountPercent = parseFloat(product.discount || "0");
      if (discountPercent > 0) {
        return basePrice * (1 - discountPercent / 100);
      }
      return basePrice;
    };

    // Helper function to check if product is discounted
    const isDiscounted = () => {
      return parseFloat(product.discount || "0") > 0;
    };

    return (
      <div 
        key={product.id} 
        className={`relative group min-w-[15rem] ${product.stock === 0 ? 'opacity-70' : 'cursor-pointer'} hover:scale-105 transition-transform ${
          selectedBaseProduct?.id === product.id ? 'ring-4 ring-[#e6d5a7]' : ''
        }`}
        onClick={() => product.stock > 0 && handleBaseProductSelect(product)}
      >
        <div className="aspect-square overflow-hidden rounded-md">
          <ImageWithFallback 
            src={product.img} 
            alt={product.text} 
            className={`w-[15rem] h-[15rem] object-cover shadow-md rounded ${product.stock === 0 ? 'grayscale' : ''}`} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '../../assets/default/banner_home.jpeg';
            }}
          />
        </div>
        {product.stock === 0 ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SOLD OUT</div>
        ) : product.stock < 10 ? (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">LOW STOCK</div>
        ) : null}
        <div className="absolute inset-0 bg-[#f5f5dc] opacity-0 group-hover:opacity-80 flex flex-col justify-center items-center transition-opacity">
          <span className="text-lg font-bold text-center">{product.text}</span>
          {isDiscounted() ? (
            <span className="text-sm">
              <span className="line-through text-gray-400">{formatIDR(parseFloat(product.price))}</span>
              {' '}
              <span className="text-red-600">{formatIDR(getDisplayPrice())}</span>
            </span>
          ) : (
            <span className="text-sm">{formatIDR(parseFloat(product.price))}</span>
          )}
        </div>
      </div>
    );
  };

   // Calculate base price (without discount)
  const calculateBasePrice = () => {
    let total = getDiscountedPrice(selectedBaseProduct);
    
    // Add charm prices
    for (let i = 1; i <= charmCount; i++) {
      const charm = selectedCharms[i];
      if (charm) {
        total += getDiscountedPrice(charm);
      }
    }
    
    return total;
  };

  // Calculate total price with discount
  const calculateTotalPrice = () => {
    const basePrice = calculateBasePrice();
    
    // Apply discount based on number of charms selected
    const discount = calculateCharmDiscount(charmCount);
    return Math.max(0, basePrice - discount);
  };

  // Find is_charm_spreadable from selected base product (default to false)
  const isCharmSpreadable = selectedBaseProduct?.is_charm_spreadable === true;

  // getCharmPosition function switches logic based on isCharmSpreadable
  const getCharmPosition = (index, total) => {
    const baseSize = '17%';

    // Get category and spreadable info from selectedBaseProduct (or default to necklace logic)
    const category = selectedBaseProduct?.category || 'necklace';
    const isCharmSpreadable = selectedBaseProduct?.is_charm_spreadable === true;

    // ---- iOS ADJUSTMENTS: Lift charm positions slightly for better visual alignment ----
    const iosOffset = isIOS ? -2.5 : 0;

    // ---- NECKLACE POSITIONS ----
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
          top: `${parseFloat(pos.top) + iosOffset}%`
        }));
      });
      return adjusted;
    };

    const adjustedNecklaceDefault = applyIosOffset(necklaceDefaultPositions);
    const adjustedBraceletDefault = applyIosOffset(braceletDefaultPositions);

    // ✅ FIX: Use selectedBaseProduct, not "product"
    const isSpreadable = selectedBaseProduct?.is_charm_spreadable === true;
    let posList;

    if (category === "bracelet") {
      posList = isSpreadable 
        ? braceletSpreadPositions 
        : (isIOS ? adjustedBraceletDefault : braceletDefaultPositions);
    } else if (category === "necklace") {
      posList = isSpreadable 
        ? necklaceSpreadPositions 
        : (isIOS ? adjustedNecklaceDefault : necklaceDefaultPositions);
    } else {
      // fallback: use necklace logic for unknown category
      posList = isSpreadable 
        ? necklaceSpreadPositions 
        : (isIOS ? adjustedNecklaceDefault : necklaceDefaultPositions);
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

  // --- CHAIN ONLY/0 CHARMS INTEGRATION START ---
  // Effect: When charmCount is 0, clear selectedCharms and selectedTab
  useEffect(() => {
    if (charmCount === 0) {
      setSelectedCharms({});
      setSelectedTab(0);
    } else if (selectedTab < 1 || selectedTab > charmCount) {
      setSelectedTab(1);
    }
  }, [charmCount]); // Only runs when charmCount changes

  const handleAddToCart = async () => {
    // Check login status first - before any other validation
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return; // Exit early if not logged in
    }

    // Only proceed with validation if user is logged in
    if (!selectedBaseProduct) {
      setSnackbarMessage('Please select a base product first');
      setSnackbarType('error');
      setShowSnackbar(true);
      return;
    }


    try {
      // Prepare cart data - format it to match what your API expects
      const cartData = {
        product: selectedBaseProduct?.id,
        quantity: 1,
        charms: charmCount > 0 ? Object.values(selectedCharms).map(charm => charm.id) : []
      };

      // Call the addToCart API function
      await addToCart(selectedBaseProduct?.id, cartData);

      // Show success message
      setSnackbarMessage('Customized item added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbarMessage(error.message || 'Failed to add to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  if (loading.charms || loading.products) {
    return (
      <div className="bg-[#f9f5ef] min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f9f5ef] min-h-screen flex justify-center items-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  const groupedCharms = groupCharmsByCategoryAndLabel();
  const necklaces = filterProductsByCategory('necklace');
  const bracelets = filterProductsByCategory('bracelet');
  const recommend = [...necklaces.slice(0, 3), ...bracelets.slice(0, 2)];

  const showNecklaces = necklaces.length > 0;
  const showBracelets = bracelets.length > 0;

   // Calculate prices for display
  const basePrice = calculateBasePrice();
  const finalPrice = calculateTotalPrice();
  const discountAmount = calculateCharmDiscount(charmCount);
  const discountExplanation = getDiscountExplanation(charmCount, discountAmount);


  return (
    <div className="bg-[#f9f5ef] min-h-screen">
      <Snackbar
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />
      {/* LOGIN POPUP */}
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

      <div className="font-sans px-6 py-12 max-w-6xl mx-auto">

        {/* NECKLACES - Only show if there are necklaces with charms:true */}
        {showNecklaces && (
          <>
            <h2 className="text-2xl font-serif font-semibold mb-6">SELECT A NECKLACE</h2>
            <div className="relative mb-10">
              <button onClick={() => scroll(necklaceRef, "left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2">
                <ChevronLeft size={28} />
              </button>
              <div ref={necklaceRef} className="flex gap-4 overflow-x-auto ml-12 mr-12 pb-2 no-scrollbar">
                {necklaces.map((product) => (
                  <BaseProductItem product={product} key={product.id} />
                ))}
              </div>
              <button onClick={() => scroll(necklaceRef, "right")} className="absolute right-0 top-1/2 -translate-y-1/ ```jsx
2 z-10 p-2">
                <ChevronRight size={28} />
              </button>
            </div>
          </>
        )}

        {/* BRACELETS - Only show if there are bracelets with charms:true */}
        {showBracelets && (
          <>
            <h2 className="text-2xl font-serif font-semibold mt-12 mb-6">OR SELECT A BRACELET</h2>
            <div className="relative mb-10">
              <button onClick={() => scroll(braceletRef, "left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2">
                <ChevronLeft size={28} />
              </button>
              <div ref={braceletRef} className="flex gap-4 overflow-x-auto ml-12 mr-12 pb-2 no-scrollbar">
                {bracelets.map((product) => (
                  <BaseProductItem product={product} key={product.id} />
                ))}
              </div>
              <button onClick={() => scroll(braceletRef, "right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2">
                <ChevronRight size={28} />
              </button>
            </div>
          </>
        )}

        {/* CUSTOMIZER - Always shown */}
        <div className="my-8 p-4 bg-[#f5f0e6] rounded-lg">
          {selectedBaseProduct ? (
            <>
              <h3 className="text-xl font-medium mb-2">Selected Base: {selectedBaseProduct.text}</h3>
              {/* Enhanced discount-aware price display for selected base product */}
              {(() => {
                const originalPrice = parseFloat(selectedBaseProduct.price);
                const discountedPrice = getDiscountedPrice(selectedBaseProduct);
                
                if (discountedPrice < originalPrice) {
                  return (
                    <p className="text-gray-700">
                      <span className="line-through text-gray-400">{formatIDR(originalPrice)}</span>
                      {' '}
                      <span className="text-red-600">{formatIDR(discountedPrice)}</span>
                    </p>
                  );
                } else {
                  return <p className="text-gray-700">{formatIDR(originalPrice)}</p>;
                }
              })()}
              <button 
                onClick={() => {
                  setSelectedBaseProduct(null);
                  setBaseImage(baseNecklace);
                }}
                className="mt-2 text-sm text-[#c3a46f] hover:underline"
              >
                Reset to Default Base
              </button>
            </>
          ) : (
            <p className="text-gray-700">Using default base product</p>
          )}
        </div>

        <h2 className="text-xl font-medium mb-4">Customize Your Charm</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {/* --- CHAIN ONLY/0 CHARMS BUTTON START --- */}
          <button
            key={0}
            onClick={() => {
              setCharmCount(0);
              setSelectedCharms({});
              setSelectedTab(0);
            }}
            className={clsx("px-4 py-2 border rounded transition", charmCount === 0 ? "bg-[#e6d5a7]" : "bg-white")}
          >
            Chain only
          </button>
          {/* --- CHAIN ONLY/0 CHARMS BUTTON END --- */}
          {/* Dynamically render charm count buttons based on product limits */}
          {getAvailableCharmCounts().filter(count => count > 0).map((num) => (
            <button
              key={num}
              onClick={() => {
                setCharmCount(num);
                setSelectedTab(1);
                setSelectedCharms({});
              }}
              className={clsx("px-4 py-2 border rounded transition", charmCount === num ? "bg-[#e6d5a7]" : "bg-white")}
            >
              {num} Charm{num > 1 && "s"}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="bg-white rounded p-4 relative overflow-hidden" style={{ width: '100%', maxWidth: '500px',maxHeight: '500px', aspectRatio: '1/1' }}>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative" style={{ width: '100%', height: '100%' }}>
                <ImageWithFallback 
                  src={baseImage} 
                  alt="Base" 
                  className="absolute w-full h-full object-contain" 
                  style={{ aspectRatio: '1/1' }}
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
                          <ImageWithFallback
                            src={selectedCharms[i + 1].image}
                            alt={`Charm ${i + 1}`}
                            className="w-full h-full object-contain"
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
              className="w-full bg-[#e6d5a7] text-center py-2 rounded mb-4 font-medium disabled:bg-[#f0e6cf] disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={!selectedBaseProduct}
            >
              Add to cart
            </button>

            {/* --- CHARM PICKER HIDE START --- */}
            {charmCount > 0 && (
              <div className="space-y-4 md:max-h-[19vw] sm:max-h-[40vw] overflow-y-auto pr-2 mobile-charm-picker">
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
                                  <ImageWithFallback
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
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
                                  <ImageWithFallback
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
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
                        {labels["rose_gold"].length > 0 && (
                          <div>
                            <h4 className="font-semibold pl-2">Rose Gold</h4>
                            <div className="grid grid-cols-6 gap-2 p-2">
                              {labels["rose_gold"].map((charm) => (
                                <div 
                                  key={charm.id} 
                                  className="relative cursor-pointer group" 
                                  onClick={() => handleCharmSelect(charm)}
                                >
                                  <ImageWithFallback
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
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
                                  <ImageWithFallback
                                    src={charm.image}
                                    alt={charm.name}
                                    className="hover:scale-105 transition rounded border p-1 w-full"
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
            {/* --- CHARM PICKER HIDE END --- */}

            {/* --- CHAIN ONLY/0 CHARMS MESSAGE SHOW START --- */}
            {charmCount === 0 && (
              <div className="text-gray-500 text-center py-8 italic">
                Chain only selected. No charms can be picked in this mode.
              </div>
            )}
            {/* --- CHAIN ONLY/0 CHARMS MESSAGE SHOW END --- */}
          </div>
        </div>
        <ul className="mt-10">
          <li className="mt-2 text-sm text-[#b87777] italic">* Rasio ukuran charm tidak 100% akurat, mohon dimengerti jika ada perbedaan sedikit dengan aslinya</li>
        </ul>

        {/* RECOMMENDATIONS */}
        <h2 className="text-2xl font-serif font-semibold mb-6 mt-20">YOU MIGHT ALSO LIKE...</h2>
        {recommend.length > 0 ? (
          <div className="relative mb-10">
            <button onClick={() => scroll(recommendRef, "left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2">
              <ChevronLeft size={28} />
            </button>
            <div ref={recommendRef} className="flex gap-4 overflow-x-auto ml-12 mr-12 pb-2 no-scrollbar">
              {recommend.map((product) => (
                <BaseProductItem product={product} key={product.id} />
              ))}
            </div>
            <button onClick={() => scroll(recommendRef, "right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2">
              <ChevronRight size={28} />
            </button>
          </div>
        ) : (
          <p className="text-center py-8">No recommendations available</p>
        )}
      </div>

      {/* Mobile-specific CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-charm-picker {
            max-height: 310px !important;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
