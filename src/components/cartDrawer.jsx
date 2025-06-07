import React from "react";
import { Link } from "react-router-dom";
const EMPTY_CART_IMAGE = "https://i.pinimg.com/736x/2e/ac/fa/2eacfa305d7715bdcd86bb4956209038.jpg";

const CartDrawer = ({
  open,
  onClose,
  cartItems,
  isLoadingCart,
  cartError,
  handleQuantityChange,
  toggleItemSelection,
  toggleSelectAll,
  formatPrice,
  calculateTotal,
  showDeleteConfirm,
  itemToDelete,
  handleConfirmDelete,
  setShowDeleteConfirm,
  setItemToDelete,
  setSnackbarMessage,
  setSnackbarType,
  setShowSnackbar,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-[#fdfaf3] sm:w-full md:w-[40%] h-full p-6 overflow-y-auto relative animate-slideInRight shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold tracking-widest text-gray-800">YOUR CART</h2>
          <button 
            className="text-2xl text-gray-700" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Loading and Error States */}
        {isLoadingCart && (
          <div className="flex flex-col justify-center items-center h-32 gap-2">
            <span role="img" aria-label="Loading" className="text-5xl animate-spin">🛒</span>
            <p>Loading your cart...</p>
          </div>
        )}

        {cartError && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <img
              src={EMPTY_CART_IMAGE}
              alt="Empty Cart"
              className="w-24 h-24 opacity-60"
              style={{ filter: "grayscale(70%)" }}
            />
            <span className="text-[#b87777] font-semibold text-lg text-center">
              {cartError}
            </span>
            {cartError.toLowerCase().includes('load') && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-[#e6d4a5] rounded text-gray-800 font-medium"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!cartError && !isLoadingCart && cartItems.length > 0 && (
          <div className="space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <input 
                    type="checkbox" 
                    className="custom-checkbox" 
                    checked={item.selected}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-[6rem] h-[6rem] object-cover rounded-md" 
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#b87777] font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.originalPrice && (
                        <div className="flex gap-2">
                          <p className="text-gray-400 text-sm line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </p>
                          <span className="text-xs bg-[#c3a46f] text-white px-1 rounded">
                            {item.discountLabel || `${item.discount}% OFF`}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.charms && item.charms.length > 0 && (
                      <div className="text-sm mt-2">
                        <p className="font-medium">Charm Selection</p>
                        <div className="flex gap-1 mt-1">
                          {item.charms.map((charm, index) => (
                            <img 
                              key={index} 
                              src={charm} 
                              className="w-6 h-6 border rounded-sm" 
                              alt={`charm ${index}`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {item.message && (
                      <div className="text-sm mt-2">
                        <p className="font-medium text-start text-gray-600">Special Message</p>
                        <p className="italic text-sm text-gray-600">"{item.message}"</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        className="border px-2 rounded text-gray-700"
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        className="border px-2 rounded text-gray-700"
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Section - Only show if cart has items and no error */}
        {!cartError && cartItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-10 pt-6 border-t">
              <div className="flex gap-2 items-center">
                <input 
                  type="checkbox" 
                  className="custom-checkbox" 
                  checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                  onChange={toggleSelectAll}
                />
                <label className="text-sm font-semibold">All</label>
              </div>
              <div className="flex gap-4 items-end">
                <p className="text-lg font-medium">Total</p>
                <p className="text-lg font-bold text-[#b87777]">
                  {formatPrice(calculateTotal())}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Link 
                to="/checkout" 
                state={{ selectedItems: cartItems.filter(item => item.selected) }}
                className="w-full bg-[#e9d8a6] text-gray-800 font-medium py-3 rounded-lg text-lg tracking-wide hover:opacity-90 transition block text-center"
                onClick={() => {
                  const hasSelectedItems = cartItems.some(item => item.selected);
                  if (!hasSelectedItems) {
                    setSnackbarMessage('Please select at least one item to checkout');
                    setSnackbarType('error');
                    setShowSnackbar(true);
                    return false;
                  }
                }}
              >
                Checkout
              </Link>
            </div>
          </>
        )}

        {/* Empty cart state */}
        {!isLoadingCart && cartItems.length === 0 && !cartError && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <img
              src={EMPTY_CART_IMAGE}
              alt="Empty Cart"
              className="w-24 h-24 opacity-60"
              style={{ filter: "grayscale(70%)" }}
            />
            <span className="text-[#b87777] font-semibold text-lg text-center">
              Your cart is empty.
            </span>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[999] bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Item</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setItemToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;