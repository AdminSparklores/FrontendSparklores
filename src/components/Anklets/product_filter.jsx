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
import { BASE_URL } from "../../utils/api.js";

export default function ProductGrid() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    material: [],
    product: [],
    price: [],
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountMap, setDiscountMap] = useState({});

  // Helper function to get the first image URL from a product
  const getFirstProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return '../../assets/default/banner_home.jpeg';
  };

  // Helper: format IDR currency
  const formatIDR = (value) =>
    "Rp " +
    Number(value)
      .toLocaleString("id-ID", { maximumFractionDigits: 2 })
      .replace(/,/g, ".");

  // Fetch products and discounts from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productRes, discountRes] = await Promise.all([
          fetch(`${BASE_URL}/api/products/`),
          fetch(`${BASE_URL}/api/discount-campaigns/`)
        ]);
        if (!productRes.ok) throw new Error("Failed to fetch products");
        const data = await productRes.json();

        // Discount map: productId -> discountItem (string key for reliability)
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

        // Filter only anklet products and transform data
        let ankletProducts = data
          .filter(product => product.category && product.category.toLowerCase() === "anklet")
          .map(product => ({
            ...product,
            id: product.id,
            name: product.name,
            type: product.label ? product.label.toUpperCase() : "",
            price: parseFloat(product.price),
            discount: parseFloat(product.discount || 0),
            rating: parseFloat(product.rating) || 0,
            image: getFirstProductImage(product),
            stock: product.stock,
            soldStock: product.sold_stok || 0,
            createdAt: product.created_at || new Date().toISOString()
          }));

        // Identify best sellers (top 10 by sold stock)
        const bySoldStock = [...ankletProducts].sort((a, b) => b.soldStock - a.soldStock);
        const bestSellerIds = bySoldStock.slice(0, 10).map(p => p.id);

        // Identify new arrivals (top 10 most recent)
        const byCreationDate = [...ankletProducts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt));
        const newArrivalIds = byCreationDate.slice(0, 10).map(p => p.id);

        // Identify oldest products (top 10 oldest)
        const byCreationDateOldest = [...ankletProducts].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt));
        const oldestIds = byCreationDateOldest.slice(0, 10).map(p => p.id);

        // Add category information to products
        ankletProducts = ankletProducts.map(product => ({
          ...product,
          isBestSeller: bestSellerIds.includes(product.id),
          isNewArrival: newArrivalIds.includes(product.id),
          isOldest: oldestIds.includes(product.id)
        }));

        setProducts(ankletProducts);
        setFilteredProducts(
          ankletProducts.map(product => ({
            ...product,
            ...getDiscounted(product, discountMap)
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Discount price calculation logic per product
  const getDiscounted = (product, discountMapArg) => {
    // Defensive: product.id could be string or number, discountMap keys as string
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

  // Filtering and sorting logic
  const handleDone = () => {
    setIsPopupOpen(false);

    // Apply discount logic to all products for accurate filtering/sorting
    let filtered = products.map(product => ({
      ...product,
      ...getDiscounted(product)
    }));

    if (filters.material.length > 0) {
      filtered = filtered.filter((product) =>
        filters.material.includes(product.type)
      );
    }

    if (filters.product.length > 0) {
      filtered = filtered.filter((product) => {
        if (filters.product.includes("Best Seller") && product.isBestSeller) return true;
        if (filters.product.includes("New Arrival") && product.isNewArrival) return true;
        if (filters.product.includes("Newest")) return product.isNewArrival;
        if (filters.product.includes("Oldest") && product.isOldest) return true;
        return false;
      });
    }

    // Use displayPrice for sorting!
    if (filters.price.includes("Low to High")) {
      filtered.sort((a, b) => a.displayPrice - b.displayPrice);
    } else if (filters.price.includes("High to Low")) {
      filtered.sort((a, b) => b.displayPrice - a.displayPrice);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      material: [],
      product: [],
      price: [],
    });
    setFilteredProducts(products.map(product => ({
      ...product,
      ...getDiscounted(product)
    })));
    setCurrentPage(1);
  };

  useEffect(() => {
    // After products/discountMap changes, always update filteredProducts with discount logic
    setFilteredProducts(
      products.map(product => ({
        ...product,
        ...getDiscounted(product)
      }))
    );
    // eslint-disable-next-line
  }, [products, discountMap]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const productsPerPage = layout === "grid" ? 12 : 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const isChecked = (category, value) => {
    return filters[category].includes(value);
  };

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
          {filteredProducts.length} Products
        </p>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="text-[#403c39]"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
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
            {currentProducts.map((product) => {
              // Always get discounted info for display
              const { displayPrice, oldPrice, discountLabel } = getDiscounted(product);
              const showBestSeller = product.isBestSeller;
              const showDiscount = !!discountLabel;
              return (
                <div
                  key={product.id}
                  className={`p-2 rounded-lg hover:shadow-md transition duration-200 relative ${
                    product.stock === 0 ? 'opacity-70' : 'cursor-pointer'
                  }`}
                  onClick={() => product.stock > 0 && handleProductClick(product.id)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`rounded-md w-full h-auto object-cover ${
                        product.stock === 0 ? 'grayscale' : ''
                      }`}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '../../assets/default/banner_home.jpeg'; // Fallback image
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
                    
                    {/* Both badges, separated */}
                    {showBestSeller && showDiscount ? (
                      <>
                        <div className="absolute top-2 right-2 bg-[#c3a46f] text-white text-xs font-bold px-2 py-1 rounded z-20 shadow" style={{right: '8px'}}>
                          BEST SELLER
                        </div>
                        <div className="absolute top-10 right-2 bg-[#e46464] text-white text-xs font-bold px-2 py-1 rounded z-20 shadow" style={{right: '8px'}}>
                          {discountLabel}
                        </div>
                      </>
                    ) : showBestSeller ? (
                      <div className="absolute top-2 right-2 bg-[#c3a46f] text-white text-xs font-bold px-2 py-1 rounded z-20 shadow" style={{right: '8px'}}>
                        BEST SELLER
                      </div>
                    ) : showDiscount ? (
                      <div className="absolute top-2 right-2 bg-[#e46464] text-white text-xs font-bold px-2 py-1 rounded z-20 shadow" style={{right: '8px'}}>
                        {discountLabel}
                      </div>
                    ) : null}

                    {/* Only show add to cart button if product is in stock */}
                    {product.stock > 0 && (
                      <div className="absolute bottom-2 right-2 bg-white p-1 rounded-b-xs">
                        <button 
                          className="bg-white text-[#c3a46f] border border-[#c3a46f] p-1 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic here
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-semibold uppercase text-[#403c39] leading-tight">
                      {product.name}
                    </p>
                    <p className="text-[10px] mt-1">
                      <span className="px-2 py-[2px] text-[#c3a46f] bg-[#f1ede5] border border-[#c3a46f] rounded-sm">
                        {product.type}
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
                              i < product.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.rating.toFixed(1)})
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
              )
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