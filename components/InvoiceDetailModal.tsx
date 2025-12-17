'use client';

import React, { useEffect, useState } from 'react';
import { HiX, HiDotsVertical } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { contractsApi } from '@/lib/api-client';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string | null;
  companyName: string | null;
  primaryName: string | null;
  email: string | null;
  phoneNumberCountryCode: string | null;
  phoneNumber: string | null;
  billingAddress: string | null;
  totalAmount: number;
  amountBilled: number;
  amountDue: number;
  billedOnDate: string;
  dueDate: string;
  status: string | null;
  contractId: string | null;
  packageSold: string | null;
  contractValue: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  invoiceNotes: string | null;
  invoiceItems: {
    id: string;
    invoiceId: string;
    itemDescription: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  dateCreated: string;
  dateModified: string;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail | null;
}

export default function InvoiceDetailModal({ isOpen, onClose, invoice }: InvoiceDetailModalProps) {
  const router = useRouter();
  const [contractContID, setContractContID] = useState<string | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch contract contID when invoice has a contractId
  useEffect(() => {
    const fetchContractContID = async () => {
      if (!invoice?.contractId) {
        setContractContID(null);
        return;
      }

      // Check if contractId is already a contID format (starts with CT-)
      if (invoice.contractId.startsWith('CT-')) {
        setContractContID(invoice.contractId);
        return;
      }

      // Otherwise, fetch the contract to get the contID
      try {
        setLoadingContract(true);
        const response = await contractsApi.getContractById(invoice.contractId);
        if (response.isSuccess && response.data) {
          setContractContID(response.data.contID || invoice.contractId);
        } else {
          setContractContID(invoice.contractId);
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        setContractContID(invoice.contractId);
      } finally {
        setLoadingContract(false);
      }
    };

    if (isOpen && invoice) {
      fetchContractContID();
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return '-';
    return `£${price.toLocaleString('en-GB')}`;
  };

  const formatPhoneNumber = (countryCode: string | null, phoneNumber: string | null): string => {
    if (!phoneNumber) return '-';
    return countryCode ? `${countryCode} ${phoneNumber}` : phoneNumber;
  };

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

  const statusColors = getStatusColor(invoice.status);
  const invoiceId = invoice.invoiceNumber || (invoice.id ? `INV-${invoice.id.substring(0, 8)}` : 'N/A');

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-50"
        onClick={onClose}
      />

      {/* Side Modal - Full Height */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white shadow-2xl z-[60] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-center z-10">
          <h2 className="text-lg font-semibold text-gray-900">{invoiceId}</h2>
          <button
            onClick={onClose}
            className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Invoice Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{invoiceId}</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HiDotsVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(invoice.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount Billed</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(invoice.amountBilled)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount Due</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(invoice.amountDue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Billed On Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(invoice.billedOnDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {invoice.status ? (
                  <span className={`inline-block px-3 py-1 ${statusColors.bg} ${statusColors.text} text-sm font-medium rounded`}>
                    {invoice.status}
                  </span>
                ) : (
                  <p className="text-sm font-medium text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">CUSTOMER INFORMATION</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm font-medium text-gray-900">{invoice.companyName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Primary Contact</p>
                <p className="text-sm font-medium text-gray-900">{invoice.primaryName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{invoice.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{formatPhoneNumber(invoice.phoneNumberCountryCode, invoice.phoneNumber)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Billing Address</p>
                <p className="text-sm font-medium text-gray-900">{invoice.billingAddress || '-'}</p>
              </div>
            </div>
          </div>

          {/* Related Contract */}
          {invoice.contractId && (
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">RELATED CONTRACT</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract ID</p>
                  {loadingContract ? (
                    <p className="text-sm font-medium text-gray-400">Loading...</p>
                  ) : (
                    <button
                      onClick={() => {
                        // Store contractId in sessionStorage to open modal on contracts page
                        if (typeof window !== 'undefined' && invoice.contractId) {
                          sessionStorage.setItem('openContractId', invoice.contractId);
                          router.push('/sales/contracts');
                          onClose(); // Close invoice modal
                        }
                      }}
                      className="text-sm font-medium text-primary hover:underline cursor-pointer text-left"
                    >
                      {contractContID || invoice.contractId}
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Package Sold</p>
                  <p className="text-sm font-medium text-gray-900">{invoice.packageSold || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract Value</p>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(invoice.contractValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract Start</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(invoice.contractStartDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract End</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(invoice.contractEndDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE ITEMS</h4>
            {invoice.invoiceItems && invoice.invoiceItems.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoiceItems.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemDescription || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No invoice items</p>
            )}
          </div>

          {/* Invoice Note */}
          {invoice.invoiceNotes && (
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE NOTE</h4>
              <p className="text-sm text-gray-900">{invoice.invoiceNotes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="pt-6 border-t border-gray-200 pb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">DATES</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dateCreated)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dateModified)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


