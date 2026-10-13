export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'paragraph' | 'email' | 'checkboxes' | 'radio' | 'dropdown' | 'rating';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, any>;
  clientEmail?: string;
  clientName?: string;
}

export interface CustomForm {
  id: string;
  slug: string;
  title: string;
  description: string;
  requiresPaymentConfirmation: boolean;
  createdAt: string;
  fields: FormField[];
}

export const INITIAL_FORMS: CustomForm[] = [
  {
    id: 'eyelight-pre-consultation',
    slug: 'pre-consultation',
    title: 'Eyelight Pre-consultation Form',
    description: `Thank you for booking a 40-minute Book Clarity Consultation with Eyelight Publishers.
This brief will help us understand the questions you need answered before we meet. Your responses will enable us to use our time together productively and give you recommendations that are relevant to your specific project.
Please answer as openly and specifically as you can. If you are unsure about any question, feel free to say so.`,
    requiresPaymentConfirmation: false,
    createdAt: new Date().toISOString(),
    fields: [
      {
        id: 'working_title',
        label: 'What is the working title of your book?',
        type: 'text',
        required: true,
        placeholder: 'Enter working title...',
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
      },
      {
        id: 'book_explanation',
        label: 'If you had to explain the book to someone who had never heard of it, what would you say?',
        type: 'paragraph',
        required: true,
        placeholder: 'In a few sentences, describe the core idea and essence of your book...',
      },
      {
        id: 'motivation',
        label: 'What experience, knowledge, message, or idea made you feel this book needed to exist?',
        type: 'paragraph',
        required: false,
        placeholder: 'Share the personal background, problem, or vision that inspired it...',
      },
      {
        id: 'target_audience',
        label: 'Describe the people you want to read this book, their needs, challenges, or interests.',
        type: 'paragraph',
        required: false,
        placeholder: 'Who is this written for? What transformation are they looking for?',
      },
      {
        id: 'previous_publications',
        label: 'Have you published a book before? If yes, please share the title(s) and, if possible, links to your books.',
        type: 'paragraph',
        required: false,
        placeholder: 'Titles, links, or mention if this is your first book project...',
      },
      {
        id: 'biggest_challenge',
        label: 'What is the biggest challenge you are currently facing with this book? Please explain the issue as clearly as you can.',
        type: 'paragraph',
        required: false,
        placeholder: 'E.g., structure, lack of time, finishing the draft, finding direction...',
      },
      {
        id: 'guidance_areas',
        label: 'Which aspects of your book project would you like professional guidance on? Select all that apply.',
        type: 'checkboxes',
        required: false,
        options: [
          'Author branding and building authority through the book.',
          'Understanding the entire process from idea to publication.',
          'Book marketing/launch',
          'Printing and distribution',
          'ISBN procurement',
          'Book cover design',
          'Clarifying the book idea and its direction.',
          'Developing the book\'s outline, structure, or chapter flow.',
          'Improving an existing manuscript.',
          'Writing or improving the manuscript',
          'Other',
        ],
      },
      {
        id: 'success_criteria',
        label: 'What would make this book project a success for you? (Please describe the result you hope to achieve. If you have specific targets, such as sales, reach, speaking opportunities, or business growth, include them.)',
        type: 'paragraph',
        required: true,
        placeholder: 'Describe your vision of success for this project...',
      },
      {
        id: 'target_launch_date',
        label: 'Is there a particular date or deadline you are working toward for launch? If yes, what is the date, and why is it important?',
        type: 'text',
        required: true,
        placeholder: 'E.g. November 2026 (for my annual conference)...',
      },
      {
        id: 'key_questions',
        label: 'Write at least three most important questions you want us to address during this consultation?',
        type: 'paragraph',
        required: true,
        placeholder: '1.\n2.\n3.',
      },
    ],
  },
  {
    id: 'eyelight-client-review',
    slug: 'review',
    title: 'Eyelight Client Review & Testimonial Form',
    description: `Thank you for choosing Eyelight Publishers for your book publishing journey! Your feedback allows us to celebrate your work and continually uphold world-class standards of publishing and editing excellence.`,
    requiresPaymentConfirmation: true,
    createdAt: new Date().toISOString(),
    fields: [
      {
        id: 'author_name',
        label: 'Your Full Name',
        type: 'text',
        required: true,
        placeholder: 'E.g. Dr. Jane Doe',
      },
      {
        id: 'author_email',
        label: 'Email Address (Used for Booking/Order)',
        type: 'email',
        required: true,
        placeholder: 'name@example.com',
      },
      {
        id: 'book_title',
        label: 'Book Title Published / Edited with Eyelight',
        type: 'text',
        required: true,
        placeholder: 'Title of your book...',
      },
      {
        id: 'rating',
        label: 'Overall Experience Rating',
        type: 'rating',
        required: true,
      },
      {
        id: 'review_text',
        label: 'Your Honest Review & Experience',
        type: 'paragraph',
        required: true,
        helpText: 'How was your experience working with Grace and the editorial/production team?',
        placeholder: 'Share your thoughts, outcomes, and what other authors should know...',
      },
      {
        id: 'author_location_role',
        label: 'Location & Title (e.g. Lagos, Nigeria · CEO & Founder)',
        type: 'text',
        required: false,
        placeholder: 'Location & Title',
      },
      {
        id: 'testimonial_permission',
        label: 'Permission to feature your review on the Eyelight website and catalogue',
        type: 'radio',
        required: true,
        options: [
          'Yes, with my full name and book title',
          'Yes, anonymously / first name only',
          'Internal feedback for the Eyelight team only',
        ],
      },
    ],
  },
];

