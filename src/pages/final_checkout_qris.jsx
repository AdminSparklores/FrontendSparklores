import Footer from '../components/footer.jsx'
import NavBar_Checkout from '../components/Checkout/navbar_checkout.jsx'
import QRISPage from '../components/Checkout/final_checkout_qris.jsx'



export default function FinalCheckoutQRISPage() {
    return (
      <>
          <NavBar_Checkout/>
          <QRISPage/>
          {/* <Footer /> */}
      </>
    )
  }