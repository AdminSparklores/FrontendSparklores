import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  Rows2,
} from "lucide-react";
import { cn } from "../../utils/utils.js";
import { BASE_URL, isLoggedIn, addToCart } from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';

// Helper: format IDR currency
const formatIDR = (value) =>
  "Rp " +
  Number(value)
    .toLocaleString("id-ID", { maximumFractionDigits: 2 })
    .replace(/,/g, ".");

// Helper: get date X months ago
function getOneMonthAgoISO() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return now.toISOString();
}

export default function ProductNewArrival() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    material: [],
    product: [],
    price: [],
  });
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountMap, setDiscountMap] = useState({});
  
  // Snackbar state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  // Helper: get first product image
  const getFirstProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return '../../assets/default/banner_home.jpeg';
  };

  // Discount price calculation logic per product
  const getDiscounted = (product, discountMapArg) => {
    const discountItem = (discountMapArg || discountMap)[`${product.id}`];
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
        const percent = oldPrice > 0
          ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100)
          : 0;
        discountLabel = `${percent}% OFF`;
      }
    } else if (product.discount > 0) {
      displayPrice = product.price * (1 - product.discount / 100);
      oldPrice = product.price;
      discountLabel = `${product.discount}% OFF`;
    }
    return { displayPrice, oldPrice, discountLabel };
  };

  // Handle add to cart based on product type
  const handleAddToCart = async (item, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn()) {
      // Handle login prompt if needed
      return;
    }

    try {
      let cartData;
      if (item.isCharm) {
        // Charms-only product
        cartData = { charms: [item.id], quantity: 1 };
        await addToCart(null, cartData);
      } else if (item.isGiftSet) {
        // Gift set product
        cartData = { gift_set: item.id, quantity: 1 };
        await addToCart(null, cartData);
      } else {
        // Regular product
        cartData = { quantity: 1 };
        await addToCart(item.id, cartData);
      }

      setSnackbarMessage('Item added to cart!');
      setSnackbarType('success');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update cart');
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  // Snackbar auto-hide
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

  // Fetch products, charms, gift sets and discounts from API
  useEffect(() => {
    const fetchNewArrivals = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all products, charms, gift sets & discounts
        const [productRes, charmRes, giftSetRes, discountRes] = await Promise.all([
          fetch(`${BASE_URL}/api/products/`),
          fetch(`${BASE_URL}/api/charms/`),
          fetch(`${BASE_URL}/api/gift-sets/`),
          fetch(`${BASE_URL}/api/discount-campaigns/`)
        ]);
        
        if (!productRes.ok) throw new Error("Failed to fetch products");
        const productData = await productRes.json();
        
        if (!charmRes.ok) throw new Error("Failed to fetch charms");
        const charmData = await charmRes.json();
        
        if (!giftSetRes.ok) throw new Error("Failed to fetch gift sets");
        const giftSetData = await giftSetRes.json();

        let discountData = [];
        if (discountRes.ok) {
          discountData = await discountRes.json();
        }
        const discountMap = {};
        discountData.forEach(campaign => {
          if (campaign.items && campaign.items.length > 0) {
            campaign.items.forEach(item => {
              if (item.product && item.product.id !== undefined && item.product.id !== null) {
                discountMap[`${item.product.id}`] = item;
              }
            });
          }
        });
        setDiscountMap(discountMap);

        // 2. Calculate date range: from today to 1 month ago (ISO)
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        // 3. Transform product data, filter by 1 month, add badges/discount
        const transformedProducts = productData
          .filter((p) => {
            const created = new Date(p.created_at || new Date());
            return created >= oneMonthAgo && created <= today;
          })
          .map(product => ({
            id: product.id,
            name: product.name,
            type: product.label ? product.label.toUpperCase() : "",
            price: parseFloat(product.price),
            discount: parseFloat(product.discount || 0),
            rating: parseFloat(product.rating) || 0,
            image: getFirstProductImage(product),
            stock: product.stock || product.stok || product.quantity || 0,
            soldStock: product.sold_stok || 0,
            createdAt: product.created_at || new Date().toISOString(),
            category: product.category,
            isCharm: false,
            isGiftSet: false,
            ...getDiscounted(product, discountMap)
          }));

        // 4. Transform charm data, filter by 1 month, add badges/discount
        const transformedCharms = charmData
          .filter((c) => {
            const created = new Date(c.created_at || new Date());
            return created >= oneMonthAgo && created <= today;
          })
          .map(charm => {
            const originalPrice = parseFloat(charm.price);
            const discountPercentage = parseFloat(charm.discount || 0) / 100;
            const discountedPrice = originalPrice - (originalPrice * discountPercentage);
            const hasDiscount = parseFloat(charm.discount || 0) > 0;
            return {
              id: charm.id,
              name: charm.name,
              type: charm.category ? charm.category.toUpperCase() : "",
              price: originalPrice,
              discount: parseFloat(charm.discount || 0),
              rating: Math.round(parseFloat(charm.rating || 0)),
              image: charm.image,
              stock: charm.stock || charm.stok || charm.quantity || 0,
              soldStock: charm.sold_stok || 0,
              createdAt: charm.created_at || new Date().toISOString(),
              category: charm.category,
              isCharm: true,
              isGiftSet: false,
              displayPrice: hasDiscount ? discountedPrice : originalPrice,
              oldPrice: hasDiscount ? originalPrice : null,
              discountLabel: hasDiscount ? `${parseFloat(charm.discount)}% OFF` : ""
            };
          });

        // 5. Transform gift set data, filter by 1 month
        const transformedGiftSets = giftSetData
          .filter((g) => {
            const created = new Date(g.created_at || new Date());
            return created >= oneMonthAgo && created <= today;
          })
          .map(giftSet => ({
            id: giftSet.id,
            name: giftSet.name,
            type: giftSet.label ? giftSet.label.toUpperCase() : "",
            price: parseFloat(giftSet.price),
            discount: parseFloat(giftSet.discount || 0),
            rating: Math.round(parseFloat(giftSet.rating || 0)),
            image: giftSet.image_url || giftSet.image,
            stock: giftSet.stock || giftSet.stok || giftSet.quantity || 0,
            soldStock: giftSet.sold_stok || 0,
            createdAt: giftSet.created_at || new Date().toISOString(),
            category: giftSet.category,
            isCharm: false,
            isGiftSet: true,
            ...getDiscounted(giftSet, discountMap)
          }));

        // 6. Combine and sort by newest
        const allArrivals = [...transformedProducts, ...transformedCharms, ...transformedGiftSets].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setItems(allArrivals);
        setFilteredItems(allArrivals);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Re-apply discount logic if products/discountMap changes
  useEffect(() => {
    setFilteredItems(
      items.map(item => ({
        ...item,
        ...(item.isCharm || item.isGiftSet
          ? {} // handled at mapping
          : getDiscounted(item))
      }))
    );
    // eslint-disable-next-line
  }, [items, discountMap]);

  // Handle click: products vs charm vs gift set
  const handleProductClick = (item) => {
    if (item.isCharm) {
      navigate(`/products-charm/${item.id}`);
    } else if (item.isGiftSet) {
      navigate(`/products-sets/${item.id}`);
    } else {
      navigate(`/products/${item.id}`);
    }
  };

  // Rest of your existing code remains the same...
  // (Filtering, pagination, and rendering logic)

  const productsPerPage = layout === "grid" ? 12 : 8;
  const totalPages = Math.ceil(filteredItems.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredItems.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (category === "price") {
        if (newFilters[category].includes(value)) {
          newFilters[category] = [];
        } else {
          newFilters[category] = [value];
        }
      } else {
        if (newFilters[category].includes(value)) {
          newFilters[category] = newFilters[category].filter(
            (item) => item !== value
          );
        } else {
          newFilters[category] = [...newFilters[category], value];
        }
      }
      return newFilters;
    });
  };

  const isChecked = (category, value) => {
    return filters[category].includes(value);
  };

  const handleDone = () => {
    setIsPopupOpen(false);

    let filtered = items.map(item => ({
      ...item,
      ...(item.isCharm || item.isGiftSet ? {} : getDiscounted(item))
    }));

    if (filters.material.length > 0) {
      filtered = filtered.filter((item) =>
        filters.material.includes(item.type)
      );
    }

    if (filters.product.length > 0) {
      filtered = filtered.filter((item) => {
        if (filters.product.includes("Best Seller") && item.isBestSeller) return true;
        if (filters.product.includes("New Arrival") && item.isNewArrival) return true;
        if (filters.product.includes("Newest")) return item.isNewArrival;
        if (filters.product.includes("Oldest") && item.isOldest) return true;
        return false;
      });
    }

    if (filters.price.includes("Low to High")) {
      filtered.sort((a, b) => (a.displayPrice || a.price) - (b.displayPrice || b.price));
    } else if (filters.price.includes("High to Low")) {
      filtered.sort((a, b) => (b.displayPrice || b.price) - (a.displayPrice || a.price));
    }
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      material: [],
      product: [],
      price: [],
    });
    setFilteredItems(items);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-[#ede7de] pb-2">
        <div className="flex gap-2 text-[#403c39]">
          <button
            onClick={() => setLayout("rows")}
            className={cn(
              "p-2 rounded",
              layout === "rows" ? "bg-[#e2dbce]" : "bg-transparent"
            )}
          >
            <Rows2 size={20} />
          </button>

          <button
            onClick={() => setLayout("grid")}
            className={cn(
              "p-2 rounded",
              layout === "grid" ? "bg-[#e2dbce]" : "bg-transparent"
            )}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
        <p className="text-sm text-[#b1a696] tracking-wide">
          {filteredItems.length} Products
        </p>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="text-[#403c39]"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Products Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-[#403c39] text-lg">Cannot Find The Product</p>
        </div>
      ) : (
        <>
          <div
            className={`max-w-6xl mx-auto grid ${
              layout === "grid" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
            } gap-6`}
          >
            {currentProducts.map((item) => {
              const displayPrice = typeof item.displayPrice !== "undefined" ? item.displayPrice : item.price;
              const oldPrice = item.oldPrice;
              const discountLabel = item.discountLabel;
              return (
                <div
                  key={item.isCharm ? `charm-${item.id}` : item.isGiftSet ? `giftset-${item.id}` : `product-${item.id}`}
                  className={`p-2 rounded-lg hover:shadow-md transition duration-200 relative ${
                    item.stock === 0 ? 'opacity-70' : 'cursor-pointer'
                  }`}
                  onClick={() => item.stock > 0 && handleProductClick(item)}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`rounded-md w-full h-auto object-cover ${
                        item.stock === 0 ? 'grayscale' : ''
                      }`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '../../assets/default/banner_home.jpeg';
                      }}
                    />

                    {/* Stock Status Badge */}
                    {item.stock <= 0 ? (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SOLD OUT
                      </div>
                    ) : item.stock < 10 ? (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        LOW STOCK: {item.stock} LEFT
                      </div>
                    ) : null}

                    {/* Discount badge */}
                    {discountLabel && (
                      <div className="absolute top-2 right-2 bg-[#e46464] text-white text-xs font-bold px-2 py-1 rounded z-20 shadow" style={{right: '8px'}}>
                        {discountLabel}
                      </div>
                    )}

                    {/* Only show add to cart button if product is in stock */}
                    {item.stock > 0 && (
                      <div className="absolute bottom-2 right-2 bg-white p-1 rounded-b-xs">
                        <button 
                          className="bg-white text-[#c3a46f] border border-[#c3a46f] p-1 rounded-full"
                          onClick={(e) => handleAddToCart(item, e)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-semibold uppercase text-[#403c39] leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] mt-1">
                      <span className="px-2 py-[2px] text-[#c3a46f] bg-[#f1ede5] border border-[#c3a46f] rounded-sm">
                        {item.type}
                      </span>
                    </p>
                    <div className="flex justify-center mt-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={cn(
                              "mx-[1px]",
                              i < item.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({item.rating && item.rating.toFixed ? item.rating.toFixed(1) : item.rating})
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm font-medium text-[#403c39]">
                        {formatIDR(displayPrice)}
                      </p>
                      {oldPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatIDR(oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#c3a46f] text-white rounded-l"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[#403c39]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#c3a46f] text-white rounded-r"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />

      {/* Filter Popup */}
      {isPopupOpen && (
        <>
          <div 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
            className="fixed inset-0 z-40"
            onClick={() => setIsPopupOpen(false)}
          />
          <div
            className="fixed z-50 bg-white rounded-xl p-6 w-[300px] shadow-lg border border-[#ede7de]"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-serif tracking-wide text-[#403c39]">
                FILTER
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="text-sm px-3 py-1 rounded border text-[#403c39] border-[#e2dbce] hover:bg-[#f1ede5]"
                >
                  Reset
                </button>
                <button
                  onClick={handleDone}
                  className="text-sm px-3 py-1 rounded border text-[#403c39] border-[#e2dbce] hover:bg-[#f1ede5]"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#403c39]">
              <div>
                <h3 className="font-semibold mb-1">Material</h3>
                <div className="flex gap-4">
                  {["GOLD", "SILVER"].map((val) => (
                    <label key={val} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={isChecked("material", val)}
                        onChange={() => toggleFilter("material", val)}
                        className="accent-[#c3a46f]"
                      />
                      {val.charAt(0) + val.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Product</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Best Seller", "New Arrival", "Newest", "Oldest"].map((val) => (
                    <label key={val} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={isChecked("product", val)}
                        onChange={() => toggleFilter("product", val)}
                        className="accent-[#c3a46f]"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Price</h3>
                <div className="flex gap-4">
                  {["Low to High", "High to Low"].map((val) => (
                    <label key={val} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="price"
                        checked={isChecked("price", val)}
                        onChange={() => toggleFilter("price", val)}
                        className="accent-[#c3a46f]"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}