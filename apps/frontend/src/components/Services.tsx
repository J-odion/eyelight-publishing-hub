import { motion } from "framer-motion";
import ServiceCard from "./ServiceCard";
import { services } from "@/data/servicesData";

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
