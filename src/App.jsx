import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Services from './components/Services';
import WhyNethost from './components/WhyNethost';
import Process from './components/Process';
import Pricing from './components/Pricing';
import AdditionalServices from './components/AdditionalServices';
import Testimonials from './components/Testimonials';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050914]">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Services />
      <WhyNethost />
      <Process />
      <Pricing />
      <AdditionalServices />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </div>
  );
}
