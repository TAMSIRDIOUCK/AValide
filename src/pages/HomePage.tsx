import React, { useEffect } from 'react';
import Layout from '../app/api/layout/Layout';
import Hero from '../components/home/Hero';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PaymentInfo from '../components/home/PaymentInfo';
import SellerCTA from '../components/home/SellerCTA';
import Testimonials from '../components/home/Testimonials';

const HomePage: React.FC = () => {
  // Ajout d'un effet pour faire défiler la page vers le haut lors du chargement
  

  return (
    <Layout>
      <Hero />
      <CategorySection />
      <FeaturedProducts />
      <PaymentInfo />
      <SellerCTA />
      <Testimonials />
    </Layout>
  );
};

export default HomePage;