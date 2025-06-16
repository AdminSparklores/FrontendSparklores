import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState } from "react";

const initialOrders = [
  {
    id: 1,
    user: "Jane Doe",
    items: [{ name: "Bling Pin Bracelet", qty: 2 }],
    message: "Please wrap as a gift!",
    date: "2025-06-15",
    paymentStatus: "pending",
    deliveryStatus: "Being packed",
    paymentProof: "https://via.placeholder.com/100x120",
  },
  {
    id: 2,
    user: "John Smith",
    items: [{ name: "Mono Ring", qty: 1 }, { name: "Gift Set 1", qty: 1 }],
    message: "Deliver ASAP",
    date: "2025-06-14",
    paymentStatus: "paid",
    deliveryStatus: "On delivery",
    paymentProof: "https://via.placeholder.com/100x120",
  },
];

export default function AdminDashboardAndOrder() {
  const [orders, setOrders] = useState(initialOrders);
  const [filterDate, setFilterDate] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [toCancel, setToCancel] = useState(null);

  let filtered = [...orders];
  if (filterDate) {
    filtered = filtered.filter((o) => o.date === filterDate);
  }
  filtered.sort((a, b) =>
    sortDesc
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );

  const handleCancel = (order) => {
    setToCancel(order);
  };

  const confirmCancel = () => {
    setOrders((orders) => orders.filter((o) => o.id !== toCancel.id));
    setToCancel(null);
  };

  const updateOrderStatus = (id, field, value) => {
    setOrders((orders) =>
      orders.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      )
    );
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#bfa170]">Orders</h1>
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button
              className="bg-gray-100 px-2 rounded text-[#bfa170] font-semibold"
              onClick={() => setSortDesc((s) => !s)}
            >
              Sort {sortDesc ? "↓" : "↑"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e5cfa4] shadow overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#bfa170] border-b">
                <th className="p-4">User</th>
                <th>Date</th>
                <th>Items</th>
                <th>Message</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Proof</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">No orders found.</td>
                </tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id} className="border-b hover:bg-[#f8f4ed] transition">
                  <td className="p-4 font-medium">{order.user}</td>
                  <td>{order.date}</td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.name} x{item.qty}</div>
                    ))}
                  </td>
                  <td>{order.message || "-"}</td>
                  <td>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) =>
                        updateOrderStatus(order.id, "paymentStatus", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                    <StatusBadge type={order.paymentStatus} />
                  </td>
                  <td>
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) =>
                        updateOrderStatus(order.id, "deliveryStatus", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option>Being packed</option>
                      <option>On delivery</option>
                      <option>Arrived successfully</option>
                    </select>
                    <StatusBadge type={order.deliveryStatus} />
                  </td>
                  <td>
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" className="underline text-[#bfa170]">View</a>
                  </td>
                  <td>
                    <button
                      onClick={() => handleCancel(order)}
                      className="text-red-600"
                    >Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {toCancel && (
          <ConfirmDialog
            message={`Cancel order for "${toCancel.user}"? This action cannot be undone.`}
            onCancel={() => setToCancel(null)}
            onConfirm={confirmCancel}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ type }) {
  const map = {
    "pending": { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    "paid": { color: "bg-green-100 text-green-800", label: "Paid" },
    "Being packed": { color: "bg-blue-100 text-blue-800", label: "Being packed" },
    "On delivery": { color: "bg-indigo-100 text-indigo-800", label: "On delivery" },
    "Arrived successfully": { color: "bg-green-100 text-green-800", label: "Arrived" },
    "Cancelled": { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };
  if (!map[type]) return null;
  return (
    <span className={`inline-block ml-2 px-2 py-1 rounded-full text-xs ${map[type].color}`}>
      {map[type].label}
    </span>
  );
}

function ConfirmDialog({ message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e5cfa4] min-w-[320px]">
        <div className="mb-4 text-base text-[#bfa170] font-medium">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-100"
            onClick={onCancel}
          >Cancel</button>
          <button
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white font-semibold"
            onClick={onConfirm}
          >Yes, Confirm</button>
        </div>
      </div>
    </div>
  );
}