import React from "react";
import sparkle from "../../assets/default/home_sparkle.png";

const Features = () => {
  const features = [
    { name: "HYPOALLERGENIC", image: sparkle },
    { name: "TARNISH FREE", image: sparkle },
    { name: "18K GOLD", image: sparkle },
    { name: "TITANIUM PLATED", image: sparkle },
    { name: "WATERPROOF", image: sparkle },
  ];

  return (
    <div className="bg-[#F9F5EE] py-25 border-y border-gray-300">
      {/* Desktop: Single row layout */}
      <div className="hidden md:flex mx-auto justify-evenly gap-20">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <img src={feature.image} alt={feature.name} className="w-20 h-20 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-800">{feature.name}</p>
          </div>
        ))}
      </div>

      {/* Mobile: Horizontal scrollable */}
      <div className="md:hidden px-4">
        <div className="flex overflow-x-auto scrollbar-hide space-x-20 py-2 px-10">
          {features.map((feature, index) => (
            <div key={index} className="flex-shrink-0 text-center px-4">
              <img src={feature.image} alt={feature.name} className="w-30 h-30 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-gray-800 whitespace-nowrap">{feature.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;