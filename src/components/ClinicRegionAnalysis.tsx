import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { ClinicRecord } from '../types';
import { groupRecordsBy, calculateMetrics } from '../utils/dataProcessor';

interface ClinicRegionAnalysisProps {
  records: ClinicRecord[];
  selectedClinic: string;
  onSelectClinic: (clinic: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const ClinicRegionAnalysis: React.FC<ClinicRegionAnalysisProps> = ({
  records,
  selectedClinic,
  onSelectClinic,
  selectedCity,
  onSelectCity,
}) => {
  const clinicSummaries = useMemo(() => groupRecordsBy(records, 'clinic', 'city'), [records]);
  const citySummaries = useMemo(() => groupRecordsBy(records, 'city'), [records]);
  const specialtySummaries = useMemo(() => groupRecordsBy(records, 'specialty'), [records]);
  const ageSummaries = useMemo(() => groupRecordsBy(records, 'age'), [records]);
  const genderSummaries = useMemo(() => groupRecordsBy(records, 'gender'), [records]);

  const dailyTimeline = useMemo(() => {
    const byDate = groupRecordsBy(records, 'date');
    return [...byDate]
      .filter((d) => d.groupKey !== 'Unknown')
      .sort((a, b) => a.groupKey.localeCompare(b.groupKey))
      .map((d) => ({
        date: d.groupKey,
        Revenue: Math.round(d.revenue),
        Spent: Math.round(d.spent),
        Leads: d.leads,
        PaidPatients: d.paidPatients,
      }));
  }, [records]);

  const overallMetrics = useMemo(() => calculateMetrics(records), [records]);

  const funnelStages = useMemo(() => {
    const m = overallMetrics;
    return [
      {
        stage: '01. Ad Clicks',
        count: m.clicks,
        conversionLabel: `CTR: ${m.ctr.toFixed(2)}% of ${m.impressions.toLocaleString()} Impr.`,
        pctOfClicks: 100,
      },
      {
        stage: '02. Leads (Total_Conversion)',
        count: m.leads,
        conversionLabel: `Click-to-Lead: ${m.clickToLeadRate.toFixed(2)}%`,
        pctOfClicks: m.clicks > 0 ? (m.leads / m.clicks) * 100 : 0,
      },
      {
        stage: '03. Clinic Bookings',
        count: m.bookings,
        conversionLabel: `Lead-to-Booking: ${m.leadToBookingRate.toFixed(2)}%`,
        pctOfClicks: m.clicks > 0 ? (m.bookings / m.clicks) * 100 : 0,
      },
      {
        stage: '04. Attended Visits',
        count: m.attended,
        conversionLabel: `Show-Up Rate: ${m.bookingToAttendedRate.toFixed(2)}% of Bookings`,
        pctOfClicks: m.clicks > 0 ? (m.attended / m.clicks) * 100 : 0,
      },
      {
        stage: '05. Paid Patients (Approved)',
        count: m.paidPatients,
        conversionLabel: `Lead-to-Paid: ${m.leadToPaidRate.toFixed(2)}% · CAC: SAR ${m.cac.toFixed(0)}`,
        pctOfClicks: m.clicks > 0 ? (m.paidPatients / m.clicks) * 100 : 0,
      },
    ];
  }, [overallMetrics]);

  const formatSAR = (val: number) =>
    `SAR ${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="space-y-8">
      {/* Row 1: Clinic Performance & Region (City) Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clinic Revenue vs Ad Spend Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                01. Clinic Revenue vs. Ad Spend Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross SAR revenue (credited to lead arrival date) compared against marketing spend per clinic
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700">
              {clinicSummaries.length} Active Clinics
            </span>
          </div>

          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clinicSummaries.map((c) => ({
                  name: c.groupKey,
                  Revenue: Math.round(c.revenue),
                  Spent: Math.round(c.spent),
                  ROAS: Number(c.roas.toFixed(2)),
                }))}
                margin={{ top: 10, right: 16, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `SAR ${Number(value).toLocaleString('en-US')}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Revenue" name="Gross Revenue (SAR)" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" name="Ad Spend (SAR)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional (Saudi Cities) Performance Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                02. Saudi Regional & City Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click a city row below to filter dashboard by region
              </p>
            </div>
            {selectedCity !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectCity('ALL')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline"
              >
                Reset City
              </button>
            )}
          </div>

          <div className="h-52 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={citySummaries.map((c) => ({
                  city: c.groupKey,
                  Revenue: Math.round(c.revenue),
                  PaidPatients: c.paidPatients,
                }))}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="city"
                  tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 500 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => [`SAR ${Number(value).toLocaleString('en-US')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Revenue" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Regional Table */}
          <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2">City</th>
                  <th className="py-2 text-right">Leads</th>
                  <th className="py-2 text-right">Paid</th>
                  <th className="py-2 text-right">CAC</th>
                  <th className="py-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {citySummaries.map((city) => {
                  const isSelected = selectedCity === city.groupKey;
                  return (
                    <tr
                      key={city.groupKey}
                      onClick={() =>
                        onSelectCity(isSelected ? 'ALL' : city.groupKey)
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 text-slate-900">{city.groupKey}</td>
                      <td className="py-2 text-right font-mono tabular-nums text-slate-700">
                        {city.leads.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums text-emerald-700">
                        {city.paidPatients.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums text-slate-700">
                        SAR {city.cac.toFixed(0)}
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums text-slate-900">
                        {city.roas.toFixed(2)}x
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Patient Acquisition Funnel & Specialty EDA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Funnel */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              03. Patient Acquisition & Clinic Visit Funnel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Progression from ad clicks to leads, scheduled bookings, attended clinic visits, and paid treatments
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {funnelStages.map((item, idx) => {
              const maxCount = funnelStages[0].count || 1;
              const widthPct = Math.max(6, Math.min(100, (item.count / maxCount) * 100));
              return (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.stage}</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-500">{item.conversionLabel}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-bold text-slate-900">{item.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-200"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: idx === 4 ? '#047857' : idx >= 2 ? '#059669' : '#10B981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Lead-to-Booking Rate: <strong className="font-mono text-slate-900">{overallMetrics.leadToBookingRate.toFixed(1)}%</strong></span>
            <span>Booking Show-Up Rate: <strong className="font-mono text-slate-900">{overallMetrics.bookingToAttendedRate.toFixed(1)}%</strong></span>
            <span>Lead-to-Paid Rate: <strong className="font-mono text-emerald-700">{overallMetrics.leadToPaidRate.toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Medical Specialty Performance */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              04. Medical Specialty EDA & Average Order Value
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of treatment specialties by gross SAR revenue, patient volume, and AOV
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5">Medical Specialty</th>
                  <th className="py-2.5 text-right">Leads</th>
                  <th className="py-2.5 text-right">Bookings</th>
                  <th className="py-2.5 text-right">Attended</th>
                  <th className="py-2.5 text-right">Paid</th>
                  <th className="py-2.5 text-right">AOV</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {specialtySummaries.map((spec) => (
                  <tr key={spec.groupKey} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-900">{spec.groupKey}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {spec.leads.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {spec.bookings.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {spec.attended.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {spec.paidPatients.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {formatSAR(spec.aov)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatSAR(spec.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Daily Lead Arrival Attribution Timeline & Demographic EDA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Revenue Attribution Trend */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                05. Daily Lead Arrival Revenue Attribution Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Revenue (SAR excl. VAT) is credited to the date the lead arrived; actual clinic visits occur days later
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {dailyTimeline.length} Reporting Days
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyTimeline} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#047857' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="Revenue"
                  name="Credited Revenue (SAR)"
                  fill="#10B981"
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Leads"
                  name="Inbound Leads"
                  stroke="#0F172A"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographic EDA (Age & Gender) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              06. Patient Demographic EDA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paid patient conversion and revenue by age cohort and gender
            </p>
          </div>

          <div className="mt-4 space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">By Age Group</h4>
              <div className="space-y-2">
                {ageSummaries.map((age) => (
                  <div key={age.groupKey} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-800">{age.groupKey}</span>
                    <div className="font-mono tabular-nums text-slate-600">
                      <span>{age.paidPatients} paid</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="text-emerald-800 font-semibold">{formatSAR(age.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">By Gender</h4>
              <div className="space-y-2">
                {genderSummaries.map((g) => (
                  <div key={g.groupKey} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-800">{g.groupKey}</span>
                    <div className="font-mono tabular-nums text-slate-600">
                      <span>{g.leads} leads</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>{g.paidPatients} paid</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="text-emerald-800 font-semibold">{formatSAR(g.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Comprehensive Clinic-Level EDA Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              07. Complete Clinic-by-Clinic Performance & Funnel Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any clinic row to isolate its metrics across the entire dashboard
            </p>
          </div>
          {selectedClinic !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectClinic('ALL')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Clear Clinic Filter ({selectedClinic})
            </button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Clinic Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3 text-right">Spent</th>
                <th className="py-2.5 px-3 text-right">CTR</th>
                <th className="py-2.5 px-3 text-right">Leads</th>
                <th className="py-2.5 px-3 text-right">Bookings</th>
                <th className="py-2.5 px-3 text-right">Attended</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Lead→Paid</th>
                <th className="py-2.5 px-3 text-right">CPL</th>
                <th className="py-2.5 px-3 text-right">CAC</th>
                <th className="py-2.5 px-3 text-right">Revenue (SAR)</th>
                <th className="py-2.5 pl-3 text-right">ROAS / ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {clinicSummaries.map((c) => {
                const isSelected = selectedClinic === c.groupKey;
                return (
                  <tr
                    key={c.groupKey}
                    onClick={() => onSelectClinic(isSelected ? 'ALL' : c.groupKey)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/90 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">
                      {c.groupKey}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {c.secondaryLabel || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatSAR(c.spent)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.leads.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.bookings.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.attended.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {c.paidPatients.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.leadToPaidRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {c.cpl.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {c.cac.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatSAR(c.revenue)}
                    </td>
                    <td className="py-3 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-emerald-800">{c.roas.toFixed(2)}x</span>
                      <span aria-hidden="true" className="mx-1 text-slate-300">·</span>
                      <span className="text-slate-600">
                        {c.roi >= 0 ? '+' : ''}
                        {c.roi.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
