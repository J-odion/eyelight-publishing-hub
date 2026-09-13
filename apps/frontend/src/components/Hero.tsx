import { ArrowRight, CalendarCheck } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import ConsultationDialog from "./ConsultationDialog";

const stats = [
  { value: "335+", label: "Books & Projects Delivered" },
  { value: "10+", label: "Years Editorial & Publishing Experience" },
  { value: "Global", label: "Authors Across Continents" },
];

const categories = [
  "Authors",
  "Thought Leaders",
  "Pastors",
  "Business Owners",
  "Coaches",
  "Professionals & Experts",
];

const Hero = () => {
  return (
    <section id="home" className="relative pt-20 lg:pt-24 bg-primary overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="py-12 lg:py-20">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-bold text-primary-foreground leading-[1.15] mb-6">
              The rumours are true.{" "}
              <span className="text-accent">
                We publish premium books that automatically build you into a credible author
              </span>
            </h1>
            <p className="text-base lg:text-lg text-primary-foreground/70 max-w-lg mb-8 leading-relaxed">
              Your book reflects your voice and credibility. We partner with serious authors
              to refine their ideas into premium, excellent, keep-worthy, structured,
              professionally published books designed to stand the test of time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <a
                href="#order"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Work With Us <ArrowRight size={16} />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-primary-foreground/20 text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary-foreground/5 transition-colors"
              >
                Explore Services
              </a>
            </div>

            <ConsultationDialog
              trigger={
                <button className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors mb-10 -mt-4">
                  <CalendarCheck size={14} className="text-accent" />
                  Or book a 45-min consultation with the Chief Editor
                </button>
              }
            />

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl lg:text-3xl font-bold text-accent">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:flex justify-end items-end self-end">
            <div className="relative w-full max-w-md xl:max-w-lg">
              <img
                src={heroImage}
                alt="Professional book publishing and ghostwriting services"
                className="w-full h-auto rounded-t-2xl object-cover"
              />
              {/* Badge */}
              <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Your Voice, Done Right
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who We Work With strip */}
      <div className="bg-primary-foreground/5 border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-4">
            <span className="text-xs text-primary-foreground/50 font-medium mr-2">Who We Work With:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/20"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
