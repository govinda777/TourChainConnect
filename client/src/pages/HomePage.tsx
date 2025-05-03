import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import KeyDifferentiators from "@/sections/KeyDifferentiators";
import AIDashboard from "@/sections/AIDashboard";
import WellnessProgram from "@/sections/WellnessProgram";
import SustainabilityCalculator from "@/sections/SustainabilityCalculator";
import Testimonials from "@/sections/Testimonials";
import DemoRequest from "@/sections/DemoRequest";
import Resources from "@/sections/Resources";
import { useEffect } from "react";

export default function HomePage() {
  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.getBoundingClientRect().top + window.scrollY - 80,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <main>
      <Hero />
      <Stats />
      <KeyDifferentiators />
      <AIDashboard />
      <WellnessProgram />
      <SustainabilityCalculator />
      <Testimonials />
      <DemoRequest />
      <Resources />
    </main>
  );
}
