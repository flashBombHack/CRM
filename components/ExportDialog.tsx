'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { HiX, HiChevronDown } from 'react-icons/hi';
import { exportApi } from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';
import { exportToPDF, exportToCSV, getModuleName, ExportFormat } from '@/lib/export-utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModuleOption {
  id: number;
  name: string;
}

const modules: ModuleOption[] = [
  { id: 1, name: 'Stage 1 – Leads' },
  { id: 2, name: 'Stage 2 – Qualification' },
  { id: 3, name: 'Stage 3 – Opportunity' },
  { id: 4, name: 'Stage 4 – Discovery' },
  { id: 5, name: 'Stage 5 – Proposal' },
  { id: 6, name: 'Stage 6 – Contracts' },
  { id: 7, name: 'Stage 7 – Activation' },
  { id: 8, name: 'Stage 8 – Invoice' },
  { id: 9, name: 'Stage 9 – Customer Level' },
  { id: 10, name: 'Stage 10 – Renewal' },
];

export default function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useToast();
  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const formatDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });

  // Calculate date picker position
  useEffect(() => {
    const calculateDatePickerPosition = () => {
      if (datePickerButtonRef.current && showDatePicker) {
        const buttonRect = datePickerButtonRef.current.getBoundingClientRect();
        setDatePickerPosition({
          top: buttonRect.bottom + 8,
          left: buttonRect.left,
        });
      }
    };

    if (showDatePicker) {
      calculateDatePickerPosition();
      window.addEventListener('resize', calculateDatePickerPosition);
      window.addEventListener('scroll', calculateDatePickerPosition, true);
    }

    return () => {
      window.removeEventListener('resize', calculateDatePickerPosition);
      window.removeEventListener('scroll', calculateDatePickerPosition, true);
    };
  }, [showDatePicker]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moduleDropdownRef.current &&
        !moduleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModuleDropdown(false);
      }
      if (
        formatDropdownRef.current &&
        !formatDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFormatDropdown(false);
      }
      if (
        datePickerButtonRef.current &&
        !datePickerButtonRef.current.contains(event.target as Node) &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    if (showModuleDropdown || showFormatDropdown || showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModuleDropdown, showFormatDropdown, showDatePicker]);

  if (!isOpen) return null;

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (selection.startDate && selection.endDate) {
      setDateRange({
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection',
      });
    }
  };

  const handleExport = async () => {
    if (!selectedModule) {
      error('Please select a module');
      return;
    }

    try {
      setIsExporting(true);
      
      // Format dates as ISO 8601 strings (RFC 3339 format)
      // Set start date to beginning of day (00:00:00)
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const startDateStr = startDate.toISOString();
      
      // Set end date to end of day (23:59:59)
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      const endDateStr = endDate.toISOString();

      // Fetch data from API
      const response = await exportApi.exportData(
        selectedModule.id,
        startDateStr,
        endDateStr
      );

      if (!response.isSuccess || !response.data || !Array.isArray(response.data)) {
        error(response.message || 'No data available to export');
        return;
      }

      const moduleName = getModuleName(selectedModule.id);
      const data = response.data;

      // Export based on selected format
      if (selectedFormat === 'pdf') {
        await exportToPDF(data, moduleName, startDateStr, endDateStr);
        success('PDF exported successfully!');
      } else {
        exportToCSV(data, moduleName, startDateStr, endDateStr);
        success('CSV exported successfully!');
      }
      
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.errors?.[0] || 
                          err?.message || 
                          'Failed to export data. Please try again.';
      error(errorMessage);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const datePickerContent = showDatePicker && typeof window !== 'undefined' ? (
    createPortal(
      <div
        ref={datePickerRef}
        className="fixed z-[1000] bg-white border border-gray-300 rounded-lg shadow-lg"
        style={{
          top: `${datePickerPosition.top}px`,
          left: `${datePickerPosition.left}px`,
        }}
      >
        <DateRangePicker
          ranges={[dateRange]}
          onChange={handleDateRangeChange}
          months={2}
          direction="horizontal"
          showDateDisplay={false}
          rangeColors={['#3B82F6']}
        />
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isExporting}
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Module Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module
            </label>
            <div className="relative" ref={moduleDropdownRef}>
              <button
                type="button"
                onClick={() => setShowModuleDropdown(!showModuleDropdown)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary flex items-center justify-between"
                disabled={isExporting}
              >
                <span className={selectedModule ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedModule ? selectedModule.name : 'Select a module'}
                </span>
                <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showModuleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showModuleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setSelectedModule(module);
                        setShowModuleDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {module.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="relative" ref={formatDropdownRef}>
              <button
                type="button"
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary flex items-center justify-between"
                disabled={isExporting}
              >
                <span className="flex items-center gap-2">
                  {selectedFormat === 'pdf' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                      </svg>
                      PDF Report
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      CSV Data
                    </>
                  )}
                </span>
                <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showFormatDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormat('pdf');
                      setShowFormatDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      selectedFormat === 'pdf'
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    PDF Report (Beautiful visualization)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormat('csv');
                      setShowFormatDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      selectedFormat === 'csv'
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    CSV Data (Spreadsheet format)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="relative">
              <button
                ref={datePickerButtonRef}
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isExporting}
              >
                {format(dateRange.startDate, 'MMM dd, yyyy')} - {format(dateRange.endDate, 'MMM dd, yyyy')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !selectedModule}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
      {datePickerContent}
    </div>
  );
}

