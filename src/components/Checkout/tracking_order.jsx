import React, { useEffect, useState } from "react";
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
import { trackOrder, fetchOrderDetailsTrack } from "../../utils/api";

const OrderTrackingPage = ({ trackingNumber }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsError, setOrderDetailsError] = useState(null);



  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // First fetch the tracking data
        const trackingData = await trackOrder(trackingNumber);
        setOrderData(trackingData);
        console.log("Fetched tracking data:", trackingData);
        
        // Then fetch the order details using the order ID from tracking data
        if (trackingData.orderid) {
          console.log("Fetching order details for order ID:", trackingData.orderid);
          try {
            const details = await fetchOrderDetailsTrack(trackingData.orderid);
            setOrderDetails(details);
            console.log("Fetched order details:", details);
          } catch (err) {
            console.error("Failed to fetch order details:", err);
            setOrderDetailsError("Order details unavailable - authentication required");
            // Continue even if order details fail - we'll use tracking data
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchOrderData();
    }
  }, [trackingNumber]);


  if (loading) {
    return (
      <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
        <div className="max-w-7xl mx-auto text-center py-20">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
        <div className="max-w-7xl mx-auto text-center py-20 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
        <div className="max-w-7xl mx-auto text-center py-20">
          No order data found for tracking number: {trackingNumber}
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date and time for timeline
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).replace(',', ' -');
  };

  // Format price in Indonesian Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp.');
  };

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
              <div className="text-base md:text-lg font-serif">
                {orderData.detail?.shipped_date ? `Shipped on ${formatDate(orderData.detail.shipped_date)}` : 'Processing'}
              </div>
            </div>
            <div className="md:text-start md:pl-8 py-[1rem]">
              <div className="text-xl md:text-2xl font-semibold mb-1 font-serif">Order ID</div>
              <div className="text-base md:text-lg font-serif">{orderData.orderid || 'N/A'}</div>
            </div>
          </div>

          {/* Payment/Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#ebdfc8] px-6 md:px-0">
            {/* Left: Payment Status */}
            <div className="border-e border-[#ebdfc8] col-span-1 py-7">
              <div className="text-center py-[2rem]">
                <img src={check} alt="check" className="inline h-[3rem] align-middle mb-[0.3rem]" />
                <p className="text-lg font-bold">Payment Successful</p>
              </div>
              <div className="grid grid-cols-2 justify-between pe-[1.5rem]">
                <div className="col-span-1">
                  <p className="text-[#83807D] mb-[0.3rem]">Order Time</p>
                  <p className="text-[#83807D] mb-[0.3rem]">Payment Time</p>
                </div>
                <div className="col-span-1 text-end">
                  {/* Order Time */}
                  <p className="text-[#83807D] mb-[0.3rem]">
                    {orderDetails?.created_at
                      ? formatDateTime(orderDetails.created_at)
                      : orderData.detail?.order_date
                        ? formatDateTime(orderData.detail.order_date)
                        : orderData.detail?.created_at
                          ? formatDateTime(orderData.detail.created_at)
                          : 'N/A'}
                  </p>

                  {/* Payment Time */}
                  <p className="text-[#83807D] mb-[0.3rem]">
                    {orderDetails?.updated_at
                      ? formatDateTime(orderDetails.updated_at)
                      : orderData.detail?.payment_date
                        ? formatDateTime(orderData.detail.payment_date)
                        : orderData.detail?.updated_at
                          ? formatDateTime(orderData.detail.updated_at)
                          : orderData.detail?.shipped_date
                            ? formatDateTime(orderData.detail.shipped_date)
                            : 'N/A'}
                  </p>
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
                  <p className="text-2xl font-bold text-[#343131]">
                    {orderData.history?.[0]?.status || 'Order Processing'}
                  </p>
                  <p className="text-lg text-[#d0bfa5] mb-2 ml-7 md:ml-0">
                    {orderData.detail?.shipped_date ? `Shipped on ${formatDate(orderData.detail.shipped_date)}` : 'Processing'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 mt-[1rem]">
                <div className="col-span-1 text-center">
                  <img src={map} alt="check" className="inline h-[2rem] align-middle mb-[1rem]" />
                </div>

                <div className="col-span-6">
                  <p className="text-2xl">
                    {orderData.detail?.receiver?.name || 'N/A'} 
                    <span className="text-gray-500 font-normal ml-2">
                      {orderData.detail?.receiver?.phone || ''}
                    </span>
                  </p>
                  <div className="text-lg mt-2 text-[#564d43]">
                    {orderData.detail?.receiver?.addr || 'Address not available'}
                    {orderData.detail?.receiver?.city && `, ${orderData.detail.receiver.city}`}
                    {orderData.detail?.receiver?.zipcode && `, ${orderData.detail.receiver.zipcode}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-0">
            {/* Left: Product List */}
            <div className="border-e border-[#ebdfc8] py-[2rem]">
              {/* Product Item */}
              <div className="flex gap-4 mb-6">
                <img
                  src={product1}
                  alt={orderData.detail?.itemname || 'Product'}
                  className="rounded-xl w-24 h-24 md:w-28 md:h-28 object-cover border border-[#f1e5d1]"
                  style={{ aspectRatio: "1/1" }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-base md:text-lg">
                    {orderDetails?.items?.[0]?.product_name || 
                    orderDetails?.items?.[0]?.gift_set_name || 
                    orderData.detail?.itemname || 
                    'Custom Jewelry'}
                  </div>
                  <div className="text-xs text-[#b8ab96] font-medium mb-1">
                    x{orderDetails?.items?.[0]?.quantity || orderData.detail?.qty || 1}
                  </div>
                  {/* Optional: Show item price if available, otherwise omit or estimate */}
                  {/* {orderData.detail?.actual_amount && (
                    <div className="text-base font-medium mb-2">
                      {formatPrice(orderData.detail.actual_amount)}
                    </div>
                  )} */}
                  <div className="text-xs font-semibold">Notes</div>
                  {orderDetails?.items?.map((item, index) => (
                    <div key={index} className="italic text-xs text-[#b8ab96] mb-1">
                      Item {index + 1}: "{item.message || 'No note provided'}"
                    </div>
                  ))}
                  {(!orderDetails?.items || orderDetails.items.length === 0) && (
                    <div className="italic text-xs text-[#b8ab96]">
                      "{orderData.detail?.note || 'No note provided'}"
                    </div>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="pt-2 border-t border-[#ebdfc8] text-right font-semibold text-base me-[1rem]">
                <span>Total</span>
                <span className="ml-2 font-serif">
                  {orderDetails?.total_price
                    ? formatPrice(parseFloat(orderDetails.total_price))
                    : orderData.detail?.total_price
                      ? formatPrice(orderData.detail.total_price)
                      : orderData.detail?.actual_amount
                        ? formatPrice(orderData.detail.actual_amount)
                        : 'N/A'}
                </span>
              </div>
            </div>

            {/* Right: Timeline */}
            <div className="py-[2rem] px-[3rem]">
              <div className="relative ml-4 border-l-2 border-[#e4dac9] h-full flex flex-col">
                {orderData.history?.map((item, idx) => (
                  <div key={idx} className="flex items-start mb-8 last:mb-0">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[13px]">
                      <CheckCircle size={22} className="text-[#33a85c] bg-[#fff9f3] rounded-full" />
                    </div>
                    {/* Time/Status */}
                    <div>
                      <div className="ml-6 text-lg font-light text-[#b8ab96]">
                        {formatDateTime(item.date_time)}
                      </div>
                      <div className="ml-6 text-xl mt-1">
                        {item.status}
                      </div>
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

// USE DUMMY DATA ========================================================================================================
// import React, { useEffect, useState } from "react";
// import { CheckCircle, MapPin } from "lucide-react";
// import product1 from "../../assets/default/homeproduct1.png";
// import product2 from "../../assets/default/homeproduct2.png";
// import charm1 from "../../assets/charms/charm1.png";
// import charm2 from "../../assets/charms/charm2.png";
// import charm3 from "../../assets/charms/charm3.png";
// import charm4 from "../../assets/charms/charm4.png";
// import visaLogo from "../../assets/payment/visa.png";
// import check from "../../assets/logo/check.png";
// import truck from "../../assets/logo/truck.png";
// import map from "../../assets/logo/map.png";
// import { dummyTrackingData } from "../../utils/dummyTrackingData";

// const OrderTrackingPage = ({ trackingNumber }) => {
//   const [orderData, setOrderData] = useState(null);
//   const [loading, setLoading] = useState(false); // Changed to false since we're using dummy data
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Simulate API call with setTimeout
//     const fetchOrderData = async () => {
//       try {
//         setLoading(true);
//         // Simulate network delay
//         await new Promise(resolve => setTimeout(resolve, 500));
//         // Use dummy data instead of API call
//         setOrderData(dummyTrackingData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (trackingNumber) {
//       fetchOrderData();
//     }
//   }, [trackingNumber]);

//   if (loading) {
//     return (
//       <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
//         <div className="max-w-7xl mx-auto text-center py-20">
//           Loading order details...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
//         <div className="max-w-7xl mx-auto text-center py-20 text-red-500">
//           Error: {error}
//         </div>
//       </div>
//     );
//   }

//   if (!orderData) {
//     return (
//       <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
//         <div className="max-w-7xl mx-auto text-center py-20">
//           No order data found
//         </div>
//       </div>
//     );
//   }

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Format date and time for timeline
//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return '';
//     const date = new Date(dateTimeString);
//     return date.toLocaleString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       day: 'numeric',
//       month: 'numeric',
//       year: 'numeric'
//     }).replace(',', ' -');
//   };

//   // Format price in Indonesian Rupiah
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0
//     }).format(price).replace('IDR', 'Rp.');
//   };

//   return (
//     <div className="min-h-screen px-2 py-8 md:px-8 md:py-16 bg-[#FFF9F3]">
//       <div className="max-w-7xl mx-auto">
//         <nav className="text-sm text-[#d2c7b6] mb-4 font-medium">
//           <span>Checkout</span>
//           <span className="mx-1">&gt;</span>
//           <span>Payment</span>
//           <span className="mx-1">&gt;</span>
//           <span className="text-[#27211a]">Track my order</span>
//         </nav>
//         <div className="rounded-2xl border border-[#e8dbc1] bg-[#FFF9F3] shadow-sm p-0 md:p-8">
//           <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-[2.5rem] mt-2 px-6 md:px-0 ms-[-0.1rem]">My Order</h2>

//           {/* Delivery & Order ID */}
//           <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#ebdfc8] px-6 md:px-0">
//             <div className="border-e border-[#ebdfc8] py-[1rem]">
//               <div className="text-xl md:text-2xl font-semibold mb-1 font-serif">Regular delivery service</div>
//               <div className="text-base md:text-lg font-serif">
//                 {orderData.detail?.shipped_date ? `Shipped on ${formatDate(orderData.detail.shipped_date)}` : 'Processing'}
//               </div>
//             </div>
//             <div className="md:text-start md:pl-8 py-[1rem]">
//               <div className="text-xl md:text-2xl font-semibold mb-1 font-serif">Order ID</div>
//               <div className="text-base md:text-lg font-serif">{orderData.orderid || 'N/A'}</div>
//             </div>
//           </div>

//           {/* Payment/Shipping */}
//           <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[#ebdfc8] px-6 md:px-0">
//             {/* Left: Payment Status */}
//             <div className="border-e border-[#ebdfc8] col-span-1 py-7">
//               <div className="text-center py-[2rem]">
//                 <img src={check} alt="check" className="inline h-[3rem] align-middle mb-[1rem]" />
//                 <p className="text-lg font-bold">Payment Successful</p>
//               </div>
//               <div className="grid grid-cols-2 justify-between pe-[1.5rem]">
//                 <div className="col-span-1">
//                   <p className="text-[#83807D] mb-[0.3rem]">Paid by</p>
//                   <p className="text-[#83807D] mb-[0.3rem]">Order Time</p>
//                   <p className="text-[#83807D] mb-[0.3rem]">Payment Time</p>
//                 </div>
//                 <div className="col-span-1 text-end">
//                   <img src={visaLogo} alt="VISA" className="inline h-5 align-middle mb-[0.3rem]" />
//                   <p className="text-[#83807D] mb-[0.3rem]">
//                     {orderData.detail?.shipped_date ? formatDateTime(orderData.detail.shipped_date) : 'N/A'}
//                   </p>
//                   <p className="text-[#83807D] mb-[0.3rem]">
//                     {orderData.detail?.shipped_date ? formatDateTime(orderData.detail.shipped_date) : 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             {/* Right: Shipping To */}
//             <div className="col-span-1 gap-1 pt-7">
//               <div className="grid grid-cols-7">
//                 <div className="col-span-1 text-center">
//                   <img src={truck} alt="check" className="inline h-[2rem] align-middle mb-[1rem]" />
//                 </div>
//                 <div className="col-span-6">
//                   <p className="text-2xl font-bold text-[#343131]">
//                     {orderData.history?.[0]?.status || 'Order Processing'}
//                   </p>
//                   <p className="text-lg text-[#d0bfa5] mb-2 ml-7 md:ml-0">
//                     {orderData.detail?.shipped_date ? `Shipped on ${formatDate(orderData.detail.shipped_date)}` : 'Processing'}
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-7 mt-[1rem]">
//                 <div className="col-span-1 text-center">
//                   <img src={map} alt="check" className="inline h-[2rem] align-middle mb-[1rem]" />
//                 </div>

//                 <div className="col-span-6">
//                   <p className="text-2xl">
//                     {orderData.detail?.receiver?.name || 'N/A'} 
//                     <span className="text-gray-500 font-normal ml-2">
//                       {orderData.detail?.receiver?.phone || ''}
//                     </span>
//                   </p>
//                   <div className="text-lg mt-2 text-[#564d43]">
//                     {orderData.detail?.receiver?.addr || 'Address not available'}
//                     {orderData.detail?.receiver?.city && `, ${orderData.detail.receiver.city}`}
//                     {orderData.detail?.receiver?.zipcode && `, ${orderData.detail.receiver.zipcode}`}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-0">
//             {/* Left: Product List */}
//             <div className="border-e border-[#ebdfc8] py-[2rem]">
//               {/* Product Item */}
//               <div className="flex gap-4 mb-6">
//                 <img
//                   src={product1}
//                   alt={orderData.detail?.itemname || 'Product'}
//                   className="rounded-xl w-24 h-24 md:w-28 md:h-28 object-cover border border-[#f1e5d1]"
//                   style={{ aspectRatio: "1/1" }}
//                 />
//                 <div className="flex-1">
//                   <div className="font-semibold text-base md:text-lg">
//                     {orderData.detail?.itemname || 'Product'}
//                   </div>
//                   <div className="text-xs text-[#b8ab96] font-medium mb-1">
//                     x{orderData.detail?.qty || 1}
//                   </div>
//                   <div className="text-base font-medium mb-2">
//                     {formatPrice(orderData.detail?.actual_amount || 0)}
//                   </div>
//                   <div className="text-xs font-semibold">Note</div>
//                   <div className="italic text-xs text-[#b8ab96]">
//                     "{orderData.detail?.note || 'No note provided'}"
//                   </div>
//                 </div>
//               </div>
              
//               {/* Total */}
//               <div className="pt-2 border-t border-[#ebdfc8] text-right font-semibold text-base me-[1rem]">
//                 <span>Total</span>
//                 <span className="ml-2 font-serif">
//                   {formatPrice(orderData.detail?.actual_amount || 0)}
//                 </span>
//               </div>
//             </div>

//             {/* Right: Timeline */}
//             <div className="py-[2rem] px-[3rem]">
//               <div className="relative ml-4 border-l-2 border-[#e4dac9] h-full flex flex-col">
//                 {orderData.history?.map((item, idx) => (
//                   <div key={idx} className="flex items-start mb-8 last:mb-0">
//                     {/* Timeline Dot */}
//                     <div className="absolute -left-[13px]">
//                       <CheckCircle size={22} className="text-[#33a85c] bg-[#fff9f3] rounded-full" />
//                     </div>
//                     {/* Time/Status */}
//                     <div>
//                       <div className="ml-6 text-lg font-light text-[#b8ab96]">
//                         {formatDateTime(item.date_time)}
//                       </div>
//                       <div className="ml-6 text-xl mt-1">
//                         {item.status}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderTrackingPage;