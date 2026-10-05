import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ClinicRecord, CalculatedMetrics, GroupSummary } from '../types';

function findField(row: Record<string, unknown>, candidates: string[]): unknown {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const exact = row[candidate];
    if (exact !== undefined && exact !== null && exact !== '') return exact;

    const normalizedCandidate = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedKey = keys.find(
      (k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedCandidate
    );
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && row[matchedKey] !== '') {
      return row[matchedKey];
    }
  }
  return undefined;
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseString(val: unknown, fallback = 'Unknown'): string {
  if (val === undefined || val === null) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

function normalizeDate(val: unknown): string {
  if (!val) return 'Unknown';
  if (typeof val === 'number') {
    // Handle Excel serial date
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && str.length >= 6) {
    return parsed.toISOString().split('T')[0];
  }
  return str;
}

export function normalizeRecords(rawRows: Record<string, unknown>[]): ClinicRecord[] {
  return rawRows
    .filter((row) => row && Object.keys(row).length > 0)
    .map((row, idx) => {
      const impressions = parseNumber(findField(row, ['Impressions', 'impressions', 'impr']));
      const clicks = parseNumber(findField(row, ['Clicks', 'clicks']));
      const spent = parseNumber(findField(row, ['Spent', 'spent', 'spend', 'cost', 'ad_spend']));
      const totalConversion = parseNumber(
        findField(row, ['Total_Conversion', 'total_conversion', 'leads', 'Leads', 'Total Conversion'])
      );
      const approvedConversion = parseNumber(
        findField(row, [
          'Approved_Conversion',
          'approved_conversion',
          'paid_patients',
          'Paid Patients',
          'Approved Conversion',
        ])
      );
      const bookings = parseNumber(findField(row, ['Bookings', 'bookings', 'booked']));
      const attended = parseNumber(findField(row, ['Attended', 'attended', 'visits', 'visited']));
      const revenue = parseNumber(findField(row, ['Revenue', 'revenue', 'sales', 'sar_revenue']));

      return {
        ad_id: parseString(findField(row, ['ad_id', 'adId', 'Ad ID', 'id']), `AD-${1000 + idx}`),
        age: parseString(findField(row, ['age', 'Age', 'age_group']), 'All Ages'),
        gender: parseString(findField(row, ['gender', 'Gender', 'sex']), 'All'),
        interest: parseString(findField(row, ['interest', 'Interest', 'interest_id', 'audience_interest']), 'General'),
        Impressions: impressions,
        Clicks: clicks,
        Spent: spent,
        Total_Conversion: totalConversion,
        Approved_Conversion: approvedConversion,
        Bookings: bookings,
        Attended: attended,
        Revenue: revenue,
        date: normalizeDate(findField(row, ['date', 'Date', 'day', 'report_date'])),
        clinic: parseString(findField(row, ['clinic', 'Clinic', 'clinic_name', 'branch']), 'Main Clinic'),
        city: parseString(findField(row, ['city', 'City', 'region', 'location']), 'Riyadh'),
        specialty: parseString(findField(row, ['specialty', 'Specialty', 'department', 'service']), 'General Medicine'),
        campaign_id: parseString(findField(row, ['campaign_id', 'Campaign ID', 'campaign']), 'CMP-01'),
        campaign_objective: parseString(
          findField(row, ['campaign_objective', 'Campaign Objective', 'objective']),
          'Lead Generation'
        ),
        platform: parseString(findField(row, ['platform', 'Platform', 'channel', 'source']), 'Meta'),
      };
    })
    .filter((r) => r.Impressions > 0 || r.Clicks > 0 || r.Spent > 0 || r.Revenue > 0 || r.Total_Conversion > 0);
}

export async function parseUploadedFile(file: File): Promise<ClinicRecord[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const records = normalizeRecords(results.data as Record<string, unknown>[]);
            resolve(records);
          } catch (err) {
            reject(err);
          }
        },
        error: (error) => reject(error),
      });
    });
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
    return normalizeRecords(rawData);
  } else {
    throw new Error('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.');
  }
}

