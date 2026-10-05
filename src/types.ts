export interface ClinicRecord {
  ad_id: string;
  age: string;
  gender: string;
  interest: string;
  Impressions: number;
  Clicks: number;
  Spent: number;
  Total_Conversion: number; // leads
  Approved_Conversion: number; // paid patients
  Bookings: number;
  Attended: number;
  Revenue: number; // SAR excluding VAT, credited to lead arrival day
  date: string;
  clinic: string;
  city: string;
  specialty: string;
  campaign_id: string;
  campaign_objective: string;
  platform: string;
}

export interface CalculatedMetrics {
  impressions: number;
  clicks: number;
  spent: number;
  leads: number; // Total_Conversion
  bookings: number;
  attended: number;
  paidPatients: number; // Approved_Conversion
  revenue: number;
  aov: number; // Average Order Value = Revenue / Approved_Conversion
  ctr: number; // Clicks / Impressions (percentage)
  cpc: number; // Spent / Clicks (SAR)
  cpm: number; // (Spent / Impressions) * 1000 (SAR)
  clickToLeadRate: number; // Total_Conversion / Clicks (percentage)
  leadToBookingRate: number; // Bookings / Total_Conversion (percentage)
  bookingToAttendedRate: number; // Attended / Bookings (percentage)
  leadToPaidRate: number; // Approved_Conversion / Total_Conversion (percentage)
  cpl: number; // Spent / Total_Conversion (SAR)
  cac: number; // Spent / Approved_Conversion (SAR)
  roas: number; // (Approved_Conversion * AOV) / Spent (ratio)
  roi: number; // ((Revenue - Spent) / Spent) * 100 (percentage)
}

export interface GroupSummary extends CalculatedMetrics {
  groupKey: string;
  secondaryLabel?: string;
  recordCount: number;
}

export interface FilterState {
  clinic: string;
  city: string;
  specialty: string;
  platform: string;
  campaignObjective: string;
  searchQuery: string;
}
