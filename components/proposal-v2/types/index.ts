export interface CoverPageData {
  proposalTitle: string;
  proposalDetails: string[];

  preparedFor: string;
  preparedBy: string;
  date: string;

  clientLogo?: string;
  coverImage?: string;

  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
}

export interface ScopeService {
  title: string;
  description: string;
  price: string;
}

export interface ScopePageData {
  projectTitle: string;
  services: ScopeService[];
  packageName: string;
  totalPrice: string;
}

export interface PricingPageData {
  packageTitle: string;
  strategicObjective: string;
  deliverables: string[];
  timeline: string;
  price: string;
}

export interface PartnershipPageData {
  packageName: string;

  individualPackages: IndividualPackage[];

  totalPrice: string;

  finalPrice: string;

  savePrice: string;

  discount: string;

  currency: "VND" | "USD"; // NEW

  paymentTerms: string[];

  clientLogo?: string;
}

export interface NextStepsPageData {
  preparedBy: string;
  email: string;
  nextSteps: string[];
}

export interface CoverFormData {
  proposalTitle: string;
  proposalDetails: string[];

  preparedFor: string;
  preparedBy: string;
  date: string;

  clientLogo?: string;
  coverImage?: string;

  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
}
