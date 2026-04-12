import { useState } from 'react';
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

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050914]">
      <Navbar onContactOpen={() => setContactOpen(true)} />
      <Hero />
      <DomainSearch />
      <TrustedBy />
      <Services />
      <WhyNethost />
      <Process />
      <Pricing />
      <AdditionalServices />
      <Testimonials />
      <CtaBanner />
      <Footer onContactOpen={() => setContactOpen(true)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