export function calculateMetrics(records: ClinicRecord[]): CalculatedMetrics {
  let impressions = 0;
  let clicks = 0;
  let spent = 0;
  let leads = 0;
  let bookings = 0;
  let attended = 0;
  let paidPatients = 0;
  let revenue = 0;

  for (const r of records) {
    impressions += r.Impressions;
    clicks += r.Clicks;
    spent += r.Spent;
    leads += r.Total_Conversion;
    bookings += r.Bookings;
    attended += r.Attended;
    paidPatients += r.Approved_Conversion;
    revenue += r.Revenue;
  }

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spent / clicks : 0;
  const cpm = impressions > 0 ? (spent / impressions) * 1000 : 0;
  const clickToLeadRate = clicks > 0 ? (leads / clicks) * 100 : 0;
  const leadToBookingRate = leads > 0 ? (bookings / leads) * 100 : 0;
  const bookingToAttendedRate = bookings > 0 ? (attended / bookings) * 100 : 0;
  const leadToPaidRate = leads > 0 ? (paidPatients / leads) * 100 : 0;
  const cpl = leads > 0 ? spent / leads : 0;
  const cac = paidPatients > 0 ? spent / paidPatients : 0;
  const aov = paidPatients > 0 ? revenue / paidPatients : 0;
  // ROAS = (Approved_Conversion * average order value) / Spent
  const roas = spent > 0 ? (paidPatients * aov) / spent : 0;
  const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;

  return {
    impressions,
    clicks,
    spent,
    leads,
    bookings,
    attended,
    paidPatients,
    revenue,
    aov,
    ctr,
    cpc,
    cpm,
    clickToLeadRate,
    leadToBookingRate,
    bookingToAttendedRate,
    leadToPaidRate,
    cpl,
    cac,
    roas,
    roi,
  };
}

export function groupRecordsBy<K extends keyof ClinicRecord>(
  records: ClinicRecord[],
  key: K,
  secondaryKey?: keyof ClinicRecord
): GroupSummary[] {
  const map = new Map<string, { rows: ClinicRecord[]; secondarySet: Set<string> }>();

  for (const r of records) {
    const groupVal = String(r[key] || 'Unknown');
    if (!map.has(groupVal)) {
      map.set(groupVal, { rows: [], secondarySet: new Set() });
    }
    const entry = map.get(groupVal)!;
    entry.rows.push(r);
    if (secondaryKey && r[secondaryKey]) {
      entry.secondarySet.add(String(r[secondaryKey]));
    }
  }

  const summaries: GroupSummary[] = [];
  for (const [groupKey, { rows, secondarySet }] of map.entries()) {
    const metrics = calculateMetrics(rows);
    summaries.push({
      groupKey,
      secondaryLabel: secondarySet.size > 0 ? Array.from(secondarySet).join(', ') : undefined,
      recordCount: rows.length,
      ...metrics,
    });
  }

  return summaries.sort((a, b) => b.revenue - a.revenue);
}

