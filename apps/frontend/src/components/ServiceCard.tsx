import { Check, ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  amount: number;
  icon: LucideIcon;
  features: string[];
}

interface ServiceCardProps {
  service: ServiceData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { title, description, price, priceNote, icon: Icon, features, id } = service;

  return (
    <motion.div 
      variants={itemVariants}
      className="group relative flex flex-col p-6 bg-card rounded-2xl border border-border hover:border-accent/50 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] -z-10 group-hover:bg-accent/10 transition-colors"></div>

      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center border border-accent/10 group-hover:scale-110 transition-transform duration-300">
          <Icon size={22} className="text-accent" />
        </div>
        <a
          href={`#order?service=${id}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("order");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
              // Set service selection via custom event
              window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
            }
          }}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1 px-4 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md hover:opacity-90"
        >
          Inquire <ArrowRight size={14} />
        </a>
      </div>

      <h3 className="text-lg font-bold text-card-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-1">{description}</p>

      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
            <span className="p-1 rounded-full bg-accent/10 mt-0.5 shrink-0">
              <Check size={12} className="text-accent" />
            </span>
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pt-5 border-t border-border/60 mt-auto">
        <span className="font-mono text-base font-bold text-foreground">{price}</span>
        <span className="text-xs font-medium text-muted-foreground ml-2">{priceNote}</span>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
