export interface CoverPageData {
  proposalTitle: string;
  proposalDetails: string[];
  preparedFor: string;
  preparedBy: string;
  date: string;

  staffLogo?: string | null;
  clientLogo?: string | null;
  coverImage?: string | null;

  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
}

export interface ScopeService {
  title: string;
  description: string;
  price: string;
}

export interface PricingPageData {
  packageTitle: string;

  strategicObjective: string;

  deliverables: string[];

  timeline: string;

  price: string;

  currency: "VND" | "USD";

  clientLogo?: string | null;
}

export interface IndividualPackage {
  title: string;
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

  clientLogo?: string | null;
}

export interface NextStepsPageData {
  preparedBy: string;
  email: string;
  nextSteps: string[];
  closingMessage: string;
  clientLogo?: string | null;
}

export interface CoverFormData {
  proposalTitle: string;
  proposalDetails: string[];

  preparedFor: string;
  preparedBy: string;
  date: string;

  clientLogo?: string | null;
  coverImage?: string | null;

  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
}

export interface ScopePageData {
  projectTitle: string;

  scopeImage?: string;
  scopeImagePositionX?: number;
  scopeImagePositionY?: number;
  scopeImageScale?: number;

  services: ScopeService[];

  packageName: string;
  originalPrice: string;
  totalPrice: string;

  discount: string;

  finalPrice: string;

  currency: "VND" | "USD";

  clientLogo?: string | null;

  paymentTerms: string[];
}
