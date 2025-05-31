import RefundPolicy from '../components/refund.jsx';
import Footer from '../components/footer.jsx'
import NavBar from '../components/Home/navbar.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';


export default function RefundPage() {
    return (
      <>
        <ScrollToTop />
        <NavBar/>
        <RefundPolicy/>
        <Footer />
      </>
    )
  }