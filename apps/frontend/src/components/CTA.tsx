import { ArrowRight, CalendarCheck } from "lucide-react";
import ConsultationDialog from "./ConsultationDialog";

const CTA = () => {
  return (
    <section className="py-16 lg:py-24 bg-primary relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
          Your Book Deserves To Be{" "}
          <span className="text-accent">Done Right</span>
        </h2>
        <p className="text-primary-foreground/70 leading-relaxed mb-4">
          This is not about just "publishing a book." It's about producing something you
          can confidently attach your name to.
        </p>
        <p className="text-primary-foreground/70 leading-relaxed mb-8">
          If that matters to you, we're ready when you are.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#order"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Work With Us <ArrowRight size={16} />
          </a>
          <ConsultationDialog
            trigger={
              <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-primary-foreground/30 text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary-foreground/5 transition-colors">
                <CalendarCheck size={16} /> Book a Consultation
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default CTA;
