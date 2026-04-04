// ============================================================================
// EquiFlow - Shared Household Cash Flow Dashboard
// Quiet Luxury Design | Warm Neutrals | Financial Harmony
// ============================================================================

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "EquiFlow | Shared Household Cash Flow Dashboard",
  description: "Financial harmony for modern households. Aggregate accounts, track shared expenses, and maintain privacy within partnership.",
  language: "en",
};

// ============================================================================
// Navigation Configuration
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  items: NavItem[];
}

export const navigationConfig: NavigationConfig = {
  logo: "EquiFlow",
  items: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Stories", href: "#stories" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
};

// ============================================================================
// Hero Section Configuration
// ============================================================================

export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundImage: string;
  servicesLabel: string;
  copyright: string;
}

export const heroConfig: HeroConfig = {
  title: "EQUIFLOW",
  subtitle: "Financial Harmony for Modern Households",
  backgroundImage: "/hero-main.jpg",
  servicesLabel: "Aggregate | Share | Harmonize",
  copyright: "© 2024 EquiFlow",
};

// ============================================================================
// About Section Configuration - The Problem & Solution
// ============================================================================

export interface AboutConfig {
  titleLine1: string;
  titleLine2: string;
  description: string;
  image1: string;
  image1Alt: string;
  image2: string;
  image2Alt: string;
  authorImage: string;
  authorName: string;
  authorBio: string;
}

export const aboutConfig: AboutConfig = {
  titleLine1: "The Splitwise Paradox ends here.",
  titleLine2: "Affluent households deserve better than roommate math.",
  description: "Current tools force a false choice: rigid budgeting apps that demand financial obsession, or crude bill-splitters that reduce partnership to transactions. EquiFlow introduces a third way—elegant cash flow visibility that honors both unity and autonomy.",
  image1: "/about-1.jpg",
  image1Alt: "Couple reviewing finances together peacefully",
  image2: "/about-2.jpg",
  image2Alt: "Modern home office with natural light",
  authorImage: "/founder.jpg",
  authorName: "The EquiFlow Philosophy",
  authorBio: "We believe financial tools should bring households closer, not create anxiety. Our approach centers on 'Reviewing and Responding' rather than 'Rules and Restraint'—because harmony matters more than perfection.",
};

// ============================================================================
// Features Section (Works) - Core Dashboard Features
// ============================================================================

export interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

export interface WorksConfig {
  title: string;
  subtitle: string;
  projects: WorkItem[];
}

export const worksConfig: WorksConfig = {
  title: "Core Features",
  subtitle: "Designed for the way modern households actually manage money.",
  projects: [
    { 
      id: 1, 
      title: "Unified Dashboard", 
      category: "Aggregation", 
      image: "/feature-1.jpg" 
    },
    { 
      id: 2, 
      title: "Shared Expenses", 
      category: "Collaboration", 
      image: "/feature-2.jpg" 
    },
    { 
      id: 3, 
      title: "Privacy Zones", 
      category: "Autonomy", 
      image: "/feature-3.jpg" 
    },
    { 
      id: 4, 
      title: "Gentle Insights", 
      category: "Awareness", 
      image: "/feature-4.jpg" 
    },
  ],
};

// ============================================================================
// Services Section - How EquiFlow Works
// ============================================================================

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface ServicesConfig {
  title: string;
  subtitle: string;
  services: ServiceItem[];
}

export const servicesConfig: ServicesConfig = {
  title: "How It Works",
  subtitle: "Four elegant steps to household financial harmony.",
  services: [
    { 
      id: "01", 
      title: "Connect Accounts", 
      description: "Link multiple banks, credit cards, and investment accounts securely. EquiFlow aggregates everything into one beautiful view—no more logging into five different apps.", 
      image: "/service-1.jpg" 
    },
    { 
      id: "02", 
      title: "Define Shared Spaces", 
      description: "Create collaborative expense categories for groceries, utilities, travel, and home. Each partner contributes their share without the friction of 'settling up'.", 
      image: "/service-2.jpg" 
    },
    { 
      id: "03", 
      title: "Maintain Privacy", 
      description: "Personal discretionary spending remains private. Your coffee habit, their hobby expenses—kept separate while still contributing fairly to shared goals.", 
      image: "/service-3.jpg" 
    },
    { 
      id: "04", 
      title: "Review Together", 
      description: "Weekly or monthly check-ins become moments of connection, not conflict. Beautiful visualizations show where you stand, without judgment or anxiety.", 
      image: "/service-4.jpg" 
    },
  ],
};

