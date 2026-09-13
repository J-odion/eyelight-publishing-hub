import { useState, useEffect } from "react";
import { services } from "./Services";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, ArrowLeft, CalendarCheck } from "lucide-react";
import ConsultationDialog from "./ConsultationDialog";
import { LeadsApi } from "@/lib/api";
import { motion } from "framer-motion";

const OrderForm = () => {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    projectDescription: "",
    projectType: "",
  });

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelectedService(e.detail);
    };
    window.addEventListener("select-service", handler as EventListener);
    return () => window.removeEventListener("select-service", handler as EventListener);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (!form.projectDescription.trim()) {
      toast({ title: "Please tell us about your project", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await LeadsApi.submitInquiry({
        name: form.fullName.trim(),
        email: form.email.trim(),
        metadata: {
          projectType: selectedService,
          projectDescription: form.projectDescription.trim(),
        },
      });

      toast({
        title: "Inquiry Sent! ✉️",
        description: "We'll review your inquiry and get back to you within 24 to 48 hours.",
      });

      setForm({ fullName: "", email: "", projectDescription: "",projectType: "" });
      setSelectedService("");
    } catch (error: any) {
      const isNetworkError = error?.message === "Failed to fetch" || !navigator.onLine;
      toast({
        title: isNetworkError
          ? "Service Temporarily Unavailable"
          : "Something went wrong",
        description: isNetworkError
          ? "Our server is currently offline. Please reach out to us directly via WhatsApp or email below."
          : "Please try again or contact us directly via WhatsApp or email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-5 py-3.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300 shadow-sm";

  return (
    <section id="order" className="py-20 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <a
            href="#services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Services
          </a>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Let's Work On Your <span className="text-accent relative inline-block">
              Book
              <span className="absolute bottom-1 left-0 w-full h-2 bg-accent/20 -z-10 rounded"></span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {selectedServiceData
              ? <>You're interested in{" "}
                  <span className="font-bold text-foreground">
                    {selectedServiceData.title}
                  </span>
                  . Tell us what you're working on, where you are in the process, and what you need.</>
              : "Tell us what you're working on, where you are in the process, and what you need."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 sm:p-10 rounded-3xl border border-border shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Your Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="E.g. Clinton Randy"
                    required
                    maxLength={100}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    maxLength={255}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Service Interested In <span className="text-accent">*</span>
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tell Us About Your Project <span className="text-accent">*</span>
                </label>
                <textarea
                  name="projectDescription"
                  value={form.projectDescription}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  placeholder="What are you working on? What stage is your project? What are your goals and timeline?"
                  className={inputClasses + " resize-none"}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5">
                Prefer Direct Contact?
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="https://wa.me/2349085181361"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                      <MessageCircle size={18} className="text-accent group-hover:text-white" />
                    </div>
                    Message on WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:services@eyelightpublishing.com"
                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                      <Mail size={18} className="text-accent group-hover:text-white" />
                    </div>
                    services@eyelightpublishing.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-primary text-primary-foreground rounded-2xl border border-primary p-6 sm:p-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[40px]"></div>
              
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4 relative z-10">
                <CalendarCheck size={16} /> 1:1 Session
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">
                Need guidance first?
              </h3>
              <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed relative z-10">
                Book a 45-minute consultation with the Chief Editor for $15 / ₦20,000.
              </p>
              <ConsultationDialog
                trigger={
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-accent-foreground text-sm font-bold rounded-xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative z-10">
                    Book a Consultation
                  </button>
                }
              />
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5">
                What Happens Next?
              </h3>
              <ol className="space-y-4 text-sm text-muted-foreground">
                {[
                  "We review your inquiry (24 to 48 hours)",
                  "We schedule a discovery call",
                  "We send a tailored proposal",
                  "We begin the project"
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
