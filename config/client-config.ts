import { PlannerConfig } from "@/types/planner";

export const plannerConfig: PlannerConfig = {
  businessName: "Lift Brandworks",
  primaryColour: "#ff5b5b",
  accentColour: "#28b6bd",
  landing: {
    heading: "Find the right website service",
    subheading: "Answer 5 quick questions. Get a clear next step.",
    buttonLabel: "Start"
  },
  services: [
    {
      id: "website-review",
      title: "Website Review & Action Plan",
      description:
        "Clear breakdown of what is working, what is not, and exactly how to improve the site.",
      price: "£250 / $320"
    },
    {
      id: "seo-review",
      title: "SEO Review & Setup",
      description:
        "SEO review and practical implementation to improve structure, page titles, key content and search visibility.",
      price: "£400 / $520"
    },
    {
      id: "copy-refresh",
      title: "Content & Copy Refresh",
      description:
        "Review and refine website copy so it feels clearer, more engaging, and focused on enquiries.",
      price: "£500 / $650"
    },
    {
      id: "site-update",
      title: "Full Site Review & Update",
      description:
        "Deeper website review with hands-on improvements across layout, structure and content.",
      price: "From £950 / $1,200"
    },
    {
      id: "ecommerce",
      title: "Squarespace Ecommerce Setup",
      description:
        "Online store setup with products, pages and checkout configured properly.",
      price: "From £400 / $520"
    },
    {
      id: "website-build",
      title: "Full Website Build",
      description:
        "Custom Squarespace website built from scratch around the client’s business, goals and customers.",
      price: "From £2,000 / $2,600"
    },
    {
      id: "brand-website",
      title: "Brand & Website Package",
      description:
        "Complete brand and website built from the ground up, including identity, messaging and custom Squarespace site.",
      price: "From £2,800 / $3,600"
    },
    {
      id: "not-sure",
      title: "Project Scoping Review",
      description:
        "A focused first step to define the right scope, priorities and route before quoting the larger project.",
      price: "Scope before quote"
    }
  ],
  questions: [
    {
      id: "need",
      title: "What do you need help with?",
      type: "single",
      options: [
        { id: "improve-existing", label: "Improve my existing website" },
        { id: "google", label: "Get found better on Google" },
        { id: "copy", label: "Refresh my website copy" },
        { id: "ecommerce", label: "Set up ecommerce" },
        { id: "new-site", label: "Build a new website" },
        { id: "brand-website", label: "Build a full brand and website" },
        { id: "not-sure", label: "I am not sure yet" }
      ]
    },
    {
      id: "website",
      title: "Do you already have a website?",
      type: "single",
      options: [
        { id: "improve", label: "Yes, and it needs improving" },
        { id: "replace", label: "Yes, but I want to replace it" },
        { id: "no-site", label: "No, I need a new site" },
        { id: "not-sure", label: "Not sure" }
      ]
    },
    {
      id: "priority",
      title: "What matters most right now?",
      type: "single",
      options: [
        { id: "enquiries", label: "More enquiries" },
        { id: "design", label: "Better design" },
        { id: "visibility", label: "Better Google visibility" },
        { id: "selling-online", label: "Selling online" },
        { id: "messaging", label: "Clearer messaging" },
        { id: "brand-refresh", label: "A full brand refresh" },
        { id: "fixing", label: "Understanding what needs fixing" }
      ]
    },
    {
      id: "assets",
      title: "What do you already have?",
      type: "multi",
      options: [
        { id: "logo", label: "Logo" },
        { id: "brand-assets", label: "Brand colours/fonts" },
        { id: "copy", label: "Website copy" },
        { id: "photos", label: "Professional photos" },
        { id: "domain", label: "Domain name" },
        { id: "squarespace", label: "Existing Squarespace website" },
        { id: "products", label: "Products/services ready" },
        { id: "none", label: "None of the above" }
      ]
    },
    {
      id: "budget",
      title: "Approximate budget",
      type: "single",
      options: [
        { id: "under-500", label: "Under £500" },
        { id: "500-1500", label: "£500 to £1,500" },
        { id: "1500-3000", label: "£1,500 to £3,000" },
        { id: "3000-plus", label: "£3,000+" }
      ]
    }
  ]
};
