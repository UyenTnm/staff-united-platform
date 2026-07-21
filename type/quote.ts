export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Accepted"
  | "Rejected"
  | "Expired";

export interface QuoteVersion {
  version: number;
  isCurrent: boolean;
}
