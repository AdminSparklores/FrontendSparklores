// src/pages/detail_page.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Footer from '../components/footer.jsx';
import NavBar from '../components/Home/navbar.jsx';
import ProductDetailCharm from '../components/ProductDetail/product_detail_charm.jsx';
import ProductDetailCharmBar from '../components/ProductDetail/charm.jsx';
import InfoAccordion from '../components/ProductDetail/dropdown.jsx';
import RecommendCharm from '../components/ProductDetail/recommend_charm.jsx';
import Features from '../components/Home/home_pt4.jsx';
import VideoCarousel from '../components/Home/home_pt5.jsx';
import Reviews from '../components/Home/home_pt6.jsx';
import JewelryGallery from '../components/Home/home_pt7.jsx';
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';

export default function DetailPageCharm() {
  const { productId } = useParams();
  
  return (
    <>
      <ScrollToTop />
      <NavBar/>
      <ProductDetailCharm productId={productId} />
      <InfoAccordion/>
      {/* <ProductDetailCharmBar/> */}
      <RecommendCharm/>
      <Features/>
      <VideoCarousel/>
      <Reviews/>
      <JewelryGallery/>
      <Footer />
    </>
  );
}