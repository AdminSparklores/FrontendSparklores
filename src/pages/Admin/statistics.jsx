import AdminLayout from "../../components/Admin/AdminLayout";
import { useState, useEffect } from "react";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";

export default function AdminStatistics() {
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://sparkloreofficial.com/api/orders/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrdersData(data);
      processData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (orders) => {
    // Group orders by date and calculate total sales
    const salesByDate = {};
    let totalRev = 0;
    let pendingCount = 0;

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const dateStr = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      const price = parseFloat(order.total_price);
      totalRev += price;
      
      if (order.payment_status === 'pending') {
        pendingCount++;
      }

      if (salesByDate[dateStr]) {
        salesByDate[dateStr].sales += price;
        salesByDate[dateStr].timestamp = Math.min(salesByDate[dateStr].timestamp, date.getTime());
      } else {
        salesByDate[dateStr] = {
          sales: price,
          timestamp: date.getTime()
        };
      }
    });

    // Convert to array and sort by timestamp (oldest to newest for left to right)
    const chartData = Object.keys(salesByDate)
      .map(date => ({
        date,
        sales: salesByDate[date].sales,
        timestamp: salesByDate[date].timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    setSalesData(chartData);
    setStats({
      totalRevenue: totalRev,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? totalRev / orders.length : 0,
      pendingOrders: pendingCount
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Calculate chart dimensions and scales
  const getChartPoints = () => {
    if (salesData.length === 0) return { points: '', maxY: 0, lines: [] };
    
    const width = 1200;
    const height = 500;
    const padding = 80;
    
    const maxSales = Math.max(...salesData.map(d => d.sales));
    const minSales = Math.min(...salesData.map(d => d.sales));
    const yRange = maxSales - minSales || maxSales || 1;
    
    const xStep = (width - padding * 2) / (salesData.length - 1 || 1);
    
    const points = salesData.map((d, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((d.sales - minSales) / yRange) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
    
    // Generate grid lines
    const gridLines = [];
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding + (i * (height - padding * 2) / ySteps);
      const value = maxSales - (i * yRange / ySteps);
      gridLines.push({ y, value });
    }
    
    return { points, maxY: maxSales, gridLines, width, height, padding, xStep };
  };

  const chartData = getChartPoints();

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="mx-auto max-w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-[#bfa170]">Sales Analytics</h1>
              <p className="text-gray-600 text-sm mt-1">Monitor your daily sales performance</p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-[#e5cfa4] hover:bg-[#d1b98a] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
            >
              {loading ? '⟳ Loading...' : '↻ Refresh'}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl border border-[#e5cfa4] shadow p-12 text-center">
              <div className="text-[#bfa170] text-lg">Loading data...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
              <p className="text-red-800">
                <strong>Error:</strong> {error}
              </p>
              <button
                onClick={fetchOrders}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow border border-[#e5cfa4] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#bfa170] mt-2">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-[#f8f4ed] p-3 rounded-full">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-[#e5cfa4] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-[#bfa170] mt-2">
                        {stats.totalOrders}
                      </p>
                    </div>
                    <div className="bg-[#f8f4ed] p-3 rounded-full">
                      <span className="text-2xl">🛒</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-[#e5cfa4] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Avg Order Value</p>
                      <p className="text-2xl font-bold text-[#bfa170] mt-2">
                        {formatCurrency(stats.avgOrderValue)}
                      </p>
                    </div>
                    <div className="bg-[#f8f4ed] p-3 rounded-full">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-[#e5cfa4] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
                      <p className="text-2xl font-bold text-[#bfa170] mt-2">
                        {stats.pendingOrders}
                      </p>
                    </div>
                    <div className="bg-[#f8f4ed] p-3 rounded-full">
                      <span className="text-2xl">⏳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border border-[#e5cfa4] shadow p-8 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#bfa170]">Daily Sales Trend</h2>
                  <p className="text-gray-600 text-sm mt-1">Track your sales performance over time (hover over points for details)</p>
                </div>
                
                {salesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <svg 
                      width={chartData.width} 
                      height={chartData.height}
                      className="mx-auto"
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Grid lines */}
                      {chartData.gridLines.map((line, i) => (
                        <g key={i}>
                          <line
                            x1={chartData.padding}
                            y1={line.y}
                            x2={chartData.width - chartData.padding}
                            y2={line.y}
                            stroke="#e5e7eb"
                            strokeDasharray="5,5"
                            strokeWidth="1"
                          />
                          <text
                            x={chartData.padding - 15}
                            y={line.y + 5}
                            textAnchor="end"
                            className="text-sm fill-gray-600 font-medium"
                          >
                            {(line.value / 1000).toFixed(0)}K
                          </text>
                        </g>
                      ))}
                      
                      {/* X-axis labels */}
                      {salesData.map((d, i) => (
                        <text
                          key={i}
                          x={chartData.padding + i * chartData.xStep}
                          y={chartData.height - chartData.padding + 30}
                          textAnchor="middle"
                          className="text-sm fill-gray-600 font-medium"
                        >
                          {d.date}
                        </text>
                      ))}
                      
                      {/* Area under line (gradient fill) */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#bfa170" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#bfa170" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      
                      <polygon
                        points={`${chartData.padding},${chartData.height - chartData.padding} ${chartData.points} ${chartData.width - chartData.padding},${chartData.height - chartData.padding}`}
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Line */}
                      <polyline
                        points={chartData.points}
                        fill="none"
                        stroke="#bfa170"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points */}
                      {salesData.map((d, i) => {
                        const x = chartData.padding + i * chartData.xStep;
                        const maxSales = Math.max(...salesData.map(d => d.sales));
                        const minSales = Math.min(...salesData.map(d => d.sales));
                        const yRange = maxSales - minSales || maxSales || 1;
                        const y = chartData.height - chartData.padding - ((d.sales - minSales) / yRange) * (chartData.height - chartData.padding * 2);
                        const isHovered = hoveredPoint === i;
                        
                        return (
                          <g key={i}>
                            {/* Hover area (invisible larger circle for easier interaction) */}
                            <circle
                              cx={x}
                              cy={y}
                              r="20"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredPoint(i)}
                            />
                            
                            {/* Vertical line on hover */}
                            {isHovered && (
                              <>
                                <line
                                  x1={x}
                                  y1={chartData.padding}
                                  x2={x}
                                  y2={chartData.height - chartData.padding}
                                  stroke="#bfa170"
                                  strokeWidth="2"
                                  strokeDasharray="5,5"
                                  opacity="0.5"
                                />
                                
                                {/* Tooltip */}
                                <g>
                                  <rect
                                    x={x - 100}
                                    y={y - 80}
                                    width="200"
                                    height="70"
                                    fill="white"
                                    stroke="#e5cfa4"
                                    strokeWidth="2"
                                    rx="8"
                                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                                  />
                                  <text
                                    x={x}
                                    y={y - 55}
                                    textAnchor="middle"
                                    className="text-sm fill-gray-600 font-medium"
                                  >
                                    {d.date}
                                  </text>
                                  <text
                                    x={x}
                                    y={y - 30}
                                    textAnchor="middle"
                                    className="text-lg fill-[#bfa170] font-bold"
                                  >
                                    {formatCurrency(d.sales)}
                                  </text>
                                </g>
                              </>
                            )}
                            
                            {/* Outer circle (glow effect on hover) */}
                            {isHovered && (
                              <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill="#bfa170"
                                opacity="0.2"
                                className="animate-pulse"
                              />
                            )}
                            
                            {/* Main circle */}
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? "8" : "6"}
                              fill="white"
                              stroke="#bfa170"
                              strokeWidth={isHovered ? "4" : "3"}
                              className="cursor-pointer transition-all duration-200"
                              onMouseEnter={() => setHoveredPoint(i)}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No sales data available
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}