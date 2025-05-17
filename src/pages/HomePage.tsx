import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PaymentInfo from '../components/home/PaymentInfo';
import SellerCTA from '../components/home/SellerCTA';
import Testimonials from '../components/home/Testimonials';

const HomePage: React.FC = () => {
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