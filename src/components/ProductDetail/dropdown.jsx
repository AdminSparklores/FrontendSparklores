import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const accordionData = [
  {
    title: "WATERPROOF | SWEATPROOF",
    content: "Our jewelry is made to endure daily wear – including water and sweat – without tarnishing or fading.",
  },
  {
    title: "FREE DELIVERY",
    content: "We offer free delivery on all local orders with no minimum spend.",
  },
  {
    title: "COLOR WARRANTY",
    content: "We guarantee the color quality for 12 months. If your item fades, we’ll replace it.",
  },
  {
    title: "PRODUCT CARE",
    content: "Clean your jewelry with a soft cloth regularly and avoid harsh chemicals for long-lasting shine.",
  },
  {
    title: "FREE REFUND & RETURN",
    content: "Changed your mind? Enjoy hassle-free refunds and returns within 7 days of purchase.",
  },
  {
    title: "WHY SPARKLORE?",
    content: "SparkLore offers elegant, hypoallergenic, and waterproof jewelry for everyday luxury.",
  },
];

const InfoAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='bg-[#fdf9f0]'>
        <div className="max-w-6xl mx-auto font-serif w-full">
        {accordionData.map((item, index) => (
            <div key={index} className="border-b border-[#f1e2b6]">
            <button
                onClick={() => toggle(index)}
                className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-[#f7f3e8] transition-colors duration-200"
            >
                <span className="text-sm md:text-base font-semibold text-[#2d2a26]">
                {item.title}
                </span>
                {openIndex === index ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
            </button>
            {openIndex === index && (
                <div className="px-4 pb-4 text-sm text-[#2d2a26]">
                {item.content}
                </div>
            )}
            </div>
        ))}
        </div>
    </div>
  );
};

export default InfoAccordion;
