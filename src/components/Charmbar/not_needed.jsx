import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import product1 from "../../assets/default/charmbar_product1.png";
import product2 from "../../assets/default/charmbar_product2.png";
import product3 from "../../assets/default/charmbar_product3.png";
import product4 from "../../assets/default/charmbar_product4.png";
import product5 from "../../assets/default/charmbar_product5.png";
import product6 from "../../assets/default/charmbar_product6.png";
import product7 from "../../assets/default/charmbar_product7.png";
import product8 from "../../assets/default/charmbar_product8.png";

const necklaces = [
  { img: product1, text: "Elegant Necklace", price: "$29.99" },
  { img: product2, text: "Classic Necklace", price: "$24.99" },
  { img: product3, text: "Charming Necklace", price: "$19.99" },
  { img: product4, text: "Stylish Necklace", price: "$34.99" },
  { img: product4, text: "Stylish Necklace", price: "$34.99" },
];

const bracelets = [
  { img: product5, text: "Beautiful Bracelet", price: "$19.99" },
  { img: product6, text: "Trendy Bracelet", price: "$22.99" },
  { img: product7, text: "Fashionable Bracelet", price: "$17.99" },
  { img: product8, text: "Unique Bracelet", price: "$25.99" },
  { img: product4, text: "Stylish Necklace", price: "$34.99" },
];

