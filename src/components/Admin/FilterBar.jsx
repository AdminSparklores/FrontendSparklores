import { useState } from "react";

export default function FilterBar({ 
  onDateFilter, 
  onSearch, 
  onReset,
  searchQuery 
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApplyDateFilter = () => {
    if (startDate || endDate) {
      onDateFilter(startDate, endDate);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-[#e5cfa4] mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Date Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleApplyDateFilter}
            className="bg-[#e5cfa4] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#d6c095]"
          >
            Apply Date Filter
          </button>
          
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300"
          >
            Reset All
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col ml-auto">
          <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="border border-gray-300 rounded-l px-3 py-2 text-sm w-64"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r text-sm hover:bg-gray-300"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      
      {(startDate || endDate || searchQuery) && (
        <div className="mt-3 text-sm text-gray-600">
          Active filters: 
          {startDate && <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">From: {startDate}</span>}
          {endDate && <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">To: {endDate}</span>}
          {searchQuery && <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Search: "{searchQuery}"</span>}
        </div>
      )}
    </div>
  );
}