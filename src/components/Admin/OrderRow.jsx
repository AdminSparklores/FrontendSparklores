import { useState } from "react";
import StatusBadge from "./StatusBadge2";
import ProductDetailPopup from "./ProductDetailPopUp";
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

  // Payment status logic
  const getPaymentStatus = () => {
    if (order.billcode) {
      return { status: "paid", label: "Paid", className: "bg-green-100 text-green-800" };
    }
    
    // Check if order is older than 3 hours
    const orderDate = new Date(order.created_at);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    
    if (orderDate < threeHoursAgo) {
      return { status: "canceled", label: "Canceled by User", className: "bg-red-100 text-red-800" };
    }
    
    return { status: "not_paid", label: "Not Paid", className: "bg-yellow-100 text-yellow-800" };
  };

  const paymentStatus = getPaymentStatus();

  // Determine if cancel button should be shown
  const shouldShowCancelButton = () => {
    // For Awaiting Shipment tab
    if (status === "awaiting_shipment") {
      return order.fulfillment_status === "pending" || order.fulfillment_status === "awaiting_shipment";
    }
    
    // For Collection tab - allow cancellation of collection orders
    if (status === "collection") {
      return order.fulfillment_status === "collection";
    }
    
    return false;
  };

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
        <td className="px-4 py-3 text-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatus.className}`}>
            {paymentStatus.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 text-center">
            <StatusBadge status={order.fulfillment_status} />

            {/* Show Cancel Button for eligible statuses in both Awaiting Shipment and Collection tabs */}
            {shouldShowCancelButton() && (
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="px-3 py-1 text-xs font-semibold rounded-lg 
                  bg-red-600 text-white 
                  hover:bg-red-700 
                  disabled:bg-red-300 disabled:cursor-not-allowed 
                  transition-colors"
                disabled={isCanceling}
              >
                {isCanceling ? 'Canceling...' : 'Cancel'}
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