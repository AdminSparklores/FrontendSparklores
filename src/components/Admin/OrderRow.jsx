import { useState } from "react";
import StatusBadge from "./StatusBadge2";
import ProductDetailPopup from "./ProductDetailPopup";
import MessagePopup from "./MessagePopup";
import { timeAgo, shortProductName } from "../../utils/orderHelpers";

export default function OrderRow({
  order, products, giftSets, charms,
  showCheckbox, checked, onCheck
}) {
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const items = order.product_summary || [];
  let firstProduct = items[0]?.product_name || items[0]?.gift_set_name || "-";
  let productCount = items.length;
  let shortened = shortProductName(firstProduct);

  // Check if any item has a message
  const hasMessages = items.some(item => item.message);

  return (
    <>
      <tr className="border-b hover:bg-[#f8f4ed] transition">
        {showCheckbox && (
          <td className="p-4 pl-6">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onCheck(order.id)}
              className="h-4 w-4"
            />
          </td>
        )}
        <td className="px-4 py-3">
          {order.user_email}
        </td>
        <td className="px-4 py-3 font-mono">
          {order.id.toString().padStart(18, "0")}
        </td>
        <td className="px-4 py-3">
          {order.time_elapsed}
        </td>
        <td className="px-4 py-3">
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <button
            className="underline text-[#bfa170] font-medium"
            onClick={() => setShowProductPopup(true)}
          >
            {shortened}{productCount > 1 ? ` +${productCount - 1}` : ""}
          </button>
        </td>
        <td className="px-4 py-3">
          {hasMessages ? (
            <button
              className="underline text-[#bfa170] text-xs"
              onClick={() => setShowMessagePopup(true)}
            >
              View Messages
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-400 rounded px-2 py-1 text-xs text-center">
              No Messages
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={order.fulfillment_status} />
        </td>
      </tr>

      {showProductPopup && (
        <ProductDetailPopup
          items={items}
          products={products}
          giftSets={giftSets}
          charms={charms}
          onClose={() => setShowProductPopup(false)}
        />
      )}

      {showMessagePopup && (
        <MessagePopup
          items={items}
          onClose={() => setShowMessagePopup(false)}
        />
      )}
    </>
  );
}