export function generateSampleSaudiDatasetCsv(): string {
  const headers = [
    'ad_id',
    'age',
    'gender',
    'interest',
    'Impressions',
    'Clicks',
    'Spent',
    'Total_Conversion',
    'Approved_Conversion',
    'Bookings',
    'Attended',
    'Revenue',
    'date',
    'clinic',
    'city',
    'specialty',
    'campaign_id',
    'campaign_objective',
    'platform',
  ];

  const clinics = [
    { clinic: 'Al-Noor Medical Center', city: 'Riyadh' },
    { clinic: 'Kingdom Derma & Dental', city: 'Riyadh' },
    { clinic: 'Red Sea Specialist Clinic', city: 'Jeddah' },
    { clinic: 'Rawdah Aesthetic & Health', city: 'Jeddah' },
    { clinic: 'Eastern Province Care', city: 'Dammam' },
    { clinic: 'Khobar Prime Polyclinic', city: 'Al Khobar' },
    { clinic: 'Hejaz Family Clinic', city: 'Makkah' },
  ];

  const specialties = [
    { name: 'Dermatology & Laser', baseAov: 1850 },
    { name: 'Dental Implants & Ortho', baseAov: 3400 },
    { name: 'Ophthalmology & LASIK', baseAov: 4200 },
    { name: 'Cosmetic Plastic Surgery', baseAov: 5600 },
    { name: 'Orthopedics & Physio', baseAov: 1250 },
  ];

  const platforms = [
    { name: 'Snapchat Ads', ctrMult: 1.15, cpcBase: 2.8 },
    { name: 'Instagram', ctrMult: 1.25, cpcBase: 3.4 },
    { name: 'Google Search', ctrMult: 1.65, cpcBase: 5.2 },
    { name: 'TikTok Ads', ctrMult: 1.05, cpcBase: 2.1 },
    { name: 'X (Twitter)', ctrMult: 0.85, cpcBase: 3.9 },
  ];

  const campaigns = [
    { id: 'CMP-RYD-101', objective: 'Lead Generation' },
    { id: 'CMP-JED-204', objective: 'Conversion & Booking' },
    { id: 'CMP-KSA-309', objective: 'Patient Acquisition' },
    { id: 'CMP-RAM-412', objective: 'Seasonal Wellness Offer' },
    { id: 'CMP-VIP-518', objective: 'High-Value Specialist' },
  ];

  const ages = ['25-34', '35-44', '45-54', '18-24', '55+'];
  const genders = ['Female', 'Male'];
  const interests = [
    'Skincare & Beauty',
    'Dental Care & Whitening',
    'Family Healthcare',
    'Fitness & Rehab',
    'Vision Correction',
    'Luxury Wellness',
  ];

  const rows: string[] = [headers.join(',')];

  let adCounter = 110001;
  // Deterministic pseudo-random generator
  let seed = 42;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const d = new Date(Date.UTC(2026, 7, 1 + dayOffset)); // Aug - Sep 2026
    const dateStr = d.toISOString().split('T')[0];

    // 2 to 3 records per day
    const dailyCount = 2 + (dayOffset % 2);
    for (let i = 0; i < dailyCount; i++) {
      const cObj = clinics[(dayOffset + i * 3) % clinics.length];
      const spec = specialties[(dayOffset * 2 + i) % specialties.length];
      const plat = platforms[(dayOffset + i * 2) % platforms.length];
      const camp = campaigns[(dayOffset + i) % campaigns.length];
      const age = ages[(dayOffset + i) % ages.length];
      const gender = genders[(dayOffset + i) % genders.length];
      const interest = interests[(dayOffset * 3 + i) % interests.length];

      const impressions = Math.round((14000 + nextRand() * 38000) * (cObj.city === 'Riyadh' ? 1.25 : 1.0));
      const ctr = (0.014 + nextRand() * 0.022) * plat.ctrMult;
      const clicks = Math.max(25, Math.round(impressions * ctr));
      const cpc = plat.cpcBase * (0.85 + nextRand() * 0.35);
      const spent = Number((clicks * cpc).toFixed(2));

      const clickToLead = 0.09 + nextRand() * 0.14;
      const leads = Math.max(4, Math.round(clicks * clickToLead));
      const bookings = Math.max(2, Math.round(leads * (0.58 + nextRand() * 0.24)));
      const attended = Math.max(1, Math.round(bookings * (0.68 + nextRand() * 0.22)));
      const paidPatients = Math.max(1, Math.round(attended * (0.76 + nextRand() * 0.2)));

      const aov = spec.baseAov * (0.88 + nextRand() * 0.28);
      const revenue = Number((paidPatients * aov).toFixed(2));

      const rowValues = [
        `AD-${adCounter++}`,
        age,
        gender,
        interest,
        impressions,
        clicks,
        spent,
        leads,
        paidPatients,
        bookings,
        attended,
        revenue,
        dateStr,
        cObj.clinic,
        cObj.city,
        spec.name,
        camp.id,
        camp.objective,
        plat.name,
      ];

      rows.push(rowValues.join(','));
    }
  }

  return rows.join('\n');
}
