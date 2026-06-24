export type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
};

export type QuestionOption = {
  id: string;
  label: string;
};

export type Question = {
  id: keyof PlannerAnswers;
  title: string;
  type: "single" | "multi";
  options: QuestionOption[];
};

export type ContactDetails = {
  name: string;
  businessName: string;
  email: string;
  websiteUrl: string;
  notes: string;
};

export type PlannerAnswers = {
  need: string;
  website: string;
  priority: string;
  assets: string[];
  budget: string;
};

export type Recommendation = {
  mainService: Service;
  extras: Service[];
  explanation: string;
  nextStep: string;
};

export type PlannerConfig = {
  businessName: string;
  primaryColour: string;
  accentColour: string;
  landing: {
    heading: string;
    subheading: string;
    buttonLabel: string;
  };
  services: Service[];
  questions: Question[];
};

export type StoredSubmission = {
  id: string;
  createdAt: string;
  answers: PlannerAnswers;
  contact: ContactDetails;
  recommendation: Recommendation;
};
