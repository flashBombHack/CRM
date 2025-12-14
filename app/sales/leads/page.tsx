"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateLeadModal, { CreateLeadFormData } from "@/components/CreateLeadModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { leadsApi, CreateLeadRequest } from "@/lib/api-client";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Lead {
  id: string;
  firstName: string | null;
  role: string | null;
  companyName: string | null;
  email: string | null;
  phoneNumber: string | null;
  website: string | null;
  preferredContactMethod: string | null;
  country: string | null;
  city: string | null;
  source: string | null;
  status: string | null;
  productInterest: string[];
}

interface LeadsResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Lead[];
  };
  errors: string[];
  responseCode: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response: LeadsResponse = await leadsApi.getLeads(pageIndex, pageSize);
      if (response.isSuccess && response.data) {
        setLeads(response.data.data);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const getStatusColor = (status: string | null) => {
    if (!status) return "text-gray-500";
    const statusLower = status.toLowerCase();
    if (statusLower === "new") return "text-blue-600";
    if (statusLower === "nurturing") return "text-orange-600";
    if (statusLower === "contacted") return "text-yellow-600";
    return "text-gray-500";
  };

  const getStatusDotColor = (status: string | null) => {
    if (!status) return "bg-gray-500";
    const statusLower = status.toLowerCase();
    if (statusLower === "new") return "bg-blue-600";
    if (statusLower === "nurturing") return "bg-orange-600";
    if (statusLower === "contacted") return "bg-yellow-600";
    return "bg-gray-500";
  };

  const getLeadName = (lead: Lead) => {
    if (lead.firstName) return lead.firstName;
    if (lead.email) return lead.email.split("@")[0];
    return "Unknown";
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map((lead) => lead.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === leads.length);
  };

  const handleCreateLead = async (formData: CreateLeadFormData) => {
    try {
      // Phone number is already in E.164 format (e.g., +1234567890) from PhoneInput component
      const phoneNumber = formData.phoneNumber && formData.phoneNumber.trim() 
        ? formData.phoneNumber.trim() 
        : null;

      // Prepare API request
      const leadData: CreateLeadRequest = {
        firstName: formData.firstName,
        role: formData.role || null,
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: phoneNumber,
        website: formData.website || null,
        preferredContactMethod: formData.preferredContactMethod || null,
        country: formData.country || null,
        city: formData.city || null,
        source: formData.source || null,
        status: formData.status || null,
        productInterest: formData.productInterest || [],
      };

      const response = await leadsApi.createLead(leadData);

      if (response.isSuccess) {
        success('Lead created successfully!');
        // Refresh the leads list
        await fetchLeads();
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to create lead';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create lead. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
      />
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Leads Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Leads</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      New lead
                    </button>
                    <button className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Total Leads: {totalCount}</span>
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
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>Sources: All</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>Status: All</option>
                  </select>
                </div>
              </div>

              {/* Leads Table */}
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Lead Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product Interest</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : leads.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            No leads found
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead) => (
                          <tr
                            key={lead.id}
                            className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedLeads.has(lead.id)}
                                onChange={() => handleSelectLead(lead.id)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <a 
                                href={`/sales/leads/${lead.id}`}
                                className="text-primary hover:underline text-sm font-medium"
                              >
                                {getLeadName(lead)}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {lead.companyName || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex flex-col">
                                {lead.email && <span>{lead.email}</span>}
                                {lead.phoneNumber && <span>{lead.phoneNumber}</span>}
                                {!lead.email && !lead.phoneNumber && <span>-</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {lead.productInterest && lead.productInterest.length > 0 ? (
                                  <>
                                    {lead.productInterest.slice(0, 2).map((interest, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                    {lead.productInterest.length > 2 && (
                                      <span className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full">
                                        +{lead.productInterest.length - 2}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {lead.source ? (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                                  {lead.source}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {lead.status ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(lead.status)}`}></div>
                                  <span className={`text-sm font-medium ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-gray-400 hover:text-gray-600">
                                <HiDotsVertical className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
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

