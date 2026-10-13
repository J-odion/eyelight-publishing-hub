import {
  PenTool,
  FileEdit,
  Search,
  LayoutGrid,
  Hash,
  Printer,
  Globe,
  Palette,
  Users,
  Megaphone,
  Laptop,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  amount: number;
  icon: LucideIcon;
  features: string[];
}

export const services: ServiceItem[] = [
  {
    id: "ghostwriting",
    title: "Ghostwriting",
    description:
      "We turn your ideas, experiences, and knowledge into a structured, readable, and compelling book.",
    price: "₦1,200,000 / $900",
    priceNote: "per 10,000 words",
    amount: 900,
    icon: PenTool,
    features: [
      "Voice capture through in-depth sessions",
      "Structured outline before writing",
      "Chapter-by-chapter development & revisions",
    ],
  },
  {
    id: "dev-editing",
    title: "Developmental Editing",
    description:
      "We go beyond surface-level editing to strengthen your book at its core.",
    price: "₦800,000 / $600",
    priceNote: "per 10,000 words",
    amount: 600,
    icon: FileEdit,
    features: [
      "Structure & flow improvement",
      "Argument and narrative clarity",
      "Tone and style refinement",
    ],
  },
  {
    id: "proofreading",
    title: "Proofreading",
    description: "Final polish before publishing.",
    price: "₦7,000 / $5",
    priceNote: "per page",
    amount: 5,
    icon: Search,
    features: [
      "Grammar and typo correction",
      "Formatting checks",
      "Consistency review",
    ],
  },
  {
    id: "formatting",
    title: "Book Formatting & Typesetting",
    description:
      "Clean, professional interior layout for print and digital.",
    price: "₦1,400 / $1",
    priceNote: "per page",
    amount: 1,
    icon: LayoutGrid,
    features: [
      "Proper spacing and typography",
      "Chapter structure and pagination",
      "Print-ready formatting",
    ],
  },
  {
    id: "cover-design",
    title: "Book Cover Design",
    description:
      "A professional cover that reflects the quality of your work.",
    price: "₦140,000 / $100",
    priceNote: "flat rate",
    amount: 100,
    icon: Palette,
    features: [
      "Front, spine, and back design",
      "Author bio and blurb placement",
      "Genre-appropriate design direction",
    ],
  },
  {
    id: "isbn",
    title: "ISBN & Copyright",
    description:
      "Proper registration and documentation for your book.",
    price: "T&Cs Apply",
    priceNote: "",
    amount: 0,
    icon: Hash,
    features: [
      "ISBN setup",
      "Copyright registration",
      "Publishing metadata",
    ],
  },
  {
    id: "printing",
    title: "Printing & Binding",
    description: "High-quality physical production.",
    price: "Custom Quote",
    priceNote: "",
    amount: 0,
    icon: Printer,
    features: [
      "Paperback & hardcover options",
      "Proof copy review",
      "Bulk printing",
    ],
  },
  {
    id: "publishing",
    title: "Publishing & Distribution",
    description:
      "We handle the technical side of getting your book out.",
    price: "₦60,000 / $100",
    priceNote: "flat rate",
    amount: 100,
    icon: Globe,
    features: [
      "Amazon KDP & Selar setup",
      "Pricing configuration",
      "Distribution setup",
    ],
  },
  {
    id: "branding",
    title: "Author Branding",
    description: "Position yourself beyond the book.",
    price: "From $300/month",
    priceNote: "monthly retainer",
    amount: 300,
    icon: Users,
    features: [
      "Brand identity",
      "Social media management",
      "Content strategy",
    ],
  },
  {
    id: "marketing",
    title: "Book Marketing Strategy",
    description: "Launch your book with direction.",
    price: "Free",
    priceNote: "with 5+ services",
    amount: 0,
    icon: Megaphone,
    features: [
      "Campaign strategy",
      "Content creation",
      "Promotion planning",
    ],
  },
  {
    id: "author-website",
    title: "Author Website Design",
    description: "A sleek, conversion-driven personal website that establishes your authority and showcases your books.",
    price: "$300 / ₦360,000",
    priceNote: "flat rate",
    amount: 300,
    icon: Laptop,
    features: [
      "Custom responsive design & book showcase",
      "Direct sales, newsletter & booking integration",
      "Author media kit & search engine optimization (SEO)",
    ],
  },
];
