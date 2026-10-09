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
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Learn the craft. Build the business. Become harder to replace.
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
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-8 text-slate-900">
            You can be an excellent editor and still be broke.
          </h2>
          <div className="w-16 h-px bg-amber-300 mx-auto mb-8"></div>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Many editors spend years mastering the craft of words, grammar, and story arcs. They can spot a misplaced modifier from a mile away and know exactly how to fix a sagging middle in a manuscript.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            But there is a massive disconnect between editing skill and business skill. Knowing how to fix a book doesn't automatically mean you know how to price your services, attract high-paying authors, or structure a sustainable career.
          </p>
        </div>
      </section>

      {/* 3. Grace's Story & 4. The Big Shift */}
      <section className="py-24 bg-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-amber-400 mb-4 font-serif italic text-xl">From ₦100 to Millions</div>
            <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
              Editing isn't the problem.<br />Your business model might be.
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed">
              When I started, I was paid with a ₦100 recharge card. I thought that was just how it worked. Then I upgraded to ₦60,000, then ₦100,000. It wasn't until I shifted my mindset from "freelancer doing odd jobs" to "publishing professional running a business" that everything changed.
            </p>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Today, I run a publishing firm that has handled hundreds of books. The craft is essential, but the business is what sustains you. I want to show you the exact frameworks I use.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                 {/* Placeholder for Grace's photo */}
                 <span className="font-serif text-xl">G</span>
              </div>
              <div>
                <div className="font-medium text-white">Grace</div>
                <div className="text-sm text-slate-400">Founder, Eyelight Publishing</div>
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
          <h2 className="text-3xl md:text-5xl font-serif mb-16 text-center text-slate-900">
            The Curriculum
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="rounded-none border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <BookOpen className="w-8 h-8 text-amber-600 mb-6" />
                <h3 className="text-xl font-serif font-medium mb-4">Editorial Mastery</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">Elevate your baseline skills from good to exceptional. Learn to spot structural flaws that others miss.</p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Developmental deep dives</li>
                  <li>Line editing precision</li>
                  <li>Author voice preservation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <TrendingUp className="w-8 h-8 text-amber-600 mb-6" />
                <h3 className="text-xl font-serif font-medium mb-4">Pricing & Money</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">Stop guessing your rates. Build a pricing model that reflects your expertise and guarantees profitability.</p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Value-based pricing</li>
                  <li>Packaging your services</li>
                  <li>Handling objections</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <Target className="w-8 h-8 text-amber-600 mb-6" />
                <h3 className="text-xl font-serif font-medium mb-4">Clients & Positioning</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">Attract the right authors. Learn how to present yourself so premium clients seek you out.</p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Portfolio building</li>
                  <li>Pitching strategies</li>
                  <li>Niche dominance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <ShieldCheck className="w-8 h-8 text-amber-600 mb-6" />
                <h3 className="text-xl font-serif font-medium mb-4">Systems & Protection</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">Protect your time and energy. Set up the workflows that professional firms use.</p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Contracts that protect you</li>
                  <li>Onboarding workflows</li>
                  <li>Boundary setting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-2 bg-amber-50/50 border-amber-100">
              <CardContent className="p-8">
                <Lightbulb className="w-8 h-8 text-amber-600 mb-6" />
                <h3 className="text-xl font-serif font-medium mb-4">AI & Future-Proofing</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-xl">
                  Adapt to the new landscape. Learn how to integrate AI tools to speed up your workflow without compromising quality, while marketing your distinctly human editorial intuition.
                </p>
                <Button variant="link" className="px-0 text-amber-700 hover:text-amber-800">
                  Read full syllabus <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. Transformation */}
      <section className="py-24 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-6 text-slate-900">
            Stop thinking like a freelancer.
          </h2>
          <p className="text-xl text-slate-600 mb-16 font-light">
            Start operating like a premium editorial business.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-8 bg-white border border-slate-200">
              <h3 className="text-lg font-medium text-slate-500 mb-6 uppercase tracking-wider text-center">Before</h3>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3"><XCircle className="w-5 h-5 text-slate-300 shrink-0"/> Scrambling for the next client.</li>
                <li className="flex gap-3"><XCircle className="w-5 h-5 text-slate-300 shrink-0"/> Accepting any rate just to get the job.</li>
                <li className="flex gap-3"><XCircle className="w-5 h-5 text-slate-300 shrink-0"/> Drowning in administrative mess.</li>
                <li className="flex gap-3"><XCircle className="w-5 h-5 text-slate-300 shrink-0"/> Feeling threatened by AI and industry shifts.</li>
              </ul>
            </div>
            <div className="p-8 bg-slate-900 text-white border border-slate-900 relative shadow-xl">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-500 flex items-center justify-center rounded-full shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-amber-400 mb-6 uppercase tracking-wider text-center">After</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0"/> A steady pipeline of authors seeking you out.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0"/> Confidently quoting premium, value-based rates.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0"/> Streamlined systems that handle the heavy lifting.</li>
                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0"/> Positioned as an irreplaceable human expert.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Who It's For / Not For */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-serif mb-8 text-slate-900 border-b pb-4">Who this is for</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600">Editors who are tired of undervaluing their work and want to structure their services for high-end clients.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600">Freelance writers looking to expand their offerings into developmental or line editing.</span>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  <span className="text-slate-600">Publishing professionals who want to transition into running their own independent editorial consultancy.</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-serif mb-8 text-slate-900 border-b pb-4">Who this is NOT for</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600">People looking for a "get rich quick" scheme. Building a solid business takes deliberate effort.</span>
                </li>
                <li className="flex gap-4">
                  <XCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <span className="text-slate-600">Those unwilling to interact with clients. This is about building a business, which requires communication and positioning.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bonuses & 10. Details */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-serif mb-12 text-center text-slate-900">Included in your enrollment</h2>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">The Editor's Toolkit</h4>
                <p className="text-sm text-slate-600">Templates for style sheets, editorial letters, and manuscript assessments.</p>
              </div>
            </div>
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Pricing & Proposal Kit</h4>
                <p className="text-sm text-slate-600">Plug-and-play proposal templates that win high-ticket authors.</p>
              </div>
            </div>
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Real Manuscript Walkthrough</h4>
                <p className="text-sm text-slate-600">Watch over the shoulder as we break down a real manuscript edit.</p>
              </div>
            </div>
            <div className="bg-white p-6 border border-amber-100 flex gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-amber-700">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Certification & Grant</h4>
                <p className="text-sm text-slate-600">Certificate of completion and access to pitch for an editorial cash grant.</p>
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
            <AccordionItem value="item-1" className="border-slate-200">
              <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">Are the classes live or pre-recorded?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                The core sessions are delivered live to allow for real-time Q&A and interaction. Recordings will be provided if you miss a session, but live attendance is highly recommended for the best experience.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-slate-200">
              <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">Do I need prior editing experience?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                While absolute beginners are welcome, this programme is best suited for those who already have a basic grasp of language and editing but want to formalize their skills and learn the business side of the profession.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-slate-200">
              <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">How long do I have access to the materials?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                You will have lifetime access to the templates, toolkits, and session recordings, so you can revisit them whenever you are pitching a new client or restructuring your business.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-slate-200">
              <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">Is the certification recognized?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Yes, your certificate is issued by Eyelight Publishing, a recognized firm that has processed over 335 books globally. It serves as a strong credibility marker for your portfolio.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-slate-200">
              <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700">What is the schedule for the 3 days?</AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed">
                Classes will run in the evenings (WAT) from December 4th to 6th to accommodate working professionals, with the graduation ceremony on December 7th. A detailed itinerary will be sent upon registration.
              </AccordionContent>
            </AccordionItem>
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
