import { useState } from "react";
import StatusBadge from "./StatusBadge2";
import ProductDetailPopup from "./ProductDetailPopup";
import MessagePopup from "./MessagePopup";
import { timeAgo, shortProductName } from "../../utils/orderHelpers";

export default function OrderRow({
  order, products, giftSets, charms,
  showCheckbox, checked, onCheck, status, isCanceling, handleCancelOrder
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
          <div className="flex items-center gap-2">
            <StatusBadge status={order.fulfillment_status} />

            {/* Show Cancel Button only in Awaiting Shipment tab and for eligible statuses */}
            {(order.fulfillment_status === "pending" || order.fulfillment_status === "awaiting_shipment") && 
            status === "awaiting_shipment" && (
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="px-3 py-1 text-xs font-semibold rounded-lg 
                          bg-red-600 text-white 
                          hover:bg-red-700 
                          disabled:bg-red-300 disabled:cursor-not-allowed 
                          transition-colors"
                disabled={isCanceling}
              >
                Cancel
              </button>
            )}
          </div>
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