import { ArrowRight, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import ConsultationDialog from "./ConsultationDialog";

const stats = [
  { value: "335+", label: "Books & Projects Delivered" },
  { value: "10+", label: "Years Editorial & Publishing Experience" },
  { value: "Global", label: "Authors Across Continents" },
];

const categories = [
  "Authors",
  "Thought Leaders",
  "Pastors",
  "Business Owners",
  "Coaches",
  "Professionals & Experts",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Hero = () => {
  return (
    <section id="home" className="relative pt-20 lg:pt-24 pb-12 lg:pb-0 bg-primary overflow-hidden">
      {/* Subtle Gradient Glow in Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            className="lg:col-span-7 xl:col-span-6 py-12 lg:py-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-bold text-primary-foreground leading-[1.1] mb-6"
            >

              <span className="text-accent relative inline-block">
                We publish premium books
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent/30 rounded-full"></span>
              </span>{" "}
              that builds you into a credible author.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base lg:text-lg text-primary-foreground/80 max-w-xl mb-10 leading-relaxed"
            >
              Your book reflects your voice and credibility. We partner with serious authors
              to refine their ideas into premium, excellent, keep-worthy, structured,
              professionally published books designed to stand the test of time.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#order"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Work With Us <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary-foreground/20 text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary-foreground/10 hover:border-primary-foreground/40 transition-all duration-300 backdrop-blur-sm"
              >
                Explore Services
              </a>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ConsultationDialog
                trigger={
                  <button className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/60 hover:text-accent transition-colors mb-12 group">
                    <span className="p-2 rounded-full bg-primary-foreground/5 group-hover:bg-accent/10 transition-colors">
                      <CalendarCheck size={16} className="text-accent" />
                    </span>
                    Or book a 45-min consultation with the Chief Editor
                  </button>
                }
              />
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-8 lg:gap-12 pt-8 border-t border-primary-foreground/10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wider max-w-[120px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-5 xl:col-span-6 relative hidden lg:flex justify-end items-center h-full"
          >
            <div className="relative w-full max-w-lg xl:max-w-xl mx-auto lg:mr-0 lg:ml-auto">
              {/* Image Glow/Shadow */}
              <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-[80px] -z-10 translate-y-10 translate-x-10"></div>

              <img
                src={heroImage}
                alt="Professional book publishing"
                className="w-full h-[450px] lg:h-[500px] object-cover rounded-t-[40px] rounded-bl-[40px] rounded-br-[12px] shadow-2xl relative z-10 border-4 border-primary/50"
              />

              {/* Glassmorphic Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-8 right-8 z-20 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-xl"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                  </span>
                  The rumours are true
                </div>
              </motion.div>


              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-8 -left-8 z-20 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-xl"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                  </span>
                  Your Voice, Done Right
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Who We Work With Marquee/Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 bg-primary-foreground/5 border-t border-primary-foreground/10 backdrop-blur-sm mt-12 lg:mt-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 py-5">
            <span className="text-xs uppercase tracking-widest text-primary-foreground/50 font-bold mr-2">We Publish:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-primary/40 text-primary-foreground border border-primary-foreground/10 hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
