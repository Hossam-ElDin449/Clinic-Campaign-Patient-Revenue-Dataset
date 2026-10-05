import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { ClinicRecord } from '../types';
import { parseUploadedFile, generateSampleSaudiDatasetCsv, normalizeRecords } from '../utils/dataProcessor';
import Papa from 'papaparse';

interface EmptyUploadStateProps {
  onDataLoaded: (records: ClinicRecord[], fileName: string) => void;
}

const REQUIRED_COLUMNS = [
  { group: 'Core Ad Metrics', cols: 'ad_id · age · gender · interest · Impressions · Clicks · Spent · Total_Conversion (leads) · Approved_Conversion (paid patients)' },
  { group: 'Funnel & Revenue', cols: 'Bookings · Attended · Revenue (SAR excl. VAT)' },
  { group: 'Clinic & Context', cols: 'date · clinic · city · specialty · campaign_id · campaign_objective · platform' },
];

export const EmptyUploadState: React.FC<EmptyUploadStateProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const records = await parseUploadedFile(file);
      if (records.length === 0) {
        setErrorMsg('No valid clinic records were found in the uploaded file. Please verify the column headers.');
      } else {
        onDataLoaded(records, file.name);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse file. Please upload a valid CSV or Excel sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleSaudiDatasetCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'saudi_clinics_marketing_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleDirectly = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const csvContent = generateSampleSaudiDatasetCsv();
      const parsed = Papa.parse<Record<string, unknown>>(csvContent, { header: true, skipEmptyLines: true });
      const records = normalizeRecords(parsed.data);
      setIsLoading(false);
      onDataLoaded(records, 'saudi_clinics_marketing_dataset.csv');
    }, 150);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between bg-[#F8FAF9] px-6 py-12">
      <div className="max-w-5xl w-full mx-auto my-auto">
        {/* Header Introduction */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-wide text-emerald-800 mb-2">
            Kingdom of Saudi Arabia · Healthcare Marketing & Funnel Intelligence
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight max-w-2xl" style={{ textWrap: 'balance' }}>
            Upload Clinic Campaign & Patient Revenue Dataset
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl leading-relaxed">
            The analytics workspace remains unpopulated until a dataset is provided. Upload your Excel sheet (<span className="font-mono text-sm text-slate-800">.xlsx</span>, <span className="font-mono text-sm text-slate-800">.xls</span>) or <span className="font-mono text-sm text-slate-800">.csv</span> file to compute CTR, CPC, CPM, CPL, CAC, ROAS, regional clinic EDA, and platform ROI.
          </p>
        </div>

        {/* Main Interactive Upload Surface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 transition-colors bg-white ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/40'
                  : 'border-emerald-800/20 hover:border-emerald-700/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-5">
                  <Upload className="w-6 h-6" />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  {isLoading ? 'Processing clinic dataset...' : 'Drop Excel (.xlsx) or CSV file here, or click to browse'}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 max-w-md">
                  Supports multi-clinic Saudi healthcare logs with ad spend, lead conversions, bookings, attended visits, and SAR revenue.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Select Dataset File
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSampleCsv();
                    }}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    Download Template CSV
                  </button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Dataset Upload Error</p>
                  <p className="mt-0.5 text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Financial & Attribution Governance Notice */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Accounting Rules:</span> Revenue in SAR (excl. VAT) · Credited to lead arrival date · Gross top-line (excludes treatment cost)
              </div>
              <button
                type="button"
                onClick={handleLoadSampleDirectly}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-4 whitespace-nowrap self-start sm:self-auto"
              >
                Preview with Sample Saudi Clinics CSV →
              </button>
            </div>
          </div>

          {/* Expected Schema Specification Column */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Expected Dataset Schema (19 Columns)</h3>
              <span className="text-xs font-mono text-emerald-700">.CSV / .XLSX</span>
            </div>

            <div className="mt-4 space-y-4">
              {REQUIRED_COLUMNS.map((item) => (
                <div key={item.group} className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.group}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-600 leading-relaxed">{item.cols}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Automated Card Formulas</h4>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs font-mono text-slate-600">
                <div>CTR = Clicks ÷ Impr.</div>
                <div>CPC = Spent ÷ Clicks</div>
                <div>CPM = Spent ÷ Impr. × 1000</div>
                <div>Click-to-Lead = Leads ÷ Clicks</div>
                <div>Lead-to-Paid = Paid ÷ Leads</div>
                <div>CPL = Spent ÷ Leads</div>
                <div>CAC = Spent ÷ Paid</div>
                <div>ROAS = (Paid × AOV) ÷ Spent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
