"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HiSearch, HiChevronDown, HiDotsVertical } from "react-icons/hi";

interface Activation {
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

interface ActivationsResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Activation[];
  };
  errors: string[];
  responseCode: number;
}

const VIEW_TABS = ["Table", "Kanban", "Calendar"];

export default function ActivationPage() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedActivations, setSelectedActivations] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState("Table");

  // Mock data for now - replace with API call later
  useEffect(() => {
    setTimeout(() => {
      const mockActivations: Activation[] = [
        { id: "1", contractId: "CT-2025-003", client: "Umbro UK", packageType: "Sponsorship / Hospitality", progress: 92, tasksCompleted: 11, tasksTotal: 12, status: "On Track", deadline: "Feb 20, 2026" },
        { id: "2", contractId: "CT-2025-002", client: "Greene King", packageType: "Hospitality", progress: 63, tasksCompleted: 10, tasksTotal: 14, status: "At Risk", deadline: "Dec 16, 2026" },
        { id: "3", contractId: "CT-2025-001", client: "Walker Media Group", packageType: "Digital Package", progress: 45, tasksCompleted: 15, tasksTotal: 21, status: "Overdue", deadline: "Dec 4, 2026" },
      ];
      setActivations(mockActivations);
      setTotalCount(mockActivations.length);
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
      setSelectedActivations(new Set());
    } else {
      setSelectedActivations(new Set(activations.map((activation) => activation.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectActivation = (activationId: string) => {
    const newSelected = new Set(selectedActivations);
    if (newSelected.has(activationId)) {
      newSelected.delete(activationId);
    } else {
      newSelected.add(activationId);
    }
    setSelectedActivations(newSelected);
    setSelectAll(newSelected.size === activations.length);
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
              {/* Activation Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <button className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                    Activation <HiChevronDown className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                    Export <HiChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-0 border-b border-gray-200 -mb-4">
                  {VIEW_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveView(tab)}
                      className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                        activeView === tab
                          ? "text-gray-900 bg-white"
                          : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                      }`}
                      style={{
                        borderBottom: activeView === tab ? "2px solid #3B82F6" : "1px solid #E5E7EB",
                        marginBottom: activeView === tab ? "-1px" : "0",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
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

              {/* Activations Table */}
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
                      ) : activations.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No activations found
                          </td>
                        </tr>
                      ) : (
                        activations.map((activation) => {
                          const statusColors = getStatusColor(activation.status);
                          return (
                            <tr
                              key={activation.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedActivations.has(activation.id)}
                                  onChange={() => handleSelectActivation(activation.id)}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {activation.contractId}
                              </td>
                              <td className="px-4 py-3">
                                <a 
                                  href={`/sales/activation/${activation.id}`}
                                  className="text-primary hover:underline text-sm font-medium"
                                >
                                  {activation.client}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {activation.packageType}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {activation.progress}%
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {activation.tasksCompleted} / {activation.tasksTotal}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                  {activation.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {activation.deadline}
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

