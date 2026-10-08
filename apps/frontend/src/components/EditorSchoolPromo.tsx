import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function EditorSchoolPromo() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" />
            <span>New Training Programme</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            The Book Editor Business School
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            You can be an excellent editor and still be broke. Learn how to transform your editorial skills into a premium, high-paying business.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/editor-school" 
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 w-full sm:w-auto"
            >
              View the Curriculum <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <p className="text-sm text-slate-400 mt-8">
            Next Cohort: December 4–6, 2026. Enrollment closes soon.
          </p>
        </div>
      </div>
    </section>
  );
}
