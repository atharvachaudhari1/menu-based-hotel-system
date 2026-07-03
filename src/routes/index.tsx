import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Users, Utensils, Bed } from "lucide-react";
import heroBanquet from "@/assets/hero-banquet.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import restaurant from "@/assets/restaurant.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBanquet}
          alt="Elegant banquet hall"
          className="absolute inset-0 w-full h-full object-cover"
          width={1600}
          height={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/20" />
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto animate-fade-up">
          <span className="inline-block text-gold text-sm tracking-widest uppercase mb-4">
            Welcome to
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-background leading-tight mb-6">
            Your Dream Event Deserves a Royal Venue
          </h1>
          <p className="text-background/80 text-lg mb-8 max-w-lg mx-auto">
            Spacious and equipped with modern amenities, our banquet hall is ready to host your happiest moments
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Bed, label: "Luxury Rooms", value: "25+" },
              { icon: Users, label: "Capacity", value: "500+" },
              { icon: Star, label: "Years Serving", value: "20+" },
              { icon: Utensils, label: "Cuisines", value: "Multi" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-display text-2xl text-foreground mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding bg-muted">
        <div className="container-tight">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
                About Us
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                A Legacy of Royal Hospitality
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nestled in the heart of the city, our Hotel & Banquet has been the epitome of luxury hospitality for over two decades. Our commitment to excellence, attention to detail, and warm Indian hospitality makes every stay an unforgettable experience.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Learn More →
              </Link>
            </div>
            <div className="order-1 md:order-2 grid grid-cols-2 gap-3">
              <img
                src={roomDeluxe}
                alt="Deluxe room"
                className="rounded-xl w-full aspect-[4/5] object-cover"
                width={600}
                height={750}
                loading="lazy"
              />
              <img
                src={roomExecutive}
                alt="Executive room"
                className="rounded-xl w-full aspect-[4/5] object-cover mt-8"
                width={600}
                height={750}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-background">
        <div className="container-tight text-center">
          <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
            Our Services
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10">
            Experience Our Hospitality
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Luxury Rooms",
                description: "Elegantly furnished rooms with modern amenities for a comfortable stay.",
                image: roomDeluxe,
                link: "/rooms",
              },
              {
                title: "Banquet Hall",
                description: "Spacious halls perfect for weddings, engagements, and corporate events.",
                image: heroBanquet,
                link: "/banquet",
              },
              {
                title: "Multi-Cuisine Restaurant",
                description: "Savor authentic Indian and international cuisines prepared by master chefs.",
                image: restaurant,
                link: "/contact",
              },
            ].map((service) => (
              <Link
                key={service.title}
                to={service.link}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={400}
                    height={300}
                    loading="lazy"
                  />
                </div>
                <div className="p-6 text-left">
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-tight text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Get in touch with us to discuss your requirements and book your perfect venue.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}
