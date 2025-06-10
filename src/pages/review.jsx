import RefundPolicy from '../components/refund.jsx';
import Footer from '../components/footer.jsx'
import NavBar from '../components/Home/navbar.jsx'
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';
import ReviewPage from '../components/review.jsx';


export default function UserReviewPage() {
    return (
      <>
        <ScrollToTop />
        <NavBar/>
        <ReviewPage/>
        <Footer />
      </>
    )
  }