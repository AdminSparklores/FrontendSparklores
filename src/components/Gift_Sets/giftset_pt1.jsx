import React from "react";
import { Link, NavLink } from "react-router-dom";
import product1 from "../../assets/default/homeproduct1.png";
import product2 from "../../assets/default/homeproduct2.png";
import product3 from "../../assets/default/homeproduct3.png";

const GiftSetPart1 = () => {
  const productData = [
    {
      id: 1,
      image: product1,
      alt: "New Arrival",
      title: "FOR HER",
      hoverText: "Explore",
      route: "/for-her"
    },
    {
      id: 2,
      image: product2,
      alt: "Valentine Special",
      title: "FOR HIM",
      hoverText: "Explore",
      route: "/for-him"
    },
    {
      id: 3,
      image: product3,
      alt: "Jewel Sets",
      title: "FOR US",
      hoverText: "Explore",
      route: "/for-us"
    }
  ];

  return (
    <div className="bg-[#F9F5EE] p-10 pb-[7rem]">
      <div className="relative text-center mb-[1rem] md:mb-[3rem]">
        <div className="absolute -top-20 md:-top-28 left-1/5 md:left-1/5 -translate-x-1/2 bg-[#E6D3A3] px-5 py-3 md:px-10 md:py-6 rounded-lg text-sm md:text-4xl font-semibold border-10 border-[#F9F5EE]">
          Customize My Gift
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-15 px-[0rem] md:px-[10rem]">
          {productData.map((product, index) => (
            <Link to={product.route} key={product.id}>
              <div className="relative cursor-pointer">
                {/* Mobile: Title overlayed on image */}
                <div className="md:hidden relative rounded-xl aspect-[2/1]">
                  <div 
                    className="absolute inset-0 p-4 rounded-xl"
                    style={{
                      border: "3px dashed #E6D3A3",
                      borderSpacing: "20px",
                      backgroundSize: "16px 2px",
                      backgroundRepeat: "round",
                      backgroundPosition: "0 0",
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      {/* Dark overlay for mobile */}
                      <div className="absolute inset-0 bg-black/40 z-10"></div>
                      <img
                        src={product.image}
                        alt={product.alt}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      {/* Centered title for mobile */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <p className="text-white text-xl font-bold text-center px-4">
                          {product.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Original layout */}
                <div className="hidden md:block">
                  <div className="p-4 rounded-xl text-center relative group"
                    style={{
                      border: "3px dashed #E6D3A3",
                      borderSpacing: "20px",
                      backgroundSize: "16px 2px",
                      backgroundRepeat: "round",
                      backgroundPosition: "0 0",
                    }}>
                    <div className="relative overflow-hidden rounded-lg aspect-[1/1.2]">
                      <img
                        src={product.image}
                        alt={product.alt}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Hover Overlay Text */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                        <p className="text-white text-lg md:text-xl font-medium px-4 text-center">
                          {product.hoverText}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-2xl">{product.title}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default GiftSetPart1;