// ============================================================================
// Testimonials Section - User Stories
// ============================================================================

export interface TestimonialItem {
  id: number;
  name: string;
  title: string;
  quote: string;
  image: string;
}

export interface TestimonialsConfig {
  title: string;
  testimonials: TestimonialItem[];
}

export const testimonialsConfig: TestimonialsConfig = {
  title: "Household Stories",
  testimonials: [
    { 
      id: 1, 
      name: "Sarah & Michael", 
      title: "Dual-Income Professionals", 
      quote: "We were using Splitwise for two years and hated how transactional it felt. EquiFlow changed everything—now we see 'our' spending, not 'your' debt and 'my' debt. It's brought us closer.", 
      image: "/testimonial-1.jpg" 
    },
    { 
      id: 2, 
      name: "David & James", 
      title: "Married, Blended Finances", 
      quote: "YNAB was too intense for my husband, and Mint felt chaotic. EquiFlow hits the sweet spot—elegant enough for me, simple enough for him. The privacy zones are genius.", 
      image: "/testimonial-2.jpg" 
    },
    { 
      id: 3, 
      name: "The Chen Family", 
      title: "Parents with Complex Accounts", 
      quote: "Five bank accounts, three credit cards, and investment accounts across two institutions. EquiFlow makes it feel manageable. We actually look forward to our monthly money dates now.", 
      image: "/testimonial-3.jpg" 
    },
  ],
};

// ============================================================================
// Pricing Section - Plans
// ============================================================================

export interface PricingPlan {
  id: number;
  name: string;
  price: number;
  unit: string;
  featured: boolean;
  features: string[];
}

export interface PricingConfig {
  title: string;
  subtitle: string;
  ctaButtonText: string;
  plans: PricingPlan[];
}

export const pricingConfig: PricingConfig = {
  title: "Investment",
  subtitle: "Simple pricing for households ready for financial harmony.",
  ctaButtonText: "Start Free Trial",
  plans: [
    { 
      id: 1, 
      name: "Harmony", 
      price: 12, 
      unit: "per month", 
      featured: false, 
      features: [
        "Up to 10 connected accounts",
        "Shared expense categories",
        "Basic privacy zones",
        "Monthly insights",
        "Email support"
      ] 
    },
    { 
      id: 2, 
      name: "Unity", 
      price: 24, 
      unit: "per month", 
      featured: true, 
      features: [
        "Unlimited connected accounts",
        "Advanced privacy controls",
        "Custom expense categories",
        "Weekly insights & trends",
        "Goal tracking together",
        "Priority support",
        "Export reports"
      ] 
    },
    { 
      id: 3, 
      name: "Legacy", 
      price: 49, 
      unit: "per month", 
      featured: false, 
      features: [
        "Everything in Unity",
        "Investment tracking",
        "Net worth dashboard",
        "Tax preparation exports",
        "Family member accounts",
        "Dedicated account manager",
        "White-glove onboarding"
      ] 
    },
  ],
};

// ============================================================================
// FAQ Section
// ============================================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQConfig {
  title: string;
  faqs: FAQItem[];
}

export const faqConfig: FAQConfig = {
  title: "Common Questions",
  faqs: [
    { 
      question: "How is EquiFlow different from YNAB or Monarch Money?", 
      answer: "Traditional budgeting apps focus on strict rules and envelope methods—excellent for extreme budgeters but often too rigid for households where both partners aren't 'financial dorks.' EquiFlow emphasizes visibility and harmony over control. We're designed for couples who want to stay informed together without the stress of micromanaging every dollar." 
    },
    { 
      question: "Can we keep personal spending private?", 
      answer: "Absolutely. Privacy within partnership is a core principle. You can designate any account or transaction category as private, and it won't appear in shared views. Your partner sees your contribution to shared expenses, but your personal discretionary spending remains yours alone." 
    },
    { 
      question: "What banks and institutions do you support?", 
      answer: "EquiFlow connects to over 12,000 financial institutions through secure Plaid integration. This includes all major U.S. banks (Chase, Bank of America, Wells Fargo, Citi), credit unions, investment platforms (Fidelity, Schwab, Vanguard), and credit card issuers. If we don't support your institution, we'll add it within 48 hours." 
    },
    { 
      question: "Is there a 'settling up' feature like Splitwise?", 
      answer: "No—and that's intentional. We don't believe committed households should approach finances like roommates splitting rent. Instead, EquiFlow shows each partner's contribution to shared categories in real-time. If imbalances occur, they're visible and can be addressed through conversation, not transactional debt." 
    },
    { 
      question: "How secure is our financial data?", 
      answer: "Security is paramount. We use bank-level 256-bit encryption, never store your login credentials (Plaid handles authentication), and are SOC 2 Type II certified. Your data is never sold, and you can export or delete everything at any time. We treat your financial information with the same care we'd want for our own." 
    },
    { 
      question: "Can we try before subscribing?", 
      answer: "Yes—every plan includes a 30-day free trial with full features. No credit card required to start. We want you to experience the calm that comes from financial visibility before committing." 
    },
  ],
};

