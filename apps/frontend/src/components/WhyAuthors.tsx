const problems = [
  {
    problem: '"My ideas are scattered."',
    solution: "We structure and refine your manuscript into something clear and compelling.",
  },
  {
    problem: '"I don\'t want my book to look unprofessional."',
    solution: "We ensure your book meets a standard that reflects your expertise.",
  },
  {
    problem: '"The process feels overwhelming."',
    solution: "We guide you through every stage, from manuscript to publication.",
  },
  {
    problem: '"I want to be taken seriously."',
    solution: "We produce books that strengthen your credibility.",
  },
  {
    problem: '"I don\'t have the time."',
    solution: "We handle the heavy lifting so you can stay focused on your work.",
  },
];

const WhyAuthors = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Core Problems We Solve
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Why Authors <span className="text-accent">Come to Us</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((item, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 hover:border-accent/30 hover:shadow-card transition-all"
            >
              <div className="text-sm font-semibold text-accent mb-3">{i + 1}.</div>
              <h3 className="text-base font-bold text-foreground mb-2">{item.problem}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAuthors;
