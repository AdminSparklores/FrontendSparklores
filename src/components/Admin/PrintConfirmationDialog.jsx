export default function PrintConfirmationDialog({ onPrintNow, onPrintLater, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg min-w-[320px] max-w-[90vw]">
        <div className="mb-4 font-bold text-lg">Labels Generated</div>
        <div className="mb-6">
          Shipping labels have been successfully generated. Would you like to print them now?
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-medium"
            onClick={onPrintLater}
          >
            Print Later
          </button>
          <button
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white font-semibold"
            onClick={onPrintNow}
          >
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
}