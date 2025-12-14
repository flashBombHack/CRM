'use client';

import React, { useState } from 'react';
import { HiX, HiChevronUp, HiChevronDown } from 'react-icons/hi';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProposalFormData) => Promise<void>;
}

export interface CreateProposalFormData {
  package: string;
  terms: string;
  startDate: string;
  endDate: string;
  price: string;
  discount: string;
  total: string;
}

export default function CreateProposalModal({ isOpen, onClose, onSubmit }: CreateProposalModalProps) {
  const [isProposalDetailsExpanded, setIsProposalDetailsExpanded] = useState(true);
  const [isPriceDetailsExpanded, setIsPriceDetailsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProposalFormData>({
    package: '',
    terms: '',
    startDate: '01/01/2025',
    endDate: '30/12/2025',
    price: '£0',
    discount: '',
    total: '£0',
  });

  const handleChange = (field: keyof CreateProposalFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Calculate total when price or discount changes
      if (field === 'price' || field === 'discount') {
        const priceValue = field === 'price' ? value : prev.price;
        const discountValue = field === 'discount' ? value : prev.discount;
        
        // Extract numeric value from price (remove £ and commas)
        const priceNum = parseFloat(priceValue.replace(/[£,]/g, '')) || 0;
        
        // Calculate discount amount if discount is a percentage
        let discountAmount = 0;
        if (discountValue) {
          if (discountValue.includes('%')) {
            const discountPercent = parseFloat(discountValue.replace('%', '')) || 0;
            discountAmount = (priceNum * discountPercent) / 100;
          } else {
            discountAmount = parseFloat(discountValue.replace(/[£,]/g, '')) || 0;
          }
        }
        
        const total = priceNum - discountAmount;
        updated.total = `£${total.toLocaleString('en-GB')}`;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.package.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        package: '',
        terms: '',
        startDate: '01/01/2025',
        endDate: '30/12/2025',
        price: '£0',
        discount: '',
        total: '£0',
      });
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.package.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Proposal</h2>
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
            {/* Proposal Details Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsProposalDetailsExpanded(!isProposalDetailsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Proposal Details</h3>
                {isProposalDetailsExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isProposalDetailsExpanded && (
                <div className="p-4 bg-white space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Select Pacakage</label>
                    <div className="relative">
                      <select
                        value={formData.package}
                        onChange={(e) => handleChange('package', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="basic">Basic Package</option>
                        <option value="standard">Standard Package</option>
                        <option value="premium">Premium Package</option>
                        <option value="enterprise">Enterprise Package</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Terms</label>
                    <div className="relative">
                      <select
                        value={formData.terms}
                        onChange={(e) => handleChange('terms', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                      >
                        <option value="">Select an option</option>
                        <option value="net-15">Net 15</option>
                        <option value="net-30">Net 30</option>
                        <option value="net-45">Net 45</option>
                        <option value="net-60">Net 60</option>
                        <option value="due-on-receipt">Due on Receipt</option>
                      </select>
                      <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

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
              )}
            </div>

            {/* Price Details Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsPriceDetailsExpanded(!isPriceDetailsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Price Details</h3>
                {isPriceDetailsExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isPriceDetailsExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Price</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        placeholder="£0"
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
                          <option value="">Select</option>
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
                      <label className="block text-xs text-gray-500 mb-1">Total</label>
                      <input
                        type="text"
                        value={formData.total}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none text-sm"
                      />
                    </div>
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
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
