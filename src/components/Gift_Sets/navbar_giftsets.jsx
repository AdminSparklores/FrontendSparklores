import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import logo from "../../assets/logo/sparklore_logo.png";
import { useState, useEffect } from "react";
import product1 from "../../assets/default/homeproduct1.png";
import { isLoggedIn, logout, fetchCart, updateCartItemQuantity, deleteCartItem, BASE_URL, fetchProduct, fetchCharm } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';
import CartDrawer from '../CartDrawer';

const fetchGiftSet = async (giftSetId) => {
  const response = await fetch(`${BASE_URL}/api/gift-sets/${giftSetId}/`);
  if (!response.ok) throw new Error('Failed to fetch gift set');
  return await response.json();
};

const mapCartItemsWithDetails = async (cartData, discountMap, BASE_URL, product1) => {
  const productIds = [];
  const charmIds = [];
  const giftSetIds = [];
  cartData.items.forEach(item => {
    if (item.product) productIds.push(item.product);
    if (item.gift_set) giftSetIds.push(item.gift_set);
    if (item.charms && Array.isArray(item.charms)) charmIds.push(...item.charms);
  });

  const [productsArr, charmsArr, giftSetsArr] = await Promise.all([
    Promise.all([...new Set(productIds)].map(id => fetchProduct(id))),
    Promise.all([...new Set(charmIds)].map(id => fetchCharm(id))),
    Promise.all([...new Set(giftSetIds)].map(id => fetchGiftSet(id))),
  ]);
  const productMap = {};
  productsArr.forEach(prod => { productMap[prod.id] = prod; });
  const charmMap = {};
  charmsArr.forEach(charm => { charmMap[charm.id] = charm; });
  const giftSetMap = {};
  giftSetsArr.forEach(gs => { giftSetMap[gs.id] = gs; });

  return cartData.items.map((item) => {
    if (
      !item.product &&
      !item.gift_set &&
      Array.isArray(item.charms) &&
      item.charms.length === 1
    ) {
      const charmId = item.charms[0];
      const charm = charmMap[charmId];
      let price = Number(charm?.price) || 0;
      let originalPrice = price;
      let discount = Number(charm?.discount) || 0;
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
    const product = item.product ? productMap[item.product] : null;
    const giftSet = item.gift_set ? giftSetMap[item.gift_set] : null;
    let name = "";
    let price = 0;
    let originalPrice = 0;
    let discount = 0;
    let discountLabel = "";
    let image = product1;
    if (product) {
      name = product.name;
      let productOriginalPrice = Number(product.price) || 0;
      let productPrice = productOriginalPrice;
      image = product.images && product.images.length > 0
        ? (product.images[0].image_url.startsWith('http')
          ? product.images[0].image_url
          : `${BASE_URL.replace(/\/$/, '')}${product.images[0].image_url}`)
        : product1;

      if (product.discount && Number(product.discount) > 0) {
        discount = Number(product.discount);
        productPrice = productOriginalPrice * (1 - discount / 100);
        discountLabel = `${discount}% OFF`;
      }

      let charmImages = [];
      let charmsSubtotal = 0;
      let originalCharms = 0;
      let hasCharmDiscount = false;
      if (Array.isArray(item.charms) && item.charms.length > 0) {
        charmImages = item.charms.map(
          charmId => charmMap[charmId]?.image
        ).filter(Boolean);
        charmsSubtotal = item.charms.reduce((sum, charmId) => {
          const charm = charmMap[charmId];
          if (!charm) return sum;
          let charmPrice = Number(charm.price) || 0;
          if (charm.discount && Number(charm.discount) > 0) {
            charmPrice = charmPrice * (1 - Number(charm.discount) / 100);
            hasCharmDiscount = true;
          }
          return sum + charmPrice;
        }, 0);
        originalCharms = item.charms.reduce((sum, charmId) => {
          const charm = charmMap[charmId];
          return sum + (Number(charm?.price) || 0);
        }, 0);
      }
      price = productPrice + charmsSubtotal;
      originalPrice = productOriginalPrice + originalCharms;
      if (hasCharmDiscount || discount > 0) {
        discountLabel = [
          discount > 0 ? `${discount}% OFF` : null,
          hasCharmDiscount ? "Charm Discount" : null,
        ].filter(Boolean).join(" + ");
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
        charms: (item.charms || []).map(charmId => charmMap[charmId]?.image).filter(Boolean),
        message: item.message || "",
        giftSet: null,
        type: "product",
      };
    }
    if (giftSet) {
      name = giftSet.name;
      originalPrice = Number(giftSet.price) || 0;
      price = originalPrice;
      image = giftSet.image_url
        ? (giftSet.image_url.startsWith('http')
          ? giftSet.image_url
          : `${BASE_URL.replace(/\/$/, '')}${giftSet.image_url}`)
        : product1;
      return {
        id: item.id,
        name,
        price,
        originalPrice: null,
        discount: 0,
        discountLabel: "",
        quantity: item.quantity,
        selected: false,
        image,
        charms: [],
        message: item.message || "",
        giftSet: {
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
        },
        type: "gift_set",
      };
    }
    return {
      id: item.id,
      name: "Unknown Item",
      price: 0,
      originalPrice: null,
      discount: 0,
      discountLabel: "",
      quantity: item.quantity,
      selected: false,
      image: product1,
      charms: [],
      message: item.message || "",
      giftSet: null,
      type: "unknown",
    };
  });
};

const NavBar_GiftSets = () => {
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
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [discountMap, setDiscountMap] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsInitialLoad(false);
    if (location.state?.showLoginSuccess) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setIsLoggedInState(loggedIn);
    };
    checkAuth();
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

  useEffect(() => {
    const fetchDiscountCampaigns = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/discount-campaigns/`);
        if (!response.ok) throw new Error("Failed to fetch discount campaigns");
        const campaigns = await response.json();
        const map = {};
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
        setDiscountMap({});
      }
    };
    if (drawerCartOpen && isLoggedInState) fetchDiscountCampaigns();
  }, [drawerCartOpen, isLoggedInState]);

  useEffect(() => {
    const loadCartData = async () => {
      if (drawerCartOpen && isLoggedInState) {
        try {
          setIsLoadingCart(true);
          setCartError(null);
          const cartData = await fetchCart();
          const itemsWithDetails = await mapCartItemsWithDetails(cartData, discountMap, BASE_URL, product1);
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
    setShowLogoutConfirm(false);
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

  const handleQuantityChange = async (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;
    const newQuantity = item.quantity + change;
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
      setItemToDelete(id);
      setShowDeleteConfirm(true);
      return;
    }
    try {
      setCartItems(prev =>
        prev.map(it => it.id === id ? { ...it, quantity: newQuantity } : it)
      );
      await updateCartItemQuantity(id, newQuantity);
      const cartData = await fetchCart();
      const itemsWithDetails = await mapCartItemsWithDetails(cartData, discountMap, BASE_URL, product1);
      setCartItems(itemsWithDetails);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update quantity');
      setSnackbarType('error');
      setShowSnackbar(true);
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
      {/* Logout Confirmation Popup */}
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
            <Search 
              className="w-5 h-5 cursor-pointer" 
              onClick={() => setShowSearchBar(!showSearchBar)} 
            />
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

        {/* Search Bar */}
        {showSearchBar && (
          <div className="px-[9rem] pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="GIFT SETS...."
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

      {/* Use CartDrawer */}
           <div className="text-start text-black">
            <CartDrawer
              open={drawerCartOpen}
              onClose={() => setDrawerCartOpen(false)}
              cartItems={cartItems}
              isLoadingCart={isLoadingCart}
              cartError={cartError}
              handleQuantityChange={handleQuantityChange}
              toggleItemSelection={toggleItemSelection}
              toggleSelectAll={toggleSelectAll}
              formatPrice={formatPrice}
              calculateTotal={calculateTotal}
              showDeleteConfirm={showDeleteConfirm}
              itemToDelete={itemToDelete}
              handleConfirmDelete={handleConfirmDelete}
              setShowDeleteConfirm={setShowDeleteConfirm}
              setItemToDelete={setItemToDelete}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarType={setSnackbarType}
              setShowSnackbar={setShowSnackbar}
            />
           </div>


      {/* Mobile Layout */}
      <div className="md:hidden">
        <nav className="px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Sparklore Logo" className="h-12 object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Search 
              className="w-5 h-5 cursor-pointer" 
              onClick={() => setShowSearchBar(!showSearchBar)} 
            />
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

        {/* Mobile Search Bar */}
        {showSearchBar && (
          <div className="px-4 pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="GIFT SETS...."
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

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-500/30">
          <div 
            className="absolute right-0 h-full w-4/5 max-w-xs bg-[#fdfaf3] p-4 shadow-lg"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <div className="flex justify-between items-center mb-8">
              {/* <button className="flex items-center border rounded-full text-xs font-medium">
                <span className="px-3 py-1 bg-white rounded-l-full">EN</span>
                <span className="px-3 py-1 bg-[#e6d4a5] rounded-r-full">ID</span>
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

      <style jsx>{`
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
          
        @keyframes slideIn {
          from { transform: translateX(100%); }
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

export default NavBar_GiftSets;