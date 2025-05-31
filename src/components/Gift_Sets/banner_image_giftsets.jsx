import React, { useState, useEffect } from "react";
import { fetchPageBanner } from "../../utils/api";
import banner from "../../assets/default/navbar_giftsets_bg.jpg";


const BannerHome = () => {
  const [bannerImage, setBannerImage] = useState(""); // State for banner image

  // Fetch the banner image for the giftsets page
  useEffect(() => {
    const getBannerImage = async () => {
      try {
        const imageUrl = await fetchPageBanner("gift_sets"); // Fetch banner for giftsets
        setBannerImage(imageUrl);
      } catch (error) {
        console.error("Error fetching banner image:", error);
        // Optionally set a default image in case of an error
        setBannerImage(banner); // Replace with your actual default image path
      }
    };

    getBannerImage();
  }, []);

  return (
    <>
      {/* Hero Section with Text Overlay */}
      <div className="relative w-full h-screen max-h-[20rem] md:max-h-[37rem]">
        {/* Background Image - Using the fetched image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImage})` }} // Use fetched banner image
        >
          <div className="absolute inset-0 bg-black/40"></div>{" "}
          {/* Overlay for better text visibility */}
        </div>

        {/* Text Content - Centered */}
        <div className="relative z-10 h-full flex flex-col items-start justify-center text-center px-4 text-white ps-[7rem]">
          <h1 className="text-2xl md:text-5xl mb-4 tracking-wider">
            Meaningful Gifts, Beautifully Wrapped
          </h1>
          <p className="text-lg md:text-3xl max-w-2xl leading-relaxed">
            Celebrate special moments with curated jewelry sets—thoughtful, timeless, and made to be cherished.
          </p>

          {/* <button className="mt-8 px-8 py-3 bg-[#b87777] hover:bg-[#9a5f5f] text-white font-medium rounded-full transition-colors duration-300">
            Start Creating
          </button> */}
        </div>
      </div>
    </>
  );
};

export default BannerHome;
