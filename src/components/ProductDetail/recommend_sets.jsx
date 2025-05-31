import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../../utils/api.js";
import { useNavigate } from "react-router-dom";

// Utility: Rupiah formatter
const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.round(amount));

const API_URL = `${BASE_URL}/api/gift-sets/`; // Use gift-sets API

const RecommendSets = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const recommendRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const sets = await res.json();

        // Optionally filter: stock > 0 if such property exists, else just show all and sort by created_at/newest
        // If you want to show only in-stock sets, uncomment next line and make sure property exists
        // const filtered = sets.filter(set => Number(set.stock) > 0);

        // Sort by created_at, newest first (if you want best sellers, you can sort differently)
        const sorted = sets
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setRecommendations(sorted);
      } catch (e) {
        setRecommendations([]);
      }
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  const scroll = (direction) => {
    const scrollByAmount = 260;
    if (recommendRef.current) {
      recommendRef.current.scrollBy({
        left: direction === "left" ? -scrollByAmount : scrollByAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[#fdf9f0] ">
      <div className="max-w-7xl mx-auto pt-[5rem] pb-[5rem]">
        <h2 className="text-2xl font-serif font-semibold mb-[2rem] px-[1rem]">
          YOU MIGHT ALSO LIKE...
        </h2>
        <div className="relative mb-10">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2"
            aria-label="Scroll left"
          >
            <ChevronLeft size={28} />
          </button>
          <div
            ref={recommendRef}
            className="flex gap-4 overflow-x-auto ml-12 mr-12 pb-2 no-scrollbar"
          >
            {loading ? (
              <div className="text-center py-10 w-full">Loading...</div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-10 w-full">No recommendations.</div>
            ) : (
              recommendations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/products-sets/${item.id}`)} // Navigate to set detail page with set id
                  className="relative group min-w-[15rem] cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    className="w-[15rem] h-[15rem] object-cover shadow-md rounded"
                  />
                  <div className="absolute inset-0 bg-[#f5f5dc] opacity-0 group-hover:opacity-80 flex flex-col justify-center items-center transition-opacity">
                    <span className="text-lg font-bold text-center px-2">
                      {item.name}
                    </span>
                    <span className="text-sm">
                      {formatIDR(item.price)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2"
            aria-label="Scroll right"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendSets;