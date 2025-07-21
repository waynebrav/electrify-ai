
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-electrify-500 to-purple-600 bg-clip-text text-transparent">
                Electrify
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Your one-stop destination for all electronics needs. We offer the latest tech 
              gadgets, smart home solutions, and professional-grade equipment.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/bravine.brav" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/s.i.l.v.e.r.s.t.o.n.e_b.r.a.v/" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://x.com/BravSilverstone" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Twitter (X)</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://www.youtube.com/@silverstonebrav" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/in/bravine-munialo-8b04bb242/" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="https://github.com/SILVERSTONEBRAV" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="https://www.tiktok.com/@silverstonebrav?_t=ZM-8yD0VA5Gxzs&_r=1" className="text-gray-400 hover:text-electrify-500" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">TikTok</span>
                {/* TikTok SVG icon fallback */}
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.75 2a.75.75 0 0 1 .75.75v13.5a3.75 3.75 0 1 1-3.75-3.75.75.75 0 0 1 0 1.5A2.25 2.25 0 1 0 12 16.25V2.75A.75.75 0 0 1 12.75 2zm4.5 2.25a.75.75 0 0 1 .75.75 3.75 3.75 0 0 0 3.75 3.75.75.75 0 0 1 0 1.5A5.25 5.25 0 0 1 16.5 4.25a.75.75 0 0 1 .75-.75z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Products</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/categories/smartphones" className="text-gray-500 hover:text-electrify-500">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link to="/categories/laptops" className="text-gray-500 hover:text-electrify-500">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/categories/smart-home" className="text-gray-500 hover:text-electrify-500">
                  Smart Home
                </Link>
              </li>
              <li>
                <Link to="/categories/audio" className="text-gray-500 hover:text-electrify-500">
                  Audio
                </Link>
              </li>
              <li>
                <Link to="/categories/wearables" className="text-gray-500 hover:text-electrify-500">
                  Wearables
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help-center" className="text-gray-500 hover:text-electrify-500">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-500 hover:text-electrify-500">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-500 hover:text-electrify-500">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-gray-500 hover:text-electrify-500">
                  Warranty Information
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 hover:text-electrify-500">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-gray-500 hover:text-electrify-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-500 hover:text-electrify-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-500 hover:text-electrify-500">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-500 hover:text-electrify-500">
                  Press
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Electrify. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-electrify-500">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-electrify-500">
              Terms of Service
            </Link>
            <Link to="/cookie-policy" className="text-sm text-gray-500 hover:text-electrify-500">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
