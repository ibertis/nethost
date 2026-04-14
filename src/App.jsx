import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DomainSearch from './components/DomainSearch';
import TrustedBy from './components/TrustedBy';
import Services from './components/Services';
import WhyNethost from './components/WhyNethost';
import Process from './components/Process';
import Pricing from './components/Pricing';
import AdditionalServices from './components/AdditionalServices';
import Testimonials from './components/Testimonials';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import Resources from './pages/Resources';

function HomePage({ onContactOpen }) {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <Hero />
      <DomainSearch />
      <TrustedBy />
      <Services />
      <WhyNethost />
      <Process />
      <Pricing onContactOpen={onContactOpen} />
      <AdditionalServices onContactOpen={onContactOpen} />
      <Testimonials />
      <CtaBanner onContactOpen={onContactOpen} />
      <Footer onContactOpen={onContactOpen} />
    </>
  );
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050914]">
      <Navbar onContactOpen={() => setContactOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage onContactOpen={() => setContactOpen(true)} />} />
        <Route path="/resources" element={<Resources onContactOpen={() => setContactOpen(true)} />} />
      </Routes>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
