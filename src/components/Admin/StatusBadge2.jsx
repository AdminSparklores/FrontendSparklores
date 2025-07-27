// In StatusBadge2.js
export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase();
  
  const statusConfig = {
    "pending": { color: "bg-yellow-100 text-yellow-800", label: "Awaiting Shipment" },
    "awaiting_shipment": { color: "bg-yellow-100 text-yellow-800", label: "Awaiting Shipment" },
    "collection": { color: "bg-blue-100 text-blue-800", label: "Collection" },
    "on_shipment": { color: "bg-purple-100 text-purple-800", label: "On Shipment" },
    "shipped": { color: "bg-green-100 text-green-800", label: "Shipped" },
  };

  const config = statusConfig[normalizedStatus] || 
                { color: "bg-gray-100 text-gray-800", label: status };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>
      {config.label}
    </span>
  );
}