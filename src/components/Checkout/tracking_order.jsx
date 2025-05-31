import React from "react";
import { CheckCircle, MapPin } from "lucide-react";
import product1 from "../../assets/default/homeproduct1.png";
import product2 from "../../assets/default/homeproduct2.png";
import charm1 from "../../assets/charms/charm1.png";
import charm2 from "../../assets/charms/charm2.png";
import charm3 from "../../assets/charms/charm3.png";
import charm4 from "../../assets/charms/charm4.png";
import visaLogo from "../../assets/payment/visa.png";
import check from "../../assets/logo/check.png";
import truck from "../../assets/logo/truck.png";
import map from "../../assets/logo/map.png";



const OrderTrackingPage = () => {
  // Charm data for the bracelet
  const charms = [
    { name: "Charm 1", image: charm1 },
    { name: "Charm 2", image: charm2 },
    { name: "Charm 3", image: charm3 },
    { name: "Charm 4", image: charm4 }
  ];

  // Fake order data for layout
  const timeline = [
    {
      time: "12:05, 28 - 01 - 2024",
      status: "Your jewel is in the packing process"
    },
    {
      time: "11:04, 28 - 01 - 2024",
      status: "We’ve received your order"
    }
  ];

  return (
    <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
      <div className="max-w-7xl mx-auto">
        <nav className="text-sm text-[#d2c7b6] mb-4 font-medium">
          <span>Checkout</span>
          <span className="mx-1">&gt;</span>
          <span>Payment</span>
          <span className="mx-1">&gt;</span>
          <span className="text-[#27211a]">Track my order</span>
        </nav>
        <div className="rounded-2xl border border-[#e8dbc1] bg-[#FFF9F3] shadow-sm p-0 md:p-8">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-[2.5rem] mt-2 px-6 md:px-0 ms-[-0.1rem]">My Order</h2>

          {/* Delivery & Order ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#ebdfc8] px-6 md:px-0">
            <div className="border-e border-[#ebdfc8] py-[1rem]">
              <div className="text-xl md:text-2xl font-semibold mb-1 font-serif">Regular delivery service</div>
              <div className="text-base md:text-lg font-serif">Est. 1 - Feb - 2025</div>
            </div>
            <div className="md:text-start md:pl-8  py-[1rem]">
              <div className="text-xl md:text-2xl font-semibold mb-1 font-serif">Order ID</div>
              <div className="text-base md:text-lg font-serif">#1234567890</div>
            </div>
          </div>

          {/* Payment/Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#ebdfc8] px-6 md:px-0">
            {/* Left: Payment Status */}
            <div className="border-e border-[#ebdfc8] col-span-1 py-7">
              <div className="text-center py-[2rem]">
                <img src={check} alt="check" className="inline h-[3rem] align-middle mb-[1rem]" />
                <p className="text-lg font-bold">Payment Successful</p>
              </div>
              <div className="grid grid-cols-2 justify-between pe-[1.5rem]">
                <div className="col-span-1">
                  <p className="text-[#83807D] mb-[0.3rem]">Paid by</p>
                  <p className="text-[#83807D] mb-[0.3rem]">Order Time</p>
                  <p className="text-[#83807D] mb-[0.3rem]">Payment Time</p>
                </div>
                <div className="col-span-1 text-end">
                  <img src={visaLogo} alt="VISA" className="inline h-5 align-middle mb-[0.3rem]" />
                  <p className="text-[#83807D] mb-[0.3rem]">28-01-2025 11:04</p>
                  <p className="text-[#83807D] mb-[0.3rem]">28-01-2025 11:04</p>
                </div>
              </div>
            </div>
            {/* Right: Shipping To */}
            <div className="col-span-1 gap-1 pt-7">
              <div className="grid grid-cols-7">
                <div className="col-span-1 text-center">
                  <img src={truck} alt="check" className="inline h-[2rem] align-middle mb-[1rem]" />
                </div>
                <div className="col-span-6">
                  <p className="text-2xl font-bold text-[#343131]">Your jewel is in the packing process</p>
                  <p className="text-lg text-[#d0bfa5] mb-2 ml-7 md:ml-0">Will be delivered by 1 Feb 2025</p>
                </div>
              </div>

              <div className="grid grid-cols-7 mt-[1rem]">
                <div className="col-span-1 text-center">
                  <img src={map} alt="check" className="inline h-[2rem] align-middle mb-[1rem]" />
                </div>

                <div className="col-span-6">
                  <p className="text-2xl">Jane Doe <span className="text-gray-500 font-normal ml-2">(+62) 812 345 678 900</span></p>
                   <div className="text-lg mt-2 text-[#564d43]"> Jl. Pahlawan No. 45, RT 05/RW 03, Menteng, Menteng, Jakarta Pusat, DKI Jakarta, 10310 </div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-0">
            {/* Left: Product List */}
            <div className="border-e border-[#ebdfc8] py-[2rem]">
              {/* Product 1 */}
              <div className="flex gap-4 mb-6">
                <img
                  src={product1}
                  alt="Bracelet"
                  className="rounded-xl w-24 h-24 md:w-28 md:h-28 object-cover border border-[#f1e5d1]"
                  style={{ aspectRatio: "1/1" }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-base md:text-lg">Charm Link Custom Bracelet</div>
                  <div className="text-xs text-[#b8ab96] font-medium mb-1">x1</div>
                  <div className="text-base font-medium mb-2">Rp. 369.998,00</div>
                  <div className="text-xs font-semibold">Charm Selection</div>
                  <div className="flex items-center gap-2 mt-1">
                    {charms.map((charm, i) => (
                      <img
                        key={i}
                        src={charm.image}
                        alt={charm.name}
                        className="w-7 h-7 object-contain rounded"
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[#b8ab96]">Special Message</div>
                  <div className="italic text-xs text-[#b8ab96]">"This is for the special message if the user want to send a message to the recipient."</div>
                </div>
              </div>
              {/* Product 2 */}
              <div className="flex gap-4 mb-6">
                <img
                  src={product2}
                  alt="Ring"
                  className="rounded-xl w-24 h-24 md:w-28 md:h-28 object-cover border border-[#f1e5d1]"
                  style={{ aspectRatio: "1/1" }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-base md:text-lg">Marbella Ring</div>
                  <div className="text-xs text-[#b8ab96] font-medium mb-1">x1</div>
                  <div className="text-base font-medium mb-2">Rp. 99.999,00</div>
                </div>
              </div>
              {/* Total */}
              <div className="pt-2 border-t border-[#ebdfc8] text-right font-semibold text-base me-[1rem]">
                <span>Total</span>
                <span className="ml-2 font-serif">Rp. 469.997,00</span>
              </div>
            </div>

            {/* Right: Timeline */}
            <div className="py-[2rem] px-[3rem]">
              <div className="relative ml-4 border-l-2 border-[#e4dac9] h-full flex flex-col">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start mb-8 last:mb-0">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[13px]">
                      <CheckCircle size={22} className="text-[#33a85c] bg-[#fff9f3] rounded-full" />
                    </div>
                    {/* Time/Status */}
                    <div>
                      <div className="ml-6 text-lg font-light text-[#b8ab96]">{item.time}</div>
                      <div className="ml-6 text-xl mt-1">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;