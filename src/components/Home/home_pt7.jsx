import React, { useState, useEffect } from "react";
import { fetchRecentGalleryImages } from "../../utils/api.js"; // Import the fetch function

const JewelryGallery = () => {
  const [images, setImages] = useState([]); // State to hold fetched images
  const [isLoading, setIsLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage error

  // Fetch the most recent 6 images from the API
  useEffect(() => {
    const getImages = async () => {
      try {
        const recentImages = await fetchRecentGalleryImages(); // Fetch recent images
        setImages(recentImages);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getImages();
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading images...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-[#f8f4ed] py-14 px-6">
      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h2 className="text-gray-900 text-xl md:text-2xl font-semibold tracking-wide">
          JEWELRY THAT SPEAKS FOR YOU
        </h2>
        <p className="text-gray-500 text-md md:text-lg mt-2">
          Tag <span className="font-medium">@sparklore.official</span> to be featured
        </p>
      </div>

      {/* 3x2 Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="rounded-lg overflow-hidden">
            <img
              src={image.image}
              alt={image.alt_text}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default JewelryGallery;
