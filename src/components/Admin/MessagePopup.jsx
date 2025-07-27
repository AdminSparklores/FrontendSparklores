export default function MessagePopup({ items, onClose }) {
  // Filter out items without messages
  const messages = items.filter(item => item.message);
  
  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div className="mb-4 font-bold text-lg">Customer Messages</div>
        
        {messages.length === 0 ? (
          <div className="mb-6 p-4 bg-gray-50 rounded text-center text-gray-500">
            No messages for this order
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded">
                <div className="font-medium mb-2">
                  {item.product_name || item.gift_set_name || "Custom Charm"}
                </div>
                <div className="text-gray-700">
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-5">
          <button 
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}