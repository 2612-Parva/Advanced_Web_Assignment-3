import React, { useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import SpecialtiesSection from '../components/SpecialtiesSection';
import ServicesSection from '../components/ServicesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

import { useAppSelector} from '../redux/hooks';

const Home: React.FC = () => {
  const user = useAppSelector((state) => state.user);
  useEffect(() => {
      console.log('Current user:', user);
  }, [user]);

  return (
    <>
      <Header />
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection />
      <ServicesSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
};

export default Home;