import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { BASE_URL, fetchProduct, fetchAllCharms, isLoggedIn } from "../../utils/api";

// Import your metal sound effect
import metalSfx from "../../assets/audio/metal_sfx2.mp3";

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Math.round(amount));
};

const ProductDetailCharmBar = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charm customizer state
  const [baseImage, setBaseImage] = useState('');
  const [charmCount, setCharmCount] = useState(2);
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedCharms, setSelectedCharms] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [charmsData, setCharmsData] = useState([]);
  const [charmLoading, setCharmLoading] = useState(true);

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

  const getCharmPosition = (index, total) => {
    const baseSize = '25.33%';

    if (total === 1) {
      return {
        width: baseSize,
        height: baseSize,
        left: '53%',
        top: '72%',
        transform: 'translate(-50%, -50%) rotate(0deg)'
      };
    }
    if (total === 2) {
      const rotationAngle = index === 0 ? 30 : -40;
      return {
        width: baseSize,
        height: baseSize,
        left: index === 0 ? '43%' : '65%',
        top: index === 0 ? '72%' : '70%',
        transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`
      };
    }
    if (total === 3) {
      const positions = [
        { left: '43%', top: '71%', rotation: 30 },
        { left: '55%', top: '73%', rotation: -5 },
        { left: '67%', top: '68%', rotation: -48 }
      ];
      return {
        width: baseSize,
        height: baseSize,
        left: positions[index].left,
        top: positions[index].top,
        transform: `translate(-50%, -50%) rotate(${positions[index].rotation}deg)`
      };
    }
    if (total === 4) {
      const positions = [
        { left: '41%', top: '70%', rotation: 40 },
        { left: '52%', top: '73%', rotation: 2 },
        { left: '64%', top: '70%', rotation: -35 },
        { left: '72%', top: '61%', rotation: -75 }
      ];
      return {
        width: baseSize,
        height: baseSize,
        left: positions[index].left,
        top: positions[index].top,
        transform: `translate(-50%, -50%) rotate(${positions[index].rotation}deg)`
      };
    }
    if (total === 5) {
      const positions = [
        { left: '41%', top: '70%', rotation: 40 },
        { left: '52%', top: '73%', rotation: 2 },
        { left: '64%', top: '70%', rotation: -35 },
        { left: '72%', top: '61%', rotation: -75 },
        { left: '35%', top: '63%', rotation: 73 }
      ];
      return {
        width: baseSize,
        height: baseSize,
        left: positions[index].left,
        top: positions[index].top,
        transform: `translate(-50%, -50%) rotate(${positions[index].rotation}deg)`
      };
    }
    return {
      width: baseSize,
      height: baseSize,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%) rotate(0deg)'
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

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = parseFloat(product?.price) || 0;
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

  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    alert("Added to cart! (Implement actual logic here)");
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
          {[1, 2, 3, 4, 5].map((num) => (
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
          <div className="bg-white rounded p-4 relative overflow-hidden" style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}>
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

          <div className="flex-1">
            <div className="text-2xl font-semibold mb-4">
              {formatIDR(calculateTotalPrice())}
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
              <div className="space-y-4 max-h-[25vw] overflow-y-auto pr-2">
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
                                    className=" ```jsx
hover:scale-105 transition rounded border p-1 w-full"
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
    </div>
  );
};

export default ProductDetailCharmBar;