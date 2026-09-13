import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What services does Eyelight Publishing offer?",
    a: "We provide comprehensive publishing services including ghostwriting, developmental editing, proofreading, book formatting & typesetting, cover design, ISBN registration, printing & binding, digital publishing & distribution, author branding, and book marketing strategy.",
  },
  {
    q: "How long does a typical project take?",
    a: "Timelines vary by service: Editorial services take 4 to 6 weeks, interior layout design 3 to 5 days, cover design 7 days, client review 3 to 5 days, and book production 2 weeks. Complex projects may take longer depending on manuscript length.",
  },
  {
    q: "Do you work with first-time authors?",
    a: "Absolutely! We specialize in helping first-time authors navigate the publishing process. From organizing your ideas to the final published book, we guide you every step of the way.",
  },
  {
    q: "What makes your team different?",
    a: "We combine over 10 years of experience with a hands-on, personalized approach. Every project gets dedicated attention, transparent pricing, and realistic timelines. We've successfully delivered 335+ book projects globally.",
  },
  {
    q: "Do you provide ongoing support and marketing?",
    a: "Yes! We offer book marketing strategy as an add-on service, including launch strategy, 30 social media content pieces, and promotional campaigns. Author branding with social media management is also available as a monthly retainer.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-accent rounded-full" /> FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently <span className="text-accent">Asked</span>
            </h2>
            <p className="text-muted-foreground max-w-md">
              Got questions? We've got answers. If you don't find what you're looking for,
              feel free to reach out to us directly.
            </p>
          </div>

          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-sm font-semibold text-foreground text-left hover:text-accent transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
