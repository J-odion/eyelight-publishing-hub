import { Check, ArrowRight, type LucideIcon } from "lucide-react";

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

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { title, description, price, priceNote, icon: Icon, features, id } = service;

  return (
    <div className="group relative flex flex-col p-6 bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={20} className="text-accent" />
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
          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full"
        >
          Inquire <ArrowRight size={12} />
        </a>
      </div>

      <h3 className="text-base font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{description}</p>

      <ul className="space-y-2 mb-5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check size={14} className="text-accent mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-border">
        <span className="font-mono text-sm font-semibold text-foreground">{price}</span>
        <span className="text-xs text-muted-foreground ml-2">{priceNote}</span>
      </div>
    </div>
  );
};

export default ServiceCard;
