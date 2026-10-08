import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CourseBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already closed the banner in this session
    const isClosed = sessionStorage.getItem("course_banner_closed");
    if (!isClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("course_banner_closed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-900 border-t border-slate-700 shadow-2xl p-4 md:p-0">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between min-h-[64px] gap-4">
        
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center md:text-left">
          <span className="bg-amber-500 text-white text-xs font-bold uppercase px-2 py-1 rounded">
            New
          </span>
          <p className="text-sm md:text-base text-slate-100 font-medium">
            Enrollment is open for <span className="font-serif italic text-amber-400">The Book Editor Business School</span>
          </p>
          <div className="hidden md:block w-1 h-1 bg-slate-600 rounded-full"></div>
          <p className="text-sm text-slate-400 hidden md:block">
            Learn the craft, build the business.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/editor-school" 
            className="whitespace-nowrap px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded transition-colors flex items-center gap-1"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 transition-colors rounded-full hover:bg-slate-800"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
