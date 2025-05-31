import Footer from '../components/footer.jsx'
import NavBar_Earrings from '../components/Earrings/navbar_earrings.jsx'
import ProductGrid from '../components/Earrings/product_filter.jsx'


export default function Earrings() {
    return (
      <>
          <NavBar_Earrings/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }