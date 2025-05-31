import React from "react";
import { useNavigate } from "react-router-dom";
import background from "../../assets/default/giftset_bg.jpeg";

const ValentinesPromo = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/monthly-specials");
  };

  return (
    <div className="bg-[#f2ebda]">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-8">
        {/* Left text section */}
        <div className="flex flex-col justify-center items-center p-[3rem]">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#2d2a26] leading-snug text-center">
            Celebrate Love with a <br /> Timeless Gift
          </h2>
          <p className="text-[#4d4a45] mt-4 text-base md:text-lg leading-relaxed text-center">
            Make this Month unforgettable with a personalized jewellery set, crafted to tell your unique love story.
          </p>
          <button
            className="mt-6 px-6 py-3 border-2 border-[#f6e3b8] rounded-md text-[#2d2a26] font-medium hover:bg-[#f6e3b8] transition"
            onClick={handleButtonClick}
          >
            Shop Monthly Special Gift Sets
          </button>
        </div>

        {/* Right image section */}
        <div className="flex justify-center">
          <img
            src={background}
            alt="Monthly Specials Jewellery Set"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ValentinesPromo;