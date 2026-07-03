import { Phone, MessageCircle } from "lucide-react";

export function FloatingActions() {
  return (
    <>
      {/* Desktop floating buttons */}
      <div className="hidden md:flex fixed right-4 bottom-4 flex-col gap-3 z-50">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <a
          href="tel:+919876543210"
          className="w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Call"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-foreground border-t border-foreground/20 pb-safe">
        <div className="grid grid-cols-2">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
          <a
            href="tel:+919876543210"
            className="flex items-center justify-center gap-2 py-4 bg-accent text-accent-foreground font-medium"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
        </div>
      </div>
    </>
  );
}
