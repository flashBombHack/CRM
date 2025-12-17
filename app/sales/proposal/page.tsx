"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateProposalModal, { CreateProposalFormData } from "@/components/CreateProposalModal";
import ProposalActionsDropdown from "@/components/ProposalActionsDropdown";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { proposalsApi, CreateProposalRequest } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Proposal {
  id: string;
  opportunity: string | null;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  package: string | null;
  terms: string | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  discount: number | null;
  total: number | null;
  cvResumeFileName: string | null;
  cvResumeFilePath: string | null;
  status: string | null;
  dateCreated: string;
  dateModified: string;
  proposalInvoiceItems: {
    id: string;
    proposalId: string;
    installment: string | null;
    price: number;
    dueDate: string;
  }[];
}

interface ProposalsResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Proposal[];
  };
  errors: string[];
  responseCode: number;
}

export default function ProposalPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("All proposals");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editFormData, setEditFormData] = useState<CreateProposalFormData | null>(null);
  const [deleteProposalId, setDeleteProposalId] = useState<string | null>(null);
  const { toasts, success, error, removeToast } = useToast();
  const router = useRouter();

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "All proposals" ? null : activeTab;
      const response = await proposalsApi.getProposals(pageIndex, pageSize, statusFilter);
      if (response.isSuccess && response.data) {
        setProposals(response.data.data);
        setTotalCount(response.data.totalCount);
      }
    } catch (err) {
      console.error("Error fetching proposals:", err);
      error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [pageIndex, pageSize, activeTab]);

  // Open modal when editFormData is set (for edit mode)
  useEffect(() => {
    if (editFormData && editingProposal && !isModalOpen) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [editFormData, editingProposal, isModalOpen]);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "grey":
        return { bg: "bg-gray-200", text: "text-gray-700" };
      case "sent":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "accepted":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "declined":
        return { bg: "bg-red-100", text: "text-red-700" };
      case "expired":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      default:
        return { bg: "bg-gray-200", text: "text-gray-700" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getOpportunityName = (proposal: Proposal): string => {
    if (proposal.firstName && proposal.lastName) {
      return `${proposal.firstName} ${proposal.lastName}`;
    }
    return proposal.opportunity || proposal.company || '-';
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProposals(new Set());
    } else {
      setSelectedProposals(new Set(proposals.map((proposal) => proposal.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectProposal = (proposalId: string) => {
    const newSelected = new Set(selectedProposals);
    if (newSelected.has(proposalId)) {
      newSelected.delete(proposalId);
    } else {
      newSelected.add(proposalId);
    }
    setSelectedProposals(newSelected);
    setSelectAll(newSelected.size === proposals.length);
  };

  const openEditModal = async (proposal: Proposal) => {
    try {
      // Fetch full proposal data to get all fields
      const response = await proposalsApi.getProposalById(proposal.id);
      if (response.isSuccess && response.data) {
        const fullProposal = response.data;
        
        // Convert dates from ISO to DD/MM/YYYY format
        const formatDateForForm = (dateStr: string | null): string => {
          if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
          try {
            const date = new Date(dateStr);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          } catch {
            return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
        };

        // Convert price from number to currency string
        const formatPriceForForm = (price: number | null): string => {
          if (price === null || price === undefined) return '£0';
          return `£${price.toLocaleString('en-GB')}`;
        };

        // Convert discount - if it's a number, convert to percentage string
        const formatDiscountForForm = (discount: number | null): string => {
          if (discount === null || discount === undefined) return '';
          // If discount is less than 1, it's likely a percentage (e.g., 5 = 5%)
          // If discount is >= 1, it might be a percentage or absolute value
          // Based on the API response showing 5.0, it seems to be a percentage
          return `${discount}%`;
        };

        // Convert invoice items - format dueDate as natural language date
        const formatDueDateForForm = (dateStr: string | null): string => {
          if (!dateStr) return '19 December, 2025';
          try {
            const date = new Date(dateStr);
            const day = date.getDate();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month}, ${year}`;
          } catch {
            return '19 December, 2025';
          }
        };

        const proposalInvoiceItems = fullProposal.proposalInvoiceItems?.map((item: { installment: string | null; price: number; dueDate: string }) => {
          const price = item.price || 0;
          return {
            installment: item.installment || '',
            price: formatPriceForForm(price),
            dueDate: formatDueDateForForm(item.dueDate),
          };
        }) || [
          { installment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
          { installment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
          { installment: 'Final payment', price: '£0', dueDate: '12 January, 2026' },
        ];

        const formData: CreateProposalFormData = {
          company: fullProposal.company || '',
          firstName: fullProposal.firstName || '',
          lastName: fullProposal.lastName || '',
          email: fullProposal.email || '',
          phoneNumber: fullProposal.phoneNumber || '',
          package: fullProposal.package || '',
          terms: fullProposal.terms || '',
          startDate: formatDateForForm(fullProposal.startDate),
          endDate: formatDateForForm(fullProposal.endDate),
          price: formatPriceForForm(fullProposal.price),
          discount: formatDiscountForForm(fullProposal.discount),
          total: formatPriceForForm(fullProposal.total),
          status: fullProposal.status || '',
          proposalInvoiceItems: proposalInvoiceItems,
          cvResume: null, // File can't be pre-filled
        };

        // Close modal first if open, then set edit data
        setIsModalOpen(false);
        setEditingProposal(proposal);
        setEditFormData(formData);
        // Modal will open via useEffect when editFormData is set
      }
    } catch (err) {
      console.error("Error fetching proposal for edit:", err);
      error('Failed to fetch proposal details');
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    router.push(`/sales/proposal/${proposal.id}`);
  };

  const handleDeleteProposal = async () => {
    if (!deleteProposalId) return;

    try {
      const response = await proposalsApi.deleteProposal(deleteProposalId);
      if (response.isSuccess) {
        success('Proposal deleted successfully!');
        await fetchProposals();
        setDeleteProposalId(null);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to delete proposal';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to delete proposal. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const handleCreateProposal = async (formData: CreateProposalFormData) => {
    try {
      // Convert form data to API format
      const convertDate = (dateStr: string): string | null => {
        if (!dateStr || dateStr.trim() === '') return null;
        // Convert DD/MM/YYYY to ISO format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}T00:00:00.000Z`;
        }
        // Try parsing as natural language date (e.g., "19 December, 2025")
        try {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
          }
        } catch {
          // Fallback to null
        }
        return null;
      };

      const convertPrice = (priceStr: string): number | null => {
        if (!priceStr || priceStr.trim() === '') return null;
        const cleaned = priceStr.replace(/[£,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };

      // Convert CV/Resume file to base64
      let cvResumeFileName: string | null = null;
      let cvResumeFilePath: string | null = null;

      if (formData.cvResume) {
        cvResumeFileName = formData.cvResume.name;
        // For now, set filePath to fileName (backend might handle this differently)
        // If backend requires base64, we may need to add cvResumeBase64 field to the API
        cvResumeFilePath = cvResumeFileName;
      }

      const proposalData: CreateProposalRequest = {
        company: formData.company || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || null,
        package: formData.package || null,
        terms: formData.terms || null,
        startDate: convertDate(formData.startDate),
        endDate: convertDate(formData.endDate),
        price: convertPrice(formData.price),
        discount: convertPrice(formData.discount),
        total: convertPrice(formData.total),
        cvResumeFileName: cvResumeFileName,
        cvResumeFilePath: cvResumeFilePath,
        status: formData.status || 'Draft',
        proposalInvoiceItems: formData.proposalInvoiceItems.map(item => ({
          installment: item.installment || '',
          price: convertPrice(item.price) || 0,
          dueDate: convertDate(item.dueDate) || new Date().toISOString(),
        })),
      };

      if (editingProposal) {
        // Update proposal
        const response = await proposalsApi.updateProposal(editingProposal.id, proposalData);
        if (response.isSuccess) {
          success('Proposal updated successfully!');
          await fetchProposals();
          setIsModalOpen(false);
          setEditingProposal(null);
          setEditFormData(null);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to update proposal';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Create proposal
        const response = await proposalsApi.createProposal(proposalData);
        if (response.isSuccess) {
          success('Proposal created successfully!');
          await fetchProposals();
          setIsModalOpen(false);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to create proposal';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to save proposal. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <CreateProposalModal
        key={editingProposal?.id || 'create'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProposal(null);
          setEditFormData(null);
        }}
        onSubmit={handleCreateProposal}
        initialData={editFormData}
        isEditMode={!!editingProposal}
      />

      {/* Delete Confirmation Dialog */}
      {deleteProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Proposal</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteProposalId(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProposal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Proposals Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Stage 5 - Proposals</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingProposal(null);
                        setEditFormData(null);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      New proposal
                    </button>
                    <button className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-4">
                  {["All proposals", "Grey", "Sent", "Accepted", "Declined", "Expired"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setPageIndex(1);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Total Proposals: {totalCount}</span>
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

              {/* Proposals Table */}
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Opportunity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Last Updated</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : proposals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            No proposals found
                          </td>
                        </tr>
                      ) : (
                        proposals
                          .filter((proposal) => {
                            if (!searchQuery) return true;
                            const searchLower = searchQuery.toLowerCase();
                            const opportunityName = getOpportunityName(proposal).toLowerCase();
                            const company = (proposal.company || '').toLowerCase();
                            const email = (proposal.email || '').toLowerCase();
                            return opportunityName.includes(searchLower) || 
                                   company.includes(searchLower) || 
                                   email.includes(searchLower);
                          })
                          .map((proposal) => {
                            const statusColors = getStatusColor(proposal.status || '');
                            return (
                            <tr
                              key={proposal.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors cursor-pointer"
                              onClick={(e) => {
                                // Don't trigger if clicking checkbox or actions button
                                const target = e.target as HTMLElement;
                                if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                                  return;
                                }
                                handleViewProposal(proposal);
                              }}
                            >
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedProposals.has(proposal.id)}
                                    onChange={() => handleSelectProposal(proposal.id)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <a 
                                    href={`/sales/proposal/${proposal.id}`}
                                    className="text-primary hover:underline text-sm font-medium"
                                  >
                                    {getOpportunityName(proposal)}
                                  </a>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {proposal.company || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <div className="flex flex-col">
                                    <span>{proposal.email || '-'}</span>
                                    <span>{proposal.phoneNumber || '-'}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {proposal.status ? (
                                    <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                      {proposal.status}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {formatTimeAgo(proposal.dateModified)}
                                </td>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                  <ProposalActionsDropdown
                                    proposalId={proposal.id}
                                    onView={() => handleViewProposal(proposal)}
                                    onEdit={() => openEditModal(proposal)}
                                    onDelete={() => setDeleteProposalId(proposal.id)}
                                  />
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



