import { useEffect, useState } from "react";

export default function ProductDetailPopup({ items, products, giftSets, charms, onClose }) {
  const [itemDetails, setItemDetails] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await Promise.all(items.map(async (item) => {
        // Base object that includes all common fields including message
        const baseItem = {
          message: item.message || null,
          quantity: item.quantity
        };

        // Handle product case
        if (item.product) {
          const product = products.find(p => p.id === item.product);
          return {
            ...baseItem,
            type: 'product',
            name: item.product_name || product?.name || "-",
            image: product?.images?.[0]?.image_url,
          };
        }
        // Handle gift set case
        else if (item.gift_set) {
          const giftSet = giftSets.find(g => g.id === item.gift_set);
          return {
            ...baseItem,
            type: 'gift_set',
            name: item.gift_set_name || giftSet?.name || "-",
            image: giftSet?.image,
          };
        }
        // Handle charm case
        else if (item.charms && item.charms.length > 0) {
          const charmDetails = await Promise.all(item.charms.map(async (charmItem) => {
            const charm = charms.find(c => c.id === charmItem.charm);
            return {
              ...baseItem,
              type: 'charm',
              name: charmItem.charm_name || charm?.name || "-",
              image: charm?.image,
            };
          }));
          return charmDetails;
        }
        // Fallback for unknown items
        return {
          ...baseItem,
          type: 'unknown',
          name: item.product_name || item.gift_set_name || "-",
          image: null,
        };
      }));
      
      // Flatten the array in case charmDetails returned arrays
      setItemDetails(details.flat());
    };

    fetchDetails();
  }, [items, products, giftSets, charms]);

  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div className="mb-4 font-bold text-lg">Order Products</div>
        <div className="space-y-4">
          {itemDetails.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-3 border-b last:border-0">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-contain rounded border border-gray-200" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://via.placeholder.com/64?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border border-gray-200 text-gray-400">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Type: {item.type.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </div>
                {item.message && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium text-gray-600">Message:</div>
                    <div className="text-gray-700">{item.message}</div>
                  </div>
                )}
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