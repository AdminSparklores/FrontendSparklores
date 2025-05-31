import React, { useState, useEffect } from "react";
import { fetchPageBanner } from "../../utils/api.js";

const BannerHome = () => {
  const [bannerImage, setBannerImage] = useState("");

  // Fetch the banner image for the homepage
  useEffect(() => {
    const getBannerImage = async () => {
      try {
        const imageUrl = await fetchPageBanner("homepage"); // Fetch banner for homepage
        setBannerImage(imageUrl);
      } catch (error) {
        console.error("Error fetching banner image:", error);
        // Optionally set a default image in case of an error
        setBannerImage("../../assets/default/banner_home.jpeg"); // Replace with your actual default image path
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
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>{" "}
          {/* Overlay for better text visibility */}
        </div>

        {/* Text Content - Centered */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
            Jewellery That Tells Your Story
          </h1>
          <p className="text-lg md:text-xl max-w-2xl leading-relaxed">
            Create, customize, and cherish—crafted just for you. SparkLore
            brings your unique style to life, one charm at a time.
          </p>
        </div>
      </div>
    </>
  );
};

export default BannerHome;
