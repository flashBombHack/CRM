"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvoiceDetailModal from "@/components/InvoiceDetailModal";
import CreateInvoiceModal, { CreateInvoiceFormData } from "@/components/CreateInvoiceModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Invoice {
  id: string;
  invoiceId: string;
  customer: string;
  amountBilled: number;
  status: string;
  dueDate: string;
  amountDue: number;
}

interface InvoicesResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Invoice[];
  };
  errors: string[];
  responseCode: number;
}

const TABS = ["All invoices", "Draft", "Sent", "Paid", "Partially Paid", "Overdue"];

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("All invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  // Mock data for now - replace with API call later
  useEffect(() => {
    setTimeout(() => {
      const mockInvoices: Invoice[] = [
        { id: "1", invoiceId: "INV-2025-0098", customer: "Lily Robinson", amountBilled: 12500, status: "Sent", dueDate: "Dec 20, 2025", amountDue: 12500 },
        { id: "2", invoiceId: "INV-2025-0098", customer: "Ava Green", amountBilled: 12500, status: "Draft", dueDate: "Dec 20, 2025", amountDue: 12500 },
        { id: "3", invoiceId: "INV-2025-0098", customer: "Sophie Adams", amountBilled: 12500, status: "Paid", dueDate: "Dec 20, 2025", amountDue: 0 },
        { id: "4", invoiceId: "INV-2025-0098", customer: "Alfie Turner", amountBilled: 12500, status: "Partially Paid", dueDate: "Dec 20, 2025", amountDue: 7500 },
        { id: "5", invoiceId: "INV-2025-0098", customer: "Lucas Hall", amountBilled: 12500, status: "Overdue", dueDate: "Dec 20, 2025", amountDue: 12500 },
      ];
      setInvoices(mockInvoices);
      setTotalCount(mockInvoices.length);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "sent":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "draft":
        return { bg: "bg-gray-200", text: "text-gray-700" };
      case "paid":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "partially paid":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "overdue":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-200", text: "text-gray-700" };
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(invoices.map((invoice) => invoice.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
    setSelectAll(newSelected.size === invoices.length);
  };

  const getFilteredInvoices = () => {
    if (activeTab === "All invoices") {
      return invoices;
    }
    return invoices.filter(invoice => {
      const statusLower = invoice.status.toLowerCase();
      const tabLower = activeTab.toLowerCase();
      return statusLower === tabLower;
    });
  };

  const filteredInvoices = getFilteredInvoices();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInvoiceDetail = (invoice: Invoice) => {
    // Generate invoice detail data based on the invoice
    return {
      id: invoice.id,
      invoiceId: invoice.invoiceId,
      totalAmount: formatCurrency(invoice.amountBilled),
      balanceDue: formatCurrency(invoice.amountDue),
      dueDate: invoice.dueDate,
      status: invoice.status,
      company: "Walker Media Group",
      primaryContact: invoice.customer,
      email: "james@walkermedia.co",
      phone: "+44 7924 112 883",
      billingAddress: "22 Southbury Lane, Leeds LS10 5QF",
      contractId: "CT-2025-009",
      packageSold: "Corporate Hospitality Package",
      contractValue: formatCurrency(invoice.amountBilled),
      contractStart: "01 January, 2026",
      contractEnd: "30 May 2026",
      invoiceItems: [
        { item: "Corporate Hospitality Package", qty: 1, price: formatCurrency(invoice.amountBilled), total: formatCurrency(invoice.amountBilled) },
      ],
      invoiceNote: "Customer requested split payments. Invoice broken into deposit + balance.",
      ownerName: "Sarah Thompson",
      ownerTitle: "Commercial Sales Manager",
    };
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    const invoiceDetail = getInvoiceDetail(invoice);
    setSelectedInvoice(invoiceDetail);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = async (formData: CreateInvoiceFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating invoice:', formData);
      success('Invoice created successfully!');
      // Refresh the invoices list
      // await fetchInvoices();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create invoice. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        invoice={selectedInvoice}
      />
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInvoice}
      />
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Invoices Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Stage 8 – Invoices</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      Create new invoice
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

              {/* Invoices Table */}
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Invoice ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount Billed</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount Due</th>
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
                      ) : filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            No invoices found
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((invoice) => {
                          const statusColors = getStatusColor(invoice.status);
                          return (
                            <tr
                              key={invoice.id}
                              className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors cursor-pointer"
                              onClick={(e) => {
                                // Don't trigger if clicking checkbox or actions button
                                const target = e.target as HTMLElement;
                                if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                                  return;
                                }
                                handleInvoiceClick(invoice);
                              }}
                            >
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedInvoices.has(invoice.id)}
                                  onChange={() => handleSelectInvoice(invoice.id)}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {invoice.invoiceId}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-primary hover:underline text-sm font-medium">
                                  {invoice.customer}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(invoice.amountBilled)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {invoice.dueDate}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(invoice.amountDue)}
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
