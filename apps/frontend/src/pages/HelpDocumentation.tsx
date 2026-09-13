import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Layers, Settings, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpDocumentation = () => {
  return (
    <div className="min-h-screen bg-muted/30 py-20 lg:py-28 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            System <span className="text-accent">Documentation</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            A comprehensive overview of the Eyelight Publishing Hub architecture, portals, and features.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Section 1: Summary of Achievements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Star className="text-accent" /> Summary of Achievements
            </h2>
            <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-muted-foreground">
              <p>
                The Eyelight Publishing Hub has been completely transformed into a modern, sleek, and highly functional monolithic web application. We successfully migrated from a disjointed architecture to an integrated full-stack solution featuring:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-foreground/80">
                <li><strong>Premium UI/UX:</strong> A glassmorphic, highly animated (Framer Motion) frontend built with React, Vite, and Tailwind CSS.</li>
                <li><strong>Unified Monorepo:</strong> Seamlessly integrated a NestJS backend and React frontend into a single repository for easier deployment and maintenance.</li>
                <li><strong>End-to-End Workflows:</strong> Automated the entire author lifecycle from manuscript submission and payment processing (Paystack) to project tracking and referral rewards.</li>
                <li><strong>Dynamic Admin CRM:</strong> A robust admin portal to manage leads, send broadcast emails (Resend API), track book production pipelines, and manage authors.</li>
                <li><strong>Production-Ready Deployment:</strong> Fully configured for Render (Backend) and Vercel (Frontend) with hardened security protocols and environment configurations.</li>
              </ul>
            </div>
          </motion.div>

          {/* Section 2: Public Pages */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <BookOpen className="text-accent" /> Public Pages (Author Acquisition)
            </h2>
            <p className="text-muted-foreground mb-6">
              These pages serve as the marketing front-end to attract and onboard new authors.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RouteCard title="Homepage" path="/" desc="The main landing page featuring premium animations, service highlights, and the primary call-to-action." />
              <RouteCard title="Submit Manuscript" path="/submit-manuscript" desc="A unified onboarding flow where authors submit book details and instantly create their portal account." />
              <RouteCard title="Book Consultation" path="/book" desc="Paystack-integrated scheduling page for 1:1 sessions." />
              <RouteCard title="Book Catalogue" path="/catalogue" desc="A dynamic grid displaying published works and successful projects." />
              <RouteCard title="Events" path="/events" desc="Upcoming webinars and book launches with RSVP functionality." />
              <RouteCard title="Press Room" path="/press" desc="Downloadable media kits, press releases, and author assets." />
            </div>
          </motion.div>

          {/* Section 3: Author Portal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl p-8 lg:p-10 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Users className="text-accent" /> Author Portal (Client Dashboard)
            </h2>
            <p className="text-muted-foreground mb-6">
              A private, secure workspace for authors to track their publishing journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RouteCard title="Author Login & Dashboard" path="/portal" desc="Protected via JWT authentication. Authors can view their active manuscript progress, upload files, and check outstanding payments." />
              <div className="bg-muted p-5 rounded-xl border border-border/50">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2"><Layers size={16} /> Referral System</h4>
                <p className="text-sm text-muted-foreground">Embedded within the portal, authors get a unique tracking link (e.g., EYE-12345). The system automatically tracks signups via this link and rewards the referrer.</p>
              </div>
            </div>
          </motion.div>

          {/* Section 4: Admin CRM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary text-primary-foreground rounded-3xl p-8 lg:p-10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
              <Settings className="text-accent" /> Admin ERP / CRM
            </h2>
            <p className="text-primary-foreground/80 mb-6 relative z-10">
              The command center for staff to manage the entire publishing business.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <RouteCard title="Admin Login" path="/admin/login" desc="Role-based access control. Only users with the 'admin' role can access the CRM." dark />
              <RouteCard title="Main CRM Dashboard" path="/admin/crm" desc="Central hub containing the Leads Pipeline, Email Engine (Resend API), and the global Production Board." dark />
              <RouteCard title="Author 360° Profile" path="/admin/authors/:id" desc="Detailed view of a specific author, allowing admins to manually update project status, log payments, and manage referral payouts." dark />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const RouteCard = ({ title, path, desc, dark = false }: { title: string, path: string, desc: string, dark?: boolean }) => (
  <Link to={path.includes(':') ? '#' : path} className={`block p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${dark ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20' : 'bg-background border-border hover:shadow-md'}`}>
    <div className="flex items-start justify-between mb-2">
      <h4 className={`font-bold ${dark ? 'text-white' : 'text-foreground'}`}>{title}</h4>
      {!path.includes(':') && <ArrowRight size={16} className={dark ? 'text-accent' : 'text-muted-foreground'} />}
    </div>
    <div className={`text-xs font-mono py-1 px-2 rounded mb-3 inline-block ${dark ? 'bg-black/30 text-accent' : 'bg-muted text-foreground'}`}>
      {path}
    </div>
    <p className={`text-sm ${dark ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{desc}</p>
  </Link>
);

export default HelpDocumentation;
