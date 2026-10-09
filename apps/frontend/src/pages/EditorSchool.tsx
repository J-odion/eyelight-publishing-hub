import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LeadsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const ZoomCarousel = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden py-10 my-10">
      <div className="flex items-center justify-center relative w-full h-full max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => {
            const isActive = i === index;
            let offset = i - index;
            if (offset < -1) offset += images.length;
            if (offset > 1) offset -= images.length;
            
            if (Math.abs(offset) > 1) return null;

            return (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.8, x: offset * 300 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.4, 
                  scale: isActive ? 1.05 : 0.8,
                  x: offset * (typeof window !== 'undefined' && window.innerWidth < 768 ? 150 : 300),
                  zIndex: isActive ? 10 : 0,
                  rotateY: isActive ? 0 : offset * -15 
                }}
                exit={{ opacity: 0, scale: 0.8, x: offset * 300 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute w-[220px] md:w-[320px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl cursor-pointer border-4 border-slate-900 bg-slate-800"
                onClick={() => setIndex(i)}
                style={{ perspective: 1000 }}
              >
                <img src={img} className="w-full h-full object-cover" alt="Gallery" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <button onClick={prev} className="absolute left-2 md:left-10 z-20 w-12 h-12 rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg">
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>
      <button onClick={next} className="absolute right-2 md:right-10 z-20 w-12 h-12 rounded-full bg-slate-900/50 backdrop-blur-md border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg">
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};

const DeckCarousel = ({ images }: { images: string[] }) => {
  const [cards, setCards] = useState(images);
  
  const dealNext = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const first = newCards.shift();
      if(first) newCards.push(first);
      return newCards;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      dealNext();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center my-16">
      <div 
        className="relative w-full h-[450px] md:h-[500px] cursor-pointer perspective-1000"
        onClick={dealNext}
      >
        <AnimatePresence>
          {cards.map((src, i) => {
            if (i > 3) return null;
            return (
              <motion.div
                key={src}
                layout
                initial={{ scale: 0.8, opacity: 0, y: -50 }}
                animate={{
                  top: i * 25,
                  scale: 1 - i * 0.06,
                  zIndex: cards.length - i,
                  opacity: 1 - i * 0.15,
                  rotate: i % 2 === 0 ? i * 2 : -i * 1.5,
                }}
                exit={{ opacity: 0, scale: 0.5, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute w-[260px] md:w-[300px] h-[360px] md:h-[400px] left-1/2 -ml-[130px] md:-ml-[150px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200 bg-white"
              >
                <img src={src} className="w-full h-full object-cover" alt="Portfolio" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <div className="mt-8 z-20">
        <Button onClick={dealNext} variant="outline" className="rounded-full shadow-sm text-amber-700 border-amber-200 hover:bg-amber-50">
          Next Book <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default function EditorSchool() {
  const [timeLeft, setTimeLeft] = useState("");
  const [isDiscountActive, setIsDiscountActive] = useState(true);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  const handleBlur = () => saveLeadToCRM('incomplete');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      toast({ title: "Required fields missing", description: "Please provide your name and email.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    await saveLeadToCRM('complete');
    
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      toast({ title: "Registration received!", description: "Redirecting to payment gateway..." });
    }, 1000);
  };

  useEffect(() => {
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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-900 relative">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="font-serif font-bold text-xl text-amber-500 tracking-tight">Eyelight.</a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/catalogue" className="hover:text-white transition-colors">Books</a>
            <a href="/store" className="hover:text-white transition-colors">Store</a>
            <a href="mailto:hello@eyelight.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <Button onClick={handleCTA} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold h-9 text-xs rounded-sm">
            REGISTER NOW
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-slate-950 text-white overflow-hidden text-center px-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-amber-400 text-sm font-medium mb-10 shadow-xl backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            Enrollment open for December 2026 Cohort
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 text-white leading-[1.1] tracking-tight drop-shadow-sm">The Book Editor <br className="hidden md:block"/> Business School</h1>
          
          <p className="text-2xl md:text-3xl text-amber-400 mb-8 font-light max-w-4xl mx-auto">Editing books is a skill. <br className="hidden md:block"/><span className="font-medium text-white">Building a business around that skill is a completely different game.</span></p>
          
          <div className="text-lg md:text-xl text-slate-300 space-y-6 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            <p>You can be an excellent editor and still be broke.</p>
            <p>You can spend 70 hours inside somebody’s manuscript, save their book from disaster, make their ideas clearer, sharpen every sentence, protect their voice...<br/><span className="text-amber-200">…and still be the person they negotiate down to ₦10,000.</span></p>
            <p>You can be the reason a book reads beautifully while somebody else gets paid like the professional in the room.</p>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl mt-12 shadow-2xl backdrop-blur-sm">
              <p className="text-white font-bold text-3xl mb-4 font-serif">That ends here.</p>
              <p className="text-amber-400 font-medium text-xl mb-4">Welcome to The Book Editor Business School.</p>
              <p className="text-slate-300 text-base">A practical business school for editors who are exhausted from treating editing like a side hustle and are ready to build an editing business that attracts serious authors, better projects and better money.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <Button size="lg" onClick={handleCTA} className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-base h-16 px-12 rounded-sm font-bold shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] transition-transform hover:-translate-y-1 tracking-wide">
              REGISTER NOW!
            </Button>
            {isDiscountActive && (
              <div className="flex flex-col sm:flex-row items-center gap-3 text-sm font-medium text-amber-400 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20 mt-4">
                <span>🔥 Discount: {currentPriceNaira} <span className="line-through text-slate-500 ml-1">₦33,500</span></span>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-amber-400"></span>
                <span className="font-mono">{timeLeft}</span>
              </div>
            )}
            <p className="text-sm text-slate-400 font-medium mt-4">NOTE: The price goes back to ₦33,500 on 25th November</p>
          </div>
        </div>
      </section>

      {/* Grace Story */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-serif text-slate-900 mb-6 text-center">I KNOW WHAT IT FEELS LIKE TO THINK EDITING DOESN'T PAY.</h2>
        <p className="text-center text-lg text-slate-600 mb-12">Now, I tell you my story.</p>
        
        <div className="bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-xl space-y-6 text-slate-700 text-lg leading-relaxed">
          <div className="flex items-center gap-6 mb-8 border-b pb-8">
            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-slate-100">
               <img src="/editor-school/1.jpg" alt="Grace" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div>
              <p className="font-bold text-xl text-slate-900">Hi, I'm Grace</p>
              <p className="text-sm text-slate-500">A graduate of English and Literary Studies, a book editor, publisher and the founder of Eyelight Publishers.</p>
            </div>
          </div>
          <p>I started editing while I was in the university.</p>
          <p>I loved it. I was good at it.</p>
          <p className="font-semibold text-amber-700 bg-amber-50 p-4 border-l-4 border-amber-500 rounded-r">People started bringing me their manuscripts, and I was doing it for free only for the love of the work and directionless!</p>
          <p>Then one day, an author paid me for editing with a ₦100 recharge card.</p>
          <p>Yes. One hundred naira. A recharge card.</p>
          <p>At the time, I didn't think much of it. I simply thought, well, at least somebody is paying me to do something I enjoy.</p>
          <p>I had no idea that I was sitting on a skill that would eventually change my life.</p>
          <p className="font-bold text-slate-900 pt-4">Then something changed.</p>
          <p>One author paid me ₦60,000.<br/>Another paid me ₦100,000.</p>
          <p>Voila! Those two payments did something to my brain. They made me stop and ask:<br/><strong className="italic text-slate-900 text-xl block mt-2">“Wait. How much can this thing actually pay?”</strong></p>
          <p className="mt-4">That question changed everything. I started paying attention, learning non-stop, experimenting, figuring out how to price. How to position. How to communicate value. How to work with authors. How to structure projects. How to create systems. How to protect myself. How to attract better clients.</p>
          <p>How to stop treating editing like something I did because I loved books and start treating it like the business that it was.</p>
          <p className="font-bold text-slate-900 pt-4">And today?</p>
          <p>That same skill that once got me a ₦100 recharge card now pays me in millions of naira and thousands of dollars.</p>
        </div>
        
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-serif text-slate-900 mb-2">Meet Your Instructor</h3>
          <p className="text-slate-500 mb-8">Some memories from building my career over the years.</p>
          <ZoomCarousel images={[1, 2, 3, 4, 5, 6].map(num => `/editor-school/${num}.jpg`)} />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-slate-50 text-center px-6 border-y border-slate-200">
        <h3 className="text-3xl font-serif text-slate-900 mb-4 max-w-2xl mx-auto leading-tight">Some of the books I edited at the early stage of building my career</h3>
        
        <DeckCarousel images={[1, 2, 3, 4, 5].map(num => `/editor-school/books/Image ${num}.png`)} />
        
        <div className="max-w-3xl mx-auto text-lg text-slate-700 space-y-6 mt-16">
          <p>The same skill has put me behind books read by thousands of people.</p>
          <p>It has opened doors to work with remarkable men and women, both in Nigeria, the US, the UK, and around the world.</p>
          <p>It has allowed respected authors, leaders and professionals to trust me with their stories and legacies.</p>
          <p>People like Apostle Femi Lazarus, Nurse Sugar, Dr. Christine, Lilly White and many other respected names have trusted my work.</p>
          <p>I have been behind many popular and bestselling books that NDAs would not allow me disclose.</p>
          <p>So…<br/>…I want to show you what took me years of experience, mistakes, experiments and uncomfortable lessons to figure out in just 3 days!</p>
          <p className="font-bold text-xl text-amber-600 bg-amber-50 p-6 rounded-lg mt-8 shadow-sm">Editing is NOT magic but the way you build the business around the editing is everything.</p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-10 uppercase tracking-wide">THE PROBLEM IS NOT THAT EDITORS DON'T MAKE MONEY.</h2>
        <div className="space-y-6 text-lg text-slate-700 text-left max-w-4xl mx-auto">
          <p>The problem is that too many editors have never learnt how to make their skill expensive.</p>
          <p>I am going to be honest with you. There is a strange way the world treats editors. Everyone wants a good editor. Nobody wants to pay for one.</p>
          <p>Authors will spend thousands designing covers. Millions printing books. Thousands running ads. Thousands buying courses on marketing. Then suddenly, when it is time to edit the manuscript:</p>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left mt-10">
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg italic text-slate-500 shadow-sm">"Please, what's your final price?"</div>
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg italic text-slate-500 shadow-sm">"I have another editor that can do it for less."</div>
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg italic text-slate-500 shadow-sm">"It's just proofreading."</div>
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg italic text-slate-500 shadow-sm">"The manuscript is already written."</div>
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg italic text-slate-500 shadow-sm sm:col-span-2">"Can't you just correct the errors?"</div>
          </div>
          
          <p>Then, because nobody taught you how to communicate the value of what you do, you start defending your price. Then reducing it. Then apologising for it. Then accepting work that makes you resent the author. Then wondering why editing doesn't pay.</p>
          <p className="font-bold text-3xl text-center pt-10 font-serif text-slate-900">Editing is not the problem.<br/>Your business model might be.</p>
        </div>
        
        <div className="mt-16 bg-slate-900 p-10 rounded-2xl shadow-xl flex flex-col items-center border border-slate-800">
          <Button size="lg" onClick={handleCTA} className="bg-amber-500 hover:bg-amber-400 text-slate-900 h-16 px-12 rounded-sm font-bold text-base shadow-lg hover:-translate-y-1 transition-transform tracking-wide">
            REGISTER NOW!
          </Button>
          <p className="mt-6 font-bold text-xl text-white">{currentPriceNaira} <span className="text-slate-500 text-base line-through font-normal">₦33,500</span></p>
          <p className="text-sm text-amber-400 font-medium mt-2">Limited slots available. Secure yours before price increases.</p>
        </div>
      </section>

      {/* You don't need another class */}
      <section className="py-24 bg-amber-50 px-6 border-y border-amber-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center uppercase tracking-wide leading-tight">YOU DON'T NEED ANOTHER <br className="hidden sm:block"/> “HOW TO EDIT” CLASS.</h2>
          <div className="space-y-6 text-lg text-slate-700 text-center max-w-3xl mx-auto">
            <p>You need to understand what happens after you know how to edit.</p>
            <p>Being able to spot a weak paragraph is one skill. Knowing what to charge for fixing it is another.</p>
            <p>Knowing how to explain that value to an author is another. Knowing how to structure the project is another. Knowing where your responsibility ends is another. Knowing how to handle revisions is another. Knowing how to deal with a difficult author is another. Knowing how to get clients without begging for work is another.</p>
            <p>Knowing how to build systems so that every new client doesn't throw your entire life into chaos?</p>
            <p className="font-bold text-2xl text-amber-700 pt-6">Another skill entirely.<br/>That is what I will be teaching.</p>
          </div>
        </div>
      </section>

      {/* AI */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-slate-900 mb-8 text-center uppercase">THEN AI SHOWED UP.</h2>
        <div className="space-y-6 text-lg text-slate-700 text-left">
          <p>Maybe you've been watching what is happening with AI and quietly wondering: <br/><strong className="italic">“Is editing still going to be a thing?”</strong></p>
          <p>You should be asking that question because AI is changing the industry. Authors are generating manuscripts with AI. They are rewriting paragraphs with AI. They are asking AI to improve their grammar. They are asking AI to “make this sound human.” They are asking AI to critique their chapters.</p>
          <p>Some editors, including you, are responding by pretending none of this is happening.</p>
          <p className="font-bold text-slate-900 text-xl border-l-4 border-amber-500 pl-4 py-2 bg-slate-50">I wouldn't. Because AI is not going away.</p>
          <p>The question is not: “How do I compete with AI?”<br/>The better one to ask is: <strong className="text-amber-700">“How do I become more valuable because AI exists?”</strong></p>
          <p>Here is something interesting. AI may actually create more opportunities for good editors. Why?</p>
          <p>Because authors can generate words. What they still struggle with is knowing whether those words actually sound like them. Whether the book makes sense as a whole. Whether the argument holds. Whether the ideas are properly developed. Whether the story has a pulse. Whether the voice is consistent. Whether the manuscript is saying what the author actually means. Whether the book is worth publishing in the first place.</p>
          <p>Not to hurt you but authors who are already using AI don't necessarily need another person to tell ChatGPT: “Humanize this more.” NO! They can do that themselves.</p>
          <p>They need someone who understands books, people, language, ideas, context, voice and editorial judgement.</p>
          <p className="font-bold text-xl text-center bg-slate-900 text-white p-8 rounded-xl mt-10 shadow-lg">That person can be you IF you know how to position yourself for where the industry is going.</p>
        </div>
        
        <div className="mt-16 text-center">
          <Button size="lg" onClick={handleCTA} className="bg-amber-500 hover:bg-amber-400 text-slate-900 h-16 px-12 rounded-sm font-bold text-base shadow-xl hover:-translate-y-1 transition-transform">
            REGISTER NOW!
          </Button>
          <p className="mt-6 font-bold text-lg">{currentPriceNaira} <span className="text-slate-500 text-sm line-through">₦33,500</span></p>
          <p className="text-sm text-amber-600 font-medium">Limited slots available.</p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6 uppercase leading-tight">THIS SCHOOL WILL TEACH YOU HOW TO DO EXACTLY THAT.</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">Not theory or endless grammar lectures. In fact, not even a collection of editing definitions you will forget next week.</p>
            <p className="text-2xl font-bold text-amber-400 mt-6 tracking-wide">Business. Skill. Process. Positioning. Money.</p>
            <p className="text-slate-400 mt-4 uppercase tracking-widest text-sm font-medium">You will learn:</p>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="phase-1">
            <AccordionItem value="phase-1" className="border-slate-800 bg-slate-800/50 mb-4 rounded-xl px-2">
              <AccordionTrigger className="text-left font-serif text-xl hover:text-amber-400 px-4 py-6">
                Phase 1: The Editorial Foundation
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { t: "01. THE EDITORIAL PROCESS", d: "How to take a book from manuscript receipt to final delivery without wondering what you're supposed to do next." },
                    { t: "02. THE FOUR TYPES OF BOOK EDITING", d: "What they are, how they differ and, more importantly, which ones you should actually be selling." },
                    { t: "03. MANUSCRIPT ASSESSMENT", d: "The top things you should look for before touching a manuscript so you don't walk blindly into a project." },
                    { t: "04. DEVELOPMENTAL EDITING", d: "How to fix a book with brilliant ideas but terrible execution." },
                    { t: "05. WHERE YOUR EDITING ENDS", d: "Line editing. Developmental editing. Proofreading. Where exactly should you stop? You must know that touching everything in a manuscript does not make you a better editor." },
                  ].map((i, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 shadow-sm">
                      <h3 className="text-sm font-bold tracking-wider text-amber-400 mb-2">{i.t}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{i.d}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="phase-2" className="border-slate-800 bg-slate-800/50 mb-4 rounded-xl px-2">
              <AccordionTrigger className="text-left font-serif text-xl hover:text-amber-400 px-4 py-6">
                Phase 2: Execution & Judgement
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { t: "06. EDITING DIFFERENT GENRES", d: "How to work across genres without flattening every author's voice into your own." },
                    { t: "07. EDITORIAL JUDGEMENT", d: "What to change. What to confirm. What to question. What to leave alone. This is one of the things that separates an editor from someone who simply knows grammar." },
                    { t: "08. AUTHOR FEEDBACK", d: "How to tell an author that something is not working without starting a war." },
                    { t: "09. PRICING YOUR SERVICES", d: "Stop pulling prices from thin air. Learn how to think about your fees professionally." },
                    { t: "10. CALCULATING YOUR EDITING FEE", d: "How to calculate your fee from the manuscript itself. Not from desperation. Not from what your friend charges. Not from what you think the author can afford." },
                  ].map((i, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 shadow-sm">
                      <h3 className="text-sm font-bold tracking-wider text-amber-400 mb-2">{i.t}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{i.d}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="phase-3" className="border-slate-800 bg-slate-800/50 mb-4 rounded-xl px-2">
              <AccordionTrigger className="text-left font-serif text-xl hover:text-amber-400 px-4 py-6">
                Phase 3: The Business of Editing
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { t: "11. GETTING CLIENTS", d: "How to get your first editing clients without begging people on WhatsApp to 'please patronise me.'" },
                    { t: "12. YOUR EDITING WORKFLOW", d: "Build a process from manuscript receipt to final delivery." },
                    { t: "13. PROTECTING YOURSELF", d: "Contracts. Briefs. Boundaries. Revisions. Because 'just one more little change' has destroyed many an editor's peace." },
                    { t: "14. DIFFICULT AUTHORS & IMPOSSIBLE DEADLINES", d: "How to deal with clients who want everything yesterday and another 17 changes today." },
                    { t: "15. PROFESSIONAL POSITIONING", d: "How to position yourself as a professional editor even when you're still building your track record." },
                  ].map((i, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 shadow-sm">
                      <h3 className="text-sm font-bold tracking-wider text-amber-400 mb-2">{i.t}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{i.d}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="phase-4" className="border-slate-800 bg-slate-800/50 mb-4 rounded-xl px-2">
              <AccordionTrigger className="text-left font-serif text-xl hover:text-amber-400 px-4 py-6">
                Phase 4: Future-Proofing & Rewards
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { t: "16. AI VS HUMAN EDITING", d: "What you should never blindly outsource to AI." },
                    { t: "17. AI-PROOFING YOUR BUSINESS", d: "How to evolve your service before it becomes replaceable." },
                    { t: "18. BEYOND FREELANCING", d: "How to think beyond 'I edit books for people.' Learn how to build an editing business that can eventually grow beyond your own two hands." },
                    { t: "19. CERTIFICATE", d: "You will receive a certificate of participation." },
                    { t: "20. THE BEST STUDENT CASH GRANT", d: "The outstanding student of the cohort will receive a cash grant to support the growth of their editing business." }
                  ].map((i, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 shadow-sm">
                      <h3 className="text-sm font-bold tracking-wider text-amber-400 mb-2">{i.t}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{i.d}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-16 text-center">
            <Button size="lg" onClick={handleCTA} className="bg-amber-500 hover:bg-amber-400 text-slate-950 h-16 px-12 rounded-sm font-bold text-base shadow-xl hover:-translate-y-1 transition-transform tracking-wide">
              REGISTER NOW!
            </Button>
          </div>
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-24 bg-white px-6 text-center border-b border-slate-200">
        <h2 className="text-3xl font-serif text-slate-900 mb-2 uppercase">…and I'M NOT SENDING YOU INTO THE REAL WORLD WITH ONLY LIVE CLASSES</h2>
        <p className="text-xl text-amber-700 font-bold mb-16">God forbid! YOU GET THE EDITOR'S TOOLKIT.</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          <div className="bg-slate-50 p-10 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl text-slate-900 mb-4 border-b border-slate-200 pb-4">BONUS 1: THE EDITOR'S TOOLKIT</h3>
            <ul className="space-y-3 text-slate-600 mb-8 font-medium">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Contracts.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Onboarding forms.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Editing briefs.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Style sheets.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Checklists.</li>
            </ul>
            <p className="text-sm font-bold text-slate-800 pt-4 bg-slate-200/50 p-4 rounded text-center">The documents that help you look and operate like a business.</p>
          </div>
          
          <div className="bg-slate-50 p-10 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl text-slate-900 mb-4 border-b border-slate-200 pb-4">BONUS 2: THE PRICING & PROPOSAL KIT</h3>
            <ul className="space-y-3 text-slate-600 mb-8 font-medium">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Pricing calculator.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Quotation template.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Proposal template.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0"/> Invoice.</li>
            </ul>
            <p className="text-sm font-bold text-slate-800 pt-4 bg-slate-200/50 p-4 rounded text-center">Because knowing what you charge is one thing. Being able to present that price professionally is another.</p>
          </div>
          
          <div className="bg-slate-50 p-10 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl text-slate-900 mb-4 border-b border-slate-200 pb-4">BONUS 3: REAL MANUSCRIPT WALKTHROUGH</h3>
            <p className="text-slate-600 mb-4 font-medium leading-relaxed">I don't want you finishing this course thinking: "Okay...but what does professional editing actually look like?"</p>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">You will see it. A real sample manuscript. Before. After. What was changed. What wasn't changed. Why.</p>
            <p className="text-sm font-bold text-slate-800 pt-4 bg-slate-200/50 p-4 rounded text-center">You will see the work, not just hear me talk about the work.</p>
          </div>
        </div>
      </section>

      {/* Imagine */}
      <section className="py-32 bg-slate-100 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-16 max-w-5xl mx-auto leading-tight">IMAGINE WHAT CHANGES WHEN YOU STOP THINKING LIKE A FREELANCER.</h2>
        <div className="max-w-2xl mx-auto space-y-6 text-xl text-slate-700">
          <p>You stop asking: “How much can this author afford?”<br/>and start asking: <strong className="text-amber-700 bg-amber-100 px-2 rounded">“What does this project require?”</strong></p>
          <p>You stop saying: “I can edit anything.”<br/>and start communicating <strong className="text-amber-700 bg-amber-100 px-2 rounded">exactly what you do.</strong></p>
          <p>You stop taking manuscripts through WhatsApp with no brief, no contract, no process and no boundaries.</p>
          <p>You stop calculating prices based on fear.</p>
          <p>You stop accepting authors who treat your expertise like a commodity.</p>
          <p>You stop panicking every time someone asks: “What's your price?”</p>
          <div className="mt-16 bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
            <p className="font-bold text-2xl text-slate-900 mb-6">Then you start building an editing business that makes sense.</p>
            <p className="mb-8 text-lg font-medium text-slate-600">A business with processes. Standards. Boundaries. Positioning. Better clients.</p>
            <p className="text-5xl font-serif text-amber-600 font-bold">And, yes... Better money.</p>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-amber-50 p-10 border border-amber-100 rounded-2xl shadow-sm">
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-8 uppercase border-b border-amber-200 pb-4">THIS IS FOR YOU IF...</h3>
            <ul className="space-y-5 text-slate-700 text-lg">
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You already edit books but feel like you're constantly underpaid.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You are tired of authors negotiating every fee.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You know you're good but don't know how to position yourself.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You have no idea what to charge.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You edit without a proper workflow.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You keep attracting authors who want premium work for bargain prices.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You want to start editing professionally but don't know where to begin.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You've been relying on referrals and don't know how to consistently find clients.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You are scared that AI is going to take your work.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You are already using AI but don't know how to make your human expertise more valuable.</li>
              <li className="flex gap-4"><CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0 mt-1"/> You want to move from freelance editor to editing business owner.</li>
            </ul>
            <p className="mt-8 font-bold text-slate-900 italic text-xl border-t border-amber-200 pt-6">Or perhaps you're simply thinking: “I know I can do this. I just don't know how to build the business.” Then you are exactly who I built this for.</p>
          </div>
          
          <div className="bg-slate-50 p-10 border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-8 uppercase border-b border-slate-200 pb-4">THIS IS NOT FOR YOU IF...</h3>
            <ul className="space-y-6 text-slate-700 text-lg">
              <li className="flex gap-4"><XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-1"/> You want a certificate to frame on your wall and do nothing with it.</li>
              <li className="flex gap-4"><XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-1"/> You want a magic formula that will make clients appear without you doing the work.</li>
              <li className="flex gap-4"><XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-1"/> You want to remain comfortable charging whatever people are willing to give you.</li>
              <li className="flex gap-4"><XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-1"/> You don't want to learn the business side of editing.</li>
              <li className="flex gap-4"><XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-1"/> You think being a good editor automatically makes you a good business owner.</li>
            </ul>
            <p className="mt-8 font-bold text-slate-900 italic text-xl border-t border-slate-200 pt-6">It doesn't, and I would rather tell you that now than collect your money and flatter you.</p>
          </div>
        </div>
      </section>

      {/* I have made the mistakes */}
      <section className="py-32 bg-slate-900 text-white px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-10 text-xl font-light">
          <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-wider mb-8">I HAVE MADE THE MISTAKES ALREADY.</h2>
          <p>I have spent years learning this through actual manuscripts, actual authors, actual deadlines, actual money, actual difficult conversations and actual mistakes.</p>
          <p>I did not wake up one morning with a business plan. Gradually, the girl who once received a ₦100 recharge card for editing became the editor whose skill now commands millions of naira.</p>
          <p>I don't want you to spend the next ten years learning every lesson the hard way.</p>
          <p className="font-bold text-3xl text-amber-400">Take the shortcut. Learn from someone who has already walked into the walls.</p>
          
          <div className="py-16">
            <h2 className="text-4xl md:text-5xl font-serif uppercase text-amber-500 leading-tight drop-shadow">THE WORLD DOES NOT NEED MORE PEOPLE WHO CAN CORRECT GRAMMAR.</h2>
            <h2 className="text-4xl md:text-5xl font-serif uppercase text-white mt-6 leading-tight drop-shadow">IT NEEDS EDITORS WHO KNOW WHAT THEY ARE DOING.</h2>
          </div>
          
          <p className="text-2xl font-medium max-w-3xl mx-auto">Editors who can run a business. Editors who can make money from the thing they are already good at. That is the editor I want to help you become.</p>
          
          <div className="text-slate-400 italic py-12 border-y border-slate-800 my-12 bg-slate-950/30 rounded-xl px-8 shadow-inner">
            <p className="mb-4">Maybe yours wasn't a recharge card.</p>
            <p className="mb-4">Maybe it was: <span className="text-slate-300">"Please help me edit this one. I'll pay you later."</span></p>
            <p className="mb-4">Maybe it was: <span className="text-slate-300">"I don't have much, but I can give you exposure."</span></p>
            <p className="mb-4">Maybe you've edited entire books for money that made you embarrassed to tell anyone what you charged.</p>
            <p className="mb-4">Maybe you've sat at your laptop for hours thinking: <span className="text-slate-300">"There has to be more to this."</span></p>
          </div>
          
          <p className="font-bold text-4xl text-amber-400">There is. I know because I found it and now I'm opening the door.</p>
        </div>
      </section>

      {/* Final Pitch / Form */}
      <section id="register" className="py-24 bg-slate-100 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="text-slate-900">
            <h2 className="text-5xl font-serif mb-6 uppercase leading-tight tracking-tight">THE BOOK EDITOR BUSINESS SCHOOL</h2>
            <p className="text-2xl font-medium text-amber-700 mb-10">Learn the craft. Build the business. Become harder to replace.</p>
            
            <ul className="space-y-5 text-xl font-medium mb-10">
              <li className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200"><CheckCircle2 className="text-amber-500 w-8 h-8" /> 20 powerful lessons.</li>
              <li className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200"><CheckCircle2 className="text-amber-500 w-8 h-8" /> 3 practical bonuses.</li>
              <li className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200"><CheckCircle2 className="text-amber-500 w-8 h-8" /> Certificate of participation.</li>
              <li className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200"><CheckCircle2 className="text-amber-500 w-8 h-8" /> Cash grant for the outstanding student.</li>
            </ul>
            
            <p className="text-xl text-slate-700 mb-6 leading-relaxed">You can spend another year figuring this out through trial and error. Or you can spend one investment learning the systems, thinking and business principles that took me years to build.</p>
            <p className="text-2xl text-slate-900 mb-10 font-bold">Your choice.</p>
            
            <div className="bg-slate-900 p-8 rounded-xl shadow-lg text-slate-300 space-y-4 mb-10 text-xl font-light">
              <p>But if you already know that editing is what you want to do...</p>
              <p>If you already know you're good at it...</p>
              <p>If you already know you want better clients and better money...</p>
              <p className="font-bold text-3xl text-amber-400 pt-2 border-t border-slate-700 mt-4">Don't sit this one out.</p>
            </div>
            
            <div className="border-t-2 border-slate-300 pt-10 mt-10 text-slate-700 text-xl">
              <p className="font-bold mb-4 uppercase text-slate-900 tracking-widest text-sm">One more thing.</p>
              <p className="mb-4">Please don't buy this because you like me. Don't buy it because I told you editing can make money.</p>
              <p>Buy it because you have looked at your current editing business and admitted:</p>
              <p className="text-4xl font-serif italic my-8 text-slate-900 text-center">“I can do better than this.”</p>
              <p className="font-bold text-3xl text-amber-700 text-center">You can. Let's build it.</p>
            </div>
          </div>
          
          <div className="bg-white p-10 md:p-14 shadow-2xl rounded-2xl border border-slate-200 sticky top-24">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase whitespace-nowrap shadow-md">
              Limited Slots Remaining
            </div>
            <h3 className="text-3xl font-serif text-slate-900 mb-4 uppercase text-center mt-4">SECURE YOUR SEAT</h3>
            
            <div className="flex flex-col items-center justify-center mb-10 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="text-5xl font-bold text-slate-900 mb-2">{currentPriceNaira}</div>
              <div className="text-xl text-slate-500 font-medium line-through mb-4">₦33,500</div>
              {isDiscountActive && (
                <div className="text-amber-700 font-bold text-base text-center bg-amber-100/50 w-full py-3 rounded-lg">
                  Discount ends in: <span className="font-mono ml-2 tracking-wide">{timeLeft}</span>
                </div>
              )}
            </div>
            
            {hasSubmitted ? (
              <div className="py-12 text-center bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h4 className="text-2xl text-slate-900 font-bold mb-2">Registration initiated!</h4>
                <p className="text-slate-600 text-lg">Redirecting to payment gateway...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold">Full Name *</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} onBlur={handleBlur} className="h-14 text-lg bg-slate-50" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} onBlur={handleBlur} className="h-14 text-lg bg-slate-50" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} onBlur={handleBlur} className="h-14 text-lg bg-slate-50" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="experience" className="text-base font-semibold">Years of Editing Experience</Label>
                  <Input id="experience" placeholder="e.g. 2 years, none, 5+ years" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} onBlur={handleBlur} className="h-14 text-lg bg-slate-50 placeholder:text-slate-400" />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 h-16 font-bold text-lg mt-6 shadow-xl hover:-translate-y-1 transition-transform tracking-wide">
                  {isSubmitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Processing...</> : "REGISTER NOW!"}
                </Button>
                <p className="text-sm text-center text-slate-500 mt-6 font-medium">Seats are limited. Once this cohort closes, this offer closes with it.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white px-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-16 text-center text-slate-900 uppercase tracking-widest">FREQUENTLY ASKED QUESTIONS</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "1. How long is The Book Editor Business School?", a: "The school runs for 3 days, from December 4–6, 2026." },
              { q: "2. When does the class start?", a: "Classes begin on December 4, 2026." },
              { q: "3. When is graduation?", a: "Graduation is on December 7, 2026. 🎓" },
              { q: "4. Will I receive a certificate?", a: "Yes. Every participant who completes the programme will receive a Certificate of Participation." },
              { q: "5. Who is this school for?", a: "This school is for people who already edit books. You don't need to have 10 years of experience. You don't need to have edited 100 books. You could have edited one book, five books, twenty books or hundreds of books. What matters is that you have some actual experience editing books and you want to become better at the work and better at the business." },
              { q: "7. Is this for complete beginners who have never edited a book?", a: "No. This is not a beginner's “how to become an editor” course. If you've never edited a book before, this is probably not the right place to start. Come with some experience. We'll help you build from there." },
              { q: "8. I already edit books. What exactly will I gain from this?", a: "A lot. You may already know how to edit but still struggle with pricing, positioning, getting clients, contracts, boundaries, workflow, author management, revisions and building a business around your skill. That's where this school comes in." },
              { q: "9. Is this just an editing skills course?", a: "No. It covers the editing craft, but the bigger focus is on helping you understand how to run your editing like a real business. You'll learn how to price your services, structure your workflow, work with authors, protect yourself, position yourself professionally, attract better clients and prepare your business for the changes AI is bringing to publishing." },
              { q: "10. Will you teach me how to charge more for my editing?", a: "We will teach you how to price your work properly, calculate fees from the manuscript and communicate your value professionally. The goal isn't simply to tell you, “Charge more.” It's to help you understand why your work costs what it costs." },
              { q: "11. Will you teach us how to get better-paying clients?", a: "Yes. We'll cover positioning and client acquisition, including how to get editing clients without constantly begging people to give you work." },
              { q: "12. What if I already have clients but most of them don't pay very well?", a: "Then you're exactly the kind of person who should pay attention. Having clients is not the same thing as having a good editing business. You can be busy and still be underpaid. This school will help you examine the way you're positioning, pricing and delivering your service so you can start moving towards better clients and better projects." },
              { q: "17. What will you teach us about AI?", a: "We'll look at AI vs. human editing, what you should never blindly outsource to AI, and how to AI-proof your editing business so you don't become replaceable simply because technology can now generate and rewrite text." },
              { q: "18. Do I need to know anything about AI before joining?", a: "No. You simply need to already have experience editing books. We'll handle the AI conversation from there." },
              { q: "19. Can I join if I already have an established editing business?", a: "Absolutely. You don't have to be struggling to benefit from this. You may already have clients, make good money and have years of experience. The school can help you tighten your systems, improve your positioning, refine your pricing and think beyond simply selling your time." },
              { q: "21. Will there be a cash grant?", a: "Yes. The outstanding participant of the cohort will receive a cash grant to support the growth of their editing business." },
              { q: "22. Is the programme online?", a: "Yes. The school is designed to be accessible to participants regardless of where they are located." },
              { q: "23. How much does it cost?", a: "The investment is: ₦33,500 or $25. That's for the complete 3-day programme, including the bonuses, certificate and graduation." },
              { q: "24. Is the ₦33,500 for all three days?", a: "Yes. One payment gives you access to the full school from December 4–6, plus the graduation on December 7." },
              { q: "25. Is this a university degree or diploma?", a: "No. This is a professional training programme, not a university programme. You will receive a Certificate of Participation upon completion." },
              { q: "26. Will the certificate make me a certified editor?", a: "The certificate confirms your participation in The Book Editor Business School. It is not a government licence or university qualification, and we don't claim that it is." },
              { q: "27. What happens after I pay?", a: "You'll receive the information required to access the programme and prepare for the school. Your seat is secured once your payment is confirmed." },
              { q: "28. What if I'm still unsure?", a: "If you already edit books and you've ever thought: “I know how to do this. I just don't know how to make this business work the way I want it to.” This is probably the room you need to be in. Come with your experience. We'll work on the rest." }
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-100 mb-2">
                <AccordionTrigger className="text-left font-serif text-lg hover:text-amber-700 bg-slate-50 px-6 py-4 rounded-lg hover:bg-slate-100 transition-colors">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed px-6 pt-4 pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-950 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-amber-500 font-serif text-3xl font-bold mb-6">Eyelight Publishing</div>
          <div className="flex justify-center gap-8 mb-10 text-slate-400 font-medium text-base">
            <a href="mailto:hello@eyelight.com" className="hover:text-white transition-colors">hello@eyelight.com</a>
            <a href="https://wa.me/234XXXXXXXXXX" className="hover:text-white transition-colors">WhatsApp Support</a>
          </div>
          <p>© {new Date().getFullYear()} Eyelight Publishing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
