"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import ContractDetailModal from "@/components/ContractDetailModal";
import CreateContractModal, { CreateContractFormData } from "@/components/CreateContractModal";
import ContractActionsDropdown from "@/components/ContractActionsDropdown";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { contractsApi, CreateContractRequest, ContractInvoiceItem } from "@/lib/api-client";
import { HiSearch, HiChevronDown, HiPlus } from "react-icons/hi";

interface Contract {
  id: string;
  contID?: string;
  name: string | null;
  companyName: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: string | null;
  dateModified: string | null;
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
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editFormData, setEditFormData] = useState<CreateContractFormData | null>(null);
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null);
  const { toasts, success, error, removeToast } = useToast();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "All contracts" ? null : activeTab;
      const response = await contractsApi.getContracts(pageIndex, pageSize, statusFilter);
      if (response.isSuccess && response.data) {
        setContracts(response.data.data);
        setTotalCount(response.data.totalCount);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      error('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [pageIndex, pageSize, activeTab]);

  // Check for contractId from navigation (e.g., from invoice detail modal)
  useEffect(() => {
    const openContractId = sessionStorage.getItem('openContractId');
    if (openContractId && contracts.length > 0) {
      sessionStorage.removeItem('openContractId');
      // Find the contract in the current list or fetch it
      const contract = contracts.find(c => c.id === openContractId);
      if (contract) {
        // Use the existing handleContractClick logic
        contractsApi.getContractById(contract.id)
          .then(response => {
            if (response.isSuccess && response.data) {
              setSelectedContract(response.data);
              setIsDetailModalOpen(true);
            }
          })
          .catch(err => {
            console.error("Error fetching contract details:", err);
            error('Failed to fetch contract details');
          });
      } else {
        // If contract not in current list, fetch it directly
        contractsApi.getContractById(openContractId)
          .then(response => {
            if (response.isSuccess && response.data) {
              setSelectedContract(response.data);
              setIsDetailModalOpen(true);
            }
          })
          .catch(err => {
            console.error("Error fetching contract:", err);
            error('Failed to fetch contract details');
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts]);

  const getStatusColor = (status: string | null) => {
    if (!status) return { bg: "bg-gray-200", text: "text-gray-700" };
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

  const formatTimeAgo = (dateString: string | null) => {
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

  // Contracts are already filtered by API based on activeTab
  const filteredContracts = contracts;

  const handleContractClick = async (contract: Contract) => {
    try {
      const response = await contractsApi.getContractById(contract.id);
      if (response.isSuccess && response.data) {
        setSelectedContract(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching contract details:", err);
      error('Failed to fetch contract details');
    }
  };

  const openEditModal = async (contract: Contract) => {
    try {
      // Fetch full contract data to get all fields
      const response = await contractsApi.getContractById(contract.id);
      if (response.isSuccess && response.data) {
        const fullContract = response.data;
        
        // Convert dates from ISO to DD/MM/YYYY format
        const formatDateForForm = (dateStr: string | null): string => {
          if (!dateStr) return '01/01/2025';
          try {
            const date = new Date(dateStr);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          } catch {
            return '01/01/2025';
          }
        };

        // Convert price from number to currency string
        const formatPriceForForm = (price: number | null): string => {
          if (price === null || price === undefined) return '£0,000';
          return `£${price.toLocaleString('en-GB')},000`;
        };

        // Convert invoice items
        const invoiceItems = fullContract.contractInvoiceItems?.map((item: { installment: string | null; price: number; dueDate: string }) => ({
          instalment: item.installment || '',
          price: formatPriceForForm(item.price),
          dueDate: formatDateForForm(item.dueDate),
        })) || [
          { instalment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
          { instalment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
          { instalment: 'Final payment', price: '£0', dueDate: '12 January,,2026' },
        ];

        const formData: CreateContractFormData = {
          name: fullContract.name || '',
          companyName: fullContract.companyName || '',
          email: fullContract.email || '',
          phoneNumber: fullContract.phoneNumber || '',
          contractDetails: fullContract.details || '',
          season: fullContract.season || '',
          startDate: formatDateForForm(fullContract.startDate),
          endDate: formatDateForForm(fullContract.endDate),
          totalAgreedPrice: formatPriceForForm(fullContract.totalAgreedPrice),
          discount: typeof fullContract.discount === 'string' ? fullContract.discount : (fullContract.discount?.toString() || ''),
          finalPrice: formatPriceForForm(fullContract.finalPrice),
          invoiceItems: invoiceItems,
          cvResume: null, // File can't be pre-filled
        };

        setEditingContract(contract);
        setEditFormData(formData);
        setIsCreateModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching contract for edit:", err);
      error('Failed to fetch contract details');
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  const handleDeleteContract = async () => {
    if (!deleteContractId) return;

    try {
      const response = await contractsApi.deleteContract(deleteContractId);
      if (response.isSuccess) {
        success('Contract deleted successfully!');
        await fetchContracts();
        setDeleteContractId(null);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to delete contract';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to delete contract. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const handleCreateContract = async (formData: CreateContractFormData) => {
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
        return null;
      };

      const convertPrice = (priceStr: string): number | null => {
        if (!priceStr || priceStr.trim() === '') return null;
        const cleaned = priceStr.replace(/[£,]/g, '').replace('000', '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };

      // Convert file to base64
      let cvResumeBase64: string | null = null;
      let cvResumeFileName: string | null = null;
      if (formData.cvResume) {
        cvResumeFileName = formData.cvResume.name;
        cvResumeBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/...;base64, prefix if present
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.cvResume!);
        });
      }

      // Convert dueDate from text format to ISO date
      const convertDueDate = (dateStr: string): string => {
        if (!dateStr || dateStr.trim() === '') return new Date().toISOString();
        // Try to parse common date formats
        try {
          // Try DD/MM/YYYY first
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}T00:00:00.000Z`;
          }
          // Try parsing as natural language date
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString();
          }
        } catch {
          // Fallback to current date
        }
        return new Date().toISOString();
      };

      const contractData: CreateContractRequest = {
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null,
        status: editingContract?.status || 'Draft',
        details: formData.contractDetails || '',
        season: formData.season || null,
        startDate: convertDate(formData.startDate),
        endDate: convertDate(formData.endDate),
        totalAgreedPrice: convertPrice(formData.totalAgreedPrice),
        discount: formData.discount || null, // Keep as string
        finalPrice: convertPrice(formData.finalPrice),
        cvResumeBase64: cvResumeBase64,
        cvResumeFileName: cvResumeFileName,
        contractInvoiceItems: formData.invoiceItems.map(item => ({
          installment: item.instalment,
          price: convertPrice(item.price) || 0,
          dueDate: convertDueDate(item.dueDate),
        })),
      };

      if (editingContract) {
        // Update contract
        const response = await contractsApi.updateContract(editingContract.id, contractData);
        if (response.isSuccess) {
          success('Contract updated successfully!');
          await fetchContracts();
          setEditingContract(null);
          setIsCreateModalOpen(false);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to update contract';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Create contract
        const response = await contractsApi.createContract(contractData);
        if (response.isSuccess) {
          success('Contract created successfully!');
          await fetchContracts();
          setIsCreateModalOpen(false);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to create contract';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      }
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
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingContract(null);
          setEditFormData(null);
        }}
        onSubmit={handleCreateContract}
        initialData={editFormData}
        isEditMode={!!editingContract}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteContractId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Contract</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteContractId(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContract}
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
                                  {contract.name || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {contract.companyName || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <div className="flex flex-col">
                                  <span>{contract.email || '-'}</span>
                                  <span>{contract.phoneNumber || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {contract.status ? (
                                  <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                    {contract.status}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatTimeAgo(contract.dateModified)}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <ContractActionsDropdown
                                  contractId={contract.id}
                                  onView={() => handleContractClick(contract)}
                                  onEdit={() => openEditModal(contract)}
                                  onDelete={() => setDeleteContractId(contract.id)}
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

