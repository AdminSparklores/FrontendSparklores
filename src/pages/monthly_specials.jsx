import Footer from '../components/footer.jsx'
import NavBar_MonthlySpecials from '../components/MonthlySpecials/navbar_monthlyspecials.jsx'
import ProductGrid from '../components/MonthlySpecials/product_filter.jsx'


export default function MonthlySpecials() {
    return (
      <>
          <NavBar_MonthlySpecials/>
          <ProductGrid/>
          <Footer />
      </>
    )
  }