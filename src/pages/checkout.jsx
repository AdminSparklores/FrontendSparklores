import Footer from '../components/footer.jsx'
import CheckoutPage from '../components/Checkout/checkout.jsx'
import NavBar_Checkout from '../components/Checkout/navbar_checkout.jsx'



export default function Checkout() {
    return (
      <>
          <NavBar_Checkout/>
          <CheckoutPage/>
          <Footer />
      </>
    )
  }