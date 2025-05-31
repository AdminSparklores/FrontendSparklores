import Footer from '../components/footer.jsx'
import NavBar_Anklets from '../components/Anklets/navbar_anklets.jsx'
import ProductGrid from '../components/Anklets/product_filter.jsx'


export default function Anklets() {
    return (
      <>
          <NavBar_Anklets/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }