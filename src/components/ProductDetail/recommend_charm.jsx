import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../../utils/api.js";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Utility: Rupiah formatter
const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.round(amount));

const API_URL = `${BASE_URL}/api/charms/`; // Update to charm API

const RecommendCharm = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const recommendRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const charms = await res.json();

        // Filter: stock > 0, sort by sold_stok descending
        const sorted = charms
          .filter((charm) => Number(charm.stock) > 0)
          .sort((a, b) => Number(b.sold_stok) - Number(a.sold_stok));

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
                  onClick={() => navigate(`/products-charm/${item.id}`)} // Navigate to charm detail page
                  className="relative group min-w-[15rem] cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={item.image}
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

export default RecommendCharm;
