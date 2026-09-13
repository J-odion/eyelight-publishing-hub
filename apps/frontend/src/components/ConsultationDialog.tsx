import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, DollarSign, MessageCircle, Mail, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  trigger: ReactNode;
}

const whatsappMessage = encodeURIComponent(
  "Hello, I'd like to book a 45-minute consultation with the Chief Editor."
);

const ConsultationDialog = ({ trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Book a Consultation with the{" "}
            <span className="text-accent">Chief Editor</span>
          </DialogTitle>
          <DialogDescription>
            A focused 45-minute session to review your project, clarify your
            direction, and map out your next steps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                <DollarSign size={14} /> Fee
              </div>
              <p className="text-sm font-semibold text-foreground">
                ₦25,000
              </p>
              <p className="text-xs text-muted-foreground mt-1">per session</p>
            </div>
            <div className="bg-muted rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                <Clock size={14} /> Duration
              </div>
              <p className="text-sm font-semibold text-foreground">45 minutes</p>
              <p className="text-xs text-muted-foreground mt-1">
                One-on-one call
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              <Calendar size={14} /> Available Slots (WAT)
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Monday – Saturday</span>
                <span className="font-medium">10:00 AM · 3:00 PM · 9:15 PM</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted-foreground">Sunday</span>
                <span className="font-medium">9:00 PM</span>
              </li>
            </ul>
          </div>

          <Link
            to="/book"
            onClick={() => setOpen(false)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <CreditCard size={16} /> Reserve & Pay Online
          </Link>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/2349085181361?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="mailto:services@eyelightpublishing.com?subject=Consultation%20Booking%20Request"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors"
            >
              <Mail size={16} /> Email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationDialog;
