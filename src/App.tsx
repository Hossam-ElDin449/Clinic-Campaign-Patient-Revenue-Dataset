/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Upload, RotateCcw, Filter, Info } from 'lucide-react';
import { ClinicRecord } from './types';
import { calculateMetrics, parseUploadedFile } from './utils/dataProcessor';
import { EmptyUploadState } from './components/EmptyUploadState';
import { MetricCards } from './components/MetricCards';
import { ClinicRegionAnalysis } from './components/ClinicRegionAnalysis';
import { PlatformCampaignSummary } from './components/PlatformCampaignSummary';
import { DatasetExplorer } from './components/DatasetExplorer';

type ActiveSection = 'overview' | 'clinics' | 'platforms' | 'ledger';

export default function App() {
  // Dashboard is strictly null until the user uploads an Excel or CSV file
  const [records, setRecords] = useState<ClinicRecord[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // Interactive Filters
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedClinic, setSelectedClinic] = useState<string>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');

  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const handleDataLoaded = (loadedRecords: ClinicRecord[], name: string) => {
    setRecords(loadedRecords);
    setFileName(name);
    setSelectedCity('ALL');
    setSelectedClinic('ALL');
    setSelectedSpecialty('ALL');
    setSelectedPlatform('ALL');
  };

  const handleHeaderFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed.length > 0) {
        handleDataLoaded(parsed, file.name);
      }
    } catch {
      // Handled silently or user can reset to main uploader
    }
  };

  const handleReset = () => {
    setRecords(null);
    setFileName('');
    setSelectedCity('ALL');
    setSelectedClinic('ALL');
    setSelectedSpecialty('ALL');
    setSelectedPlatform('ALL');
  };

  // Distinct filter options
  const cities = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map((r) => r.city))).sort();
  }, [records]);

  const clinics = useMemo(() => {
    if (!records) return [];
    const subset = selectedCity === 'ALL' ? records : records.filter((r) => r.city === selectedCity);
    return Array.from(new Set(subset.map((r) => r.clinic))).sort();
  }, [records, selectedCity]);

  const specialties = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map((r) => r.specialty))).sort();
  }, [records]);

  const platforms = useMemo(() => {
    if (!records) return [];
    return Array.from(new Set(records.map((r) => r.platform))).sort();
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (selectedCity !== 'ALL' && r.city !== selectedCity) return false;
      if (selectedClinic !== 'ALL' && r.clinic !== selectedClinic) return false;
      if (selectedSpecialty !== 'ALL' && r.specialty !== selectedSpecialty) return false;
      if (selectedPlatform !== 'ALL' && r.platform !== selectedPlatform) return false;
      return true;
    });
  }, [records, selectedCity, selectedClinic, selectedSpecialty, selectedPlatform]);

  const metrics = useMemo(() => calculateMetrics(filteredRecords), [filteredRecords]);

  const hasActiveFilters =
    selectedCity !== 'ALL' ||
    selectedClinic !== 'ALL' ||
    selectedSpecialty !== 'ALL' ||
    selectedPlatform !== 'ALL';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('overview');
          }}
          className="text-lg font-bold tracking-tight text-emerald-900 whitespace-nowrap"
        >
          Shifa Saudi Clinics Analytics
        </a>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            disabled={!records}
            onClick={() => setActiveSection('overview')}
            className={`transition-colors whitespace-nowrap disabled:opacity-40 ${
              activeSection === 'overview'
                ? 'text-emerald-800 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Executive Overview
          </button>
          <button
            type="button"
            disabled={!records}
            onClick={() => setActiveSection('clinics')}
            className={`transition-colors whitespace-nowrap disabled:opacity-40 ${
              activeSection === 'clinics'
                ? 'text-emerald-800 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Clinics & Regions
          </button>
          <button
            type="button"
            disabled={!records}
            onClick={() => setActiveSection('platforms')}
            className={`transition-colors whitespace-nowrap disabled:opacity-40 ${
              activeSection === 'platforms'
                ? 'text-emerald-800 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Platforms & Campaigns
          </button>
          <button
            type="button"
            disabled={!records}
            onClick={() => setActiveSection('ledger')}
            className={`transition-colors whitespace-nowrap disabled:opacity-40 ${
              activeSection === 'ledger'
                ? 'text-emerald-800 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Dataset Ledger
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <input
            ref={headerFileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleHeaderFileChange}
          />
          {records && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Data
            </button>
          )}
          <button
            type="button"
            onClick={() => headerFileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {records ? 'Upload New File' : 'Upload Excel / CSV'}
          </button>
        </div>
      </header>

      {/* Main Content Area: Null/Empty State vs Populated Dashboard */}
      {!records ? (
        <EmptyUploadState onDataLoaded={handleDataLoaded} />
      ) : (
        <main className="max-w-[1400px] w-full mx-auto px-6 py-8 space-y-8 flex-1">
          {/* Revenue & Attribution Accounting Banner + Active File Context */}
          <div className="bg-emerald-900 text-white rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-emerald-200 font-mono">
                <span>Loaded Dataset: {fileName}</span>
                <span aria-hidden="true">·</span>
                <span>{filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()} Ad Records</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Saudi Healthcare Clinics Acquisition, Funnel & Revenue Performance
              </h1>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-lg px-4 py-2.5 text-xs text-emerald-100 max-w-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-white">Financial & Attribution Rule:</strong> Revenue is reported in{' '}
                <strong className="text-white">SAR (excluding VAT)</strong> and credited to the day the lead arrived.
                Real clinic visits occur days later. Revenue represents gross top-line receipts, not profit (excludes
                clinical treatment costs).
              </div>
            </div>
          </div>

          {/* Interactive Dimension Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pr-2">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>Filter Workspace:</span>
              </div>

              {/* City / Region Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="city-filter" className="text-xs text-slate-500">
                  City:
                </label>
                <select
                  id="city-filter"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedClinic('ALL');
                  }}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Saudi Cities ({cities.length})</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinic Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="clinic-filter" className="text-xs text-slate-500">
                  Clinic:
                </label>
                <select
                  id="clinic-filter"
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Clinics ({clinics.length})</option>
                  {clinics.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="specialty-filter" className="text-xs text-slate-500">
                  Specialty:
                </label>
                <select
                  id="specialty-filter"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Specialties ({specialties.length})</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="platform-filter" className="text-xs text-slate-500">
                  Platform:
                </label>
                <select
                  id="platform-filter"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="ALL">All Platforms ({platforms.length})</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('ALL');
                    setSelectedClinic('ALL');
                    setSelectedSpecialty('ALL');
                    setSelectedPlatform('ALL');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline ml-2 whitespace-nowrap"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Mobile / Quick View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'overview', label: 'All Analytics' },
                  { id: 'clinics', label: 'Clinic & Region EDA' },
                  { id: 'platforms', label: 'Platforms & ROI' },
                  { id: 'ledger', label: 'Raw Data' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core 8 Formula Metric Cards + Volume Summary (Always visible in Overview, Clinics, Platforms) */}
          <MetricCards metrics={metrics} />

          {/* Section Views */}
          {activeSection === 'overview' && (
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Clinic & Regional Exploratory Data Analysis (EDA)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Multi-clinic revenue comparison, Saudi city distribution, patient funnel progression, and medical specialty performance
                  </p>
                </div>
                <ClinicRegionAnalysis
                  records={filteredRecords}
                  selectedClinic={selectedClinic}
                  onSelectClinic={setSelectedClinic}
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                />
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Advertising Platforms & Campaign ROI Summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Channel efficiency, click-to-lead and lead-to-paid conversion rates, ROAS, and net ROI by platform and campaign
                  </p>
                </div>
                <PlatformCampaignSummary
                  records={filteredRecords}
                  selectedPlatform={selectedPlatform}
                  onSelectPlatform={setSelectedPlatform}
                />
              </div>
            </div>
          )}

          {activeSection === 'clinics' && (
            <ClinicRegionAnalysis
              records={filteredRecords}
              selectedClinic={selectedClinic}
              onSelectClinic={setSelectedClinic}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
            />
          )}

          {activeSection === 'platforms' && (
            <PlatformCampaignSummary
              records={filteredRecords}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
            />
          )}

          {activeSection === 'ledger' && <DatasetExplorer records={filteredRecords} />}
        </main>
      )}

      {/* Clean Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Shifa Saudi Clinics Marketing & Funnel Intelligence</span>
          <span>All monetary values in SAR (excluding 15% VAT) · Gross Revenue credited to Lead Arrival Date</span>
        </div>
      </footer>
    </div>
  );
}
