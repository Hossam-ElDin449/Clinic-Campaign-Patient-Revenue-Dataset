import React from 'react';
import { CalculatedMetrics } from '../types';

interface MetricCardsProps {
  metrics: CalculatedMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const formatSAR = (val: number, decimals = 2) =>
    `SAR ${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

  const formatPct = (val: number) =>
    `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

  const formatInt = (val: number) => Math.round(val).toLocaleString('en-US');

  const formulaCards = [
    {
      title: 'CTR (Click-Through Rate)',
      value: formatPct(metrics.ctr),
      formula: 'Clicks ÷ Impressions',
      detail: `${formatInt(metrics.clicks)} clicks ÷ ${formatInt(metrics.impressions)} impr.`,
      accent: 'border-l-emerald-600',
    },
    {
      title: 'CPC (Cost Per Click)',
      value: formatSAR(metrics.cpc, 2),
      formula: 'Spent ÷ Clicks',
      detail: `${formatSAR(metrics.spent, 0)} ÷ ${formatInt(metrics.clicks)} clicks`,
      accent: 'border-l-emerald-600',
    },
    {
      title: 'CPM (Cost Per 1,000 Impr.)',
      value: formatSAR(metrics.cpm, 2),
      formula: 'Spent ÷ Impressions × 1000',
      detail: `${formatSAR(metrics.spent, 0)} across ${formatInt(metrics.impressions)} impr.`,
      accent: 'border-l-emerald-600',
    },
    {
      title: 'Click-to-Lead Rate',
      value: formatPct(metrics.clickToLeadRate),
      formula: 'Total_Conversion ÷ Clicks',
      detail: `${formatInt(metrics.leads)} leads ÷ ${formatInt(metrics.clicks)} clicks`,
      accent: 'border-l-teal-600',
    },
    {
      title: 'Lead-to-Paid Rate',
      value: formatPct(metrics.leadToPaidRate),
      formula: 'Approved_Conversion ÷ Total_Conversion',
      detail: `${formatInt(metrics.paidPatients)} paid ÷ ${formatInt(metrics.leads)} leads`,
      accent: 'border-l-teal-600',
    },
    {
      title: 'CPL (Cost Per Lead)',
      value: formatSAR(metrics.cpl, 2),
      formula: 'Spent ÷ Total_Conversion',
      detail: `${formatSAR(metrics.spent, 0)} ÷ ${formatInt(metrics.leads)} leads`,
      accent: 'border-l-emerald-700',
    },
    {
      title: 'CAC (Cost Per Paying Patient)',
      value: formatSAR(metrics.cac, 2),
      formula: 'Spent ÷ Approved_Conversion',
      detail: `${formatSAR(metrics.spent, 0)} ÷ ${formatInt(metrics.paidPatients)} paid patients`,
      accent: 'border-l-emerald-700',
    },
    {
      title: 'ROAS (Return on Ad Spend)',
      value: `${metrics.roas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`,
      formula: '(Approved_Conversion × AOV) ÷ Spent',
      detail: `AOV ${formatSAR(metrics.aov, 0)} · ROI ${metrics.roi >= 0 ? '+' : ''}${formatPct(metrics.roi)}`,
      accent: 'border-l-emerald-800',
    },
  ];

  return (
    <section aria-label="Calculated Performance Metric Cards">
      {/* Top-Line Volume & Financial Context Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="pt-2 sm:pt-0 first:pl-0 sm:pl-4">
            <p className="text-xs text-slate-500">Total Ad Spend</p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatSAR(metrics.spent, 0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{formatInt(metrics.impressions)} Impressions</p>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-500">Total Leads (Conversions)</p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatInt(metrics.leads)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{formatInt(metrics.clicks)} Ad Clicks</p>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-500">Clinic Bookings</p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatInt(metrics.bookings)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatPct(metrics.leadToBookingRate)} of Leads Booked
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-500">Attended Visits</p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatInt(metrics.attended)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatPct(metrics.bookingToAttendedRate)} Show-Up Rate
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-500">Paid Patients (Approved)</p>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
              {formatInt(metrics.paidPatients)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              AOV: {formatSAR(metrics.aov, 0)}
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-500">Gross Revenue (Excl. VAT)</p>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-800 mt-0.5">
              {formatSAR(metrics.revenue, 0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Net ROI: {metrics.roi >= 0 ? '+' : ''}{formatPct(metrics.roi)}
            </p>
          </div>
        </div>
      </div>

      {/* 8 Required Formula Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {formulaCards.map((card) => (
          <div
            key={card.title}
            className={`bg-white rounded-xl border border-slate-200 border-l-4 ${card.accent} p-5 transition-colors hover:border-emerald-600/40`}
          >
            <p className="text-xs font-semibold text-slate-600">{card.title}</p>
            <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
              {card.value}
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-0.5">
              <span className="text-xs font-mono text-emerald-800">{card.formula}</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">{card.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
