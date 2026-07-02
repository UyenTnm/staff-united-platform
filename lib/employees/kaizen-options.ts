import { KaizenImpact } from "./kaizen";

export const KAIZEN_CATEGORIES = [
  { label: "Workflow", value: "Workflow" },
  { label: "Productivity", value: "Productivity" },
  { label: "Customer Experience", value: "Customer Experience" },
  { label: "Quality", value: "Quality" },
  { label: "Cost Saving", value: "Cost Saving" },
  { label: "Revenue Growth", value: "Revenue Growth" },
  { label: "Automation", value: "Automation" },
  { label: "Communication", value: "Communication" },
  { label: "Documentation", value: "Documentation" },
  { label: "Training", value: "Training" },
  { label: "Innovation", value: "Innovation" },
  { label: "Other", value: "Other" },
];

export const KAIZEN_IMPACTS = [
  { label: "Small (+1)", value: "Small" },
  { label: "Medium (+2)", value: "Medium" },
  { label: "Major (+3)", value: "Major" },
  { label: "Innovation (+4)", value: "Innovation" },
  {
    label: "Outstanding Innovation (+5)",
    value: "Outstanding Innovation",
  },
];

export const KAIZEN_POINTS = [
  { label: "+1 Point", value: "1" },
  { label: "+2 Points", value: "2" },
  { label: "+3 Points", value: "3" },
  { label: "+4 Points", value: "4" },
  { label: "+5 Points", value: "5" },
];

export const IMPACT_POINT_OPTIONS = {
  Small: [{ label: "+1 Point", value: "1" }],

  Medium: [{ label: "+2 Points", value: "2" }],

  Major: [{ label: "+3 Points", value: "3" }],

  Innovation: [{ label: "+4 Points", value: "4" }],

  "Outstanding Innovation": [{ label: "+5 Points", value: "5" }],
} as const;

export const IMPACT_POINTS: Record<KaizenImpact, number> = {
  Small: 1,
  Medium: 2,
  Major: 3,
  Innovation: 4,
  "Outstanding Innovation": 5,
};

export const KAIZEN_STATUSES = [
  { label: "Submitted", value: "Submitted" },
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Implemented", value: "Implemented" },
  { label: "Rewarded", value: "Rewarded" },
];
