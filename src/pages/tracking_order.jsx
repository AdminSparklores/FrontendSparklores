import Footer from '../components/footer.jsx'
import OrderTrackingPage from '../components/Checkout/tracking_order.jsx'
import NavBar_Checkout from '../components/Checkout/navbar_checkout.jsx'
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TrackingOrder() {
  const { trackingNumber } = useParams();
  return (
    <>
      <NavBar_Checkout/>
      <OrderTrackingPage trackingNumber={trackingNumber}/>
    </>
  )
}