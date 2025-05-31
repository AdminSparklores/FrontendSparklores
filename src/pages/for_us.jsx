import Footer from '../components/footer.jsx'
import NavBar_ForUs from '../components/ForUs/navbar_forus.jsx'
import ProductGrid from '../components/ForUs/product_filter.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';


export default function ForUs() {
    return (
      <>
        <ScrollToTop />
        <NavBar_ForUs/>
        <ProductGrid/>
        <Footer />
      </>
    )
  }