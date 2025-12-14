'use client';

import React, { useState, useEffect } from 'react';
import { HiX, HiChevronUp, HiChevronDown, HiPlus } from 'react-icons/hi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { Value } from 'react-phone-number-input';
import { contractsApi } from '@/lib/api-client';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceFormData) => Promise<void>;
  initialData?: CreateInvoiceFormData | null;
  isEditMode?: boolean;
}

export interface CreateInvoiceFormData {
  companyName: string;
  primaryName: string;
  email: string;
  phoneNumber: string;
  billingAddress: string;
  packageSold: string;
  contractValue: string;
  startDate: string;
  endDate: string;
  status: string;
  invoiceNotes: string;
  billedOnDate: string;
  dueDate: string;
  contractId: string;
  invoiceItems: {
    item: string;
    qty: string;
    price: string;
    total: string;
  }[];
}

interface Contract {
  id: string;
  contID?: string;
  status: string | null;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSubmit, initialData, isEditMode = false }: CreateInvoiceModalProps) {
  const [isCustomerInfoExpanded, setIsCustomerInfoExpanded] = useState(true);
  const [isRelatedContactExpanded, setIsRelatedContactExpanded] = useState(true);
  const [isInvoiceItemsExpanded, setIsInvoiceItemsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', qty: '', price: '' });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  
  const [formData, setFormData] = useState<CreateInvoiceFormData>({
    companyName: '',
    primaryName: '',
    email: '',
    phoneNumber: '',
    billingAddress: '',
    packageSold: '',
    contractValue: '£0,000',
    startDate: '01/01/2025',
    endDate: '30/12/2025',
    status: '',
    invoiceNotes: '',
    billedOnDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    dueDate: '30/12/2025',
    contractId: '',
    invoiceItems: [],
  });

  const handleChange = (field: keyof CreateInvoiceFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      // Fetch all contracts without status filter
      const response = await contractsApi.getContracts(1, 100, null);
      if (response.isSuccess && response.data) {
        setContracts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Populate form when initialData changes (for edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        companyName: '',
        primaryName: '',
        email: '',
        phoneNumber: '',
        billingAddress: '',
        packageSold: '',
        contractValue: '£0,000',
        startDate: '01/01/2025',
        endDate: '30/12/2025',
        status: '',
        invoiceNotes: '',
        billedOnDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        dueDate: '30/12/2025',
        contractId: '',
        invoiceItems: [],
      });
      setNewItem({ item: '', qty: '', price: '' });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      // Fetch all contracts when modal opens
      fetchContracts();
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (!newItem.item || !newItem.qty || !newItem.price) return;
    
    const qtyNum = parseFloat(newItem.qty) || 0;
    const priceNum = parseFloat(newItem.price.replace(/[£,]/g, '')) || 0;
    const total = qtyNum * priceNum;
    
    const formattedTotal = `£${total.toLocaleString('en-GB')}`;
    const formattedPrice = newItem.price.startsWith('£') ? newItem.price : `£${newItem.price}`;
    
    setFormData((prev) => ({
      ...prev,
      invoiceItems: [
        ...prev.invoiceItems,
        {
          item: newItem.item,
          qty: newItem.qty,
          price: formattedPrice,
          total: formattedTotal,
        },
      ],
    }));
    
    setNewItem({ item: '', qty: '', price: '' });
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invoiceItems: prev.invoiceItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyName.trim() || !formData.primaryName.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        companyName: '',
        primaryName: '',
        email: '',
        phoneNumber: '',
        billingAddress: '',
        packageSold: '',
        contractValue: '£0,000',
        startDate: '01/01/2025',
        endDate: '30/12/2025',
        status: '',
        invoiceNotes: '',
        billedOnDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        dueDate: '30/12/2025',
        contractId: '',
        invoiceItems: [],
      });
      setNewItem({ item: '', qty: '', price: '' });
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.companyName.trim() && formData.primaryName.trim() && formData.email.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Customer Information Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsCustomerInfoExpanded(!isCustomerInfoExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                {isCustomerInfoExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isCustomerInfoExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Company name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Primary name</label>
                    <input
                      type="text"
                      value={formData.primaryName}
                      onChange={(e) => handleChange('primaryName', e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="johndoe@slow.co"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={formData.phoneNumber as Value}
                        onChange={(value) => handleChange('phoneNumber', value || '')}
                        placeholder="Enter phone number"
                        className="phone-input-wrapper"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Billing address</label>
                    <input
                      type="text"
                      value={formData.billingAddress}
                      onChange={(e) => handleChange('billingAddress', e.target.value)}
                      placeholder="Enter billing address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Related Contact Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsRelatedContactExpanded(!isRelatedContactExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Related Contact</h3>
                {isRelatedContactExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isRelatedContactExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none pr-8"
                      >
                        <option value="">Select an option</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="partially paid">Partially Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contract ID</label>
                    <div className="relative">
                      <select
                        value={formData.contractId}
                        onChange={(e) => handleChange('contractId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none pr-8"
                        disabled={loadingContracts}
                      >
                        <option value="">Select a contract</option>
                        {contracts.map((contract) => (
                          <option key={contract.id} value={contract.contID || contract.id}>
                            {contract.contID || `CT-${contract.id.substring(0, 8)}`}
                          </option>
                        ))}
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Package sold</label>
                    <div className="relative">
                      <select
                        value={formData.packageSold}
                        onChange={(e) => handleChange('packageSold', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none pr-8"
                      >
                        <option value="">Select an option</option>
                        <option value="Corporate Hospitality Package">Corporate Hospitality Package</option>
                        <option value="Sponsorship Package">Sponsorship Package</option>
                        <option value="Digital Package">Digital Package</option>
                        <option value="Hospitality Package">Hospitality Package</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contract value</label>
                    <input
                      type="text"
                      value={formData.contractValue}
                      onChange={(e) => handleChange('contractValue', e.target.value)}
                      placeholder="£0,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contract Start Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.startDate}
                          onChange={(e) => handleChange('startDate', e.target.value)}
                          placeholder="01/01/2025"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm pr-10"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contract End Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.endDate}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                          placeholder="30/12/2025"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm pr-10"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Billed On Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.billedOnDate}
                          onChange={(e) => handleChange('billedOnDate', e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm pr-10"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.dueDate}
                          onChange={(e) => handleChange('dueDate', e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm pr-10"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Invoice Notes</label>
                    <textarea
                      value={formData.invoiceNotes}
                      onChange={(e) => handleChange('invoiceNotes', e.target.value)}
                      placeholder="Enter invoice notes (optional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Items Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsInvoiceItemsExpanded(!isInvoiceItemsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                {isInvoiceItemsExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isInvoiceItemsExpanded && (
                <div className="p-4 bg-white space-y-4">
                  {/* Invoice Items Table */}
                  {formData.invoiceItems.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.invoiceItems.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                              <td className="px-4 py-3 text-sm text-gray-900">{item.item}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.qty}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.price}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{item.total}</td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add New Item Input Row */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Item</label>
                        <input
                          type="text"
                          value={newItem.item}
                          onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                          placeholder="Input"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <div className="relative">
                          <select
                            value={newItem.qty}
                            onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none pr-8"
                          >
                            <option value="">Select</option>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num.toString()}>
                                {num}
                              </option>
                            ))}
                          </select>
                          <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price</label>
                        <input
                          type="text"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          placeholder="Input"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Total</label>
                        <input
                          type="text"
                          value={
                            newItem.qty && newItem.price
                              ? `£${(parseFloat(newItem.qty) * parseFloat(newItem.price.replace(/[£,]/g, '')) || 0).toLocaleString('en-GB')}`
                              : '£0'
                          }
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                ${isFormValid && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
