'use client';

import React, { useState, useEffect } from 'react';
import { HiX, HiChevronUp, HiChevronDown } from 'react-icons/hi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { Value } from 'react-phone-number-input';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContractFormData) => Promise<void>;
  initialData?: CreateContractFormData | null;
  isEditMode?: boolean;
}

export interface CreateContractFormData {
  name: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  contractDetails: string;
  season: string;
  startDate: string;
  endDate: string;
  totalAgreedPrice: string;
  discount: string;
  finalPrice: string;
  invoiceItems: {
    instalment: string;
    price: string;
    dueDate: string;
  }[];
  cvResume: File | null;
}

export default function CreateContractModal({ isOpen, onClose, onSubmit, initialData, isEditMode = false }: CreateContractModalProps) {
  const [isClientInfoExpanded, setIsClientInfoExpanded] = useState(true);
  const [isContractDetailsExpanded, setIsContractDetailsExpanded] = useState(true);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);
  const [isInvoiceItemsExpanded, setIsInvoiceItemsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateContractFormData>({
    name: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    contractDetails: '',
    status: '',
    season: '',
    startDate: '01/01/2025',
    endDate: '30/12/2025',
    totalAgreedPrice: '£0,000',
    discount: '',
    finalPrice: '£0,000',
    invoiceItems: [
      { instalment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
      { instalment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
      { instalment: 'Final payment', price: '£0', dueDate: '12 January,,2026' },
    ],
    cvResume: null,
  });

  // Populate form when initialData changes (for edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        companyName: initialData.companyName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        contractDetails: initialData.contractDetails || '',
        status: initialData.status || '',
        season: initialData.season || '',
        startDate: initialData.startDate || '01/01/2025',
        endDate: initialData.endDate || '30/12/2025',
        totalAgreedPrice: initialData.totalAgreedPrice || '£0,000',
        discount: initialData.discount || '',
        finalPrice: initialData.finalPrice || '£0,000',
        invoiceItems: initialData.invoiceItems || [
          { instalment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
          { instalment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
          { instalment: 'Final payment', price: '£0', dueDate: '12 January,,2026' },
        ],
        cvResume: initialData.cvResume || null,
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        contractDetails: '',
        status: '',
        season: '',
        startDate: '01/01/2025',
        endDate: '30/12/2025',
        totalAgreedPrice: '£0,000',
        discount: '',
        finalPrice: '£0,000',
        invoiceItems: [
          { instalment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
          { instalment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
          { instalment: 'Final payment', price: '£0', dueDate: '12 January,,2026' },
        ],
        cvResume: null,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof CreateContractFormData, value: string | File | null) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Calculate final price when total agreed price or discount changes
      if (field === 'totalAgreedPrice' || field === 'discount') {
        const priceValue = field === 'totalAgreedPrice' ? value : prev.totalAgreedPrice;
        const discountValue = field === 'discount' ? value : prev.discount;
        
        // Extract numeric value from price (remove £, commas, and "000")
        const priceStr = priceValue && typeof priceValue === 'string' ? priceValue : prev.totalAgreedPrice || '0';
        const priceNum = parseFloat(priceStr.replace(/[£,]/g, '').replace('000', '')) || 0;
        
        // Calculate discount amount if discount is a percentage
        let discountAmount = 0;
        if (discountValue) {
          if (discountValue.toString().includes('%')) {
            const discountPercent = parseFloat(discountValue.toString().replace('%', '')) || 0;
            discountAmount = (priceNum * discountPercent) / 100;
          } else {
            discountAmount = parseFloat(discountValue.toString().replace(/[£,]/g, '')) || 0;
          }
        }
        
        const final = priceNum - discountAmount;
        updated.finalPrice = `£${final.toLocaleString('en-GB')},000`;
      }
      
      return updated;
    });
  };

  const handleInvoiceItemChange = (index: number, field: 'instalment' | 'price' | 'dueDate', value: string) => {
    setFormData((prev) => {
      const updatedItems = [...prev.invoiceItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, invoiceItems: updatedItems };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('File size exceeds 2MB limit. Please choose a smaller file.');
        e.target.value = ''; // Clear the input
        return;
      }
    }
    setFormData((prev) => ({ ...prev, cvResume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.companyName.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        contractDetails: '',
        season: '',
        startDate: '01/01/2025',
        endDate: '30/12/2025',
        totalAgreedPrice: '£0,000',
        discount: '',
        finalPrice: '£0,000',
        invoiceItems: [
          { instalment: 'Deposit', price: '£0', dueDate: '19 December, 2025' },
          { instalment: 'Middle payment', price: '£0', dueDate: '29 December, 2025' },
          { instalment: 'Final payment', price: '£0', dueDate: '12 January,,2026' },
        ],
        cvResume: null,
      });
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.name.trim() && formData.companyName.trim() && formData.email.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit Contract' : 'Create New Contract'}</h2>
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
            {/* Client Information Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsClientInfoExpanded(!isClientInfoExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                {isClientInfoExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isClientInfoExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

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
                </div>
              )}
            </div>

            {/* Contract Details Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsContractDetailsExpanded(!isContractDetailsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Contract Details</h3>
                {isContractDetailsExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isContractDetailsExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contract details</label>
                    <input
                      type="text"
                      value={formData.contractDetails}
                      onChange={(e) => handleChange('contractDetails', e.target.value)}
                      placeholder="<Company> — <Season> Contract"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="signed">Signed</option>
                        <option value="draft">Draft</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Season</label>
                    <div className="relative">
                      <select
                        value={formData.season}
                        onChange={(e) => handleChange('season', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="23/24">23/24 Season</option>
                        <option value="24/25">24/25 Season</option>
                        <option value="25/26">25/26 Season</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.startDate}
                          onChange={(e) => handleChange('startDate', e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.endDate}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsPricingExpanded(!isPricingExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                {isPricingExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isPricingExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Total agreed price</label>
                    <input
                      type="text"
                      value={formData.totalAgreedPrice}
                      onChange={(e) => handleChange('totalAgreedPrice', e.target.value)}
                      placeholder="£0,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Discount</label>
                    <div className="relative">
                      <select
                        value={formData.discount}
                        onChange={(e) => handleChange('discount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="5%">5%</option>
                        <option value="10%">10%</option>
                        <option value="15%">15%</option>
                        <option value="20%">20%</option>
                        <option value="25%">25%</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Final Price</label>
                    <input
                      type="text"
                      value={formData.finalPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none text-sm"
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
                <div className="p-4 bg-white">
                  <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#E1E3E6' }}>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Instalment</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Due date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.invoiceItems.map((item, index) => (
                          <tr key={index} className="border-b last:border-b-0" style={{ borderColor: '#E1E3E6' }}>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.instalment}
                                onChange={(e) => handleInvoiceItemChange(index, 'instalment', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => handleInvoiceItemChange(index, 'price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.dueDate}
                                onChange={(e) => handleInvoiceItemChange(index, 'dueDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Cv / Resume Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              <div className="px-4 py-3" style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}>
                <h3 className="text-lg font-medium text-gray-900">Cv / Resume</h3>
              </div>
              <div className="p-4 bg-white">
                <label className="block">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors" style={{ borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }}>
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Upload CSV / PNG / JPEG file here. or click to browse
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.png,.jpeg,.jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {formData.cvResume && (
                  <p className="mt-2 text-sm text-gray-600">{formData.cvResume.name}</p>
                )}
              </div>
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
