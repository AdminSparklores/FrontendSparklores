import Footer from '../components/footer.jsx'
import NavBar_Charms from '../components/Charms/navbar_charms.jsx'
import ProductGrid from '../components/Charms/product_filter.jsx'


export default function Charms() {
    return (
      <>
          <NavBar_Charms/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }