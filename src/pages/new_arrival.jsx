import Footer from '../components/footer.jsx'
import NavBar_NewArrival from '../components/NewArrival/navbar_newarrival.jsx'
import ProductGrid from '../components/NewArrival/product_filter.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';


export default function NewArrival() {
    return (
      <>
        <ScrollToTop />
        <NavBar_NewArrival/>
        <ProductGrid/>
        <Footer />
      </>
    )
  }