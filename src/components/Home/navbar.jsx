import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import logo from "../../assets/logo/sparklore_logo.png";
import { useState, useEffect } from "react";
import product1 from "../../assets/default/homeproduct1.png";
import product2 from "../../assets/default/homeproduct2.png";
import { isLoggedIn, logout, getAuthData, fetchCart, updateCartItemQuantity, deleteCartItem, BASE_URL, fetchAllCharms } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';
const EMPTY_CART_IMAGE = "https://i.pinimg.com/736x/2e/ac/fa/2eacfa305d7715bdcd86bb4956209038.jpg";

const mapCartItemsWithCharms = (cartData, charmMap, discountMap, BASE_URL, product1) => {
  return cartData.items.map((item) => {
    // CASE: Charm-only item (no product/gift_set, only one charm)
    if (
      !item.product &&
      !item.gift_set &&
      Array.isArray(item.charms) &&
      item.charms.length === 1
    ) {
      const charmId = item.charms[0];
      const charm = charmMap[charmId];
      let price = charm?.price || 0;
      let originalPrice = price;
      let discount = charm?.discount || 0;
      let discountLabel = "";
      if (discount > 0) {
        price = price * (1 - discount / 100);
        discountLabel = `${discount}% OFF`;
      }
      return {
        id: item.id,
        name: charm?.name || "Unknown Charm",
        price,
        originalPrice: discount > 0 ? originalPrice : null,
        discount,
        discountLabel,
        quantity: item.quantity,
        selected: false,
        image: charm?.image,
        charms: [],
        message: item.message || "",
        giftSet: null,
        description: charm?.description || "",
        charmId: charmId,
        category: charm?.category || "",
        type: "single-charm",
      };
    }

    // CASE: Product or GiftSet
    const product = item.product;
    const giftSet = item.gift_set;
    let name = "";
    let price = 0;
    let originalPrice = 0;
    let discount = 0;
    let discountLabel = "";
    let image = product1;

    if (product) {
      name = product.name;
      originalPrice = parseFloat(product.price);
      price = originalPrice;
      image = product.images && product.images.length > 0
        ? (product.images[0].image_url.startsWith('http')
          ? product.images[0].image_url
          : `${BASE_URL.replace(/\/$/, '')}${product.images[0].image_url}`)
        : product1;

      // Discount/campaign logic for main product
      const campaignDiscount = discountMap[`${product.id}`];
      if (campaignDiscount) {
        const discountType = campaignDiscount.discount_type;
        const discountValue = parseFloat(campaignDiscount.discount_value || "0");
        if (discountType === "percent") {
          price = originalPrice * (1 - discountValue / 100);
          discount = discountValue;
          discountLabel = `${discountValue}% OFF`;
        } else if (discountType === "amount") {
          price = discountValue;
          discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
          discountLabel = `${discount}% OFF`;
        }
      } else if (product.discount && parseFloat(product.discount) > 0) {
        discount = parseFloat(product.discount);
        price = originalPrice * (1 - discount / 100);
        discountLabel = `${discount}% OFF`;
      }
    } else if (giftSet) {
      name = giftSet.name;
      originalPrice = parseFloat(giftSet.price);
      price = originalPrice;
      image = giftSet.image_url
        ? (giftSet.image_url.startsWith('http')
          ? giftSet.image_url
          : `${BASE_URL.replace(/\/$/, '')}${giftSet.image_url}`)
        : product1;
    }

    // --- PRODUCT & CHARMS: Add all charm prices to product price ---
    let charmImages = [];
    let charmsSubtotal = 0;
    if (product && Array.isArray(item.charms) && item.charms.length > 0) {
      charmImages = item.charms.map(
        charmId => charmMap[charmId]?.image
      ).filter(Boolean);

      // Add up charm prices (with discount if any)
      charmsSubtotal = item.charms.reduce((sum, charmId) => {
        const charm = charmMap[charmId];
        if (!charm) return sum;
        let charmPrice = charm.price || 0;
        if (charm.discount && charm.discount > 0) {
          charmPrice = charmPrice * (1 - charm.discount / 100);
        }
        return sum + charmPrice;
      }, 0);

      // Add charms price to product price!
      price += charmsSubtotal;
      // For originalPrice: add *original* charms price (no discount for charms)
      let originalCharms = item.charms.reduce((sum, charmId) => {
        const charm = charmMap[charmId];
        return sum + (charm?.price || 0);
      }, 0);
      // If product is discounted, originalPrice is base product price + original charms price
      originalPrice = (originalPrice || 0) + originalCharms;
      // If any charm has discount, show discount info
      const hasCharmDiscount = item.charms.some(
        charmId => charmMap[charmId]?.discount > 0
      );
      if (hasCharmDiscount || discount > 0) {
        discountLabel = [
          discount > 0 ? `${discount}% OFF` : null,
          hasCharmDiscount ? "Charm Discount" : null,
        ].filter(Boolean).join(" + ");
      }
    } else {
      // For non-product/giftset with charms (e.g., jewel_set, etc):
      charmImages = (item.charms || []).map(
        charmId => charmMap[charmId]?.image
      ).filter(Boolean);
    }

    return {
      id: item.id,
      name,
      price,
      originalPrice: price !== originalPrice ? originalPrice : null,
      discount,
      discountLabel,
      quantity: item.quantity,
      selected: false,
      image,
      charms: charmImages,
      message: item.message || "",
      giftSet: giftSet
        ? {
            id: giftSet.id,
            name: giftSet.name,
            image: giftSet.image_url
              ? (giftSet.image_url.startsWith('http')
                ? giftSet.image_url
                : `${BASE_URL.replace(/\/$/, '')}${giftSet.image_url}`)
              : null,
            price: giftSet.price,
            description: giftSet.description,
            products: giftSet.products
          }
        : null,
      type: "product",
    };
  });
};

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCartOpen, setDrawerCartOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Charm Link Custom Bracelet",
      price: 369998,
      quantity: 1,
      selected: false,
      image: product1,
      charms: [product1, product1, product1, product1, product1],
      message: "This is for the special message if the user want to send a message to the recipient."
    },
    {
      id: 2,
      name: "Marbella Ring",
      price: 99999,
      quantity: 1,
      selected: false,
      image: product2
    }
  ]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  // New state for discount campaign map (productId as string => discountItem)
  const [discountMap, setDiscountMap] = useState({});

  // Fetch and build discount map on mount and whenever cart is opened
  useEffect(() => {
    const fetchDiscountCampaigns = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/discount-campaigns/`);
        if (!response.ok) throw new Error("Failed to fetch discount campaigns");
        const campaigns = await response.json();
        const map = {};
        // Flatten all campaign items into productId -> discountItem
        campaigns.forEach(campaign => {
          if (campaign.items && campaign.items.length > 0) {
            campaign.items.forEach(item => {
              if (item.product && item.product.id !== undefined && item.product.id !== null) {
                map[`${item.product.id}`] = item;
              }
            });
          }
        });
        setDiscountMap(map);
      } catch (err) {
        // No error thrown, cart can still work without discounts
        setDiscountMap({});
      }
    };
    // Always fetch new discount map if cart is opened
    if (drawerCartOpen && isLoggedInState) fetchDiscountCampaigns();
  }, [drawerCartOpen, isLoggedInState]);

  // Load cart data when drawer opens and user is logged in
  useEffect(() => {
    const loadCartData = async () => {
      if (drawerCartOpen && isLoggedInState) {
        try {
          setIsLoadingCart(true);
          setCartError(null);

          const cartData = await fetchCart();
          const allCharms = await fetchAllCharms();
          const charmMap = {};
          allCharms.forEach(charm => {
            charmMap[charm.id] = charm;
          });

          const itemsWithDetails = mapCartItemsWithCharms(cartData, charmMap, discountMap, BASE_URL, product1);
          setCartItems(itemsWithDetails);
        } catch (error) {
          setCartError("Couldn't load cart data.");
          setCartItems([]);
          setCartError(error.message);
        } finally {
          setIsLoadingCart(false);
        }
      }
    };
    loadCartData();
    // eslint-disable-next-line
  }, [drawerCartOpen, isLoggedInState, discountMap]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchBar(false);
    }
  };

  // Add this useEffect to listen for storage changes
  useEffect(() => {
    setIsInitialLoad(false);

    if (location.state?.showLoginSuccess) {
      setSnackbarMessage('You are logged in');
      setSnackbarType('success');
      setShowSnackbar(true);
      // Clear the state so it doesn't show again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Initial check
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setIsLoggedInState(loggedIn);
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'authData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.state]);

  const handleCartClick = () => {
    if (!isLoggedInState) {
      setShowLoginPrompt(true);
    } else {
      setDrawerCartOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedInState(false);
    setSnackbarMessage('Successfully logged out');
    setSnackbarType('success');
    setShowSnackbar(true);
    setShowLogoutConfirm(false); // Close the confirmation dialog
    navigate('/');
  };

  const navItems = [
    { name: "Charm Bar", path: "/charmbar" },
    { name: "Charms", path: "/charms" },
    { name: "Necklaces", path: "/necklaces" },
    { name: "Bracelets", path: "/bracelets" },
    { name: "Earrings", path: "/earrings" },
    { name: "Rings", path: "/rings" },
    { name: "Anklets", path: "/anklets" },
    { name: "Gift Sets", path: "/giftsets" },
  ];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

   // --- PATCH: handleQuantityChange uses the same mapping logic as cart loading!
  const handleQuantityChange = async (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity < 0) return; // should never happen

    if (newQuantity === 0) {
      setItemToDelete(id);
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // Optimistically update UI
      setCartItems(prev =>
        prev.map(it => it.id === id ? { ...it, quantity: newQuantity } : it)
      );

      await updateCartItemQuantity(id, newQuantity);

      // Re-fetch cart to resync WITH charms info
      const cartData = await fetchCart();
      const allCharms = await fetchAllCharms();
      const charmMap = {};
      allCharms.forEach(charm => {
        charmMap[charm.id] = charm;
      });

      const itemsWithDetails = mapCartItemsWithCharms(cartData, charmMap, discountMap, BASE_URL, product1);
      setCartItems(itemsWithDetails);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update quantity');
      setSnackbarType('error');
      setShowSnackbar(true);
      // For debugging, also log the error:
      console.error("Quantity update error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCartItem(itemToDelete);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setSnackbarMessage('Item removed from cart');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Failed to remove item');
      setSnackbarType('error');
      setShowSnackbar(true);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const toggleItemSelection = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? {
            ...item,
            selected: !item.selected
          }
          : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        selected: !allSelected
      }))
    );
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp.');
  };


  return (
    <div className="bg-[#fdfaf3] shadow-md">
      {/* Add the logout confirmation popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Snackbar 
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />

      {/* Desktop Layout */}
      <div className="hidden md:block">
         <nav className="px-[9rem] pb-[2rem] pt-[1rem] flex items-center justify-between">
          {/* Left Section - Language Toggle */}
          <div className="flex items-center">
            <div className="p-[3rem]"></div>
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img src={logo} alt="Sparklore Logo" className="h-[7rem] object-contain" />
            </Link>
          </div>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-6 text-gray-700">
            <Search className="w-5 h-5 cursor-pointer" onClick={() => setShowSearchBar(!showSearchBar)} />
            {isLoggedInState ? (
              <LogOut 
                className="w-5 h-5 cursor-pointer hover:text-[#b87777]" 
                onClick={() => setShowLogoutConfirm(true)}
                title="Logout"
              />
            ) : (
              <Link to="/login">
                <User className="w-5 h-5 cursor-pointer hover:text-[#b87777]" />
              </Link>
            )}
            <ShoppingBag 
              className="w-5 h-5 cursor-pointer" 
              onClick={handleCartClick} 
            />
          </div>
        </nav>

        {/* Bottom Navigation Links */}
        <div className="px-6 pb-[1rem] pt-[0.1rem]">
          <ul className="flex justify-center md:gap-6 lg:gap-30 uppercase text-xs md:text-lg font-semibold tracking-wider text-center">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `pb-2 hover:text-[#b87777] hover:border-b hover:border-[#b87777] transition-colors duration-300 ${
                      isInitialLoad || !isActive ? "text-gray-800" : "text-[#b87777] font-bold border-b-2 border-[#b87777]"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        {showSearchBar && (
        <div className="px-[9rem] pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="COUPLE BRACELETS...."
              className="w-full bg-[#fdfaf3] border-b border-gray-300 text-gray-700 placeholder-gray-400 text-lg tracking-wide px-12 py-3 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      </div>

      {/* Shopping Cart Drawer - Updated Section */}
      {drawerCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex justify-end"
          onClick={() => setDrawerCartOpen(false)}
        >
          <div
            className="bg-[#fdfaf3] sm:w-full md:w-[40%] h-full p-6 overflow-y-auto relative animate-slideInRight shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold tracking-widest text-gray-800">YOUR CART</h2>
              <button 
                className="text-2xl text-gray-700" 
                onClick={() => setDrawerCartOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Loading and Error States */}
            {isLoadingCart && (
              <div className="flex flex-col justify-center items-center h-32 gap-2">
                <span role="img" aria-label="Loading" className="text-5xl animate-spin">🛒</span>
                <p>Loading your cart...</p>
              </div>
            )}

            {cartError && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <img
                  src={EMPTY_CART_IMAGE}
                  alt="Empty Cart"
                  className="w-24 h-24 opacity-60"
                  style={{ filter: "grayscale(70%)" }}
                />
                <span className="text-[#b87777] font-semibold text-lg text-center">
                  {cartError}
                </span>
                {cartError.toLowerCase().includes('load') && (
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-[#e6d4a5] rounded text-gray-800 font-medium"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {!cartError && !isLoadingCart && cartItems.length > 0 && (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <div className="flex gap-4">
                      <input 
                        type="checkbox" 
                        className="custom-checkbox" 
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-[6rem] h-[6rem] object-cover rounded-md" 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[#b87777] font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.originalPrice && (
                            <div className="flex gap-2">
                              <p className="text-gray-400 text-sm line-through">
                                {formatPrice(item.originalPrice * item.quantity)}
                              </p>
                              <span className="text-xs bg-[#c3a46f] text-white px-1 rounded">
                                {item.discountLabel || `${item.discount}% OFF`}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* --- Product/GiftSet Unified UI --- */}
                        {/* If it's a gift set, display like a product */}
                        {/* {item.giftSet && (
                          <div className="mt-2 p-2 border rounded bg-[#fbf8ed]">
                            <div className="flex gap-3 items-center">
                              {item.giftSet.image && (
                                <img
                                  src={item.giftSet.image}
                                  alt={item.giftSet.name}
                                  className="w-[4.5rem] h-[4.5rem] object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-[#b87777] text-base">{item.giftSet.name}</div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {item.giftSet.products && item.giftSet.products.length > 0
                                    ? "Includes: " + item.giftSet.products.map(p => p.name).join(", ")
                                    : null}
                                </div>
                                <p className="text-gray-800 font-semibold">
                                  {formatPrice(Number(item.giftSet.price) * item.quantity)}
                                </p>
                                {item.giftSet.description && (
                                  <div className="text-xs text-gray-700 mt-1">{item.giftSet.description}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )} */}
                        {/* --- END Product/GiftSet Unified UI --- */}
                        {item.charms && item.charms.length > 0 && (
                          <div className="text-sm mt-2">
                            <p className="font-medium">Charm Selection</p>
                            <div className="flex gap-1 mt-1">
                              {item.charms.map((charm, index) => (
                                <img 
                                  key={index} 
                                  src={charm} 
                                  className="w-6 h-6 border rounded-sm" 
                                  alt={`charm ${index}`} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {item.message && (
                          <div className="text-sm mt-2">
                            <p className="font-medium text-start text-gray-600">Special Message</p>
                            <p className="italic text-sm text-gray-600">"{item.message}"</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            className="border px-2 rounded text-gray-700"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            className="border px-2 rounded text-gray-700"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Section - Only show if cart has items and no error */}
            {!cartError && cartItems.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-10 pt-6 border-t">
                  <div className="flex gap-2 items-center">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                      onChange={toggleSelectAll}
                    />
                    <label className="text-sm font-semibold">All</label>
                  </div>
                  <div className="flex gap-4 items-end">
                    <p className="text-lg font-medium">Total</p>
                    <p className="text-lg font-bold text-[#b87777]">
                      {formatPrice(calculateTotal())}
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <Link 
                    to="/checkout" 
                    state={{ selectedItems: cartItems.filter(item => item.selected) }}
                    className="w-full bg-[#e9d8a6] text-gray-800 font-medium py-3 rounded-lg text-lg tracking-wide hover:opacity-90 transition block text-center"
                    onClick={() => {
                      const hasSelectedItems = cartItems.some(item => item.selected);
                      if (!hasSelectedItems) {
                        setSnackbarMessage('Please select at least one item to checkout');
                        setSnackbarType('error');
                        setShowSnackbar(true);
                        return false;
                      }
                    }}
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}

            {/* Empty cart state (nice user-friendly) */}
            {!isLoadingCart && cartItems.length === 0 && !cartError && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <img
                  src={EMPTY_CART_IMAGE}
                  alt="Empty Cart"
                  className="w-24 h-24 opacity-60"
                  style={{ filter: "grayscale(70%)" }}
                />
                <span className="text-[#b87777] font-semibold text-lg text-center">
                  Your cart is empty.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden">
          <nav className="px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Sparklore Logo" className="h-12 object-contain" />
            </Link>
            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 cursor-pointer" onClick={() => setShowSearchBar(!showSearchBar)} />
              {isLoggedInState ? (
                <LogOut 
                  className="w-5 h-5 cursor-pointer hover:text-[#b87777]" 
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Logout"
                />
              ) : (
                <Link to="/login">
                  <User className="w-5 h-5 cursor-pointer hover:text-[#b87777]" />
                </Link>
              )}
              <ShoppingBag 
                className="w-5 h-5 cursor-pointer" 
                onClick={handleCartClick} 
              />
              <Menu 
                className="w-6 h-6 cursor-pointer" 
                onClick={() => setDrawerOpen(true)}
              />
            </div>
          </nav>

        {showSearchBar && (
          <div className="px-[0.2rem] pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
            <div className="relative">
              <input
                type="text"
                placeholder="COUPLE BRACELETS...."
                className="w-full bg-[#fdfaf3] border-b border-gray-300 text-gray-700 placeholder-gray-400 text-lg tracking-wide px-12 py-3 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl"
                onClick={() => setShowSearchBar(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-500/30">
          <div 
            className="absolute right-0 h-full w-4/5 max-w-xs bg-[#fdfaf3] p-4 shadow-lg"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="p-[3rem]"></div>
              <button 
                className="text-gray-700 text-2xl"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <ul className="space-y-4 uppercase text-base font-semibold">
              {navItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block py-2 hover:text-[#b87777] ${
                        isActive ? "text-[#b87777]" : "text-gray-800"
                      }`
                    }
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Login Prompt Popup */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to access your shopping cart.
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

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[999] bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          /* Custom checkbox styling */
          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            background-color: #fff;
            margin: 0;
            font: inherit;
            color: #e9d8a6;
            width: 1.25rem;
            height: 1.25rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            transform: translateY(-0.075em);
            display: grid;
            place-content: center;
            cursor: pointer;
          }

          input[type="checkbox"]::before {
            content: "";
            width: 0.65rem;
            height: 0.65rem;
            transform: scale(0);
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1rem 1rem #e9d8a6;
            transform-origin: bottom left;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
          }

          input[type="checkbox"]:checked::before {
            transform: scale(1);
          }

          input[type="checkbox"]:focus {
            outline: 2px solid #3c3011;
            outline-offset: 2px;
          }

          /* Rest of your animations */
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }

          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
      `}</style>
    </div>
  );
};

export default NavBar;