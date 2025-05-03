import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20ZM16.17,8.76L15.07,7.66C14.68,7.27 14.05,7.27 13.66,7.66L8.83,12.49L7.3,10.96C6.91,10.57 6.28,10.57 5.89,10.96L4.79,12.06C4.4,12.45 4.4,13.08 4.79,13.47L8.36,17.04C8.75,17.43 9.38,17.43 9.77,17.04L16.17,10.64C16.56,10.25 16.56,9.62 16.17,8.76Z" />
            </svg>
            <span className="text-2xl font-bold text-primary">TourChain</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#solutions" className="text-neutral-700 hover:text-primary font-medium">Solutions</a>
            <a href="#ai-optimization" className="text-neutral-700 hover:text-primary font-medium">AI Optimization</a>
            <a href="#wellness" className="text-neutral-700 hover:text-primary font-medium">Wellness</a>
            <a href="#sustainability" className="text-neutral-700 hover:text-primary font-medium">Sustainability</a>
            <a href="#resources" className="text-neutral-700 hover:text-primary font-medium">Resources</a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="#contact" className="px-4 py-2 rounded-md text-primary border border-primary hover:bg-primary-light font-medium transition">Contact Us</a>
            <a href="#demo" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark font-medium transition">Request Demo</a>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-neutral-700 focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-3">
            <a href="#solutions" className="block px-3 py-2 text-neutral-700 hover:bg-primary-light rounded-md" onClick={closeMobileMenu}>Solutions</a>
            <a href="#ai-optimization" className="block px-3 py-2 text-neutral-700 hover:bg-primary-light rounded-md" onClick={closeMobileMenu}>AI Optimization</a>
            <a href="#wellness" className="block px-3 py-2 text-neutral-700 hover:bg-primary-light rounded-md" onClick={closeMobileMenu}>Wellness</a>
            <a href="#sustainability" className="block px-3 py-2 text-neutral-700 hover:bg-primary-light rounded-md" onClick={closeMobileMenu}>Sustainability</a>
            <a href="#resources" className="block px-3 py-2 text-neutral-700 hover:bg-primary-light rounded-md" onClick={closeMobileMenu}>Resources</a>
            <div className="flex space-x-2 pt-3">
              <a href="#contact" className="flex-1 px-4 py-2 text-center rounded-md text-primary border border-primary hover:bg-primary-light font-medium" onClick={closeMobileMenu}>Contact</a>
              <a href="#demo" className="flex-1 px-4 py-2 text-center rounded-md bg-primary text-white hover:bg-primary-dark font-medium" onClick={closeMobileMenu}>Demo</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
