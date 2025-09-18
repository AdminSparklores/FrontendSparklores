import { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import ProductDetailPopup from "./ProductDetailPopUp";  
import MessagePopup from "./MessagePopup";
import { timeAgo, shortProductName } from "../../utils/orderHelpers";
import OrderRow from "./OrderRow";

export default function OrderTable({
  orders, products, giftSets, charms,
  status, selectedIds, onCheck, onCheckAll, onCancelOrder, isCanceling  
}) {
  // Define which statuses should show checkboxes
  const showCheckboxForStatus = [
    "awaiting_shipment", 
    "collection",
    "packing",
    "pending"
  ].includes(status);

  return (
    <div className="bg-white rounded-xl border border-[#e5cfa4] shadow overflow-x-auto mt-4">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[#bfa170] border-b">
            {showCheckboxForStatus && (
              <th className="p-4 pl-6">
                <input
                  type="checkbox"
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onChange={onCheckAll}
                  aria-label="Select all"
                  className="h-4 w-4"
                />
              </th>
            )}
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Products</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Payment Status</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr><td colSpan={showCheckboxForStatus ? 10 : 9} className="text-center py-4">No orders found.</td></tr>
          )}
          {orders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              products={products}
              giftSets={giftSets}
              charms={charms}
              showCheckbox={showCheckboxForStatus}
              checked={selectedIds.includes(order.id)}
              onCheck={onCheck}
              status={status}
              isCanceling={isCanceling} 
              handleCancelOrder={onCancelOrder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}