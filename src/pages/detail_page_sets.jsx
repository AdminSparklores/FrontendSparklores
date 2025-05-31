// src/pages/detail_page.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Footer from '../components/footer.jsx';
import NavBar from '../components/Home/navbar.jsx';
import InfoAccordion from '../components/ProductDetail/dropdown.jsx';
import RecommendSets from '../components/ProductDetail/recommend_sets.jsx';
import Features from '../components/Home/home_pt4.jsx';
import VideoCarousel from '../components/Home/home_pt5.jsx';
import Reviews from '../components/Home/home_pt6.jsx';
import JewelryGallery from '../components/Home/home_pt7.jsx';
import ScrollToTop from '../components/ProductDetail/ScrollToTop.jsx';
import ProductDetailSets from '../components/ProductDetail/product_detail_sets.jsx';

export default function DetailPageSets() {
  const { productId } = useParams();
  
  return (
    <>
      <ScrollToTop />
      <NavBar/>
      <ProductDetailSets productId={productId} />
      <InfoAccordion/>
      <RecommendSets/>
      <Features/>
      <VideoCarousel/>
      <Reviews/>
      <JewelryGallery/>
      <Footer />
    </>
  );
}