// ============================================================================
// Blog Section - Financial Harmony Insights
// ============================================================================

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  image: string;
  category: string;
}

export interface BlogConfig {
  title: string;
  subtitle: string;
  allPostsLabel: string;
  readMoreLabel: string;
  readTimePrefix: string;
  posts: BlogPost[];
}

export const blogConfig: BlogConfig = {
  title: "The Stillness Journal",
  subtitle: "Insights on household harmony, mindful money, and modern partnership.",
  allPostsLabel: "All Articles",
  readMoreLabel: "Read More",
  readTimePrefix: "Read ",
  posts: [
    { 
      id: 1, 
      title: "The Psychology of 'Our Money' vs. 'My Money'", 
      excerpt: "Why the language we use about household finances shapes our emotional relationship with partnership—and how to shift toward unity without losing autonomy.", 
      readTime: "6 min", 
      date: "Mar 28, 2024", 
      image: "/blog-1.jpg", 
      category: "Partnership" 
    },
    { 
      id: 2, 
      title: "Designing Calm: The Aesthetics of Financial Tools", 
      excerpt: "How visual design influences our emotional response to money management. Why 'Quiet Luxury' isn't just a trend—it's a neurological necessity for reducing financial anxiety.", 
      readTime: "8 min", 
      date: "Mar 15, 2024", 
      image: "/blog-2.jpg", 
      category: "Design" 
    },
    { 
      id: 3, 
      title: "The Monthly Money Date: A Ritual for Connection", 
      excerpt: "Transform financial check-ins from stressful obligations into opportunities for intimacy. A step-by-step guide to creating your own household ritual.", 
      readTime: "5 min", 
      date: "Feb 28, 2024", 
      image: "/blog-3.jpg", 
      category: "Rituals" 
    },
  ],
};

// ============================================================================
// Contact Section
// ============================================================================

export interface ContactFormOption {
  value: string;
  label: string;
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  projectTypeLabel: string;
  projectTypePlaceholder: string;
  projectTypeOptions: ContactFormOption[];
  messageLabel: string;
  submitButtonText: string;
  image: string;
}

export const contactConfig: ContactConfig = {
  title: "Begin Your Journey",
  subtitle: "Ready for household financial harmony? Let's start a conversation.",
  nameLabel: "Your Name *",
  emailLabel: "Email Address *",
  projectTypeLabel: "Household Type",
  projectTypePlaceholder: "Select...",
  projectTypeOptions: [
    { value: "married", label: "Married / Domestic Partnership" },
    { value: "engaged", label: "Engaged / Planning to Merge" },
    { value: "cohabiting", label: "Living Together" },
    { value: "blended", label: "Blended Family" },
    { value: "other", label: "Other" },
  ],
  messageLabel: "Tell us about your household's financial journey",
  submitButtonText: "Request Early Access",
  image: "/contact.jpg",
};

// ============================================================================
// Footer Configuration
// ============================================================================

export interface FooterLink {
  label: string;
  href: string;
  icon?: string;
}

export interface FooterConfig {
  marqueeText: string;
  marqueeHighlightChars: string[];
  navLinks1: FooterLink[];
  navLinks2: FooterLink[];
  ctaText: string;
  ctaHref: string;
  copyright: string;
  tagline: string;
}

export const footerConfig: FooterConfig = {
  marqueeText: "Financial Stillness • Household Harmony • Shared Understanding",
  marqueeHighlightChars: ["S", "H"],
  navLinks1: [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  navLinks2: [
    { label: "Twitter", href: "#", icon: "Twitter" },
    { label: "LinkedIn", href: "#", icon: "Linkedin" },
    { label: "Instagram", href: "#", icon: "Instagram" },
  ],
  ctaText: "Start Free Trial",
  ctaHref: "#contact",
  copyright: "© 2024 EquiFlow. All rights reserved.",
  tagline: "Crafted for harmony",
};
