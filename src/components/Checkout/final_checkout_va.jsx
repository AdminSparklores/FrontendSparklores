import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, CheckCircle } from "lucide-react";

const VA_NUMBER = "1234567890123456"; // Dummy VA number
const ADMIN_FEE = 4000; // Example admin fee
const EXPIRE_HOURS = 24;

const paymentGuides = [
  {
    title: "ATM BCA",
    steps: [
      "Masukkan kartu ATM dan PIN.",
      "Pilih menu Transaksi Lainnya.",
      "Pilih Transfer > Ke Rekening Virtual Account.",
      "Masukkan nomor Virtual Account.",
      "Masukkan jumlah pembayaran.",
      "Konfirmasi dan selesaikan transaksi."
    ]
  },
  {
    title: "BCA Mobile",
    steps: [
      "Login ke BCA Mobile.",
      "Pilih m-Transfer > Transfer ke BCA Virtual Account.",
      "Masukkan nomor Virtual Account.",
      "Masukkan jumlah pembayaran.",
      "Konfirmasi dan selesaikan transaksi."
    ]
  },
  {
    title: "Internet Banking",
    steps: [
      "Login ke KlikBCA.",
      "Pilih Transfer Dana > Transfer ke BCA Virtual Account.",
      "Masukkan nomor Virtual Account.",
      "Masukkan jumlah pembayaran.",
      "Konfirmasi dan selesaikan transaksi."
    ]
  }
];

function VirtualAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(EXPIRE_HOURS * 60 * 60); // in seconds
  const [status, setStatus] = useState("Not Paid"); // You can implement polling to API to update this

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Dummy confirmation id for popup
  const confirmationId = "PAYCONF123456789";

  useEffect(() => {
    const timer = setInterval(() => setRemaining(r => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = sec => {
    const h = String(Math.floor(sec / 3600)).padStart(2,"0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2,"0");
    const s = String(sec % 60).padStart(2,"0");
    return `${h}:${m}:${s}`;
  };

  if (!orderDetails) {
    return (
      <div className="min-h-min flex items-center justify-center bg-[#fdfaf5]">
        <div className="text-center">No order details found.</div>
      </div>
    );
  }

  const priceBreakdown = [
    { label: "Subtotal", value: orderDetails.subtotal },
    ...(orderDetails.discount > 0
      ? [{ label: "Discount", value: -orderDetails.discount }]
      : []),
    { label: "Shipping", value: orderDetails.shippingCost },
    { label: "Admin Fee", value: ADMIN_FEE }
  ];
  const totalPayment = orderDetails.total + ADMIN_FEE;

  return (
    <div className="min-h-min bg-[#fdfaf5] px-2 py-8 font-serif text-[#3a2e2a] flex items-center justify-center">
      {/* Modern, Simple, Aesthetic Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full px-8 py-10 flex flex-col items-center relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close"
              onClick={() => setShowPopup(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <CheckCircle size={52} className="text-[#33a85c] mb-4 drop-shadow-glow" />
            <h2 className="text-2xl font-bold mb-2 text-[#23201a] tracking-wide text-center">Thank you for your purchase!</h2>
            <p className="text-[#6bbf7e] font-semibold mb-1 text-base">Payment Completed</p>
            <div className="rounded-xl w-full bg-[#f8f6f1] p-3 flex flex-col items-center mb-4 mt-2 border border-[#f2e9d5]">
              <span className="text-xs text-gray-500 mb-1">Confirmation ID</span>
              <span className="font-mono text-base font-semibold text-[#b87777] tracking-widest">{confirmationId}</span>
            </div>
            <div className="w-full flex justify-between items-center text-sm mb-6 text-gray-800">
              <span className="font-light">Total Paid</span>
              <span className="font-bold text-[#b87777] text-base">
                Rp. {totalPayment.toLocaleString('id-ID')},00
              </span>
            </div>
            <button
              className="w-full mt-2 bg-[#b87777] hover:bg-[#a16207] text-white font-semibold px-6 py-2 rounded-lg transition text-base shadow-md"
              onClick={() => {
                setShowPopup(false);
                navigate("/track-order");
              }}
            >
              Go to Track Order
            </button>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(32px);}
              to { opacity: 1; transform: translateY(0);}
            }
            .animate-fadeIn { animation: fadeIn 0.32s cubic-bezier(.4,0,.2,1); }
            .drop-shadow-glow { filter: drop-shadow(0 0 12px #e7ffef66); }
          `}</style>
        </div>
      )}

      <div className="w-full max-w-5xl bg-[#fffaf3] border border-[#f4e8d7] p-0 md:p-10 rounded-2xl shadow-md flex flex-col md:flex-row gap-0 md:gap-10">
        {/* Left Column: Payment Info */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <h1 className="text-2xl font-bold mb-4">Virtual Account Payment</h1>
          <div className="mb-4">
            <span className={`px-4 py-1 rounded-full text-white text-sm font-medium ${status === "Paid" ? "bg-blue-600" : "bg-yellow-600"}`}>
              Status: {status}
            </span>
          </div>
          <div className="bg-[#f9f2e6] rounded-xl p-5 flex flex-col items-center mb-6">
            <div className="text-lg font-semibold">Total Payment</div>
            <div className="text-3xl font-bold text-[#b87777] my-2">
              Rp. {totalPayment.toLocaleString('id-ID')},00
            </div>
            <div className="text-sm text-gray-600 mb-1">+ Admin Fee: Rp. {ADMIN_FEE.toLocaleString('id-ID')},00</div>
            <div className="text-xs text-[#a16207]">
              Pay before: <span className="font-semibold">{formatTime(remaining)}</span>
            </div>
          </div>
          <div className="mb-5">
            <div className="text-center text-md mb-1">Virtual Account Number</div>
            <div className="flex items-center justify-center mb-2">
              <span className="font-mono border border-[#e3d5c5] bg-white rounded-md px-4 py-2 text-lg">{VA_NUMBER}</span>
              <button
                className="ml-3 px-2 py-1 bg-[#e9d6a9] border rounded hover:bg-[#e3c990] transition"
                onClick={() => {
                  navigator.clipboard.writeText(VA_NUMBER);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                title="Copy VA Number"
              >
                <Copy className="w-5 h-5 inline" /> {copied && <span className="ml-1 text-green-700 font-semibold">Copied!</span>}
              </button>
            </div>
          </div>
          {/* Payment Guides */}
          <div className="mb-2">
            <h2 className="font-semibold text-lg mb-2">Panduan Pembayaran</h2>
            <div className="grid grid-cols-1 gap-2">
              {paymentGuides.map((guide, i) => (
                <details key={i} className="mb-2 border rounded-lg bg-[#f8f4ed]">
                  <summary className="cursor-pointer px-4 py-2 font-medium bg-[#f5e8d2] rounded-t-lg">{guide.title}</summary>
                  <ul className="px-6 py-2 list-decimal text-sm">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="mb-1">{step}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              className="bg-[#b87777] hover:bg-[#a16207] text-white font-semibold px-6 py-2 rounded-lg transition text-base shadow"
              onClick={() => setShowPopup(true)}
            >
              Check Payment Status
            </button>
          </div>
        </div>
        {/* Right Column: Order Summary */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-[#f4e8d7] bg-[#fcf7ee] rounded-b-2xl md:rounded-b-none md:rounded-r-2xl px-6 py-8">
          <h3 className="font-semibold text-lg mb-4">Order Details</h3>
          <div className="space-y-4 mb-1">
            {orderDetails.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 border-b pb-2">
                <img
                  src={item.image || "/default-product.png"}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border bg-white"
                  onError={e => { e.target.onerror = null; e.target.src = "/default-product.png"; }}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  {item.quantity > 1 && <div className="text-xs text-gray-500">x{item.quantity}</div>}
                </div>
                <div>Rp. {(item.price * item.quantity).toLocaleString('id-ID')},00</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1 text-sm">
            {priceBreakdown.map((x, i) => (
              <div key={i} className="flex justify-between">
                <span>{x.label}</span>
                <span className={x.value < 0 ? "text-green-700" : ""}>
                  {x.value < 0 ? "-" : ""}
                  Rp. {Math.abs(x.value).toLocaleString('id-ID')},00
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>Rp. {totalPayment.toLocaleString('id-ID')},00</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(32px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn { animation: fadeIn 0.32s cubic-bezier(.4,0,.2,1); }
        .drop-shadow-glow { filter: drop-shadow(0 0 12px #e7ffef66); }
      `}</style>
    </div>
  );
}

export default VirtualAccountPage;