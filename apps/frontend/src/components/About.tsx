import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import aboutImage from "@/assets/about-image.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const About = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-[-10%] w-[40%] h-[50%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Image */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Image Wrapper for styling */}
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-accent/10 translate-x-4 translate-y-4 rounded-3xl -z-10"></div>
              <img
                src={aboutImage}
                alt="About Eyelight Publishing"
                className="w-full rounded-2xl object-cover shadow-[0_20px_50px_rgb(0,0,0,0.1)] border-4 border-background"
              />
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={itemVariants} className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> About Us
            </motion.p>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
              About Eyelight <span className="text-accent relative inline-block">
                Publishing
                <span className="absolute bottom-1 left-0 w-full h-2 bg-accent/20 -z-10 rounded"></span>
              </span>
            </motion.h2>
            
            <motion.div variants={itemVariants} className="space-y-5">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Eyelight Publishing exists for one reason: to help serious authors produce books
                that are clear, structured, and professionally done.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are a team of writers, editors, and publishing specialists who understand that
                a book is more than words on a page. It is a representation of your thinking,
                your experience, and your authority.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Over the years, we've worked with over 335 authors, helping them move from
                scattered ideas to finished, published books they are proud to attach their names to.
                We don't rush books out. We develop them properly.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 mb-10">
              <a
                href="#services"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Our Services <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                  <BookOpen size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground mb-1">335+ Projects</div>
                  <div className="text-sm text-muted-foreground leading-snug">Books delivered worldwide</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                  <MapPin size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground mb-1">Global Reach</div>
                  <div className="text-sm text-muted-foreground leading-snug">Authors across continents</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
