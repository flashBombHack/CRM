'use client';

import React, { useState } from 'react';
import { HiX, HiChevronUp, HiChevronDown, HiSearch } from 'react-icons/hi';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConvertLeadFormData) => Promise<void>;
  leadData?: {
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
  };
}

export interface ConvertLeadFormData {
  accountOption: 'create' | 'existing';
  accountName?: string;
  accountSearch?: string;
  contactOption: 'create' | 'existing';
  salutation?: string;
  firstName?: string;
  lastName?: string;
  contactSearch?: string;
  opportunityOption: 'create' | 'existing';
  opportunityName?: string;
  estimatedValue?: string;
  startDate?: string;
  opportunitySearch?: string;
  productSelected?: string;
  source?: string;
  leadNote?: string;
}

export default function ConvertLeadModal({ isOpen, onClose, onSubmit, leadData }: ConvertLeadModalProps) {
  const [isAccountExpanded, setIsAccountExpanded] = useState(true);
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isOpportunityExpanded, setIsOpportunityExpanded] = useState(true);
  const [isProductExpanded, setIsProductExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ConvertLeadFormData>({
    accountOption: 'create',
    accountName: leadData?.companyName || 'Walker Media Group',
    accountSearch: '',
    contactOption: 'create',
    salutation: 'Mr',
    firstName: leadData?.firstName || 'James',
    lastName: leadData?.lastName || 'Walker',
    contactSearch: '',
    opportunityOption: 'create',
    opportunityName: 'Freelancer',
    estimatedValue: '£12,000',
    startDate: '20/09/2025',
    opportunitySearch: '',
    productSelected: 'Hospitaity package',
    source: '',
    leadNote: 'Interested in matchday hospitality',
  });

  const handleChange = (field: keyof ConvertLeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (section: 'account' | 'contact' | 'opportunity', option: 'create' | 'existing') => {
    if (section === 'account') {
      setFormData((prev) => ({ ...prev, accountOption: option }));
    } else if (section === 'contact') {
      setFormData((prev) => ({ ...prev, contactOption: option }));
    } else if (section === 'opportunity') {
      setFormData((prev) => ({ ...prev, opportunityOption: option }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Convert Lead</h2>
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
            {/* Account Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsAccountExpanded(!isAccountExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Account</h3>
                {isAccountExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isAccountExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-12 relative">
                    {/* Left Column - Create new account */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="create-account"
                          name="account-option"
                          checked={formData.accountOption === 'create'}
                          onChange={() => handleOptionChange('account', 'create')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="create-account" className="text-sm font-medium text-gray-700">
                          Create new account
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <label className="block text-xs text-gray-500 mb-1">Account name</label>
                        <input
                          type="text"
                          value={formData.accountName}
                          onChange={(e) => handleChange('accountName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                  {/* OR Separator */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                    <div className="px-3 text-xs font-medium text-gray-500">OR</div>
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                  </div>

                    {/* Right Column - Choose existing account */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="existing-account"
                          name="account-option"
                          checked={formData.accountOption === 'existing'}
                          onChange={() => handleOptionChange('account', 'existing')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="existing-account" className="text-sm font-medium text-gray-700">
                          Choose existing account
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <label className="block text-xs text-gray-500 mb-1">Account search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.accountSearch}
                            onChange={(e) => handleChange('accountSearch', e.target.value)}
                            placeholder="Search for matching accounts"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                          <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsContactExpanded(!isContactExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Contact</h3>
                {isContactExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isContactExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-12 relative">
                    {/* Left Column - Create new contact */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="create-contact"
                          name="contact-option"
                          checked={formData.contactOption === 'create'}
                          onChange={() => handleOptionChange('contact', 'create')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="create-contact" className="text-sm font-medium text-gray-700">
                          Create new contact
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Salutation</label>
                            <div className="relative">
                              <select
                                value={formData.salutation}
                                onChange={(e) => handleChange('salutation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                              >
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Dr">Dr</option>
                              </select>
                              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">First name</label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleChange('firstName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Last name</label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleChange('lastName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* OR Separator */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                    <div className="px-3 text-xs font-medium text-gray-500">OR</div>
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                  </div>

                    {/* Right Column - Choose existing contact */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="existing-contact"
                          name="contact-option"
                          checked={formData.contactOption === 'existing'}
                          onChange={() => handleOptionChange('contact', 'existing')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="existing-contact" className="text-sm font-medium text-gray-700">
                          Choose existing contact
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <label className="block text-xs text-gray-500 mb-1">Contact search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.contactSearch}
                            onChange={(e) => handleChange('contactSearch', e.target.value)}
                            placeholder="Search for matching accounts"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                          <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opportunity Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsOpportunityExpanded(!isOpportunityExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Opportunity</h3>
                {isOpportunityExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isOpportunityExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-12 relative">
                    {/* Left Column - Create new opportunity */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="create-opportunity"
                          name="opportunity-option"
                          checked={formData.opportunityOption === 'create'}
                          onChange={() => handleOptionChange('opportunity', 'create')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="create-opportunity" className="text-sm font-medium text-gray-700">
                          Create new opportunity
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Opportunity name</label>
                            <input
                              type="text"
                              value={formData.opportunityName}
                              onChange={(e) => handleChange('opportunityName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Estimated value</label>
                            <input
                              type="text"
                              value={formData.estimatedValue}
                              onChange={(e) => handleChange('estimatedValue', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
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
                        </div>
                      </div>
                    </div>

                  {/* OR Separator */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                    <div className="px-3 text-xs font-medium text-gray-500">OR</div>
                    <div className="w-px h-8" style={{ backgroundColor: '#E1E3E6' }}></div>
                  </div>

                    {/* Right Column - Choose existing opportunity */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="existing-opportunity"
                          name="opportunity-option"
                          checked={formData.opportunityOption === 'existing'}
                          onChange={() => handleOptionChange('opportunity', 'existing')}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="existing-opportunity" className="text-sm font-medium text-gray-700">
                          Choose existing opportunity
                        </label>
                      </div>
                      <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                        <label className="block text-xs text-gray-500 mb-1">Opportunity search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.opportunitySearch}
                            onChange={(e) => handleChange('opportunitySearch', e.target.value)}
                            placeholder="Search for matching accounts"
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                          <HiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Section */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E1E3E6' }}>
              {/* Header */}
              <button
                type="button"
                onClick={() => setIsProductExpanded(!isProductExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left rounded-t-lg"
                style={{ backgroundColor: '#F7F8F8', borderBottom: '1px solid #E1E3E6' }}
              >
                <h3 className="text-lg font-medium text-gray-900">Product</h3>
                {isProductExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isProductExpanded && (
                <div className="p-4 bg-white">
                  <div className="rounded-lg border p-3" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Product Selected</label>
                        <div className="relative">
                          <select
                            value={formData.productSelected}
                            onChange={(e) => handleChange('productSelected', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 text-sm"
                          >
                            <option value="Hospitaity package">Hospitaity package</option>
                            <option value="Box / Lounge">Box / Lounge</option>
                            <option value="Sponsorship Asset">Sponsorship Asset</option>
                          </select>
                          <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Source</label>
                        <input
                          type="text"
                          value={formData.source}
                          onChange={(e) => handleChange('source', e.target.value)}
                          placeholder="Website enquiry"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lead note</label>
                        <input
                          type="text"
                          value={formData.leadNote}
                          onChange={(e) => handleChange('leadNote', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


