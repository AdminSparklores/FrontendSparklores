import Footer from '../components/footer.jsx'
import NavBar_Necklace from '../components/Necklace/navbar_necklace.jsx'
import ProductGrid from '../components/Necklace/product_filter.jsx'


export default function Necklace() {
    return (
      <>
          <NavBar_Necklace/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }