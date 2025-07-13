export default function ConfirmDialog({ message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e5cfa4] min-w-[320px] max-w-[90vw]">
        <div className="mb-4 text-base text-[#bfa170] font-medium">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white font-semibold hover:bg-[#d4bf94] transition"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}