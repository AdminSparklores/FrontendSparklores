import { useEffect, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";
import OrderTable from "../../components/Admin/OrderTable";
import StatusFilterBar from "../../components/Admin/StatusFilterBar";
import ConfirmDialog from "../../components/Admin/ConfirmDialog2";
import { getOrders, getProducts, getGiftSets, getCharms, createLabels } from "../../utils/admin_api";

const ORDER_STATUS = [
  { value: "all", label: "All" },
  { value: "awaiting_shipment", label: "Awaiting Shipment" },
  { value: "collection", label: "Collection" },
  { value: "on_shipment", label: "On Shipment" },
  { value: "shipped", label: "Shipped" },
];

export default function AdminOrderDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [giftSets, setGiftSets] = useState([]);
  const [charms, setCharms] = useState([]);
  const [statusFilter, setStatusFilter] = useState("awaiting_shipment");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch all required data on mount
  useEffect(() => {
    getOrders().then(setOrders);
    getProducts().then(setProducts);
    getGiftSets().then(setGiftSets);
    getCharms().then(setCharms);
  }, []);

  // Filtering by status
  const filteredOrders = orders.filter(order => {
    switch (statusFilter) {
      case "awaiting_shipment":
        return order.fulfillment_status === "pending";
      case "collection":
        return order.fulfillment_status === "collection";
      case "on_shipment":
        return order.fulfillment_status === "on_shipment";
      case "shipped":
        return order.fulfillment_status === "shipped";
      default: // "all" case
        return true;
    }
  });

  // Checkbox logic (only for Awaiting Shipment)
  const handleCheck = (id) => {
    setSelectedIds(selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]
    );
  };
  
  const handleCheckAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(order => order.id));
    }
  };

  // Trigger label creation
  const handleCreateLabels = () => {
  setConfirmAction(() => async () => {
    try {
      const blob = await createLabels(selectedIds);
      
      // Create PDF for printing
      const pdfUrl = URL.createObjectURL(blob);
      const printWindow = window.open(pdfUrl);
      printWindow.onload = () => {
        printWindow.print();
      };

      // Refresh orders after successful label creation
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error creating labels:", error);
      alert("Failed to create labels. Please check console for details.");
    }
  });
  setShowConfirm(true);
};

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="mx-auto max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#bfa170]">Order Management</h1>
          </div>
          <StatusFilterBar
            status={statusFilter}
            setStatus={setStatusFilter}
            orderStatus={ORDER_STATUS}
          />
          <OrderTable
            orders={filteredOrders}
            products={products}
            giftSets={giftSets}
            charms={charms}
            status={statusFilter}
            selectedIds={selectedIds}
            onCheck={handleCheck}
            onCheckAll={handleCheckAll}
          />
          {/* Action bar for selected checkboxes */}
          {statusFilter === "awaiting_shipment" && selectedIds.length > 0 && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateLabels}
                className="bg-[#e5cfa4] px-6 py-2 rounded text-white font-bold"
              >
                Create Label & Print Document
              </button>
            </div>
          )}
        </div>
        {/* Confirm Dialog for actions */}
        {showConfirm && (
          <ConfirmDialog
            message="Create shipping label and print for selected orders? This will move the orders to Collection status."
            onCancel={() => setShowConfirm(false)}
            onConfirm={async () => {
              await confirmAction();
              setShowConfirm(false);
            }}
          />
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}