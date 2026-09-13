import { Eye, Target } from "lucide-react";

const VisionMission = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Vision & Mission
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            What Drives <span className="text-accent">Us</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
              <Eye size={20} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To become a trusted publishing brand that authors confidently entrust with their
              life's work, and are willing to invest in because of the standard we uphold.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-8">
            <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
              <Target size={20} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To help serious authors transform their ideas into professionally published books
              that are clear, compelling, and built to stand out, while positioning them as credible
              voices through excellence in editing, design, and production.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
