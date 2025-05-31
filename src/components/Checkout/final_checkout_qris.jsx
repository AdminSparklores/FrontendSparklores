import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dummyQR from "../../assets/default/qris_dummy.jpg";

const QR_TIMEOUT = 10 * 60; // 10 minutes in seconds

function QRISPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;
  const [remaining, setRemaining] = useState(QR_TIMEOUT);
  const qrRef = useRef();

  useEffect(() => {
    const timer = setInterval(() => setRemaining(r => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2,"0");
    const s = String(sec % 60).padStart(2,"0");
    return `${m}:${s}`;
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
    { label: "Shipping", value: orderDetails.shippingCost }
  ];
  const totalPayment = orderDetails.total;

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = dummyQR;
    link.download = "qris_sparklore.png";
    link.click();
  };

  return (
    <div className="min-h-min bg-[#fdfaf5] px-2 py-8 font-serif text-[#3a2e2a] flex items-center justify-center">
      <div className="w-full max-w-5xl bg-[#fffaf3] border border-[#f4e8d7] p-0 md:p-10 rounded-2xl shadow-md flex flex-col md:flex-row gap-0 md:gap-10">
        {/* Left Column: QR and Info */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
          <h1 className="text-2xl font-bold mb-4 text-center">QRIS Payment</h1>
          <div className="text-lg font-semibold mb-1 text-center">Scan QR Code to Pay</div>
          <div className="mb-4 text-[#a16207] text-sm text-center">
            Pay before: <span className="font-semibold">{formatTime(remaining)}</span>
          </div>
          <img
            ref={qrRef}
            src={dummyQR}
            alt="QRIS"
            className="w-60 h-60 object-contain rounded-lg border border-[#e3d5c5] bg-white shadow-lg mx-auto"
          />
          <button
            className="mt-5 px-4 py-2 bg-[#e9d6a9] border rounded hover:bg-[#e3c990] transition font-medium"
            onClick={handleDownloadQR}
          >
            Download QRIS
          </button>
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
          <div className="border-t pt-2 space-y-2 text-sm">
            {priceBreakdown.map((x, i) => (
              <div key={i} className="flex justify-between">
                <span>{x.label}</span>
                <span className={x.value < 0 ? "text-green-700" : ""}>
                  {x.value < 0 ? "-" : ""}
                  Rp. {Math.abs(x.value).toLocaleString('id-ID')},00
                </span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>Rp. {totalPayment.toLocaleString('id-ID')},00</span>
            </div>
          </div>
          {/* <div className="text-center mt-8">
            <button
              className="px-6 py-2 rounded bg-[#b87777] text-white font-medium hover:bg-[#a16207] transition"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default QRISPage;