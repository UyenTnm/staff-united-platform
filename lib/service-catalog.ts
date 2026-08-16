export interface ServiceCatalogItem {
  name: string;
}

export interface ServiceCatalogCategory {
  name: string;
  services: ServiceCatalogItem[];
}

export interface ServiceCatalogDepartment {
  name: string;
  categories: ServiceCatalogCategory[];
}

export const SERVICE_CATALOG: ServiceCatalogDepartment[] = [
  {
    name: "Strategic Operations",
    categories: [
      {
        name: "Administrative Support",
        services: [
          { name: "Executive Assistant Support" },
          { name: "Calendar & Inbox Management" },
          { name: "Meeting Scheduling & Coordination" },
          { name: "Document Formatting & Preparation" },
          { name: "Reporting & Administrative Coordination" },
          { name: "Vendor & Payment Coordination" },
        ],
      },
      {
        name: "Workflow & Systems",
        services: [
          { name: "CRM Updates & Data Management" },
          { name: "Workflow & Systems Coordination" },
          { name: "SOP Documentation" },
          { name: "Operational Documentation & Process Mapping" },
          { name: "Internal Process Optimization Support" },
          { name: "Business Process Standardization" },
        ],
      },
      {
        name: "Organization & Documentation",
        services: [
          { name: "Research & Information Gathering" },
          { name: "Internal Follow-Ups & Task Tracking" },
          { name: "File & System Organization" },
          { name: "Information & File Management Systems" },
          { name: "Operational Reporting & Tracking" },
        ],
      },
      {
        name: "Governance & Continuity",
        services: [
          { name: "Business Continuity Planning Support" },
          { name: "Compliance & Administrative Coordination" },
          { name: "Operational Risk Coordination Support" },
          { name: "Internal Security Procedure Coordination" },
        ],
      },
    ],
  },
  {
    name: "Targeted Sales",
    categories: [
      {
        name: "Sales Operations",
        services: [
          { name: "Lead Research & List Building" },
          { name: "CRM Cleanup & Maintenance" },
          { name: "Pipeline & Follow-Up Tracking" },
          { name: "Proposal & Document Formatting" },
          { name: "Appointment Scheduling" },
          { name: "Sales Administration Support" },
        ],
      },
      {
        name: "Customer Support",
        services: [
          { name: "Email Customer Support" },
          { name: "Live Chat Support" },
          { name: "Helpdesk & Ticket Handling" },
        ],
      },
      {
        name: "Order & Account Coordination",
        services: [
          { name: "Order Processing Support" },
          { name: "Returns & Refund Coordination" },
          { name: "CRM Case Logging & Updates" },
        ],
      },
      {
        name: "Customer Success & Retention",
        services: [
          { name: "Customer Follow-Up Support" },
          { name: "After-Sales Support" },
        ],
      },
    ],
  },
  {
    name: "Accounting & Legal",
    categories: [
      {
        name: "Bookkeeping & Reconciliation",
        services: [
          { name: "Monthly Bookkeeping" },
          { name: "Bank & Credit Card Reconciliation" },
          { name: "Catch-Up & Cleanup Bookkeeping" },
        ],
      },
      {
        name: "Accounts Management",
        services: [
          { name: "Accounts Payable (AP) Support" },
          { name: "Accounts Receivable (AR) Support" },
          { name: "Invoicing & Billing Support" },
        ],
      },
      {
        name: "Financial Operations",
        services: [
          { name: "Expense Coding & Categorization" },
          { name: "Month-End Close Support" },
          { name: "Payroll Administration Support" },
        ],
      },
      {
        name: "Reporting & Records",
        services: [
          { name: "Financial Data Entry & Maintenance" },
          { name: "Management Reporting Support" },
        ],
      },
    ],
  },
  {
    name: "Focused Marketing",
    categories: [
      {
        name: "Marketing Strategy & Campaigns",
        services: [
          { name: "Social Media Strategic Planning" },
          { name: "Email Campaign Setup" },
          { name: "Campaign Coordination" },
          { name: "Marketing Content Coordination" },
        ],
      },
      {
        name: "Brand & Creative Assets",
        services: [
          { name: "Brand Communication Support" },
          { name: "Graphic & Visual Asset Coordination" },
          { name: "Brand Communication & Visual Assets" },
        ],
      },
      {
        name: "Business Marketing Materials",
        services: [
          { name: "Website Development & Optimization" },
          { name: "Digital Brochure & Company Profile Design" },
          { name: "Corporate Presentation & Pitch Deck Design" },
        ],
      },
      {
        name: "Media Production & Distribution",
        services: [
          { name: "Video Editing & Media Production" },
          { name: "Animated, Lyrical & Promotional Video Production" },
          { name: "YouTube Content Optimization & Publishing" },
          { name: "On-Site Media Production (Vietnam)" },
          { name: "Reporting & Dashboard Support" },
          { name: "Marketing Administration Support" },
        ],
      },
    ],
  },
  {
    name: "Future Expansion",
    categories: [
      {
        name: "Business Setup",
        services: [
          { name: "Virtual Office Setup" },
          { name: "Business Address Setup" },
          { name: "Operational Setup Coordination" },
          { name: "Banking Setup Support" },
        ],
      },
      {
        name: "Documentation & Administration",
        services: [
          { name: "Administrative Follow-Ups" },
          { name: "Translation & Documentation Support" },
          { name: "Required Document Preparation" },
          { name: "Government Filing Assistance" },
        ],
      },
      {
        name: "Local Coordination",
        services: [
          { name: "Local Operations Coordination" },
          { name: "Local Legal Partner Introductions" },
        ],
      },
      {
        name: "Market Entry Support",
        services: [
          { name: "Vietnam Business Registration Coordination" },
          { name: "Vietnam Market Entry Coordination" },
        ],
      },
    ],
  },
];
