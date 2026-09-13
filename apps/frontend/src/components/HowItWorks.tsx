const steps = [
  {
    num: "01",
    title: "Editorial Work",
    desc: "4 to 6 weeks",
  },
  {
    num: "02",
    title: "Interior Layout",
    desc: "3 to 5 business days",
  },
  {
    num: "03",
    title: "Cover Design",
    desc: "7 business days",
  },
  {
    num: "04",
    title: "Review & Approval",
    desc: "3 to 5 business days",
  },
  {
    num: "05",
    title: "Production",
    desc: "2 weeks",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Our Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How We <span className="text-accent">Work</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We follow a structured process to ensure quality at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-card transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {step.num}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
