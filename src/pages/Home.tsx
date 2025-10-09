import React from 'react';
import Header from '../components/Header';
import BannerSlider from '../components/BannerSlider';
import CategoryCarousel from '../components/CategoryCarousel';
import Products from '../components/Products';
import Benefits from '../components/Benefits';
import Reviews from '../components/Reviews';
import { Link } from 'react-router-dom';


const Home: React.FC = () => {
  return (
    <div>
      <BannerSlider />
      <CategoryCarousel />
      <Products />
      <Benefits />
      <Reviews />
    </div>
  );
};

export default Home;
