import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/home.jsx'
import Charmbar from './pages/charmbar.jsx'
import Charms from './pages/charms.jsx'
import GiftSets from './pages/gift_sets.jsx'
import Anklets from './pages/anklets.jsx'
import Rings from './pages/rings.jsx'
import Earrings from './pages/earrings.jsx'
import Bracelets from './pages/bracelets.jsx'
import Necklaces from './pages/necklaces.jsx'
import DetailPage from './pages/detail_page';
import DetailPageCharm from './pages/detail_page_charm';
import Login from './pages/login.jsx';
import OTPCode from './pages/otpcode.jsx';
import NotFound from './pages/not_found.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Checkout from './pages/checkout.jsx'
import FinalCheckoutPage from './pages/final_checkout.jsx'
import TrackingOrder from './pages/tracking_order.jsx'
import NewArrival from './pages/new_arrival.jsx'
import Search from './pages/search.jsx'
import JewelSet from './pages/jewelset.jsx'
import ForUs from './pages/for_us.jsx'
import ForHim from './pages/for_him.jsx'
import ForHer from './pages/for_her.jsx'
import FaqRefundPage from './pages/faq.jsx'
import FaqPage from './pages/faq.jsx'
import RefundPage from './pages/refund.jsx'
import DetailPageSets from './pages/detail_page_sets.jsx'
import MonthlySpecials from './pages/monthly_specials.jsx'
import FinalCheckoutQRISPage from './pages/final_checkout_qris.jsx'
import FinalCheckoutVAPage from './pages/final_checkout _va.jsx'
import DetailPageJewelSets from './pages/detail_page_jewelsets.jsx'
import UserReviewPage from './pages/review.jsx'

const router = createBrowserRouter([
  {path:"/", element: <Home/>},
  {path:"/charmbar", element: <Charmbar/>},
  {path:"/charms", element: <Charms/>},
  {path:"/giftsets", element: <GiftSets/>},
  {path:"/anklets", element: <Anklets/>},
  {path:"/rings", element: <Rings/>},
  {path:"/earrings", element: <Earrings/>},
  {path:"/bracelets", element: <Bracelets/>},
  {path:"/necklaces", element: <Necklaces/>},
  {path:"/products/:productId", element: <DetailPage />},
  {path:"/products-charm/:productId", element: <DetailPageCharm />},
  {path:"/products-sets/:productId", element: <DetailPageSets />},
  {path:"/products-jewelsets/:productId", element: <DetailPageJewelSets />},
  {path:"/login", element: <Login />},
  {path:"/verify", element: <OTPCode />},
  {path:"/checkout", element: <Checkout />},
  {path:"/checkout/payment", element: <FinalCheckoutPage />},
  {path:"/checkout/virtual-account", element: <FinalCheckoutVAPage/>},
  {path:"/checkout/qris", element: <FinalCheckoutQRISPage/>},
  {path:"/track-order", element: <TrackingOrder />},
  {path:"/new-arrival", element: <NewArrival />},
  {path:"/jewel-set", element: <JewelSet />},
  {path:"/search", element: <Search />},
  {path:"/for-us", element: <ForUs />},
  {path:"/for-him", element: <ForHim />},
  {path:"/for-her", element: <ForHer />},
  {path:"/faq", element: <FaqPage />},
  {path:"/refund", element: <RefundPage />},
  {path:"/monthly-specials", element: <MonthlySpecials />},
  { path: "/review", element: <UserReviewPage /> },
  {path:"*", element: <NotFound/>},
  
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
