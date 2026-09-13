import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

const PRICE_NGN = 25000;
const DURATION_MIN = 45;

// Weekday slots: Mon (1) – Sat (6) → 10:00, 15:00, 21:15. Sunday (0) → 21:00.
const WEEKDAY_SLOTS = ["10:00", "15:00", "21:15"];
const SUNDAY_SLOTS = ["21:00"];

// Mock "already booked" slots (would come from backend)
const MOCK_BOOKED: { date: string; time: string }[] = [
  { date: format(addDays(new Date(), 1), "yyyy-MM-dd"), time: "10:00" },
  { date: format(addDays(new Date(), 2), "yyyy-MM-dd"), time: "15:00" },
];

const formatTimeLabel = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
};

const STEPS = ["Date", "Time", "Details", "Payment"] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  note: string;
};

const Book = () => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // 14 days starting today
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)),
    []
  );

  const slotsForDate = (d: Date) => {
    const day = d.getDay();
    const base = day === 0 ? SUNDAY_SLOTS : WEEKDAY_SLOTS;
    const key = format(d, "yyyy-MM-dd");
    const booked = new Set(
      MOCK_BOOKED.filter((b) => b.date === key).map((b) => b.time)
    );
    return base.map((t) => ({ time: t, booked: booked.has(t) }));
  };

  const goNext = () => setStep((s) => Math.min(3, s + 1) as typeof step);
  const goBack = () => setStep((s) => Math.max(0, s - 1) as typeof step);

  const validateDetails = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (form.phone.trim().length < 7) return "Please enter a valid phone number.";
    return null;
  };

  const handleContinueToPayment = async () => {
    setSubmitting(true);
    // Frontend-only: simulate reservation + redirect to Paystack
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    toast({
      title: "Slot reserved (10 mins)",
      description:
        "Backend not yet connected. Paystack checkout will open here once webhooks are wired.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Eyelight Publishing" className="h-10 lg:h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 max-w-3xl">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            1:1 Editorial Guidance
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Book a Consultation with the{" "}
            <span className="text-accent">Chief Editor</span>
          </h1>
          <p className="text-muted-foreground">
            ₦{PRICE_NGN.toLocaleString()} · {DURATION_MIN} mins · One-on-one call (WAT)
          </p>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-between mb-10 max-w-md mx-auto">
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={label} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors",
                      active && "bg-accent text-accent-foreground border-accent",
                      done && "bg-primary text-primary-foreground border-primary",
                      !active && !done && "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-[11px] font-medium uppercase tracking-wider",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 mx-1 -mt-6",
                      done ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <section className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-card">
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Select a date
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Showing the next 14 days. Times shown are West Africa Time (WAT).
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {days.map((d) => {
                  const selected = date && isSameDay(d, date);
                  const slots = slotsForDate(d);
                  const available = slots.some((s) => !s.booked);
                  return (
                    <button
                      key={d.toISOString()}
                      disabled={!available}
                      onClick={() => setDate(d)}
                      className={cn(
                        "rounded-lg border p-3 text-center transition-colors",
                        selected
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50 bg-background",
                        !available && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {format(d, "EEE")}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {format(d, "d")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {format(d, "MMM")}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  disabled={!date}
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-full disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && date && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Pick a time
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {format(date, "EEEE, MMMM d, yyyy")} · {DURATION_MIN} mins per session
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsForDate(date).map(({ time: t, booked }) => {
                  const selected = time === t;
                  return (
                    <button
                      key={t}
                      disabled={booked}
                      onClick={() => setTime(t)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        selected
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-background hover:border-accent/50 text-foreground",
                        booked && "opacity-40 cursor-not-allowed line-through"
                      )}
                    >
                      <Clock size={14} /> {formatTimeLabel(t)}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  disabled={!time}
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-full disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Your details
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                We'll send the confirmation and meeting link to your email.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Jane Doe"
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="jane@example.com"
                />
                <Field
                  label="Phone (WhatsApp)"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="+234 ..."
                />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Note (optional)
                </label>
                <textarea
                  rows={4}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    const err = validateDetails();
                    if (err) {
                      toast({ title: "Check your details", description: err });
                      return;
                    }
                    goNext();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                  Review & Pay <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && date && time && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Confirm & pay
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Your slot will be reserved for 10 minutes while you complete payment.
              </p>

              <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
                <Row label="Service" value={`Consultation · ${DURATION_MIN} mins`} />
                <Row label="Date" value={format(date, "EEEE, MMMM d, yyyy")} />
                <Row label="Time (WAT)" value={formatTimeLabel(time)} />
                <Row label="Name" value={form.name} />
                <Row label="Email" value={form.email} />
                <Row label="Phone" value={form.phone} />
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    ₦{PRICE_NGN.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                <Lock size={12} /> Secure payment processed by Paystack.
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={goBack}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-full hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleContinueToPayment}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Reserving slot...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} /> Pay ₦{PRICE_NGN.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground mt-6 inline-flex items-center gap-2 w-full justify-center">
          <CalendarCheck size={12} /> Slots auto-sync with the editor's calendar to avoid
          conflicts.
        </p>
      </main>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
    />
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right">{value}</span>
  </div>
);

export default Book;
