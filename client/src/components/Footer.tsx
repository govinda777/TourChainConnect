import { Link } from "wouter";

export default function Footer() {
  return (
    <footer id="contact" className="bg-neutral-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20ZM16.17,8.76L15.07,7.66C14.68,7.27 14.05,7.27 13.66,7.66L8.83,12.49L7.3,10.96C6.91,10.57 6.28,10.57 5.89,10.96L4.79,12.06C4.4,12.45 4.4,13.08 4.79,13.47L8.36,17.04C8.75,17.43 9.38,17.43 9.77,17.04L16.17,10.64C16.56,10.25 16.56,9.62 16.17,8.76Z" />
              </svg>
              <span className="text-2xl font-bold">TourChain</span>
            </div>
            <p className="text-neutral-400 mb-6">
              Transforming corporate travel management with innovation, safety, and sustainability since 2017.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <i className="ri-linkedin-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li><a href="#solutions" className="text-neutral-400 hover:text-white transition">Travel Management</a></li>
              <li><a href="#ai-optimization" className="text-neutral-400 hover:text-white transition">AI Cost Optimization</a></li>
              <li><a href="#wellness" className="text-neutral-400 hover:text-white transition">Wellness Programs</a></li>
              <li><a href="#sustainability" className="text-neutral-400 hover:text-white transition">Sustainability</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Travel Safety</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#resources" className="text-neutral-400 hover:text-white transition">Blog</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Case Studies</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Webinars</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">Guides</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="ri-mail-line mt-1 mr-2 text-neutral-400"></i>
                <span className="text-neutral-400">contact@tourchain.com</span>
              </li>
              <li className="flex items-start">
                <i className="ri-phone-line mt-1 mr-2 text-neutral-400"></i>
                <span className="text-neutral-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <i className="ri-map-pin-line mt-1 mr-2 text-neutral-400"></i>
                <span className="text-neutral-400">123 Innovation Drive, San Francisco, CA 94103</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-700 text-neutral-400 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TourChain. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