export default function Charmbar_display1() {
  const necklaceRef = useRef(null);
  const braceletRef = useRef(null);

  const scrollByAmount = 260; // One item width + gap

  const scroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -scrollByAmount : scrollByAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-[#f9f5ef]">
      <div className="px-6 py-12 max-w-6xl mx-auto">
        {/* NECKLACES */}
        <h2 className="text-2xl font-serif font-semibold mb-6">NECKLACES</h2>
        <div className="relative">
          <button
            onClick={() => scroll(necklaceRef, "left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <div
            ref={necklaceRef}
            className="flex gap-4 overflow-x-auto scroll-smooth ml-12 mr-12 pb-2 no-scrollbar"
          >
            {necklaces.map((item, i) => (
              <div className="relative group min-w-[15rem] transition-transform duration-300 hover:scale-105" key={i}>
                <img
                  src={item.img}
                  alt={`Necklace ${i + 1}`}
                  className="w-[15rem] h-[15rem] object-cover shadow-md"
                />
                <div className="absolute inset-0 bg-[#f5f5dc] opacity-0 group-hover:opacity-80 flex flex-col items-center justify-center transition-opacity duration-300">
                  <span className="text-lg font-bold text-gray-800">{item.text}</span>
                  <span className="text-md font-semibold text-gray-700">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll(necklaceRef, "right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* BRACELETS */}
        <h2 className="text-2xl font-serif font-semibold mt-12 mb-6">BRACELETS</h2>
        <div className="relative">
          <button
            onClick={() => scroll(braceletRef, "left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <div
            ref={braceletRef}
            className="flex gap-4 overflow-x-auto scroll-smooth ml-12 mr-12 pb-2 no-scrollbar"
          >
            {bracelets.map((item, i) => (
              <div className="relative group min-w-[15rem] transition-transform duration-300 hover:scale-105" key={i}>
                <img
                  src={item.img}
                  alt={`Bracelet ${i + 1}`}
                  className="w-[15rem] h-[15rem] object-cover shadow-md"
                />
                <div className="absolute inset-0 bg-[#f5f5dc] opacity-0 group-hover:opacity-80 flex flex-col items-center justify-center transition-opacity duration-300">
                  <span className="text-lg font-bold text-gray-800">{item.text}</span>
                  <span className="text-md font-semibold text-gray-700">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll(braceletRef, "right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-fulltransition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import charm1 from "../../assets/charms/charm1.png";
import charm2 from "../../assets/charms/charm2.png";
import charm3 from "../../assets/charms/charm3.png";
import charm4 from "../../assets/charms/charm4.png";
import charm5 from "../../assets/charms/charm5.png";
import basenecklace from "../../assets/default/charmbar_product6.png";


const charms = {
  Alphabet: [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ], // Add image sources and names later
  Birthstone: [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
  "Birthstone Mini": [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
  "Birth Flower": [
        { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
  Zodiac: [
    { name: "Aries", src: charm1 },
    { name: "Taurus", src: charm2 },
    { name: "Gemini", src: charm3 },
    { name: "Cancer", src: charm4 },
    { name: "Leo", src: charm5 },
  ],
  "Sparklore Specials": [
    { name: "Special Charm 1", src: charm1 },
    { name: "Special Charm 2", src: charm2 },
    { name: "Special Charm 3", src: charm3 },
    { name: "Special Charm 4", src: charm4 },
    { name: "Special Charm 5", src: charm5 },
  ],
  AlphabetDD: [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ], // Add image sources and names later
  BirthstoneCC: [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
  "BirthstoneBB": [
    { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
  "BirthAA": [
        { name: "Garnet", src: charm1 },
    { name: "Amethyst", src: charm2 },
    { name: "Aquamarine", src: charm3 },
    { name: "Moonstone", src: charm4 },
    { name: "Emerald", src: charm5 },
    // Ensure charm6 is defined if used
  ],
};

export default function CharmCustomizer() {
  const [charmCount, setCharmCount] = useState(2);
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedCharms, setSelectedCharms] = useState({ 1: null, 2: null });
  const [openCategory, setOpenCategory] = useState("Birthstone");

  const handleCharmSelect = (charm) => {
    setSelectedCharms({ ...selectedCharms, [selectedTab]: charm });
  };

  return (
    <div className="bg-[#f9f5ef] min-h-screen ">
            <div className="font-sans px-6 py-12 max-w-6xl mx-auto">
                <h2 className="text-xl font-medium mb-4">Pick Your Package</h2>
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => {
                        setCharmCount(num);
                        setSelectedTab(1);
                        }}
                        className={clsx(
                        "px-4 py-2 border rounded transition",
                        charmCount === num ? "bg-[#e6d5a7]" : "bg-white"
                        )}
                    >
                        {num} Charm{num > 1 && "s"}
                    </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="bg-white rounded w-full max-w-xl aspect-square p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                        src= {basenecklace} // Ensure this path is correct
                        alt="Base Necklace"
                        className="w-full max-w-sm, bg-cover"
                        />
                        {Array.from({ length: charmCount }, (_, i) => (
                        selectedCharms[i + 1] && (
                            <img
                            key={i}
                            src={selectedCharms[i + 1].src}
                            alt={`Charm ${i + 1}`}
                            className="absolute w-10 h-10"
                            style={{ top: `${60 + i * 40}px`, left: `${120 + i * 30}px` }}
                            title={selectedCharms[i + 1].name}
                            />
                        )
                        ))}
                    </div>
                    </div>

                    <div className="flex-1">
                    <div className="text-2xl font-semibold mb-4">Rp {139999 + (charmCount - 1) * 25000},00</div>
                    {charmCount > 1 && (
                        <div className="flex gap-2 mb-4">
                        {Array.from({ length: charmCount }, (_, i) => (
                            <button
                            key={i}
                            onClick={() => setSelectedTab(i + 1)}
                            className={clsx(
                                "px-4 py-1 rounded border",
                                selectedTab === i + 1 ? "bg-[#e6d5a7]" : "bg-white"
                            )}
                            >
                            Charm {i + 1}
                            </button>
                        ))}
                        </div>
                    )}

                    <button className="w-full bg-[#e6d5a7] text-center py-2 rounded mb-4 font-medium">
                        Add to cart
                    </button>

                    {Object.keys(charms).map((category) => (
                        <div key={category} className="mb-2">
                        <button
                            onClick={() => setOpenCategory(openCategory === category ? null : category)}
                            className="w-full flex justify-between items-center py-2 border-b"
                        >
                            <span>{category}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {openCategory === category && (
                            <div className="grid grid-cols-3 gap-2 p-2">
                            {charms[category].map((charm, i) => (
                                <img
                                key={i}
                                src={charm.src}
                                alt={charm.name}
                                title={charm.name}
                                onClick={() => handleCharmSelect(charm)}
                                className="cursor-pointer hover:scale-105 transition rounded border p-1"
                                />
                            ))}
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>
                </div>
    </div>

  );
}