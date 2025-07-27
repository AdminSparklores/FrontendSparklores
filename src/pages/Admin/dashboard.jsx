import { useEffect, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";
import OrderTable from "../../components/Admin/OrderTable";
import StatusFilterBar from "../../components/Admin/StatusFilterBar";
import ConfirmDialog from "../../components/Admin/ConfirmDialog2";
import PrintConfirmationDialog from "../../components/Admin/PrintConfirmationDialog";
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
  const [isCreatingLabels, setIsCreatingLabels] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);


  // Fetch all required data on mount
  useEffect(() => {
    getOrders().then(setOrders);
    getProducts().then(setProducts);
    getGiftSets().then(setGiftSets);
    getCharms().then(setCharms);
  }, []);

  // Filtering by status
  const filteredOrders = orders.filter(order => {
    const status = order.fulfillment_status?.toLowerCase(); // Normalize to lowercase
    
    switch (statusFilter) {
      case "awaiting_shipment":
        return status === "pending" || status === "awaiting_shipment";
      case "collection":
        return status === "collection";
      case "on_shipment":
        return status === "on_shipment";
      case "shipped":
        return status === "shipped";
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
    if (selectedIds.length === 0) {
      alert("Please select at least one order to create labels");
      return;
    }

    setConfirmAction(() => async () => {
      try {
        const blob = await createLabels(selectedIds);
        const pdfUrl = URL.createObjectURL(blob);
        
        // Store the PDF URL and show print confirmation
        setGeneratedPdfUrl(pdfUrl);
        setShowPrintConfirm(true);

        // Refresh orders
        const updatedOrders = await getOrders();
        setOrders(updatedOrders);
        setSelectedIds([]);
      } catch (error) {
        console.error("Label creation error:", error);
        alert(`Error creating labels: ${error.message || 'Please check console for details'}`);
      }
    });
    
    setShowConfirm(true);
  };

  // Handle print now action
  const handlePrintNow = () => {
    const printWindow = window.open(generatedPdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        try {
          printWindow.print();
        } catch (e) {
          console.error("Print failed:", e);
          alert("Print dialog was blocked. Please enable popups and try again.");
        }
      };
    } else {
      alert("Popup was blocked. Please enable popups to print.");
    }
    
    // Clean up
    setShowPrintConfirm(false);
    setTimeout(() => URL.revokeObjectURL(generatedPdfUrl), 1000);
  };

  // Handle print later action
  const handlePrintLater = () => {
    // Create download link
    const a = document.createElement('a');
    a.href = generatedPdfUrl;
    a.download = `labels-${selectedIds.join('-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(generatedPdfUrl);
    }, 100);
    
    setShowPrintConfirm(false);
  };

  // Add this function to dashboard.jsx
const handlePrintReceipts = () => {
  if (selectedIds.length === 0) {
    alert("Please select at least one order to print receipts");
    return;
  }

  // Here you would implement the actual receipt printing logic
  console.log("Printing receipts for:", selectedIds);
  alert(`Preparing to print receipts for ${selectedIds.length} order(s)`);
  
  // For now, we'll just clear the selection
  setSelectedIds([]);
};

// Update the action bar section to show different buttons based on status:
{selectedIds.length > 0 && (
  <div className="flex gap-3 mt-4">
    {statusFilter === "awaiting_shipment" && (
      <button
        onClick={handleCreateLabels}
        className="bg-[#e5cfa4] px-6 py-2 rounded text-white font-bold"
        disabled={isCreatingLabels}
      >
        {isCreatingLabels ? 'Creating...' : 'Create Label & Print Document'}
      </button>
    )}
    {statusFilter === "collection" && (
      <button
        onClick={handlePrintReceipts}
        className="bg-[#e5cfa4] px-6 py-2 rounded text-white font-bold"
      >
        Print Receipts
      </button>
    )}
  </div>
)}

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
          {selectedIds.length > 0 && (
            <div className="flex gap-3 mt-4">
              {statusFilter === "awaiting_shipment" && (
                <button
                  onClick={handleCreateLabels}
                  className="bg-[#e5cfa4] px-6 py-2 rounded text-white font-bold"
                  disabled={isCreatingLabels}
                >
                  {isCreatingLabels ? 'Creating...' : 'Create Label & Print Document'}
                </button>
              )}
              {statusFilter === "collection" && (
                <button
                  onClick={handlePrintReceipts}
                  className="bg-[#e5cfa4] px-6 py-2 rounded text-white font-bold"
                >
                  Print Receipts
                </button>
              )}
            </div>
          )}
        </div>
        {/* Confirm Dialog for label creation */}
      {showConfirm && (
        <ConfirmDialog
          message={`Create shipping labels for ${selectedIds.length} selected order(s)? This will move the orders to Collection status.`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            await confirmAction();
            setShowConfirm(false);
          }}
        />
      )}
      
      {/* Print Confirmation Dialog */}
      {showPrintConfirm && (
        <PrintConfirmationDialog
          onPrintNow={handlePrintNow}
          onPrintLater={handlePrintLater}
          onClose={() => {
            setShowPrintConfirm(false);
            URL.revokeObjectURL(generatedPdfUrl);
          }}
        />
      )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}