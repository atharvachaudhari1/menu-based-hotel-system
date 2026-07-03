import { createFileRoute, Link } from "@tanstack/react-router";
import { Wifi, Car, Coffee, Tv, Wind, ShowerHead } from "lucide-react";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomExecutive from "@/assets/room-executive.jpg";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Suites — Hotel & Banquet" },
      { name: "description", content: "Discover our elegantly furnished rooms and suites with modern amenities. From deluxe rooms to executive suites, find your perfect stay." },
      { property: "og:title", content: "Rooms & Suites — Hotel & Banquet" },
      { property: "og:description", content: "Discover our elegantly furnished rooms and suites with modern amenities." },
    ],
  }),
  component: RoomsPage,
});

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Wind, label: "AC" },
  { icon: Tv, label: "LED TV" },
  { icon: Coffee, label: "Tea/Coffee" },
  { icon: ShowerHead, label: "Hot Water" },
  { icon: Car, label: "Parking" },
];

const rooms = [
  {
    name: "Deluxe Room",
    description: "Spacious and elegantly furnished room with modern amenities, perfect for business travelers and couples seeking comfort and style.",
    image: roomDeluxe,
    features: ["King Size Bed", "City View", "Work Desk", "Mini Fridge"],
    price: "₹3,500",
  },
  {
    name: "Executive Suite",
    description: "Our premium executive suite offers luxurious living space with separate sitting area, ideal for extended stays and VIP guests.",
    image: roomExecutive,
    features: ["King Size Bed", "Living Area", "Bathtub", "Premium Toiletries"],
    price: "₹5,500",
  },
  {
    name: "Family Room",
    description: "Thoughtfully designed for families, this spacious room accommodates up to 4 guests with extra beds available on request.",
    image: roomDeluxe,
    features: ["2 Double Beds", "Extra Space", "Kids Amenities", "Connecting Option"],
    price: "₹4,500",
  },
];

function RoomsPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={roomExecutive}
          alt="Executive room"
          className="absolute inset-0 w-full h-full object-cover"
          width={1200}
          height={900}
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display text-4xl md:text-5xl text-background mb-4">
            Rooms & Suites
          </h1>
          <p className="text-background/80 text-lg">
            Comfort meets elegance
          </p>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-padding bg-muted">
        <div className="container-tight">
          <div className="text-center mb-8">
            <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
              Room Amenities
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              All Rooms Include
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {amenities.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Cards */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="grid gap-8">
            {rooms.map((room, index) => (
              <div
                key={room.name}
                className={`grid md:grid-cols-2 gap-6 md:gap-10 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <img
                    src={room.image}
                    alt={room.name}
                    className="rounded-xl w-full aspect-[4/3] object-cover"
                    width={600}
                    height={450}
                    loading="lazy"
                  />
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                    {room.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {room.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {room.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-display text-2xl text-primary">
                      {room.price}
                      <span className="text-sm text-muted-foreground font-body"> / night</span>
                    </span>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-tight text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Contact us and our team will help you find the perfect room for your stay.
          </p>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-accent/90 transition-colors"
          >
            Call Us Now
          </a>
        </div>
      </section>
    </div>
  );
}
