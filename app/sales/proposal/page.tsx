"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateProposalModal, { CreateProposalFormData } from "@/components/CreateProposalModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Proposal {
  id: string;
  opportunityName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  status: string;
  lastUpdated: string; // ISO date string
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  // Mock data for now - replace with API call later
  useEffect(() => {
    setTimeout(() => {
      const mockProposals: Proposal[] = [
        { id: "1", opportunityName: "Lily Robinson", companyName: "Robinson Retail Group", email: "lily@robinsonretailgroup.co.uk", phoneNumber: "+44 7851 440 190", status: "Grey", lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { id: "2", opportunityName: "Benjamin Scott", companyName: "Scott Manufacturing", email: "benjamin@scottmfg.co.uk", phoneNumber: "+44 7851 440 191", status: "Sent", lastUpdated: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: "3", opportunityName: "Charlotte Taylor", companyName: "Taylor Solutions", email: "charlotte@taylorsolutions.co.uk", phoneNumber: "+44 7851 440 192", status: "Accepted", lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "4", opportunityName: "Oliver Brown", companyName: "Brown Industries", email: "oliver@brownindustries.co.uk", phoneNumber: "+44 7851 440 193", status: "Declined", lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "5", opportunityName: "Sophia Wilson", companyName: "Wilson Tech", email: "sophia@wilsontech.co.uk", phoneNumber: "+44 7851 440 194", status: "Expired", lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "6", opportunityName: "James Anderson", companyName: "Anderson Corp", email: "james@andersoncorp.co.uk", phoneNumber: "+44 7851 440 195", status: "Sent", lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: "7", opportunityName: "Emma Davis", companyName: "Davis Enterprises", email: "emma@davisenterprises.co.uk", phoneNumber: "+44 7851 440 196", status: "Grey", lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "8", opportunityName: "William Martinez", companyName: "Martinez Group", email: "william@martinezgroup.co.uk", phoneNumber: "+44 7851 440 197", status: "Accepted", lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "9", opportunityName: "Isabella Garcia", companyName: "Garcia Solutions", email: "isabella@garcia.co.uk", phoneNumber: "+44 7851 440 198", status: "Sent", lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: "10", opportunityName: "Michael Rodriguez", companyName: "Rodriguez Ltd", email: "michael@rodriguez.co.uk", phoneNumber: "+44 7851 440 199", status: "Grey", lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
        { id: "11", opportunityName: "Amelia Lewis", companyName: "Lewis Industries", email: "amelia@lewis.co.uk", phoneNumber: "+44 7851 440 200", status: "Declined", lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "12", opportunityName: "Henry Walker", companyName: "Walker Tech", email: "henry@walkertech.co.uk", phoneNumber: "+44 7851 440 201", status: "Expired", lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "13", opportunityName: "Mia Hall", companyName: "Hall Manufacturing", email: "mia@hallmfg.co.uk", phoneNumber: "+44 7851 440 202", status: "Accepted", lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "14", opportunityName: "Alexander Young", companyName: "Young Solutions", email: "alexander@young.co.uk", phoneNumber: "+44 7851 440 203", status: "Sent", lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: "15", opportunityName: "Harper King", companyName: "King Enterprises", email: "harper@king.co.uk", phoneNumber: "+44 7851 440 204", status: "Grey", lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        { id: "16", opportunityName: "Daniel Wright", companyName: "Wright Corp", email: "daniel@wright.co.uk", phoneNumber: "+44 7851 440 205", status: "Accepted", lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "17", opportunityName: "Evelyn Lopez", companyName: "Lopez Group", email: "evelyn@lopez.co.uk", phoneNumber: "+44 7851 440 206", status: "Sent", lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
        { id: "18", opportunityName: "Matthew Hill", companyName: "Hill Industries", email: "matthew@hill.co.uk", phoneNumber: "+44 7851 440 207", status: "Declined", lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "19", opportunityName: "Avery Green", companyName: "Green Tech", email: "avery@green.co.uk", phoneNumber: "+44 7851 440 208", status: "Expired", lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "20", opportunityName: "Sofia Adams", companyName: "Adams Solutions", email: "sofia@adams.co.uk", phoneNumber: "+44 7851 440 209", status: "Grey", lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
        { id: "21", opportunityName: "Joseph Baker", companyName: "Baker Ltd", email: "joseph@baker.co.uk", phoneNumber: "+44 7851 440 210", status: "Accepted", lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "22", opportunityName: "Madison Nelson", companyName: "Nelson Corp", email: "madison@nelson.co.uk", phoneNumber: "+44 7851 440 211", status: "Sent", lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
        { id: "23", opportunityName: "David Carter", companyName: "Carter Enterprises", email: "david@carter.co.uk", phoneNumber: "+44 7851 440 212", status: "Grey", lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: "24", opportunityName: "Scarlett Mitchell", companyName: "Mitchell Group", email: "scarlett@mitchell.co.uk", phoneNumber: "+44 7851 440 213", status: "Declined", lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "25", opportunityName: "Andrew Perez", companyName: "Perez Tech", email: "andrew@perez.co.uk", phoneNumber: "+44 7851 440 214", status: "Expired", lastUpdated: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "26", opportunityName: "Victoria Roberts", companyName: "Roberts Industries", email: "victoria@roberts.co.uk", phoneNumber: "+44 7851 440 215", status: "Accepted", lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "27", opportunityName: "Joshua Turner", companyName: "Turner Solutions", email: "joshua@turner.co.uk", phoneNumber: "+44 7851 440 216", status: "Sent", lastUpdated: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
        { id: "28", opportunityName: "Grace Phillips", companyName: "Phillips Ltd", email: "grace@phillips.co.uk", phoneNumber: "+44 7851 440 217", status: "Grey", lastUpdated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
        { id: "29", opportunityName: "Ryan Campbell", companyName: "Campbell Corp", email: "ryan@campbell.co.uk", phoneNumber: "+44 7851 440 218", status: "Declined", lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "30", opportunityName: "Chloe Parker", companyName: "Parker Group", email: "chloe@parker.co.uk", phoneNumber: "+44 7851 440 219", status: "Expired", lastUpdated: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "31", opportunityName: "Nathan Evans", companyName: "Evans Tech", email: "nathan@evans.co.uk", phoneNumber: "+44 7851 440 220", status: "Accepted", lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "32", opportunityName: "Zoe Edwards", companyName: "Edwards Solutions", email: "zoe@edwards.co.uk", phoneNumber: "+44 7851 440 221", status: "Sent", lastUpdated: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
        { id: "33", opportunityName: "Christopher Collins", companyName: "Collins Industries", email: "christopher@collins.co.uk", phoneNumber: "+44 7851 440 222", status: "Grey", lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      ];
      setProposals(mockProposals);
      setTotalCount(mockProposals.length);
      setLoading(false);
    }, 500);
  }, []);

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

  const handleCreateProposal = async (formData: CreateProposalFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating proposal:', formData);
      success('Proposal created successfully!');
      // Refresh the proposals list
      // await fetchProposals();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create proposal. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProposal}
      />
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
                      onClick={() => setIsModalOpen(true)}
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
                        proposals.map((proposal) => {
                          const statusColors = getStatusColor(proposal.status);
                          return (
                            <tr
                              key={proposal.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors"
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
                                  {proposal.opportunityName}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {proposal.companyName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <div className="flex flex-col">
                                  <span>{proposal.email}</span>
                                  <span>{proposal.phoneNumber}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                  {proposal.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatTimeAgo(proposal.lastUpdated)}
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
