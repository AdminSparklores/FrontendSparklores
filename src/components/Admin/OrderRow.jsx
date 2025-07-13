import { useState } from "react";
import StatusBadge from "./StatusBadge2";
import ProductDetailPopup from "./ProductDetailPopup";
import MessageDropdown from "./MessageDropdown";
import { timeAgo, shortProductName } from "../../utils/orderHelpers";

export default function OrderRow({
  order, products, giftSets, charms,
  showCheckbox, checked, onCheck
}) {
  const [showProductPopup, setShowProductPopup] = useState(false);

  // Compose product summary - using product_summary from the new API
  const items = order.product_summary || [];
  let firstProduct = items[0]?.product_name || items[0]?.gift_set_name || "-";
  let productCount = items.length;

  // Shorten product name if too long
  let shortened = shortProductName(firstProduct);

  return (
    <tr className="border-b hover:bg-[#f8f4ed] transition">
        {showCheckbox && (
            <td className="p-4 pl-6"> {/* Added pl-6 for left padding */}
            <input
                type="checkbox"
                checked={checked}
                onChange={() => onCheck(order.id)}
                className="h-4 w-4" // Standard checkbox size
            />
            </td>
        )}
        <td className="px-4 py-3"> {/* Added padding */}
            {order.user_email}
        </td>
        <td className="px-4 py-3 font-mono"> {/* Added padding */}
            {order.id.toString().padStart(18, "0")}
        </td>
        <td className="px-4 py-3"> {/* Added padding */}
            {order.time_elapsed}
        </td>
        <td className="px-4 py-3"> {/* Added padding */}
            {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3"> {/* Added padding */}
            <button
            className="underline text-[#bfa170] font-medium"
            onClick={() => setShowProductPopup(true)}
            >
            {shortened}{productCount > 1 ? ` +${productCount - 1}` : ""}
            </button>
        </td>
        <td className="px-4 py-3"> {/* Added padding */}
            <MessageDropdown message={order.message} />
        </td>
        <td className="px-4 py-3"> {/* Added padding */}
            <StatusBadge status={order.fulfillment_status} />
        </td>
        </tr>
  );
}