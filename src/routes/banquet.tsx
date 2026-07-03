import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Music, UtensilsCrossed, Sparkles, Camera, Flower } from "lucide-react";
import heroBanquet from "@/assets/hero-banquet.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";

export const Route = createFileRoute("/banquet")({
  head: () => ({
    meta: [
      { title: "Banquet Hall — Hotel & Banquet" },
      { name: "description", content: "Host your dream wedding, engagement, or corporate event in our elegant banquet hall. Spacious venue with capacity for 500+ guests." },
      { property: "og:title", content: "Banquet Hall — Hotel & Banquet" },
      { property: "og:description", content: "Host your dream wedding or event in our elegant banquet hall with 500+ capacity." },
    ],
  }),
  component: BanquetPage,
});

const services = [
  { icon: UtensilsCrossed, label: "Catering", description: "Multi-cuisine menus with vegetarian and non-vegetarian options" },
  { icon: Flower, label: "Decoration", description: "Customized themes and floral arrangements" },
  { icon: Music, label: "DJ & Sound", description: "Professional sound system and lighting" },
  { icon: Camera, label: "Photography", description: "Experienced photographers and videographers" },
  { icon: Sparkles, label: "Stage Setup", description: "Elegant mandap and stage decorations" },
  { icon: Users, label: "Event Planning", description: "Dedicated event coordinators" },
];

const events = [
  "Weddings",
  "Engagements",
  "Reception",
  "Corporate Events",
  "Birthday Parties",
  "Anniversary",
  "Product Launch",
  "Conferences",
];

function BanquetPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBanquet}
          alt="Banquet hall"
          className="absolute inset-0 w-full h-full object-cover"
          width={1600}
          height={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/20" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display text-4xl md:text-5xl text-background mb-4">
            Banquet Hall
          </h1>
          <p className="text-background/80 text-lg max-w-lg mx-auto">
            Your dream celebration deserves a royal venue
          </p>
        </div>
      </section>

      {/* Info */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
                The Venue
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Grand Banquet Hall
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our spacious banquet hall is the perfect venue for your most cherished celebrations. With a seating capacity of over 500 guests, state-of-the-art amenities, and elegant interiors, we ensure your event is nothing short of spectacular.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                From intimate gatherings to grand weddings, our experienced team handles every detail with precision and care, allowing you to focus on creating beautiful memories.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="font-display text-3xl text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Guest Capacity</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="font-display text-3xl text-primary">15,000</div>
                  <div className="text-sm text-muted-foreground">Sq. Ft. Area</div>
                </div>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Book Your Date
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img
                src={gallery1}
                alt="Wedding decoration"
                className="rounded-xl w-full aspect-[3/4] object-cover"
                width={450}
                height={600}
                loading="lazy"
              />
              <img
                src={gallery2}
                alt="Table setup"
                className="rounded-xl w-full aspect-[3/4] object-cover mt-8"
                width={600}
                height={800}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="section-padding bg-muted">
        <div className="container-tight text-center">
          <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
            Events We Host
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8">
            Perfect for Every Occasion
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {events.map((event) => (
              <span
                key={event}
                className="bg-card border border-border rounded-full px-5 py-2 text-sm text-foreground"
              >
                {event}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="text-center mb-10">
            <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
              Our Services
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              Complete Event Solutions
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.label}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">
                  {service.label}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-accent text-accent-foreground">
        <div className="container-tight text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-lg mx-auto">
            Contact us today to check availability and discuss your requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-lg font-medium text-lg hover:bg-foreground/90 transition-colors"
            >
              Get Quote
            </Link>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 border-2 border-accent-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-accent-foreground/10 transition-colors"
            >
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
