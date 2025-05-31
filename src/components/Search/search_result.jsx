import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { BASE_URL, fetchAllCharms } from "../../utils/api.js";

// Helper: format IDR currency
const formatIDR = (value) =>
  "Rp " +
  Number(value)
    .toLocaleString("id-ID", { maximumFractionDigits: 2 })
    .replace(/,/g, ".");

export default function SearchProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discount campaign map: productId (string) -> discount item
  const [discountMap, setDiscountMap] = useState({});

  // Fetch all products, charms, and gift sets from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products, gift sets, charms, and discount campaigns
        const [
          productsResponse,
          giftSetsResponse,
          charmsData,
          discountRes
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/products/`),
          fetch(`${BASE_URL}/api/gift-sets/`),
          fetchAllCharms(),
          fetch(`${BASE_URL}/api/discount-campaigns/`)
        ]);
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        if (!giftSetsResponse.ok) {
          throw new Error("Failed to fetch gift sets");
        }
        // Prepare discount map
        let discountCampaigns = [];
        if (discountRes.ok) {
          discountCampaigns = await discountRes.json();
        }
        const discountMap = {};
        discountCampaigns.forEach(campaign => {
          if (campaign.items && campaign.items.length > 0) {
            campaign.items.forEach(item => {
              if (item.product && item.product.id !== undefined && item.product.id !== null) {
                discountMap[`${item.product.id}`] = item;
              }
            });
          }
        });
        setDiscountMap(discountMap);

        // Transform products data
        const productsData = await productsResponse.json();
        const transformedProducts = productsData.map(product => {
          // Discount campaign logic
          let price = parseFloat(product.price);
          let originalPrice = null;
          let discount = 0;
          let discountLabel = "";
          const discountItem = discountMap[`${product.id}`];
          if (discountItem) {
            const discountType = discountItem.discount_type;
            const discountValue = parseFloat(discountItem.discount_value || "0");
            if (discountType === "percent") {
              originalPrice = price;
              price = price * (1 - discountValue / 100);
              discount = discountValue;
              discountLabel = `${discountValue}% OFF`;
            } else if (discountType === "amount") {
              originalPrice = price;
              price = discountValue;
              discount = originalPrice > 0
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : 0;
              discountLabel = `${discount}% OFF`;
            }
          } else if (parseFloat(product.discount || 0) > 0) {
            originalPrice = price;
            discount = parseFloat(product.discount || 0);
            price = price * (1 - discount / 100);
            discountLabel = `${discount}% OFF`;
          }
          return {
            id: product.id,
            name: product.name,
            type: product.label ? product.label.toUpperCase() : "-", // fallback
            price: `Rp ${price.toLocaleString('id-ID')}`,
            originalPrice: originalPrice ? `Rp ${originalPrice.toLocaleString('id-ID')}` : null,
            discount: discount,
            discountLabel,
            rating: parseFloat(product.rating) || 0,
            image: (product.images && product.images.length > 0)
              ? product.images[0].image_url
              : "/assets/default/banner_home.jpeg",
            stock: product.stock,
            soldStock: product.sold_stok || 0,
            category: product.category,
            createdAt: product.created_at,
            itemType: 'product'
          };
        });

        // Fetch and transform gift sets
        const giftSetsData = await giftSetsResponse.json();
        const transformedGiftSets = giftSetsData.map((set) => ({
          id: set.id,
          name: set.name,
          type: set.label ? set.label.toUpperCase() : "-",
          price: `Rp ${parseFloat(set.price).toLocaleString('id-ID')}`,
          originalPrice: null,
          discount: 0,
          discountLabel: "",
          rating: 0,
          image: set.image_url || set.image || "/assets/default/banner_home.jpeg",
          stock: 99, // Assume always available
          soldStock: 0,
          category: "gift_set",
          createdAt: set.created_at,
          itemType: 'gift-set'
        }));

        // Transform charms data
        const transformedCharms = charmsData.map(charm => {
          const originalPrice = parseFloat(charm.price);
          const discountPercentage = parseFloat(charm.discount || 0) / 100;
          const discountedPrice = originalPrice - (originalPrice * discountPercentage);
          const hasDiscount = parseFloat(charm.discount) > 0;
          return {
            id: charm.id,
            name: charm.name,
            type: charm.category ? charm.category.toUpperCase() : "-",
            price: hasDiscount 
              ? `Rp ${discountedPrice.toLocaleString('id-ID')}`
              : `Rp ${originalPrice.toLocaleString('id-ID')}`,
            originalPrice: hasDiscount 
              ? `Rp ${originalPrice.toLocaleString('id-ID')}`
              : null,
            discount: parseFloat(charm.discount || 0),
            discountLabel: hasDiscount ? `${charm.discount}% OFF` : "",
            rating: parseFloat(charm.rating) || 0,
            image: charm.image || "/assets/default/banner_home.jpeg",
            category: charm.category,
            stock: charm.stock,
            soldStock: charm.sold_stok || 0,
            createdAt: charm.created_at,
            itemType: 'charm'
          };
        });

        // Merge all items for searching/sorting/filtering
        setAllItems([...transformedProducts, ...transformedGiftSets, ...transformedCharms]);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search when query changes or data is loaded
  useEffect(() => {
    if (allItems.length === 0) return;

    // Parse search query from URL
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    setSearchQuery(query);

    // Flat search across name, type, category
    if (query) {
      const filtered = allItems.filter(item => 
        (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(query.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(allItems);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [location.search, allItems]);

  const handleProductClick = (itemId, itemType) => {
    if (itemType === "product") {
      navigate(`/products/${itemId}`);
    } else if (itemType === "charm") {
      navigate(`/products-charm/${itemId}`);
    } else if (itemType === "gift-set") {
      navigate(`/products-sets/${itemId}`);
    }
  };

  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredItems.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + productsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p>Loading items...</p>
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
      <div className="text-center px-4 text-[#302E2A] mb-8">
        <h1 className="text-xl md:text-4xl mb-4 tracking-wider">
          Search Results
        </h1>
        <p className="text-md md:text-2xl leading-relaxed">
          {filteredItems.length} results for "{searchQuery}"
        </p>
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div
              key={`${item.itemType}-${item.id}`}
              className={`p-2 rounded-lg hover:shadow-md transition duration-200 relative ${item.stock === 0 ? 'opacity-70' : 'cursor-pointer'}`}
              onClick={() => item.stock > 0 && handleProductClick(item.id, item.itemType)}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`rounded-md w-full h-auto object-cover ${item.stock === 0 ? 'grayscale' : ''}`}
                  onError={e => { e.target.onerror = null; e.target.src = "/assets/default/banner_home.jpeg"; }}
                />
                {/* Discount badge (products/campaign or charms) */}
                {item.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-[#b87777] text-white text-xs font-bold px-2 py-1 rounded">
                    {item.discountLabel || `${item.discount}% OFF`}
                  </div>
                )}
                {/* Stock Status Badge */}
                {item.stock === 0 ? (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    SOLD OUT
                  </div>
                ) : item.stock < 10 && item.itemType !== "gift-set" ? (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    LOW STOCK
                  </div>
                ) : null}
                {/* Best Seller Badge (for products) */}
                {item.itemType === "product" && item.soldStock > 0 && (
                  <div className="absolute top-2 right-2 bg-[#c3a46f] text-white text-xs font-bold px-2 py-1 rounded">
                    BEST SELLER
                  </div>
                )}
                {/* Only show add to cart button if item is in stock */}
                {item.stock > 0 && (
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
                        className={i < Math.round(item.rating) ? "text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  <span className="text-xs text-gray-500 ml-1">
                    ({item.rating && item.rating.toFixed ? item.rating.toFixed(1) : "0.0"})
                  </span>
                </div>
                <div className="mt-1">
                  <p className="text-sm font-medium text-[#403c39]">
                    {item.price}
                  </p>
                  {item.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {item.originalPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-lg text-gray-600">
              {searchQuery ? 
                "No items found matching your search." : 
                "No items available."
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination - Only show if there are results */}
      {filteredItems.length > 0 && (
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
      )}
    </div>
  );
}