import React from "react";

export default function StatusBadge({ type }) {
  const map = {
    "pending": { color: "bg-yellow-200 text-yellow-800", label: "Pending" },
    "paid": { color: "bg-green-200 text-green-800", label: "Paid" },
    "Being packed": { color: "bg-blue-100 text-blue-800", label: "Being packed" },
    "On delivery": { color: "bg-indigo-100 text-indigo-800", label: "On delivery" },
    "Arrived successfully": { color: "bg-green-100 text-green-800", label: "Arrived" },
    "Cancelled": { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };
  if (!map[type]) return null;
  return (
    <span className={`inline-block ml-2 px-2 py-1 rounded-full text-xs ${map[type].color}`}>
      {map[type].label}
    </span>
  );
}