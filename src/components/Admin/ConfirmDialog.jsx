import React from "react";

export default function ConfirmDialog({ message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg border border-[#e5cfa4]">
        <div className="mb-4 text-lg">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onCancel}
          >Cancel</button>
          <button
            className="px-4 py-2 rounded bg-[#e5cfa4] text-white"
            onClick={onConfirm}
          >Yes, Confirm</button>
        </div>
      </div>
    </div>
  );
}