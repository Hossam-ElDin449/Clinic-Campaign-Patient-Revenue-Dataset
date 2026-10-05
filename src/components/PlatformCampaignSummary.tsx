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
import { groupRecordsBy } from '../utils/dataProcessor';

interface PlatformCampaignSummaryProps {
  records: ClinicRecord[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export const PlatformCampaignSummary: React.FC<PlatformCampaignSummaryProps> = ({
  records,
  selectedPlatform,
  onSelectPlatform,
}) => {
  const platformSummaries = useMemo(() => groupRecordsBy(records, 'platform'), [records]);
  const campaignSummaries = useMemo(
    () => groupRecordsBy(records, 'campaign_id', 'campaign_objective'),
    [records]
  );
  const objectiveSummaries = useMemo(
    () => groupRecordsBy(records, 'campaign_objective'),
    [records]
  );
  const interestSummaries = useMemo(() => groupRecordsBy(records, 'interest'), [records]);

  const formatSAR = (val: number) => `SAR ${Math.round(val).toLocaleString('en-US')}`;

  return (
    <div className="space-y-8">
      {/* Row 1: Platform Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Platform Spend vs Revenue & ROI */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                01. Advertising Platform Spend, Revenue & ROI
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross SAR revenue vs. ad spend and return on investment (%) across acquisition channels
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700">
              {platformSummaries.length} Platforms
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={platformSummaries.map((p) => ({
                  platform: p.groupKey,
                  Revenue: Math.round(p.revenue),
                  Spent: Math.round(p.spent),
                  ROI: Number(p.roi.toFixed(1)),
                }))}
                margin={{ top: 10, right: 16, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 12, fill: '#0F172A' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#047857' }}
                  tickFormatter={(v) => `${v}%`}
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
                <Bar yAxisId="left" dataKey="Revenue" name="Gross Revenue (SAR)" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="Spent" name="Ad Spend (SAR)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ROI"
                  name="Net ROI (%)"
                  stroke="#0F172A"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Conversion Rates Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              02. Platform Conversion Rate Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click-to-Lead rate (%) vs. Lead-to-Paid Patient rate (%) per channel
            </p>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformSummaries.map((p) => ({
                  platform: p.groupKey,
                  ClickToLead: Number(p.clickToLeadRate.toFixed(2)),
                  LeadToPaid: Number(p.leadToPaidRate.toFixed(2)),
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#0F172A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ClickToLead" name="Click-to-Lead (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LeadToPaid" name="Lead-to-Paid (%)" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Platform Summary Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              03. Platform Summary Matrix (Total Conversion Rates, CAC, ROAS & ROI)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any platform row to filter the entire analytics workspace by acquisition channel
            </p>
          </div>
          {selectedPlatform !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectPlatform('ALL')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Clear Platform Filter ({selectedPlatform})
            </button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Platform</th>
                <th className="py-2.5 px-3 text-right">Impressions</th>
                <th className="py-2.5 px-3 text-right">Clicks</th>
                <th className="py-2.5 px-3 text-right">CTR</th>
                <th className="py-2.5 px-3 text-right">CPC</th>
                <th className="py-2.5 px-3 text-right">Click→Lead</th>
                <th className="py-2.5 px-3 text-right">Leads</th>
                <th className="py-2.5 px-3 text-right">Lead→Paid</th>
                <th className="py-2.5 px-3 text-right">Paid Patients</th>
                <th className="py-2.5 px-3 text-right">CPL</th>
                <th className="py-2.5 px-3 text-right">CAC</th>
                <th className="py-2.5 px-3 text-right">Spent</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 pl-3 text-right">ROAS · ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {platformSummaries.map((p) => {
                const isSelected = selectedPlatform === p.groupKey;
                return (
                  <tr
                    key={p.groupKey}
                    onClick={() => onSelectPlatform(isSelected ? 'ALL' : p.groupKey)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/90 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 whitespace-nowrap">
                      {p.groupKey}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {p.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {p.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {p.cpc.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {p.clickToLeadRate.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {p.leads.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {p.leadToPaidRate.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold">
                      {p.paidPatients.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {p.cpl.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {p.cac.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatSAR(p.spent)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatSAR(p.revenue)}
                    </td>
                    <td className="py-3 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-emerald-800">{p.roas.toFixed(2)}x</span>
                      <span aria-hidden="true" className="mx-1 text-slate-300">·</span>
                      <span className="text-slate-600">
                        {p.roi >= 0 ? '+' : ''}
                        {p.roi.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Campaign Summary & Audience Interest Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Summary Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              04. Campaign ID & Objective Conversion Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              End-to-end conversion rates, patient acquisition cost (CAC), ROAS, and net ROI by campaign
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Campaign ID</th>
                  <th className="py-2.5 px-3">Objective</th>
                  <th className="py-2.5 px-3 text-right">Spent</th>
                  <th className="py-2.5 px-3 text-right">Click→Lead</th>
                  <th className="py-2.5 px-3 text-right">Lead→Paid</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">CAC</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 pl-3 text-right">ROAS · ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {campaignSummaries.map((c) => (
                  <tr key={c.groupKey} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {c.groupKey}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {c.secondaryLabel || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatSAR(c.spent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {c.clickToLeadRate.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                      {c.leadToPaidRate.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold">
                      {c.paidPatients.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      SAR {c.cac.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatSAR(c.revenue)}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-emerald-800">{c.roas.toFixed(2)}x</span>
                      <span aria-hidden="true" className="mx-1 text-slate-300">·</span>
                      <span className="text-slate-600">
                        {c.roi >= 0 ? '+' : ''}
                        {c.roi.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Objectives & Interest Segments */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              05. Audience Interest & Objective ROI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversion efficiency by interest segment and campaign objective
            </p>
          </div>

          <div className="mt-4 space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">By Audience Interest</h4>
              <div className="space-y-2">
                {interestSummaries.slice(0, 6).map((intItem) => (
                  <div
                    key={intItem.groupKey}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {intItem.groupKey}
                    </span>
                    <div className="font-mono tabular-nums text-slate-600 shrink-0">
                      <span>{intItem.paidPatients} paid</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="text-emerald-800 font-semibold">{intItem.roas.toFixed(2)}x ROAS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">By Campaign Objective</h4>
              <div className="space-y-2">
                {objectiveSummaries.map((obj) => (
                  <div
                    key={obj.groupKey}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {obj.groupKey}
                    </span>
                    <div className="font-mono tabular-nums text-slate-600 shrink-0">
                      <span>{obj.leadToPaidRate.toFixed(1)}% L→P</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span className="text-emerald-800 font-semibold">+{obj.roi.toFixed(0)}% ROI</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
