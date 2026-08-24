import ContactCTA from "@/components/homePage/ContactCTA";
import HeroSection from "@/components/homePage/HeroSection";
import ServicesSection from "@/components/homePage/ServicesSection";
import TestimonialsSection from "@/components/homePage/TestimonialsSection";
import WhyChoose from "@/components/homePage/WhyChoose";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gilbrice",
  description: "",
};

export default function HomePage() {
  return (
    <div className="">
      <HeroSection />
      <ServicesSection />
      <WhyChoose />
      <TestimonialsSection />
      <ContactCTA />
    </div>
  );
}
