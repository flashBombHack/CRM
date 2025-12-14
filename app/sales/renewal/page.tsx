"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Renewal {
  id: string;
  contractId: string;
  client: string;
  packageType: string;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  status: string;
  deadline: string;
}

const TABS = ["List", "Risk"];

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRenewals, setSelectedRenewals] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("List");

  // Mock data for now - replace with API call later
  useEffect(() => {
    setTimeout(() => {
      const mockRenewals: Renewal[] = [
        { id: "1", contractId: "CT-2025-003", client: "Umbro UK", packageType: "Sponsorship / Hospitality", progress: 92, tasksCompleted: 11, tasksTotal: 12, status: "On Track", deadline: "Feb 20, 2026" },
        { id: "2", contractId: "CT-2025-002", client: "Greene King", packageType: "Hospitality", progress: 63, tasksCompleted: 10, tasksTotal: 14, status: "At Risk", deadline: "Dec 16, 2026" },
        { id: "3", contractId: "CT-2025-001", client: "Walker Media Group", packageType: "Digital Package", progress: 45, tasksCompleted: 15, tasksTotal: 21, status: "Overdue", deadline: "Dec 4, 2026" },
      ];
      setRenewals(mockRenewals);
      setTotalCount(mockRenewals.length);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "on track":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "at risk":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "overdue":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-200", text: "text-gray-700" };
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRenewals(new Set());
    } else {
      setSelectedRenewals(new Set(renewals.map((renewal) => renewal.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRenewal = (renewalId: string) => {
    const newSelected = new Set(selectedRenewals);
    if (newSelected.has(renewalId)) {
      newSelected.delete(renewalId);
    } else {
      newSelected.add(renewalId);
    }
    setSelectedRenewals(newSelected);
    setSelectAll(newSelected.size === renewals.length);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Renewals Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Stage 10 – Renewals</h2>
                  </div>
                  <button className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                    Export <HiChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs with + icons */}
                <div className="flex items-center gap-0 border-b border-gray-200 -mb-4">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                        activeTab === tab
                          ? "text-gray-900 bg-white"
                          : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                      }`}
                      style={{
                        borderBottom: activeTab === tab ? "2px solid #3B82F6" : "1px solid #E5E7EB",
                        marginBottom: activeTab === tab ? "-1px" : "0",
                      }}
                    >
                      <HiPlus className="w-4 h-4" />
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Summary Metrics Section */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="border border-gray-200 rounded-lg p-4 bg-transparent">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Summary Metrics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {/* Contracts Expiring Soon */}
                    <div className="bg-[#F7F8F8] rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
                      <div className="text-sm text-gray-700 mb-1">Contracts</div>
                      <div className="text-xs text-gray-500">Next 90 days</div>
                    </div>

                    {/* Renewal Pipeline Value */}
                    <div className="bg-[#F7F8F8] rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">£1.2M</div>
                    </div>

                    {/* At-Risk Renewals */}
                    <div className="bg-[#F7F8F8] rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">7</div>
                      <div className="text-sm text-gray-700">High risks</div>
                    </div>

                    {/* Expected Retained Revenue */}
                    <div className="bg-[#F7F8F8] rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">£820,000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Control Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Contracts: {totalCount}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 max-w-md">
                      <HiSearch className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search this list"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 text-sm"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Renewals Table */}
              <div className="px-6 py-4">
                <div className="bg-[#FAFAFA] border border-[#C4C7CC] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-[#C4C7CC]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contract ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Package Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Progress</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tasks</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Deadline</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : renewals.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No renewals found
                          </td>
                        </tr>
                      ) : (
                        renewals.map((renewal) => {
                          const statusColors = getStatusColor(renewal.status);
                          return (
                            <tr
                              key={renewal.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedRenewals.has(renewal.id)}
                                  onChange={() => handleSelectRenewal(renewal.id)}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <a 
                                  href={`/sales/renewals/${renewal.id}`}
                                  className="text-primary hover:underline text-sm font-medium"
                                >
                                  {renewal.contractId}
                                </a>
                              </td>
                              <td className="px-4 py-3">
                                <a 
                                  href={`/sales/renewals/${renewal.id}`}
                                  className="text-primary hover:underline text-sm font-medium"
                                >
                                  {renewal.client}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {renewal.packageType}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {renewal.progress}%
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {renewal.tasksCompleted} / {renewal.tasksTotal}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                  {renewal.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {renewal.deadline}
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <HiDotsVertical className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {Math.min((pageIndex - 1) * pageSize + 1, totalCount)} - {Math.min(pageIndex * pageSize, totalCount)} of {totalCount} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageIndex}
                    onChange={(e) => setPageIndex(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">of {Math.ceil(totalCount / pageSize)} page{Math.ceil(totalCount / pageSize) !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                    disabled={pageIndex === 1}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    aria-label="Previous page"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPageIndex((prev) => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                    disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    aria-label="Next page"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
