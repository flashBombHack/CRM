"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import ContractDetailModal from "@/components/ContractDetailModal";
import CreateContractModal, { CreateContractFormData } from "@/components/CreateContractModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Contract {
  id: string;
  opportunityName: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  status: string;
  lastUpdated: string; // ISO date string
}

interface ContractsResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Contract[];
  };
  errors: string[];
  responseCode: number;
}

const TABS = ["All contracts", "Sent", "Signed", "Pending", "Draft", "Cancelled", "Expired"];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("All contracts");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  // Mock data for now - replace with API call later
  useEffect(() => {
    setTimeout(() => {
      const mockContracts: Contract[] = [
        { id: "1", opportunityName: "Lily Robinson", companyName: "Robinson Retail Group", email: "lily@robinsonretailgroup.co.uk", phoneNumber: "+44 7851 440 190", status: "Grey", lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { id: "2", opportunityName: "Benjamin Scott", companyName: "Scott Technical Services", email: "benjamin@scotttech.co.uk", phoneNumber: "+44 7851 440 191", status: "Sent", lastUpdated: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: "3", opportunityName: "Mia Phillips", companyName: "Phillips Recruitment UK", email: "mia@phillipsrecruitment.co.uk", phoneNumber: "+44 7851 440 192", status: "Signed", lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "4", opportunityName: "Lucas Hall", companyName: "Hall Security Systems", email: "lucas@hallsecurity.co.uk", phoneNumber: "+44 7851 440 193", status: "Pending", lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "5", opportunityName: "Grace Foster", companyName: "Foster Media Agency", email: "grace@fostermedia.co.uk", phoneNumber: "+44 7851 440 194", status: "Draft", lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "6", opportunityName: "Alfie Turner", companyName: "Turner Mechanical Ltd", email: "alfie@turnermechanical.co.uk", phoneNumber: "+44 7851 440 195", status: "Cancelled", lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "7", opportunityName: "Charlotte Taylor", companyName: "Taylor Solutions", email: "charlotte@taylorsolutions.co.uk", phoneNumber: "+44 7851 440 196", status: "Expired", lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "8", opportunityName: "Oliver Brown", companyName: "Brown Industries", email: "oliver@brownindustries.co.uk", phoneNumber: "+44 7851 440 197", status: "Sent", lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: "9", opportunityName: "Sophia Wilson", companyName: "Wilson Tech", email: "sophia@wilsontech.co.uk", phoneNumber: "+44 7851 440 198", status: "Signed", lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "10", opportunityName: "James Anderson", companyName: "Anderson Corp", email: "james@andersoncorp.co.uk", phoneNumber: "+44 7851 440 199", status: "Pending", lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "11", opportunityName: "Emma Davis", companyName: "Davis Enterprises", email: "emma@davisenterprises.co.uk", phoneNumber: "+44 7851 440 200", status: "Draft", lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "12", opportunityName: "William Martinez", companyName: "Martinez Group", email: "william@martinezgroup.co.uk", phoneNumber: "+44 7851 440 201", status: "Grey", lastUpdated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
        { id: "13", opportunityName: "Isabella Garcia", companyName: "Garcia Solutions", email: "isabella@garcia.co.uk", phoneNumber: "+44 7851 440 202", status: "Sent", lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: "14", opportunityName: "Michael Rodriguez", companyName: "Rodriguez Ltd", email: "michael@rodriguez.co.uk", phoneNumber: "+44 7851 440 203", status: "Signed", lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "15", opportunityName: "Amelia Lewis", companyName: "Lewis Industries", email: "amelia@lewis.co.uk", phoneNumber: "+44 7851 440 204", status: "Pending", lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "16", opportunityName: "Henry Walker", companyName: "Walker Tech", email: "henry@walkertech.co.uk", phoneNumber: "+44 7851 440 205", status: "Draft", lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "17", opportunityName: "Noah Gray", companyName: "Gray Corp", email: "noah@graycorp.co.uk", phoneNumber: "+44 7851 440 206", status: "Cancelled", lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "18", opportunityName: "Ava White", companyName: "White Solutions", email: "ava@whitesolutions.co.uk", phoneNumber: "+44 7851 440 207", status: "Expired", lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "19", opportunityName: "Ethan Black", companyName: "Black Industries", email: "ethan@blackindustries.co.uk", phoneNumber: "+44 7851 440 208", status: "Grey", lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
        { id: "20", opportunityName: "Olivia Green", companyName: "Green Tech", email: "olivia@greentech.co.uk", phoneNumber: "+44 7851 440 209", status: "Sent", lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      ];
      setContracts(mockContracts);
      setTotalCount(mockContracts.length);
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
      case "signed":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "draft":
        return { bg: "bg-purple-100", text: "text-purple-700" };
      case "cancelled":
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
      setSelectedContracts(new Set());
    } else {
      setSelectedContracts(new Set(contracts.map((contract) => contract.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectContract = (contractId: string) => {
    const newSelected = new Set(selectedContracts);
    if (newSelected.has(contractId)) {
      newSelected.delete(contractId);
    } else {
      newSelected.add(contractId);
    }
    setSelectedContracts(newSelected);
    setSelectAll(newSelected.size === contracts.length);
  };

  const getFilteredContracts = () => {
    if (activeTab === "All contracts") {
      return contracts;
    }
    return contracts.filter(contract => {
      const statusLower = contract.status.toLowerCase();
      const tabLower = activeTab.toLowerCase();
      return statusLower === tabLower;
    });
  };

  const filteredContracts = getFilteredContracts();

  const getContractDetail = (contract: Contract) => {
    // Generate contract detail data based on the contract
    return {
      id: contract.id,
      contractId: `CT-2025-${contract.id.padStart(4, '0')}`,
      opportunityName: contract.opportunityName,
      companyName: contract.companyName,
      email: contract.email,
      phoneNumber: contract.phoneNumber,
      status: contract.status,
      totalAmount: "£12,500",
      balanceDue: "£7,500",
      dueDate: "Dec 20, 2025",
      season: "24/25 Season",
      contractValue: "£12,500",
      contractStart: "01 January, 2026",
      contractEnd: "30 May 2026",
      invoiceItems: [
        { instalment: "Deposit", price: "£7,500", dueDate: "03 January, 2026" },
        { instalment: "Middle Payment", price: "£2,300", dueDate: "12 March, 2026" },
        { instalment: "Final Payment", price: "£2,700", dueDate: "05 May, 2026" },
      ],
      termsStatus: "Signed",
      documents: ["Contract.png"],
    };
  };

  const handleContractClick = (contract: Contract) => {
    const contractDetail = getContractDetail(contract);
    setSelectedContract(contractDetail);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  const handleCreateContract = async (formData: CreateContractFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating contract:', formData);
      success('Contract created successfully!');
      // Refresh the contracts list
      // await fetchContracts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create contract. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        contract={selectedContract}
      />
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContract}
      />
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Contracts Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Stage 6 - Contracts</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      Create new contract
                    </button>
                    <button className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Tabs and Search/Filter Section - Side by Side */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  {/* Tabs on the left */}
                  <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                    {TABS.map((tab, index) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? "text-gray-900 bg-white"
                            : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                        }`}
                        style={{
                          borderRight: index < TABS.length - 1 ? "1px solid #E5E7EB" : "none",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search and Filter Controls on the right */}
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

              {/* Contracts Table */}
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
                      ) : filteredContracts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            No contracts found
                          </td>
                        </tr>
                      ) : (
                        filteredContracts.map((contract) => {
                          const statusColors = getStatusColor(contract.status);
                          return (
                            <tr
                              key={contract.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors cursor-pointer"
                              onClick={(e) => {
                                // Don't trigger if clicking checkbox or actions button
                                const target = e.target as HTMLElement;
                                if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                                  return;
                                }
                                handleContractClick(contract);
                              }}
                            >
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedContracts.has(contract.id)}
                                  onChange={() => handleSelectContract(contract.id)}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-primary hover:underline text-sm font-medium">
                                  {contract.opportunityName}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {contract.companyName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <div className="flex flex-col">
                                  <span>{contract.email}</span>
                                  <span>{contract.phoneNumber}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                  {contract.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatTimeAgo(contract.lastUpdated)}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                    {Math.min((pageIndex - 1) * pageSize + 1, filteredContracts.length)} - {Math.min(pageIndex * pageSize, filteredContracts.length)} of {filteredContracts.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageIndex}
                    onChange={(e) => setPageIndex(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {Array.from({ length: Math.ceil(filteredContracts.length / pageSize) }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">of {Math.ceil(filteredContracts.length / pageSize)} page{Math.ceil(filteredContracts.length / pageSize) !== 1 ? 's' : ''}</span>
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
                    onClick={() => setPageIndex((prev) => Math.min(Math.ceil(filteredContracts.length / pageSize), prev + 1))}
                    disabled={pageIndex >= Math.ceil(filteredContracts.length / pageSize)}
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
