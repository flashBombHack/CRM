"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvoiceDetailModal from "@/components/InvoiceDetailModal";
import CreateInvoiceModal, { CreateInvoiceFormData } from "@/components/CreateInvoiceModal";
import InvoiceActionsDropdown from "@/components/InvoiceActionsDropdown";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { invoicesApi, CreateInvoiceRequest } from "@/lib/api-client";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus } from "react-icons/hi";

interface Invoice {
  id: string;
  invoiceNumber: string | null;
  companyName: string | null;
  primaryName: string | null;
  email: string | null;
  totalAmount: number;
  amountBilled: number;
  amountDue: number;
  dueDate: string | null;
  status: string | null;
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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editFormData, setEditFormData] = useState<CreateInvoiceFormData | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const { toasts, success, error, removeToast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === "All invoices" ? null : activeTab;
      const response = await invoicesApi.getInvoices(pageIndex, pageSize, statusFilter);
      if (response.isSuccess && response.data) {
        setInvoices(response.data.data);
        setTotalCount(response.data.totalCount);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [pageIndex, pageSize, activeTab]);

  const getStatusColor = (status: string | null) => {
    if (!status) return { bg: "bg-gray-200", text: "text-gray-700" };
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

  // Invoices are already filtered by API based on activeTab
  const filteredInvoices = invoices;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const handleInvoiceClick = async (invoice: Invoice) => {
    try {
      const response = await invoicesApi.getInvoiceById(invoice.id);
      if (response.isSuccess && response.data) {
        setSelectedInvoice(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      error('Failed to fetch invoice details');
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const openEditModal = async (invoice: Invoice) => {
    try {
      // Fetch full invoice data to get all fields
      const response = await invoicesApi.getInvoiceById(invoice.id);
      if (response.isSuccess && response.data) {
        const fullInvoice = response.data;
        
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
          if (price === null || price === undefined) return '£0,000';
          return `£${price.toLocaleString('en-GB')}`;
        };

        // Convert invoice items
        const invoiceItems = fullInvoice.invoiceItems?.map((item: { itemDescription: string | null; quantity: number; unitPrice: number }) => {
          const qty = item.quantity || 0;
          const price = item.unitPrice || 0;
          const total = qty * price;
          return {
            item: item.itemDescription || '',
            qty: qty.toString(),
            price: formatPriceForForm(price),
            total: formatPriceForForm(total),
          };
        }) || [];

        // Reconstruct phone number from country code and number
        let phoneNumber = '';
        if (fullInvoice.phoneNumberCountryCode && fullInvoice.phoneNumber) {
          phoneNumber = `${fullInvoice.phoneNumberCountryCode}${fullInvoice.phoneNumber}`;
        } else if (fullInvoice.phoneNumber) {
          phoneNumber = fullInvoice.phoneNumber;
        }

        const formData: CreateInvoiceFormData = {
          companyName: fullInvoice.companyName || '',
          primaryName: fullInvoice.primaryName || '',
          email: fullInvoice.email || '',
          phoneNumber: phoneNumber,
          billingAddress: fullInvoice.billingAddress || '',
          packageSold: fullInvoice.packageSold || '',
          contractValue: formatPriceForForm(fullInvoice.contractValue),
          startDate: formatDateForForm(fullInvoice.contractStartDate),
          endDate: formatDateForForm(fullInvoice.contractEndDate),
          status: fullInvoice.status || '',
          invoiceNotes: fullInvoice.invoiceNotes || '',
          billedOnDate: formatDateForForm(fullInvoice.billedOnDate),
          dueDate: formatDateForForm(fullInvoice.dueDate),
          contractId: fullInvoice.contractId || '',
          invoiceItems: invoiceItems,
        };

        setEditingInvoice(invoice);
        setEditFormData(formData);
        setIsCreateModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching invoice for edit:", err);
      error('Failed to fetch invoice details');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteInvoiceId) return;

    try {
      const response = await invoicesApi.deleteInvoice(deleteInvoiceId);
      if (response.isSuccess) {
        success('Invoice deleted successfully!');
        await fetchInvoices();
        setDeleteInvoiceId(null);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to delete invoice';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to delete invoice. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const handleCreateInvoice = async (formData: CreateInvoiceFormData) => {
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
        // Try parsing as natural language date
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

      // Calculate totals from invoice items
      let totalAmount = 0;
      formData.invoiceItems.forEach(item => {
        const qty = parseFloat(item.qty) || 0;
        const price = convertPrice(item.price) || 0;
        totalAmount += qty * price;
      });

      // For now, amountBilled = totalAmount and amountDue = totalAmount
      // This can be adjusted if there's a separate field for amountBilled
      const amountBilled = totalAmount;
      const amountDue = totalAmount;

      // Parse phone number from E.164 format (e.g., +1234567890) to country code and number
      let phoneNumberCountryCode: string | null = null;
      let phoneNumber: string | null = null;
      
      if (formData.phoneNumber && formData.phoneNumber.trim()) {
        const phoneValue = formData.phoneNumber.trim();
        // PhoneInput returns E.164 format (e.g., +1234567890)
        // Extract country code (1-3 digits after +) and remaining number
        // Common country codes: 1 (US/CA), 44 (UK), 33 (FR), 49 (DE), etc.
        const match = phoneValue.match(/^\+(\d{1,3})(.*)$/);
        if (match) {
          phoneNumberCountryCode = `+${match[1]}`;
          phoneNumber = match[2].trim() || null;
        } else {
          // If no + prefix, treat as number without country code
          phoneNumber = phoneValue;
        }
      }

      const invoiceData: CreateInvoiceRequest = {
        companyName: formData.companyName || '',
        primaryName: formData.primaryName || '',
        email: formData.email || '',
        phoneNumberCountryCode: phoneNumberCountryCode,
        phoneNumber: phoneNumber,
        billingAddress: formData.billingAddress || null,
        totalAmount: totalAmount || 0,
        amountBilled: amountBilled || 0,
        amountDue: amountDue || 0,
        billedOnDate: convertDate(formData.billedOnDate) || new Date().toISOString(),
        dueDate: convertDate(formData.dueDate) || new Date().toISOString(),
        status: formData.status || 'Draft',
        invoiceNotes: formData.invoiceNotes || null,
        contractId: formData.contractId || null,
        packageSold: formData.packageSold || null,
        contractValue: formData.contractValue ? convertPrice(formData.contractValue) : null,
        contractStartDate: formData.startDate ? convertDate(formData.startDate) : null,
        contractEndDate: formData.endDate ? convertDate(formData.endDate) : null,
        invoiceItems: formData.invoiceItems.map(item => ({
          id: null,
          item: item.item || null,
          qty: parseFloat(item.qty) || null,
          price: convertPrice(item.price),
        })),
      };

      if (editingInvoice) {
        // Update invoice
        const response = await invoicesApi.updateInvoice(editingInvoice.id, invoiceData);
        if (response.isSuccess) {
          success('Invoice updated successfully!');
          await fetchInvoices();
          setIsCreateModalOpen(false);
          setEditingInvoice(null);
          setEditFormData(null);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to update invoice';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        // Create invoice
        const response = await invoicesApi.createInvoice(invoiceData);
        if (response.isSuccess) {
          success('Invoice created successfully!');
          await fetchInvoices();
          setIsCreateModalOpen(false);
        } else {
          const errorMessage = response.message || response.errors?.[0] || 'Failed to create invoice';
          error(errorMessage);
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to save invoice. Please try again.';
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
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingInvoice(null);
          setEditFormData(null);
        }}
        onSubmit={handleCreateInvoice}
        initialData={editFormData}
        isEditMode={!!editingInvoice}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Invoice</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteInvoiceId(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
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
                                {invoice.invoiceNumber || '-'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-primary hover:underline text-sm font-medium">
                                  {invoice.primaryName || invoice.companyName || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(invoice.amountBilled)}
                              </td>
                              <td className="px-4 py-3">
                                {invoice.status ? (
                                  <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-medium rounded-full`}>
                                    {invoice.status}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(invoice.amountDue)}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <InvoiceActionsDropdown
                                  invoiceId={invoice.id}
                                  onView={() => handleInvoiceClick(invoice)}
                                  onEdit={() => openEditModal(invoice)}
                                  onDelete={() => setDeleteInvoiceId(invoice.id)}
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


