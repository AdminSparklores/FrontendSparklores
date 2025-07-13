import { useEffect, useState } from "react";

export default function ProductDetailPopup({ items, products, giftSets, charms, onClose }) {
  const [itemDetails, setItemDetails] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await Promise.all(items.map(async (item) => {
        if (item.product) {
          const product = products.find(p => p.id === item.product);
          return {
            name: item.product_name || product?.name || "-",
            image: product?.images?.[0]?.image,
            quantity: item.quantity
          };
        } else if (item.gift_set) {
          const giftSet = giftSets.find(g => g.id === item.gift_set);
          return {
            name: item.gift_set_name || giftSet?.name || "-",
            image: giftSet?.image,
            quantity: item.quantity
          };
        }
        return {
          name: item.product_name || item.gift_set_name || "-",
          image: null,
          quantity: item.quantity
        };
      }));
      setItemDetails(details);
    };

    fetchDetails();
  }, [items, products, giftSets]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div className="mb-2 font-bold text-lg">Order Products</div>
        <div className="space-y-3">
          {itemDetails.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-contain rounded border border-gray-200" 
                />
              )}
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <button 
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}