import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Rows2 } from "lucide-react";
import { cn } from "../../utils/utils.js";
import { BASE_URL } from "../../utils/api.js";

export default function ProductGrid() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [giftSets, setGiftSets] = useState([]);

  // Fetch gift sets from API and filter by label "forHim"
  useEffect(() => {
    const fetchGiftSets = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/gift-sets/`);
        if (!response.ok) {
          throw new Error("Failed to fetch gift sets");
        }
        const data = await response.json();

        // Only keep those with "label": "forHim" (case-insensitive)
        const filtered = data
          .filter((item) => item.label && item.label.toLowerCase() === "forhim")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setGiftSets(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGiftSets();
  }, []);

  const productsPerPage = layout === "grid" ? 12 : 8;
  const totalPages = Math.ceil(giftSets.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = giftSets.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handleCardClick = (productId) => {
    navigate(`/products-sets/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-2 bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p>Loading gift sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-min bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  // If there are no giftSets with label: "forHim", show Coming Soon
  if (giftSets.length === 0) {
    return (
      <div className="min-h-min bg-[#fdf8f3] px-6 py-10 font-serif flex items-center justify-center">
        <p className="text-[#403c39] text-2xl font-bold">Coming Soon</p>
      </div>
    );
  }

  return (
    <div className="min-h-min bg-[#fdf8f3] px-6 py-10 font-serif relative">
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
          {giftSets.length} Gift Sets For Him
        </p>
      </div>

      {/* Products Grid (your card UI) */}
      <>
        <div
          className={`max-w-6xl mx-auto grid ${
            layout === "grid"
              ? "grid-cols-2 md:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2"
          } gap-6`}
        >
          {currentProducts.map((giftSet) => (
            <div
              key={giftSet.id}
              className="p-2 rounded-lg hover:shadow-md transition duration-200 relative cursor-pointer"
              onClick={() => handleCardClick(giftSet.id)}
            >
              <div className="relative w-full">
                <img
                  src={giftSet.image_url || giftSet.image}
                  alt={giftSet.name}
                  className="rounded-md w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '../../assets/default/banner_home.jpeg';
                  }}
                />
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-semibold uppercase text-[#403c39] leading-tight">
                  {giftSet.name}
                </p>
                <p className="text-[10px] mt-1">
                  <span className="px-2 py-[2px] text-[#c3a46f] bg-[#f1ede5] border border-[#c3a46f] rounded-sm">
                    For Him Gift Set
                  </span>
                </p>
                <div className="mt-1">
                  <p className="text-sm font-medium text-[#403c39]">
                    {giftSet.price
                      ? "Rp " +
                        Number(giftSet.price)
                          .toLocaleString("id-ID", { maximumFractionDigits: 2 })
                          .replace(/,/g, ".")
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}