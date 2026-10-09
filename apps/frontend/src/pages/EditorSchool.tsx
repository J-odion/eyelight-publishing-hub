import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Lightbulb, 
  Target, 
  XCircle,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { LeadsApi } from "@/lib/api";

export default function EditorSchool() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isDiscountActive, setIsDiscountActive] = useState(true);
  const { toast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Auto-save function for partial leads
  const saveLeadToCRM = async (status: 'incomplete' | 'complete') => {
    if (!formData.email || !formData.email.includes("@")) return;

    try {
      await LeadsApi.submitCourseRegistration({
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        metadata: {
          course: "editor_school",
          status: status,
          experience: formData.experience,
        }
      });
    } catch (e) {
      console.error("Failed to save lead", e);
    }
  };

  const handleBlur = () => {
    saveLeadToCRM('incomplete');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      toast({ title: "Required fields missing", description: "Please provide your name and email.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    await saveLeadToCRM('complete');
    
    // Simulate payment gateway redirect or success state
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      toast({ title: "Registration received!", description: "Redirecting to payment gateway..." });
    }, 1000);
  };

  useEffect(() => {
    // Discount ends on November 25, 2026
    const discountEndDate = new Date("November 25, 2026 23:59:59").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = discountEndDate - now;
      
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("");
        setIsDiscountActive(false);
        return;
      }
      
      setIsDiscountActive(true);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s left until price change`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const currentPriceNaira = isDiscountActive ? "₦15,000" : "₦33,500";
  const currentPriceUsd = isDiscountActive ? "$12" : "$25";

  const handleCTA = () => {
    const el = document.getElementById("register");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-amber-100">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 mix-blend-multiply pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Enrollment open for December 2026 Cohort
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6 text-slate-900 tracking-tight">
            The Book Editor <br className="hidden md:block"/> Business School
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-4 max-w-2xl mx-auto font-light leading-relaxed">
            Editing books is a skill. Building a business around that skill is a completely different game.
          </p>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            You can spend 70 hours inside somebody’s manuscript, save their book from disaster, make their ideas clearer... and still be the person they negotiate down to ₦10,000. That ends here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" onClick={handleCTA} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-base h-14 px-8 rounded-none transition-all hover:translate-y-[-2px] shadow-lg">
              SAVE YOUR SEAT FOR THE BOOK EDITOR BUSINESS SCHOOL
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-500 mt-8 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>3-Day Programme: Dec 4–6, 2026</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2">
              {isDiscountActive && (
                <span className="line-through text-slate-400 mr-2">₦33,500</span>
              )}
              <span className="font-semibold text-slate-800 text-base">{currentPriceNaira} / {currentPriceUsd}</span>
            </div>
            {timeLeft && (
               <>
                 <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300"></div>
                 <div className="text-amber-700 bg-amber-50 px-3 py-1.5 rounded font-mono font-bold tracking-tight border border-amber-200">
                   {timeLeft}
                 </div>
               </>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50">
        <Button onClick={handleCTA} className="w-full bg-slate-900 text-white h-12 rounded-none">
          SAVE YOUR SEAT — {currentPriceNaira}
        </Button>
      </div>

      {/* 2. The Problem */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-8 text-slate-900 leading-tight">
            The problem is not that editors don't make money.
          </h2>
          <div className="w-16 h-px bg-amber-300 mx-auto mb-8"></div>
          <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
            The problem is that too many editors have never learnt how to make their skill expensive.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Authors will spend thousands designing covers. Millions printing books. Thousands running ads. Then suddenly, when it is time to edit the manuscript:
          </p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left">
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm italic text-slate-500 text-sm">"Please, what's your final price?"</div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm italic text-slate-500 text-sm">"I have another editor that can do it for less."</div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm italic text-slate-500 text-sm">"It's just proofreading."</div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm italic text-slate-500 text-sm">"The manuscript is already written."</div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm italic text-slate-500 text-sm">"Can't you just correct the errors?"</div>
          </div>
          
          <p className="text-lg text-slate-600 leading-relaxed">
            Then, because nobody taught you how to communicate the value of what you do, you start defending your price. Then reducing it. Then apologising for it. Then accepting work that makes you resent the author. Then wondering why editing doesn't pay. <br/><br/><strong className="text-slate-900 font-serif text-xl">Editing is not the problem. Your business model might be.</strong>
          </p>
        </div>
      </section>

      {/* 3. Grace's Story & 4. The Big Shift */}
      <section className="py-24 bg-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-amber-400 mb-4 font-serif italic text-xl">From a ₦100 Recharge Card to Millions</div>
            <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
              I know what it feels like to think editing doesn't pay.
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              I started editing while I was in the university. People started bringing me their manuscripts. Then one day, an author paid me for editing with a ₦100 recharge card. I thought, well, at least somebody is paying me to do something I enjoy. I had no idea I was sitting on a skill that would change my life.
            </p>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Then one author paid me ₦60,000. Another paid me ₦100,000. Those two payments changed everything. I started paying attention, figuring out how to price, position, and communicate value.
            </p>
            <p className="text-slate-300 mb-8 leading-relaxed font-medium text-amber-50">
              Today, that same skill has put me behind books read by thousands. It has allowed respected authors and leaders like Apostle Femi Lazarus, Nurse Sugar, Dr. Christine, and Lilly White to trust me with their legacies.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                 {/* Placeholder for Grace's photo */}
                 <span className="font-serif text-xl">G</span>
              </div>
              <div>
                <div className="font-medium text-white">Grace</div>
                <div className="text-sm text-slate-400">Graduate of English & Literary Studies<br/>Founder, Eyelight Publishers</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-8 md:p-12 border border-slate-700 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
            <h3 className="text-xl font-serif mb-6 text-white">The Big Shift</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <XCircle className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-sm mb-1">Old Way (The Craft Trap)</span>
                  Waiting for authors to find you, charging per word without strategy, and taking whatever budget they offer.
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-amber-200 text-sm mb-1">New Way (The Business Shift)</span>
                  Positioning yourself as a premium consultant, creating packaged offers, and commanding rates that reflect your true value.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3.5. Instructor Gallery Slider */}
      <section className="py-24 bg-white overflow-hidden border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Meet Your Instructor</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Grace is the Founder of Eyelight Publishing, having scaled her editorial business from the ground up to serve hundreds of authors globally.
            </p>
          </div>
          
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <CarouselItem key={num} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="p-1 h-full">
                    <img 
                      src={`/editor-school/${num}.jpg`} 
                      alt={`Grace - Eyelight Publishing Founder ${num}`} 
                      className="w-full h-[400px] object-cover rounded-sm shadow-md transition-transform duration-300 hover:scale-[1.02]" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-slate-200" />
              <CarouselNext className="-right-12 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-slate-200" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 3.6. Books Edited Gallery */}
      <section className="py-24 bg-slate-50 overflow-hidden border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Select Editorial Work</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A glimpse at some of the titles shaped and polished by Grace during the early stages of building Eyelight Publishing.
            </p>
          </div>
          
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4 md:-ml-8 items-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <CarouselItem key={num} className="pl-4 md:pl-8 sm:basis-1/2 md:basis-1/3">
                  <div className="p-2 transition-transform duration-300 hover:-translate-y-2">
                    <img 
                      src={`/editor-school/books/Image ${num}.png`} 
                      alt={`Book edited by Grace ${num}`} 
                      className="w-full h-auto object-contain drop-shadow-xl max-h-[400px]" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-slate-200" />
              <CarouselNext className="-right-12 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-slate-200" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 5. AI Section */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-6">
            <Lightbulb className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-slate-900">
            AI isn't necessarily the enemy.
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Many editors are terrified of AI taking their jobs. But AI can only generate text; it cannot provide human editorial judgment, empathy, and strategic structural direction. We will show you how to position your human insight as your greatest, un-replicable asset.
          </p>
        </div>
      </section>

      {/* 6. What You'll Learn */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6 text-slate-900">
              The Curriculum
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Not theory or endless grammar lectures. Business. Skill. Process. Positioning. Money.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "01. THE EDITORIAL PROCESS", desc: "How to take a book from manuscript receipt to final delivery without wondering what you're supposed to do next." },
              { title: "02. THE FOUR TYPES OF BOOK EDITING", desc: "What they are, how they differ and, more importantly, which ones you should actually be selling." },
              { title: "03. MANUSCRIPT ASSESSMENT", desc: "The top things you should look for before touching a manuscript so you don't walk blindly into a project." },
              { title: "04. DEVELOPMENTAL EDITING", desc: "How to fix a book with brilliant ideas but terrible execution." },
              { title: "05. WHERE YOUR EDITING ENDS", desc: "Line editing. Developmental editing. Proofreading. Where exactly should you stop? Touching everything does not make you a better editor." },
              { title: "06. EDITING DIFFERENT GENRES", desc: "How to work across genres without flattening every author's voice into your own." },
              { title: "07. EDITORIAL JUDGEMENT", desc: "What to change. What to confirm. What to question. What to leave alone. This separates editors from grammar checkers." },
              { title: "08. AUTHOR FEEDBACK", desc: "How to tell an author that something is not working without starting a war." },
              { title: "09. PRICING YOUR SERVICES", desc: "Stop pulling prices from thin air. Learn how to think about your fees professionally." },
              { title: "10. CALCULATING YOUR EDITING FEE", desc: "How to calculate your fee from the manuscript itself. Not from desperation or what your friend charges." },
              { title: "11. GETTING CLIENTS", desc: "How to get your first editing clients without begging people on WhatsApp to 'please patronise me.'" },
              { title: "12. YOUR EDITING WORKFLOW", desc: "Build a process from manuscript receipt to final delivery." },
              { title: "13. PROTECTING YOURSELF", desc: "Contracts. Briefs. Boundaries. Revisions. Because 'just one more little change' has destroyed many an editor's peace." },
              { title: "14. DIFFICULT AUTHORS & DEADLINES", desc: "How to deal with clients who want everything yesterday and another 17 changes today." },
              { title: "15. PROFESSIONAL POSITIONING", desc: "How to position yourself as a professional editor even when you're still building your track record." },
              { title: "16. AI VS HUMAN EDITING", desc: "What you should never blindly outsource to AI." },
              { title: "17. AI-PROOFING YOUR BUSINESS", desc: "How to evolve your service before it becomes replaceable." },
              { title: "18. BEYOND FREELANCING", desc: "Learn how to build an editing business that can eventually grow beyond your own two hands." },
              { title: "19. CERTIFICATE", desc: "You will receive a certificate of participation." },
              { title: "20. THE BEST STUDENT CASH GRANT", desc: "The outstanding student of the cohort will receive a cash grant to support the growth of their editing business." }
            ].map((lesson, idx) => (
              <Card key={idx} className="rounded-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-slate-50/50">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold tracking-wider text-amber-700 mb-3">{lesson.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{lesson.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Transformation */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-6 text-slate-900">
            Imagine what changes when you stop thinking like a freelancer.
          </h2>
          
          <div className="text-left max-w-3xl mx-auto space-y-6 mt-16 text-lg text-slate-700">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b border-slate-200 pb-4">
              <span className="text-slate-400 font-medium">You stop asking:</span>
              <span className="italic">"How much can this author afford?"</span>
              <span className="hidden md:inline text-amber-500">→</span>
              <span className="text-slate-900 font-medium">and start asking: "What does this project require?"</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b border-slate-200 pb-4">
              <span className="text-slate-400 font-medium">You stop saying:</span>
              <span className="italic">"I can edit anything."</span>
              <span className="hidden md:inline text-amber-500">→</span>
              <span className="text-slate-900 font-medium">and start communicating exactly what you do.</span>
            </div>

            <p className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-1"/> <span>You stop taking manuscripts through WhatsApp with no brief, no contract, no process and no boundaries.</span></p>
            <p className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-1"/> <span>You stop calculating prices based on fear.</span></p>
            <p className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-1"/> <span>You stop accepting authors who treat your expertise like a commodity.</span></p>
            <p className="flex items-start gap-3"><CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-1"/> <span>You stop panicking every time someone asks: "What's your price?"</span></p>
            
            <div className="pt-8 text-center text-xl font-medium text-slate-900">
              Then you start building an editing business that makes sense.<br/>
              A business with processes. Standards. Boundaries. Positioning. Better clients.<br/>
              <span className="text-amber-600 font-serif text-3xl mt-6 block">And, yes... Better money.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Who It's For / Not For */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-serif mb-8 text-slate-900 border-b pb-4">This is for you if...</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You already edit books but feel like you're constantly underpaid.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You are tired of authors negotiating every fee.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You edit without a proper workflow and keep attracting bargain hunters.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You've been relying on referrals and don't know how to consistently find clients.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You are already using AI but don't know how to make your human expertise more valuable.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600 text-sm">You are thinking: "I know I can do this. I just don't know how to build the business."</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-serif mb-8 text-slate-900 border-b pb-4">This is NOT for you if...</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-sm">You want a certificate to frame on your wall and do nothing with it.</span>
                </li>
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-sm">You want a magic formula that will make clients appear without you doing the work.</span>
                </li>
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-sm">You want to remain comfortable charging whatever people are willing to give you.</span>
                </li>
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-sm">You think being a good editor automatically makes you a good business owner. It doesn't.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bonuses & 10. Details */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4 text-slate-900">Included in your enrollment</h2>
            <p className="text-slate-600">And I'm not sending you into the real world with only live classes. God forbid!</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">The Editor's Toolkit</h4>
                <p className="text-sm text-slate-600 mb-2">The documents that help you look and operate like a business.</p>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Contracts & Onboarding forms</li>
                  <li>Editing briefs & Checklists</li>
                  <li>Style sheets</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Pricing & Proposal Kit</h4>
                <p className="text-sm text-slate-600 mb-2">Knowing what you charge is one thing. Presenting it professionally is another.</p>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  <li>Pricing calculator & Invoice</li>
                  <li>Quotation & Proposal templates</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Real Manuscript Walkthrough</h4>
                <p className="text-sm text-slate-600">See the work, don't just hear about it. A real sample manuscript: Before and After. What was changed, what wasn't, and exactly why.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Investment / Final CTA / Registration */}
      <section id="register" className="py-24 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              I can do better than this.
            </h2>
            <p className="text-xl text-slate-300 font-light">
              If you've ever thought that, this is your next step.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            {/* Investment Summary */}
            <div className="bg-white text-slate-900 p-8 md:p-12 shadow-2xl relative order-2 md:order-1">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 text-sm font-bold tracking-wider uppercase whitespace-nowrap">
                Enrollment Closing Soon
              </div>
              
              <div className="mb-8 mt-4">
                <div className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-2">Total Investment</div>
                
                {isDiscountActive ? (
                  <>
                    <div className="text-2xl font-serif text-slate-400 line-through mb-1">₦33,500 / $25</div>
                    <div className="text-5xl font-serif font-medium text-slate-900 mb-2">{currentPriceNaira} <span className="text-2xl text-slate-400">/ {currentPriceUsd}</span></div>
                    <div className="text-amber-600 text-sm font-medium">Flash discount active. {timeLeft}</div>
                  </>
                ) : (
                  <>
                    <div className="text-5xl font-serif font-medium text-slate-900 mb-2">{currentPriceNaira} <span className="text-2xl text-slate-400">/ {currentPriceUsd}</span></div>
                    <div className="text-slate-500 text-sm font-medium">Standard Pricing</div>
                  </>
                )}
              </div>
              
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500"/> 3-Day Intensive (Dec 4-6)</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500"/> Graduation (Dec 7)</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500"/> All Bonuses & Templates</li>
                <li className="flex items-center gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 text-amber-500"/> Session Recordings</li>
              </ul>
              
              <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
                <p className="text-sm text-slate-600 italic">
                  "This programme paid for itself within two weeks when I restructured my pricing using the templates provided."
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-slate-800 p-8 md:p-10 border border-slate-700 order-1 md:order-2">
              <h3 className="text-2xl font-serif mb-6 text-white">Secure Your Spot</h3>
              {hasSubmitted ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl text-white font-medium mb-2">Registration initiated!</h4>
                  <p className="text-slate-400">Redirecting you to our secure payment gateway to complete your enrollment.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="jane@example.com" 
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onBlur={handleBlur}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+234..." 
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-slate-300">Years of Editing Experience</Label>
                    <Input 
                      id="experience" 
                      placeholder="e.g. 2 years, none, 5+ years" 
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 h-14 rounded-none text-base font-bold transition-all hover:translate-y-[-2px] shadow-lg"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                      ) : (
                        `PROCEED TO PAYMENT — ${currentPriceNaira}`
                      )}
                    </Button>
                    <p className="text-xs text-slate-500 text-center mt-4">
                      By proceeding, you agree to our terms of service. Your information is securely stored.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-serif mb-12 text-center text-slate-900">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "How long is The Book Editor Business School?", a: "The school runs for 3 days, from December 4–6, 2026." },
              { q: "When does the class start and end?", a: "Classes begin on December 4, 2026. Graduation is on December 7, 2026. 🎓" },
              { q: "Will I receive a certificate?", a: "Yes. Every participant who completes the programme will receive a Certificate of Participation." },
              { q: "Who is this school for?", a: "This school is for people who already edit books. You don't need to have 10 years of experience or 100 books edited. What matters is that you have actual experience and want to become better at the work and business." },
              { q: "Is this for complete beginners who have never edited a book?", a: "No. This is not a beginner's 'how to become an editor' course. If you've never edited a book before, this is probably not the right place to start." },
              { q: "I already edit books. What exactly will I gain from this?", a: "You may already know how to edit but still struggle with pricing, positioning, getting clients, contracts, boundaries, workflow, author management, revisions and building a business. That's where this school comes in." },
              { q: "Is this just an editing skills course?", a: "No. It covers the editing craft, but the bigger focus is on helping you run your editing like a real business. You'll learn pricing, workflow, working with authors, positioning, and AI-proofing." },
              { q: "Will you teach me how to charge more for my editing?", a: "We will teach you how to price your work properly, calculate fees from the manuscript and communicate your value. The goal isn't simply 'Charge more.' It's to understand why your work costs what it costs." },
              { q: "Will you teach us how to get better-paying clients?", a: "Yes. We'll cover positioning and client acquisition, including how to get editing clients without constantly begging people to give you work." },
              { q: "What if I already have clients but most of them don't pay very well?", a: "Then you're exactly the kind of person who should pay attention. Being busy is not the same as having a good business. We will help you examine your positioning so you can move towards better projects." },
              { q: "What will you teach us about AI?", a: "We'll look at AI vs. human editing, what you should never blindly outsource, and how to AI-proof your business so you don't become replaceable." },
              { q: "Do I need to know anything about AI before joining?", a: "No. You simply need to already have experience editing books. We'll handle the AI conversation from there." },
              { q: "Can I join if I already have an established editing business?", a: "Absolutely. You don't have to be struggling to benefit. We can help you tighten systems, improve positioning, refine pricing and think beyond simply selling your time." },
              { q: "Will there be a cash grant?", a: "Yes. The outstanding participant of the cohort will receive a cash grant to support the growth of their editing business." },
              { q: "Is the programme online?", a: "Yes. The school is designed to be accessible to participants regardless of where they are located." },
              { q: "How much does it cost?", a: "The investment is ₦33,500 or $25. That's for the complete 3-day programme, including the bonuses, certificate and graduation." },
              { q: "Is this a university degree or diploma?", a: "No. This is a professional training programme. You will receive a Certificate of Participation. It is not a government licence or university qualification." },
              { q: "What if I'm still unsure?", a: "If you already edit books and you've ever thought: 'I know how to do this. I just don't know how to make this business work the way I want it to.' This is probably the room you need to be in. Come with your experience. We'll work on the rest." }
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-200">
                <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Eyelight Publishing. All rights reserved.</p>
      </footer>
    </div>
  );
}
