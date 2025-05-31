import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import logo from "../../assets/logo/sparklore_logo.png";
import { useState, useEffect } from "react";
import product1 from "../../assets/default/homeproduct1.png";
import product2 from "../../assets/default/homeproduct2.png";
import { isLoggedIn, logout, getAuthData, fetchCart, fetchProduct, fetchCharm, updateCartItemQuantity, deleteCartItem, BASE_URL } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';

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

          // First keep the existing cart items as fallback
          const existingCartItems = [...cartItems];

          try {
            const cartData = await fetchCart();

            // Fetch product details for each item in cart
            const itemsWithDetails = await Promise.all(
              cartData.items.map(async (item) => {
                const product = await fetchProduct(item.product);
                const charmDetails = item.charms && item.charms.length > 0 
                  ? await Promise.all(item.charms.map(charmId => fetchCharm(charmId)))
                  : [];

                // Apply discount logic (campaign > product discount)
                const originalPrice = parseFloat(product.price);
                let discount = parseFloat(product.discount || 0);
                let discountedPrice = originalPrice;
                let discountLabel = "";
                let campaignDiscountItem = discountMap[`${product.id}`];

                if (campaignDiscountItem) {
                  const discountType = campaignDiscountItem.discount_type;
                  const discountValue = parseFloat(campaignDiscountItem.discount_value || "0");
                  if (discountType === "percent") {
                    discountedPrice = originalPrice * (1 - discountValue / 100);
                    discount = discountValue;
                    discountLabel = `${discountValue}% OFF`;
                  } else if (discountType === "amount") {
                    discountedPrice = discountValue;
                    discount = originalPrice > 0
                      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                      : 0;
                    discountLabel = `${discount}% OFF`;
                  }
                } else if (discount > 0) {
                  discountedPrice = originalPrice * (1 - (discount / 100));
                  discountLabel = `${discount}% OFF`;
                }

                return {
                  id: item.id,
                  productId: item.product,
                  name: product.name,
                  price: discountedPrice, // Always the discounted price if any
                  originalPrice: discountedPrice !== originalPrice ? originalPrice : null,
                  discount: discount,
                  discountLabel,
                  quantity: item.quantity,
                  selected: false,
                  image: (product.images && product.images.length > 0) ? product.images[0].image_url : product1,
                  charms: charmDetails.map(charm => charm.image),
                  message: item.message || ""
                };
              })
            );

            setCartItems(itemsWithDetails);
          } catch (error) {
            console.error("Error loading cart from API:", error);
            setCartError("Couldn't load cart data. Displaying cached items.");
            // Keep the existing cart items if API fails
            setCartItems(existingCartItems);
          }
        } catch (error) {
          console.error("Error loading cart:", error);
          setCartError(error.message);
        } finally {
          setIsLoadingCart(false);
        }
      }
      // eslint-disable-next-line
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

  const handleQuantityChange = async (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    // Prevent negative quantities
    if (newQuantity < 0) return;

    // Handle quantity 0 (delete item)
    if (newQuantity === 0) {
      setItemToDelete(id);
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // Optimistically update the UI
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Update quantity on server
      await updateCartItemQuantity(id, newQuantity);

      // Refresh cart data to ensure sync (re-apply discount logic here!)
      const updatedCart = await fetchCart();
      const itemsWithDetails = await Promise.all(
        updatedCart.items.map(async (item) => {
          const product = await fetchProduct(item.product);
          const charmDetails = item.charms && item.charms.length > 0 
            ? await Promise.all(item.charms.map(charmId => fetchCharm(charmId)))
            : [];
          // Apply discount campaign logic
          const originalPrice = parseFloat(product.price);
          let discount = parseFloat(product.discount || 0);
          let discountedPrice = originalPrice;
          let discountLabel = "";
          let campaignDiscountItem = discountMap[`${product.id}`];

          if (campaignDiscountItem) {
            const discountType = campaignDiscountItem.discount_type;
            const discountValue = parseFloat(campaignDiscountItem.discount_value || "0");
            if (discountType === "percent") {
              discountedPrice = originalPrice * (1 - discountValue / 100);
              discount = discountValue;
              discountLabel = `${discountValue}% OFF`;
            } else if (discountType === "amount") {
              discountedPrice = discountValue;
              discount = originalPrice > 0
                ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                : 0;
              discountLabel = `${discount}% OFF`;
            }
          } else if (discount > 0) {
            discountedPrice = originalPrice * (1 - (discount / 100));
            discountLabel = `${discount}% OFF`;
          }

          return {
            id: item.id,
            productId: item.product,
            name: product.name,
            price: discountedPrice, // This is the discounted price
            originalPrice: discountedPrice !== originalPrice ? originalPrice : null,
            discount: discount,
            discountLabel,
            quantity: item.quantity,
            selected: item.selected || false,
            image: (product.images && product.images.length > 0) ? product.images[0].image_url : product1,
            charms: charmDetails.map(charm => charm.image),
            message: item.message || ""
          };
        })
      );
      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert UI if update fails
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - change }
            : item
        )
      );
      setSnackbarMessage('Failed to update quantity');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Delete from server
      await deleteCartItem(itemToDelete);

      // Update UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));

      setSnackbarMessage('Item removed from cart');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error("Error deleting item:", error);
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
            {/* <button className="flex items-center border rounded-full text-xs font-medium">
              <span className="px-3 py-1 bg-white rounded-l-full">EN</span>
              <span className="px-3 py-1 bg-[#e6d4a5] rounded-r-full">ID</span>
            </button> */}
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
          // New: close drawer if user clicks the backdrop, but NOT if they click inside the drawer
          onClick={() => setDrawerCartOpen(false)}
        >
          <div
            className="bg-[#fdfaf3] sm:w-full md:w-[40%] h-full p-6 overflow-y-auto relative animate-slideInRight shadow-2xl"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the drawer
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
              <div className="flex justify-center items-center h-32">
                <p>Loading your cart...</p>
              </div>
            )}
            
            {cartError && (
              <div className="text-red-500 p-4 text-center">
                {cartError}
              </div>
            )}

            {/* Cart Items */}
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

            {/* Bottom Section - Only show if cart has items */}
            {cartItems.length > 0 && (
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

                {/* Buttons */}
                {/* In the cart drawer buttons section */}
                <div className="mt-6 space-y-4">
                  <Link 
                    to="/checkout" 
                    state={{ selectedItems: cartItems.filter(item => item.selected) }}
                    className="w-full bg-[#e9d8a6] text-gray-800 font-medium py-3 rounded-lg text-lg tracking-wide hover:opacity-90 transition block text-center"
                    onClick={() => {
                      // Only allow checkout if at least one item is selected
                      const hasSelectedItems = cartItems.some(item => item.selected);
                      if (!hasSelectedItems) {
                        setSnackbarMessage('Please select at least one item to checkout');
                        setSnackbarType('error');
                        setShowSnackbar(true);
                        return false; // Prevent navigation
                      }
                    }}
                  >
                    Checkout
                  </Link>
                  {/* <button className="w-full bg-[#e4572e] text-white font-medium py-3 rounded-lg text-lg tracking-wide hover:opacity-90 transition">
                    Shopee Checkout
                  </button> */}
                </div>
              </>
            )}

            {/* Empty cart state */}
            {!isLoadingCart && cartItems.length === 0 && !cartError && (
              <div className="text-center py-10">
                <p>Your cart is empty</p>
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
              {/* <button className="flex items-center border rounded-full text-xs font-medium">
                <span className="px-3 py-1 bg-white rounded-l-full text-black">EN</span>
                <span className="px-3 py-1 bg-[#e6d4a5] rounded-r-full text-black">ID</span>
              </button> */}
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