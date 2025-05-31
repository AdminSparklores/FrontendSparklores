import Footer from '../components/footer.jsx'
import SearchProduct from '../components/Search/search_result.jsx'
import NavBar_Checkout from '../components/Checkout/navbar_checkout.jsx'
import Features from '../components/Home/home_pt4.jsx'


export default function Search() {
    return (
      <>
          <NavBar_Checkout/>
          <SearchProduct/>
          <Features/>
          <Footer />
      </>
    )
  }