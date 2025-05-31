import Footer from '../components/footer.jsx'
import NavBar_Bracelet from '../components/Bracelet/navbar_bracelet.jsx'
import ProductGrid from '../components/Bracelet/product_filter.jsx'


export default function Bracelets() {
    return (
      <>
          <NavBar_Bracelet/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }