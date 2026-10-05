import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { ClinicRecord } from '../types';

interface DatasetExplorerProps {
  records: ClinicRecord[];
}

type SortField = 'date' | 'Revenue' | 'Spent' | 'Impressions' | 'Clicks' | 'Total_Conversion' | 'Approved_Conversion';

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? records.filter(
          (r) =>
            r.ad_id.toLowerCase().includes(q) ||
            r.clinic.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.specialty.toLowerCase().includes(q) ||
            r.platform.toLowerCase().includes(q) ||
            r.campaign_id.toLowerCase().includes(q) ||
            r.interest.toLowerCase().includes(q)
        )
      : records;

    return [...filtered].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [records, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Uploaded Clinic Ad & Funnel Ledger (All 19 Columns)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredAndSorted.length.toLocaleString()} records · Revenue in SAR (excl. VAT) credited to lead arrival date
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search clinic, city, ad_id, platform..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-800"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 whitespace-nowrap">
              <th className="py-2.5 pr-3">
                <button
                  type="button"
                  onClick={() => toggleSort('date')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Date <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2.5">ad_id</th>
              <th className="py-2.5 px-2.5">Clinic</th>
              <th className="py-2.5 px-2.5">City</th>
              <th className="py-2.5 px-2.5">Specialty</th>
              <th className="py-2.5 px-2.5">Platform</th>
              <th className="py-2.5 px-2.5">Campaign</th>
              <th className="py-2.5 px-2.5">Objective</th>
              <th className="py-2.5 px-2.5">Age / Gender</th>
              <th className="py-2.5 px-2.5">Interest</th>
              <th className="py-2.5 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Impressions')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Impr. <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Clicks')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Clicks <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Spent')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Spent <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Total_Conversion')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Leads <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2.5 text-right">Bookings</th>
              <th className="py-2.5 px-2.5 text-right">Attended</th>
              <th className="py-2.5 px-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Approved_Conversion')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Paid <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 pl-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('Revenue')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  Revenue (SAR) <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs whitespace-nowrap">
            {paginated.map((r, i) => (
              <tr key={`${r.ad_id}-${i}`} className="hover:bg-slate-50">
                <td className="py-2.5 pr-3 font-mono text-slate-600">{r.date}</td>
                <td className="py-2.5 px-2.5 font-mono text-slate-900 font-medium">{r.ad_id}</td>
                <td className="py-2.5 px-2.5 text-slate-900 font-medium">{r.clinic}</td>
                <td className="py-2.5 px-2.5 text-slate-600">{r.city}</td>
                <td className="py-2.5 px-2.5 text-slate-600">{r.specialty}</td>
                <td className="py-2.5 px-2.5 text-slate-700">{r.platform}</td>
                <td className="py-2.5 px-2.5 font-mono text-slate-600">{r.campaign_id}</td>
                <td className="py-2.5 px-2.5 text-slate-600">{r.campaign_objective}</td>
                <td className="py-2.5 px-2.5 text-slate-600">
                  {r.age} · {r.gender}
                </td>
                <td className="py-2.5 px-2.5 text-slate-600">{r.interest}</td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                  {r.Impressions.toLocaleString()}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                  {r.Clicks.toLocaleString()}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                  {r.Spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-800">
                  {r.Total_Conversion}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                  {r.Bookings}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-700">
                  {r.Attended}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                  {r.Approved_Conversion}
                </td>
                <td className="py-2.5 pl-2.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                  {r.Revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div>
          Page <span className="font-mono font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-mono font-semibold text-slate-900">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 inline-flex items-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
