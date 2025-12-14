'use client';

import React, { useEffect } from 'react';
import { HiX, HiDotsVertical } from 'react-icons/hi';

interface InvoiceDetail {
  id: string;
  invoiceId: string;
  totalAmount: string;
  balanceDue: string;
  dueDate: string;
  status: string;
  company: string;
  primaryContact: string;
  email: string;
  phone: string;
  billingAddress: string;
  contractId: string;
  packageSold: string;
  contractValue: string;
  contractStart: string;
  contractEnd: string;
  invoiceItems: {
    item: string;
    qty: number;
    price: string;
    total: string;
  }[];
  invoiceNote: string;
  ownerName: string;
  ownerTitle: string;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDetail | null;
}

export default function InvoiceDetailModal({ isOpen, onClose, invoice }: InvoiceDetailModalProps) {
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

  if (!isOpen || !invoice) return null;

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

  const statusColors = getStatusColor(invoice.status);

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
          <h2 className="text-lg font-semibold text-gray-900">{invoice.invoiceId}</h2>
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
              <h3 className="text-2xl font-bold text-gray-900">{invoice.invoiceId}</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HiDotsVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-sm font-medium text-gray-900">{invoice.totalAmount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Balance Due</p>
                <p className="text-sm font-medium text-gray-900">{invoice.balanceDue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{invoice.dueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 ${statusColors.bg} ${statusColors.text} text-sm font-medium rounded`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">CUSTOMER INFORMATION</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm font-medium text-gray-900">{invoice.company}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Primary Contact</p>
                <p className="text-sm font-medium text-gray-900">{invoice.primaryContact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{invoice.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{invoice.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Billing Address</p>
                <p className="text-sm font-medium text-gray-900">{invoice.billingAddress}</p>
              </div>
            </div>
          </div>

          {/* Related Contact (Contract Details) */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">RELATED CONTACT</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract ID</p>
                <a 
                  href={`/sales/contracts/${invoice.contractId}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {invoice.contractId}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Package Sold</p>
                <p className="text-sm font-medium text-gray-900">{invoice.packageSold}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract Value</p>
                <p className="text-sm font-medium text-gray-900">{invoice.contractValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract Start</p>
                <p className="text-sm font-medium text-gray-900">{invoice.contractStart}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contract End</p>
                <p className="text-sm font-medium text-gray-900">{invoice.contractEnd}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE ITEMS</h4>
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
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.qty}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.price}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Note */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE NOTE</h4>
            <p className="text-sm text-gray-900">{invoice.invoiceNote}</p>
          </div>

          {/* Invoice Owner */}
          <div className="pt-6 border-t border-gray-200 pb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">INVOICE OWNER</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{invoice.ownerName}</p>
                <p className="text-xs text-gray-500">{invoice.ownerTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
