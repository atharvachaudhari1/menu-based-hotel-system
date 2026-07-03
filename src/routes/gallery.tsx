import { createFileRoute } from "@tanstack/react-router";
import heroBanquet from "@/assets/hero-banquet.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import restaurant from "@/assets/restaurant.jpg";
import hotelExterior from "@/assets/hotel-exterior.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Hotel & Banquet" },
      { name: "description", content: "Browse photos of our elegant rooms, stunning banquet hall, and memorable events. See why we're the preferred venue for weddings and celebrations." },
      { property: "og:title", content: "Gallery — Hotel & Banquet" },
      { property: "og:description", content: "Browse photos of our elegant rooms, stunning banquet hall, and memorable events." },
    ],
  }),
  component: GalleryPage,
});

const images = [
  { src: heroBanquet, alt: "Banquet hall setup", category: "Banquet" },
  { src: gallery1, alt: "Wedding mandap decoration", category: "Wedding" },
  { src: roomDeluxe, alt: "Deluxe room", category: "Rooms" },
  { src: gallery2, alt: "Dinner table setup", category: "Banquet" },
  { src: hotelExterior, alt: "Hotel exterior at dusk", category: "Hotel" },
  { src: roomExecutive, alt: "Executive suite", category: "Rooms" },
  { src: restaurant, alt: "Restaurant cuisine", category: "Dining" },
  { src: gallery3, alt: "Hotel lobby", category: "Hotel" },
];

function GalleryPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero */}
      <section className="section-padding bg-muted pt-12">
        <div className="container-tight text-center">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Gallery
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Take a glimpse into our world of luxury and celebration
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding bg-background">
        <div className="container-tight">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl ${
                  index === 0 || index === 5 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full mb-1">
                      {image.category}
                    </span>
                    <p className="text-background text-sm font-medium">
                      {image.alt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding bg-muted">
        <div className="container-tight text-center">
          <span className="text-primary text-sm tracking-widest uppercase mb-2 block">
            Virtual Tour
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8">
            Experience Our Hospitality
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden bg-foreground/10 flex items-center justify-center">
            <p className="text-muted-foreground">
              Video coming soon
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
