import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import VisionMission from "@/components/VisionMission";
import Differentiator from "@/components/Differentiator";
import WhyAuthors from "@/components/WhyAuthors";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import OrderForm from "@/components/OrderForm";
import SelectedWorks from "@/components/SelectedWorks";
import CTA from "@/components/CTA";
import ConsultationBanner from "@/components/ConsultationBanner";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <VisionMission />
      <Differentiator />
      <WhyAuthors />
      <Services />
      <ConsultationBanner />
      <HowItWorks />
      <Testimonials />
      <SelectedWorks />
      <FAQ />
      <OrderForm />
      <CTA />
      <Footer />
      <WhatsAppWidget />
    </div>
  );
};

export default Index;
