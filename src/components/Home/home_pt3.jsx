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

const HomePart3 = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [discountMap, setDiscountMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Helper function to get the first image URL from a product
  const getFirstProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return '../../assets/default/banner_home.jpeg';
  };

  // Fetch products and discount campaigns from API
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productRes = await fetch(`${BASE_URL}/api/products/`);
        if (!productRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productRes.json();

        // Fetch discounts
        const discountRes = await fetch(`${BASE_URL}/api/discount-campaigns/`);
        const discountData = discountRes.ok ? await discountRes.json() : [];

        // Build a map: productId -> discount item
        const discountMap = {};
        discountData.forEach(campaign => {
          if (campaign.items && campaign.items.length > 0) {
            campaign.items.forEach(item => {
              if (item.product && item.product.id) {
                discountMap[item.product.id] = item;
              }
            });
          }
        });

        // Map and sort products by sold_stok (highest to lowest)
        const sortedProducts = productsData
          .map(product => ({
            ...product,
            id: product.id,
            name: product.name,
            tag: product.label ? product.label.toUpperCase() : "",
            rating: parseFloat(product.rating) || 0,
            price: parseFloat(product.price),
            oldPrice: null,
            discount: parseFloat(product.discount || 0),
            image: getFirstProductImage(product),
            stock: product.stock,
            soldStock: product.sold_stok || 0
          }))
          .sort((a, b) => b.soldStock - a.soldStock);

        setDiscountMap(discountMap);
        setProducts(sortedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
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
      await addToCart(productId);
      setSnackbarMessage('Item added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to add to cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem] flex justify-center items-center h-64">
        <p>Loading best sellers...</p>
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

  return (
    <div className="bg-[#F9F5EE] px-1 pb-2 md:px-10 md:pb-10 text-center pt-[1rem] md:pt-[8rem]">
      <h2 className="text-2xl md:text-5xl">BEST SELLER</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 md:gap-6 mt-6">
        {products.map((product) => {
          // 1. Check if product is in discountMap
          const discountItem = discountMap[product.id];
          let displayPrice = product.price;
          let oldPrice = null;
          let discountLabel = "";

          if (discountItem) {
            const discountType = discountItem.discount_type;
            const discountValue = parseFloat(discountItem.discount_value || "0");
            if (discountType === "percent") {
              displayPrice = product.price * (1 - discountValue / 100);
              oldPrice = product.price;
              discountLabel = `${discountValue}% OFF`;
            } else if (discountType === "amount") {
              displayPrice = discountValue;
              oldPrice = product.price;
              // percent = (original - discounted) / original * 100
              const percent = product.price > 0
                ? Math.round(((product.price - displayPrice) / product.price) * 100)
                : 0;
              discountLabel = `${percent}% OFF`;
            }
          } else if (product.discount > 0) {
            // 2. If not in discount API, but discount in product API
            displayPrice = product.price * (1 - product.discount / 100);
            oldPrice = product.price;
            discountLabel = `${product.discount}% OFF`;
          } else {
            // 3. No discount
            displayPrice = product.price;
            oldPrice = null;
            discountLabel = "";
          }

          return (
            <div
              key={product.id}
              className={`p-4 ${product.stock === 0 ? 'opacity-70' : 'cursor-pointer'}`}
              onClick={() => product.stock > 0 && handleProductClick(product.id)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`rounded-lg w-full h-auto object-cover ${product.stock === 0 ? 'grayscale' : ''}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '../../assets/default/banner_home.jpeg';
                  }}
                />

                {/* Stock Status Badge */}
                {product.stock === 0 ? (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    SOLD OUT
                  </div>
                ) : product.stock < 10 ? (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    LOW STOCK
                  </div>
                ) : null}

                {/* Discount Badge */}
                {discountLabel && (
                  <div className="absolute top-2 right-2 bg-[#c3a46f] text-white text-xs font-bold px-2 py-1 rounded">
                    {discountLabel}
                  </div>
                )}

                {/* Only show add to cart button if product is in stock */}
                {product.stock > 0 && (
                  <div className="absolute bottom-2 right-2 bg-[#faf7f0] p-2 rounded-sm shadow">
                    <button
                      className="p-2 rounded-full border-2 border-[#e8d6a8] bg-[#faf7f0]"
                      onClick={(e) => handleAddToCart(product.id, e)}
                    >
                      <Plus size={12} color="#e8d6a8" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-lg font-semibold">{product.name}</h3>
              <span className="text-sm text-[#e8d6a8] px-2 py-1 rounded-md border-3 border-[#e8d6a8]">
                {product.tag}
              </span>
              <div className="flex justify-center items-center mt-2">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <span key={i} className={i < product.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                <span className="ml-2">({product.rating.toFixed(1)})</span>
              </div>
              <p className="text-gray-500 text-lg open-sans-text">{formatIDR(displayPrice)}</p>
              {oldPrice && <p className="text-gray-400 line-through open-sans-text">{formatIDR(oldPrice)}</p>}
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

export default HomePart3;