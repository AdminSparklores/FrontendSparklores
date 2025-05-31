import Footer from '../components/footer.jsx'
import NavBar_JewelSet from '../components/JewelSet/navbar_jewelset.jsx'
import ProductGrid from '../components/JewelSet/product_filter.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';


export default function JewelSet() {
    return (
      <>
        <ScrollToTop />
        <NavBar_JewelSet/>
        <ProductGrid/>
        <Footer />
      </>
    )
  }