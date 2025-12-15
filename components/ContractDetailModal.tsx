'use client';

import React, { useEffect } from 'react';
import { HiX, HiDotsVertical } from 'react-icons/hi';

interface ContractDetail {
  id: string;
  contID?: string;
  name: string | null;
  companyName: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: string | null;
  details: string | null;
  season: string | null;
  startDate: string | null;
  endDate: string | null;
  totalAgreedPrice: number | null;
  discount: string | null;
  finalPrice: number | null;
  cvResumeBase64: string | null;
  cvResumeFileName: string | null;
  contractInvoiceItems: {
    id: string;
    contractId: string;
    installment: string | null;
    price: number;
    dueDate: string;
  }[];
  dateCreated: string;
  dateModified: string;
}

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractDetail | null;
}

export default function ContractDetailModal({ isOpen, onClose, contract }: ContractDetailModalProps) {
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

  if (!isOpen || !contract) return null;

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

  const statusColors = getStatusColor(contract.status);
  const contractId = contract.contID || (contract.id ? `CT-${contract.id.substring(0, 8)}` : 'N/A');

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">{contractId}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Contract Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{contractId}</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HiDotsVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                {contract.status ? (
                  <span className={`inline-block px-3 py-1 ${statusColors.bg} ${statusColors.text} text-sm font-medium rounded`}>
                    {contract.status}
                  </span>
                ) : (
                  <p className="text-sm font-medium text-gray-400">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Agreed Price</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(contract.totalAgreedPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Discount</p>
                <p className="text-sm font-medium text-gray-900">{contract.discount || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Final Price</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(contract.finalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">CLIENT DETAILS</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900">{contract.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm font-medium text-gray-900">{contract.companyName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{contract.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{contract.phoneNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">CONTRACT DETAILS</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Season</p>
                <p className="text-sm font-medium text-gray-900">{contract.season || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract Start</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(contract.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract End</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(contract.endDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(contract.dateCreated)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(contract.dateModified)}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE ITEMS</h4>
            {contract.contractInvoiceItems && contract.contractInvoiceItems.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Instalment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.contractInvoiceItems.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.installment || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No invoice items</p>
            )}
          </div>

          {/* Documents */}
          {contract.cvResumeFileName && (
            <div className="pt-6 border-t border-gray-200 pb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">DOCUMENTS</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-900">{contract.cvResumeFileName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

