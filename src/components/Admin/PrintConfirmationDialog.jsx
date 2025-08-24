export default function PrintConfirmationDialog({ onPrintNow, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg min-w-[320px] max-w-[90vw]">
        <div className="mb-4 font-bold text-lg">Labels Generated</div>
        <div className="mb-6">
          Shipping labels have been successfully generated. Click below to open them in new tabs.
        </div>
        <div className="flex justify-end">
          <button
            onClick={onPrintNow}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Open Labels in New Tabs
          </button>
        </div>
      </div>
    </div>
  );
}