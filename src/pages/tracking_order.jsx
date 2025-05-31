import Footer from '../components/footer.jsx'
import OrderTrackingPage from '../components/Checkout/tracking_order.jsx'
import NavBar_Checkout from '../components/Checkout/navbar_checkout.jsx'


export default function TrackingOrder() {
    return (
      <>
          <NavBar_Checkout/>
          <OrderTrackingPage/>
          {/* <Footer /> */}
      </>
    )
  }