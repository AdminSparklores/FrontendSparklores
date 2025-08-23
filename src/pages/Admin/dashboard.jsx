import { useEffect, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";
import OrderTable from "../../components/Admin/OrderTable";
import StatusFilterBar from "../../components/Admin/StatusFilterBar";
import ConfirmDialog from "../../components/Admin/ConfirmDialog2";
import PrintConfirmationDialog from "../../components/Admin/PrintConfirmationDialog";
import { getOrders, getProducts, getGiftSets, getCharms, createLabels, cancelJntOrder } from "../../utils/admin_api";

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
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelData, setCancelData] = useState({
    orderId: null,
    reason: "Canceled by user"
  });
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState({
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });


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

  // Handle individual order cancellation
  const handleCancelOrder = (orderId) => {
    setCancelData({ 
      orderId, 
      reason: "Canceled by user"  // ← use 'reason'
    });
    setShowCancelConfirm(true);
  };

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
        setIsCreatingLabels(true);
        
        const printUrls = await createLabels(selectedIds);
        
        if (!Array.isArray(printUrls)) {
          // If single URL, wrap in array
          setGeneratedPdfUrl([printUrls]);
        } else {
          setGeneratedPdfUrl(printUrls);
        }

        setShowPrintConfirm(true);

        const updatedOrders = await getOrders();
        setOrders(updatedOrders);
        setSelectedIds([]);
      } catch (error) {
        console.error("Label creation error:", error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsCreatingLabels(false);
      }
    });
    
    setShowConfirm(true);
  };

  // Handle print now action
  const handlePrintNow = () => {
    const urls = Array.isArray(generatedPdfUrl) ? generatedPdfUrl : [generatedPdfUrl];

    urls.forEach((url, index) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-1000px';
      iframe.style.left = '-1000px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';

      // Print this iframe when loaded
      iframe.onload = () => {
        try {
          iframe.contentWindow.print();
        } catch (e) {
          console.error(`Print failed for URL ${index}:`, e);
        }
      };

      iframe.src = url;
      document.body.appendChild(iframe);

      // Clean up after delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 10000);
    });

    setShowPrintConfirm(false);
  };

  // Handle print later action
  const handlePrintLater = () => {
    const urls = Array.isArray(generatedPdfUrl) ? generatedPdfUrl : [generatedPdfUrl];
    urls.forEach(url => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

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
            onCancelOrder={handleCancelOrder}   // ← Add this
            isCanceling={isCanceling}   
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

        {/* Result Modal for Success/Error */}
        {showResultModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">
                {resultModalData.title || (resultModalData.type === 'success' ? 'Success' : 'Error')}
              </h3>
              <p className={resultModalData.type === 'error' ? 'text-red-600 mb-4' : 'mb-4'}>
                {resultModalData.message}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    // Optional: reset after close
                    setResultModalData({ type: 'success', title: '', message: '' });
                  }}
                  className="px-4 py-2 bg-[#bfa170] text-white rounded hover:bg-[#a98c5f]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog for JNT Cancel with Reason Input */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
              <p className="mb-4">Are you sure you want to cancel order <strong>{cancelData.orderId}</strong>?</p>
              
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelData.reason}
                onChange={(e) => setCancelData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows="3"
                placeholder="Enter reason for cancellation"
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCanceling}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!cancelData.orderId) return;

                    setIsCanceling(true);

                    try {
                      const result = await cancelJntOrder(cancelData.orderId, cancelData.reason);

                      // ✅ Success: Show success modal
                      setResultModalData({
                        type: 'success',
                        title: 'Cancellation Successful',
                        message: `Order #${cancelData.orderId} has been canceled successfully.`
                      });

                      // Refresh orders
                      const updatedOrders = await getOrders();
                      setOrders(updatedOrders);
                      setSelectedIds(selectedIds.filter(id => id !== cancelData.orderId));
                    } catch (error) {
                      console.error("Cancellation failed:", error);

                      let title = "Cancellation Failed";
                      let message = error.message;

                      if (message.includes("CANCEL_ORDER")) {
                        message = `Order #${cancelData.orderId} is already canceled.`;
                      } else if (message.includes("Tidak dapat dibatalkan")) {
                        message = `Cancellation not allowed: ${message}`;
                      } else if (message.includes("Network")) {
                        message = "Unable to connect. Please check your internet.";
                      }

                      setResultModalData({
                        type: 'error',
                        title,
                        message
                      });
                    } finally {
                      setIsCanceling(false);
                      setShowCancelConfirm(false); // ✅ Close the confirmation modal
                      setCancelData({ orderId: null, reason: "Canceled by user" });

                      // ✅ Open the result modal after closing confirm
                      setShowResultModal(true);
                    }
                  }}
                  disabled={isCanceling}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isCanceling ? 'Canceling...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

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