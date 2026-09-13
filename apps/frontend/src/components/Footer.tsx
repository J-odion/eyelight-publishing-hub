import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { LeadsApi } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await LeadsApi.submitNewsletter({ name: "", email: email.trim() });
      toast.success("Welcome to the Eyelight newsletter!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <img src={logo} alt="Eyelight Publishing" className="h-10 mb-4 rounded" />
            <p className="text-sm opacity-60 leading-relaxed mb-4">
              Structured. Intentional. Credible publishing for serious authors.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:services@eyelightpublishing.com"
                className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                <Mail size={14} />
                services@eyelightpublishing.com
              </a>
              <a
                href="tel:+2349085181361"
                className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                <Phone size={14} />
                +234 908 518 1361
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-80">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#about" className="hover:opacity-100 transition-opacity">About Us</a></li>
              <li><a href="/catalogue" className="hover:opacity-100 transition-opacity">Book Catalogue</a></li>
              <li><a href="/events" className="hover:opacity-100 transition-opacity">Events</a></li>
              <li><a href="/press" className="hover:opacity-100 transition-opacity">Press Room</a></li>
              <li><a href="/submit-manuscript" className="hover:opacity-100 transition-opacity">Submit Manuscript</a></li>
              <li><a href="/portal" className="hover:opacity-100 transition-opacity">Author Portal</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-80">Services</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li>Ghostwriting</li>
              <li>Editing & Proofreading</li>
              <li>Cover Design</li>
              <li>Publishing & Distribution</li>
              <li>Book Marketing</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest opacity-80">Join Our Newsletter</h4>
            <p className="text-sm opacity-60 mb-4">Get publishing tips, updates, and exclusive resources.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="flex-1 px-3 py-2 bg-background/10 border border-background/20 rounded-lg text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-background/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "..." : "Join"}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center space-y-2">
          <p className="text-xs opacity-40">
            © {new Date().getFullYear()} Eyelight Publishing. All rights reserved.
          </p>
          <p className="text-xs opacity-40">
            Built by{" "}
            <a
              href="https://www.splashtechstudios.com.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 underline transition-opacity"
            >
              SPC
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
