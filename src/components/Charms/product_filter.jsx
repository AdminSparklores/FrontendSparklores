import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Plus, SlidersHorizontal, LayoutGrid, Rows2 } from "lucide-react";
import { cn } from "../../utils/utils.js";
import { fetchAllCharms } from "../../utils/api.js";

const ProductGrid = () => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    price: [],
    material: [],
    discount: false, // New discount filter
  });
  const [charms, setCharms] = useState([]);
  const [filteredCharms, setFilteredCharms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCharms = async () => {
      try {
        const data = await fetchAllCharms();
        // Sort charms to prioritize gold items first
        const sortedData = [...data].sort((a, b) => {
          if (a.label === 'gold' && b.label !== 'gold') return -1;
          if (a.label !== 'gold' && b.label === 'gold') return 1;
          return 0;
        });
        setCharms(sortedData);
        setFilteredCharms(sortedData);
        
        const uniqueCategories = [...new Set(data.map(charm => charm.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCharms();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/products-charm/${productId}`);
  };

  
  const transformCharms = (charmsToTransform) => {
    return charmsToTransform.map(charm => {
      const originalPrice = parseFloat(charm.price);
      const discountPercentage = parseFloat(charm.discount || 0) / 100;
      const discountedPrice = originalPrice - (originalPrice * discountPercentage);
      const hasDiscount = charm.discount > 0;
      
      return {
        id: charm.id,
        name: charm.name,
        type: charm.category.toUpperCase(),
        price: hasDiscount 
          ? `Rp ${discountedPrice.toLocaleString('id-ID')}`
          : `Rp ${originalPrice.toLocaleString('id-ID')}`,
        originalPrice: hasDiscount 
          ? `Rp ${originalPrice.toLocaleString('id-ID')}`
          : null,
        discount: parseFloat(charm.discount || 0),
        rating: Math.round(charm.rating),
        image: charm.image,
        category: charm.category,
        stock: charm.stock,
        material: charm.label,
      };
    });
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (category === "price") {
        newFilters[category] = newFilters[category].includes(value) ? [] : [value];
      } else if (category === "discount") {
        newFilters[category] = !newFilters[category]; // Toggle discount filter
      } else {
        newFilters[category] = newFilters[category].includes(value)
          ? newFilters[category].filter(item => item !== value)
          : [...newFilters[category], value];
      }
      return newFilters;
    });
  };

  const isChecked = (category, value) => {
    if (category === "discount") return filters[category];
    return filters[category].includes(value);
  };

  const parsePrice = (p) => p ? parseInt(p.replace(/[^\d]/g, "")) : Number.MAX_SAFE_INTEGER;

  const applyFilters = () => {
    let filtered = [...charms];

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(charm => filters.category.includes(charm.category));
    }

    // Apply material filter
    if (filters.material.length > 0) {
      filtered = filtered.filter(charm => filters.material.includes(charm.label)); // Assuming 'label' contains material info
    }

    // Apply discount filter
    if (filters.discount) {
      filtered = filtered.filter(charm => charm.discount > 0);
    }

    // Apply price sorting
    if (filters.price.includes("Low to High")) {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.price.includes("High to Low")) {
      filtered.sort((a, b) => b.price - a.price);
    }

    // Maintain gold items priority even after other filters
    filtered.sort((a, b) => {
      if (a.label === 'gold' && b.label !== 'gold') return -1;
      if (a.label !== 'gold' && b.label === 'gold') return 1;
      return 0;
    });

    setFilteredCharms(filtered);
    setCurrentPage(1);
  };

  const handleDone = () => {
    setIsPopupOpen(false);
    applyFilters();
  };

  const resetFilters = () => {
    setFilters({ category: [], price: [],  material: [], discount: false });
    setFilteredCharms(charms);
    setCurrentPage(1);
  };

  const productsPerPage = layout === "grid" ? 12 : 8;
  const transformedCharms = transformCharms(filteredCharms);
  const totalPages = Math.ceil(transformedCharms.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = transformedCharms.slice(startIndex, startIndex + productsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif relative flex justify-center items-center">
        <div className="text-[#403c39]">Loading charms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif relative flex justify-center items-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f3] px-6 py-10 font-serif relative">
      <div className="flex justify-between items-center mb-6 border-b border-[#ede7de] pb-2">
        <div className="flex gap-2 text-[#403c39]">
          <button
            onClick={() => setLayout("rows")}
            className={cn("p-2 rounded", layout === "rows" ? "bg-[#e2dbce]" : "bg-transparent")}
          >
            <Rows2 size={20} />
          </button>
          <button
            onClick={() => setLayout("grid")}
            className={cn("p-2 rounded", layout === "grid" ? "bg-[#e2dbce]" : "bg-transparent")}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
        <p className="text-sm text-[#b1a696] tracking-wide">
          {transformedCharms.length} Products
        </p>
        <button onClick={() => setIsPopupOpen(true)} className="text-[#403c39]">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className={`max-w-6xl mx-auto grid ${
        layout === "grid" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
      } gap-6`}>
        {currentProducts.map((product) => (
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
              />
              
              {/* Discount badge */}
              {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-[#b87777] text-white text-xs font-bold px-2 py-1 rounded">
                  {product.discount}% OFF
                </div>
              )}
              
              {product.stock === 0 ? (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SOLD OUT
                </div>
              ) : product.stock < 10 ? (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  LOW STOCK
                </div>
              ) : null}
              
              {product.stock > 0 && (
                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-b-xs">
                  <button 
                    className="bg-white text-[#c3a46f] border border-[#c3a46f] p-1 rounded-full"
                    onClick={(e) => e.stopPropagation()}
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
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={cn("mx-[1px]", i < product.rating ? "text-yellow-500" : "text-gray-300")}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
              </div>
              <div className="mt-1">
                <p className="text-sm font-medium text-[#403c39]">
                  {product.price}
                </p>
                {product.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {product.originalPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#c3a46f] text-white rounded-l"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-[#403c39]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#c3a46f] text-white rounded-r"
        >
          Next
        </button>
      </div>

      {isPopupOpen && (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[300px] shadow-lg relative">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-serif tracking-wide text-[#403c39]">FILTER</h2>
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

            <div>
                <h3 className="font-semibold mb-1">Material</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["gold", "silver", "rose_gold"].map((material) => (
                    <label key={material} className="flex items-center gap-1 capitalize">
                      <input
                        type="checkbox"
                        checked={isChecked("material", material)}
                        onChange={() => toggleFilter("material", material)}
                        className="accent-[#c3a46f]"
                      />
                      {material.replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>

            <div className="space-y-4 text-sm text-[#403c39] mt-3">
              <div>
                <h3 className="font-semibold mb-1">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-1 capitalize">
                      <input
                        type="checkbox"
                        checked={isChecked("category", category)}
                        onChange={() => toggleFilter("category", category)}
                        className="accent-[#c3a46f]"
                      />
                      {category.replace(/_/g, ' ')}
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

              <div>
                <h3 className="font-semibold mb-1">Discount</h3>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={isChecked("discount", true)}
                    onChange={() => toggleFilter("discount", true)}
                    className="accent-[#c3a46f]"
                  />
                  Show only discounted items
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;