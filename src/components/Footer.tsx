import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background pb-24 md:pb-0">
      <div className="container-tight section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-lg font-semibold">H</span>
              </div>
              <span className="font-display text-xl text-background">Hotel & Banquet</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Experience luxury hospitality and world-class event hosting for your most cherished moments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-background/70 hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/rooms" className="text-background/70 hover:text-gold transition-colors">Our Rooms</Link></li>
              <li><Link to="/banquet" className="text-background/70 hover:text-gold transition-colors">Banquet Hall</Link></li>
              <li><Link to="/gallery" className="text-background/70 hover:text-gold transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="text-background/70 hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4 text-gold">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <div className="text-background/70">
                  <a href="tel:+919876543210" className="hover:text-gold transition-colors">+91 98765 43210</a>
                  <br />
                  <a href="tel:+919876543211" className="hover:text-gold transition-colors">+91 98765 43211</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <a href="mailto:info@hotel.com" className="text-background/70 hover:text-gold transition-colors">info@hotel.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-gold shrink-0" />
                <span className="text-background/70">123 Main Road, City Center,<br />Your City - 400 001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-background/10 text-center text-sm text-background/50">
          © {new Date().getFullYear()} Hotel & Banquet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
