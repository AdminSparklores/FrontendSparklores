import NavBar from '../components/Home/navbar.jsx'
import MovingBanner from '../components/moving_banner.jsx'
import BannerHome from '../components/Home/banner_image_home.jsx'
import HomePart1 from '../components/Home/home_pt1.jsx'
import HomePart2 from '../components/Home/home_pt2.jsx'
import HomePart3 from '../components/Home/home_pt3.jsx'
import Features from '../components/Home/home_pt4.jsx'
import VideoCarousel from '../components/Home/home_pt5.jsx'
import Reviews from '../components/Home/home_pt6.jsx'
import JewelryGallery from '../components/Home/home_pt7.jsx'
import Footer from '../components/footer.jsx'


export default function Home() {
  return (
    <>
        <NavBar />
        <MovingBanner />
        <BannerHome/>
        <HomePart1/>
        <HomePart2/>
        <HomePart3/>
        <Features/>
        <VideoCarousel/>
        <Reviews/>
        <JewelryGallery/>
        <Footer />
    </>
  )
}