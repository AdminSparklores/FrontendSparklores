import { useEffect, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";
import OrderTable from "../../components/Admin/OrderTable";
import StatusFilterBar from "../../components/Admin/StatusFilterBar";
import ConfirmDialog from "../../components/Admin/ConfirmDialog2";
import PrintConfirmationDialog from "../../components/Admin/PrintConfirmationDialog";
import { getOrders, getProducts, getGiftSets, getCharms, createLabels, cancelJntOrder, createMergedLabels } from "../../utils/admin_api";

const ORDER_STATUS = [
  { value: "all", label: "All" },
  { value: "awaiting_shipment", label: "Awaiting Shipment" },
  { value: "collection", label: "Collection" },
  { value: "on_shipment", label: "On Shipment" },
  { value: "shipped", label: "Shipped" },
];

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-[#e5cfa4] text-[#bfa170] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f4ed]"
      >
        Previous
      </button>
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border ${
            currentPage === page
              ? "bg-[#bfa170] text-white border-[#bfa170]"
              : "border-[#e5cfa4] text-[#bfa170] hover:bg-[#f8f4ed]"
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-[#e5cfa4] text-[#bfa170] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f4ed]"
      >
        Next
      </button>
      
      <span className="ml-4 text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

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
  const [labelType, setLabelType] = useState("jnt");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // You can make this configurable

  // Fetch all required data on mount
  useEffect(() => {
    getOrders().then(setOrders);
    getProducts().then(setProducts);
    getGiftSets().then(setGiftSets);
    getCharms().then(setCharms);
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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
    if (selectedIds.length === paginatedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map(order => order.id));
    } 
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Clear selection when changing pages
    setSelectedIds([]);
  };

  // Trigger label creation - BOTH types simultaneously
  const handleCreateLabels = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one order to create labels");
      return;
    }

    const selectedOrders = orders.filter(order => selectedIds.includes(order.id));

    try {
      setIsCreatingLabels(true);
      
      // Call both APIs simultaneously
      const [statusUpdateResult, jntLabelsResult] = await Promise.allSettled([
        // This updates order status (createMergedLabels)
        createMergedLabels(selectedIds),
        // This creates JNT labels (createLabels)
        createLabels(selectedOrders)
      ]);

      // Handle status update response
      if (statusUpdateResult.status === 'rejected') {
        console.error("Status update failed:", statusUpdateResult.reason);
        // You might want to show an error message for status update failure
        setResultModalData({
          type: 'error',
          title: 'Status Update Failed',
          message: `Failed to update order status: ${statusUpdateResult.reason.message || 'Unknown error'}`
        });
        setShowResultModal(true);
      } else {
        console.log("Status update successful");
        // Status was updated successfully
      }

      // Handle JNT labels response
      if (jntLabelsResult.status === 'rejected') {
        console.error("JNT label creation failed:", jntLabelsResult.reason);
        setResultModalData({
          type: 'error',
          title: 'Label Creation Failed',
          message: `Failed to create shipping labels: ${jntLabelsResult.reason.message || 'Unknown error'}`
        });
        setShowResultModal(true);
      } else {
        // JNT labels created successfully
        setGeneratedPdfUrl(jntLabelsResult.value);
        setShowPrintConfirm(true);
      }

      // Refresh orders regardless of individual API results
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setSelectedIds([]);

    } catch (error) {
      console.error("Unexpected error:", error);
      setResultModalData({
        type: 'error',
        title: 'Unexpected Error',
        message: `An unexpected error occurred: ${error.message}`
      });
      setShowResultModal(true);
    } finally {
      setIsCreatingLabels(false);
    }
  };

  // Handle print now action
  const handlePrintNow = () => {
    if (generatedPdfUrl.jntUrls && Array.isArray(generatedPdfUrl.jntUrls)) {
      generatedPdfUrl.jntUrls.forEach(url => {
        const a = document.createElement('a');
        a.href = url.trim();
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    if (generatedPdfUrl.mergedPdfUrl) {
      const a = document.createElement('a');
      a.href = generatedPdfUrl.mergedPdfUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setShowPrintConfirm(false);
  };

  // Handle print later action for both label types
  const handlePrintLater = () => {
    if (generatedPdfUrl.mergedPdfUrl) {
      const link = document.createElement('a');
      link.href = generatedPdfUrl.mergedPdfUrl;
      link.download = `merged-shipping-labels-${Date.now()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // For JNT URLs, they're already external links, so we can't download them directly
    // but we can provide the links for the user to save manually

    setShowPrintConfirm(false);
    setTimeout(() => {
      if (generatedPdfUrl.mergedPdfUrl) {
        URL.revokeObjectURL(generatedPdfUrl.mergedPdfUrl);
      }
    }, 100);
  };

  // Print receipts function for collection tab
  const handlePrintReceipts = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one order to print receipts");
      return;
    }

    try {
      setIsCreatingLabels(true);
      
      // Get selected orders with their billcodes
      const selectedOrders = orders.filter(order => selectedIds.includes(order.id));
      
      // Call the JNT print API for each selected order
      const jntLabelsResult = await createLabels(selectedOrders);

      // Handle JNT labels response
      if (Array.isArray(jntLabelsResult) && jntLabelsResult.length > 0) {
        setGeneratedPdfUrl(jntLabelsResult);
        setShowPrintConfirm(true);
      } else {
        setResultModalData({
          type: 'error',
          title: 'Print Failed',
          message: 'Failed to generate receipts. Please try again.'
        });
        setShowResultModal(true);
      }

    } catch (error) {
      console.error("Print receipts error:", error);
      setResultModalData({
        type: 'error',
        title: 'Print Error',
        message: `Failed to print receipts: ${error.message || 'Unknown error'}`
      });
      setShowResultModal(true);
    } finally {
      setIsCreatingLabels(false);
    }
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="mx-auto max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#bfa170]">Order Management</h1>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Orders per page:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="border border-[#e5cfa4] rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
          <StatusFilterBar
            status={statusFilter}
            setStatus={setStatusFilter}
            orderStatus={ORDER_STATUS}
          />
          <OrderTable
            orders={paginatedOrders}
            products={products}
            giftSets={giftSets}
            charms={charms}
            status={statusFilter}
            selectedIds={selectedIds}
            onCheck={handleCheck}
            onCheckAll={handleCheckAll}
            onCancelOrder={handleCancelOrder}
            isCanceling={isCanceling}   
          />
          
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          
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
                  disabled={isCreatingLabels}
                >
                  {isCreatingLabels ? 'Printing...' : 'Print Receipts'}
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
      <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-2xl max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Labels Ready</h3>
          <p className="mb-4 text-sm text-gray-700">
            Click the links below to open each label in a new tab.
          </p>
          <div className="space-y-2 mb-4">
            {generatedPdfUrl && (Array.isArray(generatedPdfUrl) ? generatedPdfUrl : [generatedPdfUrl]).map((url, i) => (
              <div key={i}>
                <a
                  href={url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📄 Open Label {i + 1}
                </a>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowPrintConfirm(false);
                if (generatedPdfUrl && typeof generatedPdfUrl === 'string') {
                  URL.revokeObjectURL(generatedPdfUrl);
                }
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}