const FORMS_KEY = 'eyelight_custom_forms';
const SUBMISSIONS_KEY = 'eyelight_form_submissions';

export const FormsStore = {
  getForms(): CustomForm[] {
    const raw = localStorage.getItem(FORMS_KEY);
    if (!raw) {
      localStorage.setItem(FORMS_KEY, JSON.stringify(INITIAL_FORMS));
      return INITIAL_FORMS;
    }
    try {
      const parsed = JSON.parse(raw);
      // Ensure default forms exist
      if (!parsed.some((f: CustomForm) => f.slug === 'pre-consultation')) {
        parsed.unshift(INITIAL_FORMS[0]);
      }
      if (!parsed.some((f: CustomForm) => f.slug === 'review')) {
        parsed.push(INITIAL_FORMS[1]);
      }
      return parsed;
    } catch {
      return INITIAL_FORMS;
    }
  },

  getFormBySlug(slug: string): CustomForm | undefined {
    const forms = this.getForms();
    return forms.find((f) => f.slug === slug || f.id === slug);
  },

  saveForm(form: CustomForm) {
    const forms = this.getForms();
    const index = forms.findIndex((f) => f.id === form.id);
    if (index >= 0) {
      forms[index] = form;
    } else {
      forms.push(form);
    }
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
  },

  deleteForm(id: string) {
    const forms = this.getForms().filter((f) => f.id !== id);
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
  },

  getSubmissions(formId?: string): FormSubmission[] {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    try {
      const subs: FormSubmission[] = JSON.parse(raw);
      if (formId) return subs.filter((s) => s.formId === formId);
      return subs;
    } catch {
      return [];
    }
  },

  submitForm(submission: Omit<FormSubmission, 'id' | 'submittedAt'>): FormSubmission {
    const subs = this.getSubmissions();
    const newSub: FormSubmission = {
      ...submission,
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      submittedAt: new Date().toISOString(),
    };
    subs.unshift(newSub);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
    return newSub;
  },

  deleteSubmission(id: string) {
    const subs = this.getSubmissions().filter((s) => s.id !== id);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
  },
};
