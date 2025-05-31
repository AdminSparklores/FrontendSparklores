import Footer from '../components/footer.jsx'
import NavBar_ForHim from '../components/ForHim/navbar_forhim.jsx'
import ProductGrid from '../components/ForHim/product_filter.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';


export default function ForHim() {
    return (
      <>
        <ScrollToTop />
        <NavBar_ForHim/>
        <ProductGrid/>
        <Footer />
      </>
    )
  }