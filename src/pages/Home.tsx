import React from 'react';
import Header from '../components/Header';
import BannerSlider from '../components/BannerSlider';
import CategoryCarousel from '../components/CategoryCarousel';
import Products from '../components/Products';
import Benefits from '../components/Benefits';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div>
      <BannerSlider />
      <CategoryCarousel />
      <Products />
      <Benefits />
      <Reviews />
      <Footer />
    </div>
  );
};

export default Home;
