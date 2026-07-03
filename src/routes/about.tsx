import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Heart, Users, Clock } from "lucide-react";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Hotel & Banquet" },
      { name: "description", content: "Learn about our legacy of hospitality excellence spanning over two decades. Discover our story, values, and commitment to making every moment special." },
      { property: "og:title", content: "About Us — Hotel & Banquet" },
      { property: "og:description", content: "Learn about our legacy of hospitality excellence spanning over two decades." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={hotelExterior}
          alt="Hotel exterior"
          className="absolute inset-0 w-full h-full object-cover"
          width={1600}
          height={1200}
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display text-4xl md:text-5xl text-background mb-4">
            About Us
          </h1>
          <p className="text-background/80 text-lg">
            A legacy of excellence in hospitality
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Two Decades of Creating Memories
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded with a vision to redefine hospitality, our hotel has been a cornerstone of luxury and comfort in the city for over 20 years. What started as a dream has grown into a legacy that continues to touch lives and create unforgettable memories.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our commitment to excellence extends beyond just providing accommodation. We believe in creating experiences that resonate with warmth, elegance, and the timeless traditions of Indian hospitality.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From intimate family gatherings to grand wedding celebrations, we have had the privilege of being part of countless special moments, and each one has added to our story.
              </p>
            </div>
            <div>
              <img
                src={gallery3}
                alt="Hotel lobby"
                className="rounded-xl w-full aspect-[4/3] object-cover"
                width={800}
                height={600}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-muted">
        <div className="container-tight text-center">
          <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
            Our Values
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10">
            What We Stand For
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "Warm Hospitality",
                description: "Every guest is treated like family with genuine care and attention.",
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We strive for perfection in every detail, big or small.",
              },
              {
                icon: Users,
                title: "Community",
                description: "Building lasting relationships with our guests and local community.",
              },
              {
                icon: Clock,
                title: "Tradition",
                description: "Honoring time-tested traditions while embracing modern comforts.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-tight">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20+", label: "Years of Service" },
              { value: "10,000+", label: "Events Hosted" },
              { value: "50,000+", label: "Happy Guests" },
              { value: "100+", label: "Expert Staff" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-5xl mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/70 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-background">
        <div className="container-tight text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Be Part of Our Story
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Experience the warmth and elegance that has made us a trusted name in hospitality.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
