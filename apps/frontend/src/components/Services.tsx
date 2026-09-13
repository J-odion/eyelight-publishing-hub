import {
  PenTool,
  FileEdit,
  Search,
  LayoutGrid,
  Hash,
  Printer,
  Globe,
  Palette,
  Users,
  Megaphone,
} from "lucide-react";
import { motion } from "framer-motion";
import ServiceCard from "./ServiceCard";

export const services = [
  {
    id: "ghostwriting",
    title: "Ghostwriting",
    description:
      "We turn your ideas, experiences, and knowledge into a structured, readable, and compelling book.",
    price: "₦1,200,000 / $900",
    priceNote: "per 10,000 words",
    amount: 900,
    icon: PenTool,
    features: [
      "Voice capture through in-depth sessions",
      "Structured outline before writing",
      "Chapter-by-chapter development & revisions",
    ],
  },
  {
    id: "dev-editing",
    title: "Developmental Editing",
    description:
      "We go beyond surface-level editing to strengthen your book at its core.",
    price: "₦800,000 / $600",
    priceNote: "per 10,000 words",
    amount: 600,
    icon: FileEdit,
    features: [
      "Structure & flow improvement",
      "Argument and narrative clarity",
      "Tone and style refinement",
    ],
  },
  {
    id: "proofreading",
    title: "Proofreading",
    description: "Final polish before publishing.",
    price: "₦7,000 / $5",
    priceNote: "per page",
    amount: 5,
    icon: Search,
    features: [
      "Grammar and typo correction",
      "Formatting checks",
      "Consistency review",
    ],
  },
  {
    id: "formatting",
    title: "Book Formatting & Typesetting",
    description:
      "Clean, professional interior layout for print and digital.",
    price: "₦1,400 / $1",
    priceNote: "per page",
    amount: 1,
    icon: LayoutGrid,
    features: [
      "Proper spacing and typography",
      "Chapter structure and pagination",
      "Print-ready formatting",
    ],
  },
  {
    id: "cover-design",
    title: "Book Cover Design",
    description:
      "A professional cover that reflects the quality of your work.",
    price: "₦140,000 / $100",
    priceNote: "flat rate",
    amount: 100,
    icon: Palette,
    features: [
      "Front, spine, and back design",
      "Author bio and blurb placement",
      "Genre-appropriate design direction",
    ],
  },
  {
    id: "isbn",
    title: "ISBN & Copyright",
    description:
      "Proper registration and documentation for your book.",
    price: "T&Cs Apply",
    priceNote: "",
    amount: 0,
    icon: Hash,
    features: [
      "ISBN setup",
      "Copyright registration",
      "Publishing metadata",
    ],
  },
  {
    id: "printing",
    title: "Printing & Binding",
    description: "High-quality physical production.",
    price: "Custom Quote",
    priceNote: "",
    amount: 0,
    icon: Printer,
    features: [
      "Paperback & hardcover options",
      "Proof copy review",
      "Bulk printing",
    ],
  },
  {
    id: "publishing",
    title: "Publishing & Distribution",
    description:
      "We handle the technical side of getting your book out.",
    price: "₦60,000 / $100",
    priceNote: "flat rate",
    amount: 100,
    icon: Globe,
    features: [
      "Amazon KDP & Selar setup",
      "Pricing configuration",
      "Distribution setup",
    ],
  },
  {
    id: "branding",
    title: "Author Branding",
    description: "Position yourself beyond the book.",
    price: "From $300/month",
    priceNote: "monthly retainer",
    amount: 300,
    icon: Users,
    features: [
      "Brand identity",
      "Social media management",
      "Content strategy",
    ],
  },
  {
    id: "marketing",
    title: "Book Marketing Strategy",
    description: "Launch your book with direction.",
    price: "Free",
    priceNote: "with 5+ services",
    amount: 0,
    icon: Megaphone,
    features: [
      "Campaign strategy",
      "Content creation",
      "Promotion planning",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Services = () => {
  return (
    <section id="services" className="py-20 lg:py-32 bg-muted/30 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-16 lg:mb-20 text-center max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold uppercase tracking-widest text-accent mb-6">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Our Services
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Everything you need to <span className="text-accent relative inline-block">
              publish
              <span className="absolute bottom-1 left-0 w-full h-2 bg-accent/20 -z-10 rounded"></span>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From the first word to the final print, each service is designed to move your book forward with clarity and professional execution at every stage.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
