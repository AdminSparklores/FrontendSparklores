export const STATUS_MAP = {
  "pending": { color: "bg-yellow-100 text-yellow-800", label: "Awaiting Shipment" },
  "collection": { color: "bg-blue-100 text-blue-800", label: "Collection" },
  "on_shipment": { color: "bg-indigo-100 text-indigo-800", label: "On Shipment" },
  "shipped": { color: "bg-green-100 text-green-800", label: "Shipped" },
};

export default function StatusBadge2({ status }) {
  const s = STATUS_MAP[status] || { color: "bg-gray-100 text-gray-800", label: status };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${s.color}`}>
      {s.label}
    </span>
  );
}