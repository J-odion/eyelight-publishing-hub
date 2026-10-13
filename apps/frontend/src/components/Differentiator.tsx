import { Check } from "lucide-react";
import differentiatorImage from "@/assets/differentiator-image.jpg";

const points = [
  "Shape your ideas into a clear, well-structured manuscript with a message worth putting into the world.",
  "Get the right editorial attention to your content, argument, structure and writing before your book goes to print.",
  "Position your book to speak to the right readers and establish your authority in your field.",
  "Navigate editing, design, production and publishing with a team that understands what each stage demands.",
  "Build a book that represents the quality of your ideas and the reputation you are working to establish.",
];

const Differentiator = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="relative">
            <img
              src={differentiatorImage}
              alt="Brand philosophy - global publishing reach"
              className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl object-cover shadow-card"
            />
          </div>

          {/* Right Content */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-accent rounded-full" /> Brand Philosophy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              What Makes Us <span className="text-accent">Different</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most authors don't just need publishing. They need structure. Direction. Clarity.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              That's where we come in.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We work with you to make sure every part of your book is properly thought through, from the first idea to publishing and beyond. We help you:
            </p>

            <ul className="space-y-3 mb-6">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                  <Check size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground leading-relaxed italic">
              …because anything less is a disservice to your name and your legacy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Differentiator;
