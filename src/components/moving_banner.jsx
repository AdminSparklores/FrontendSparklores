import React from 'react';
import { Star } from 'lucide-react';

const MovingBanner = () => {
  const bannerItems = [
    {
      id: 1,
      content: (
        <span className="text-sm sm:text-base md:text-lg">UNIQUELY YOURS</span>
      ),
    },
    {
      id: 2,
      content: (
        <span className="text-sm sm:text-base md:text-lg">CUSTOMIZE YOUR OWN JEWEL</span>
      ),
    },
    {
      id: 3,
      content: (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs sm:text-sm md:text-base">LOVED BY 389 CUSTOMERS</span>
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <span className="text-sm sm:text-base md:text-lg">WATERPROOF GUARANTEED</span>
      ),
    },
  ];

  return (
    <div className="bg-[#302e2a] text-white py-3 sm:py-4 overflow-hidden">
      <div 
        className="whitespace-nowrap flex items-center"
        style={{
          animation: 'marquee 25s linear infinite',
        }}
      >
        {[...bannerItems, ...bannerItems].map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
            className="mx-4 sm:mx-6 md:mx-8 inline-flex items-center"
          >
            {item.content}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default MovingBanner;