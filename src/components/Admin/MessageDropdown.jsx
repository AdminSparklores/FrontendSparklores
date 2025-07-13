import { useState } from "react";

export default function MessageDropdown({ message }) {
  const [open, setOpen] = useState(false);

  if (!message || message.length === 0) {
    return (
      <div className="bg-gray-100 text-gray-400 rounded px-2 py-1 text-xs text-center">No Messages</div>
    );
  }

  return (
    <div className="relative">
      <button
        className="underline text-[#bfa170] text-xs"
        onClick={() => setOpen(o => !o)}
      >
        View Message
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-20 bg-white border shadow-lg p-3 rounded min-w-[180px] text-sm">
          {message}
          <div className="flex justify-end mt-2">
            <button className="text-xs text-[#bfa170]" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}