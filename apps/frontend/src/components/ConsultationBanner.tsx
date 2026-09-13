import { CalendarCheck } from "lucide-react";
import ConsultationDialog from "./ConsultationDialog";

const ConsultationBanner = () => {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-card">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-accent/10 items-center justify-center shrink-0">
              <CalendarCheck className="text-accent" size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
                1:1 Editorial Guidance
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Book a Consultation with the{" "}
                <span className="text-accent">Chief Editor</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A 45-minute session to review your manuscript, clarify your
                direction, and plan your next steps. $15 / ₦20,000 per session.
              </p>
            </div>
          </div>
          <ConsultationDialog
            trigger={
              <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                Book a Consultation
              </button>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default ConsultationBanner;
