export default function StatusFilterBar({ status, setStatus, orderStatus }) {
  return (
    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
      {orderStatus.map(opt => (
        <button
          key={opt.value}
          className={`px-4 py-1 rounded whitespace-nowrap ${status === opt.value
            ? "bg-[#e5cfa4] text-white font-bold"
            : "bg-gray-100 text-[#bfa170]"} `}
          onClick={() => setStatus(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}