'use client';

import React, { useState, useEffect } from 'react';
import { HiX, HiChevronUp, HiChevronDown } from 'react-icons/hi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { Value } from 'react-phone-number-input';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadFormData) => Promise<void>;
  initialData?: CreateLeadFormData | null;
  isEditMode?: boolean;
}

export interface CreateLeadFormData {
  firstName: string;
  role: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  website: string;
  preferredContactMethod: string;
  country: string;
  city: string;
  source: string;
  status: string;
  productInterest: string[];
  numberOfEmployees: string;
  estimatedPotential: string;
}

export default function CreateLeadModal({ isOpen, onClose, onSubmit, initialData, isEditMode = false }: CreateLeadModalProps) {
  const [isContactInfoExpanded, setIsContactInfoExpanded] = useState(true);
  const [isOtherInfoExpanded, setIsOtherInfoExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateLeadFormData>({
    firstName: '',
    role: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    website: '',
    preferredContactMethod: '',
    country: '',
    city: '',
    source: '',
    status: '',
    productInterest: [],
    numberOfEmployees: '',
    estimatedPotential: '',
  });

  // Populate form when initialData changes (for edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        role: initialData.role || '',
        companyName: initialData.companyName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        website: initialData.website || '',
        preferredContactMethod: initialData.preferredContactMethod || '',
        country: initialData.country || '',
        city: initialData.city || '',
        source: initialData.source || '',
        status: initialData.status || '',
        productInterest: initialData.productInterest || [],
        numberOfEmployees: initialData.numberOfEmployees || '',
        estimatedPotential: initialData.estimatedPotential || '',
      });
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        firstName: '',
        role: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        website: '',
        preferredContactMethod: '',
        country: '',
        city: '',
        source: '',
        status: '',
        productInterest: [],
        numberOfEmployees: '',
        estimatedPotential: '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (field: keyof CreateLeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      return;
    }
    if (!formData.companyName.trim()) {
      return;
    }
    if (!formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        firstName: '',
        role: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        website: '',
        preferredContactMethod: '',
        country: '',
        city: '',
        source: '',
        status: '',
        productInterest: [],
        numberOfEmployees: '',
        estimatedPotential: '',
      });
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.firstName.trim() && formData.companyName.trim() && formData.email.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit Lead' : 'Create New Lead'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Contact Information Section */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsContactInfoExpanded(!isContactInfoExpanded)}
                className="w-full flex items-center justify-between mb-4 text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                {isContactInfoExpanded ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isContactInfoExpanded && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      placeholder="Enter role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="Enter website"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred contact method
                    </label>
                    <select
                      value={formData.preferredContactMethod}
                      onChange={(e) => handleChange('preferredContactMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select an option</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select an option</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select an option</option>
                      <option value="New York">New York</option>
                      <option value="London">London</option>
                      <option value="Toronto">Toronto</option>
                      <option value="Sydney">Sydney</option>
                      <option value="Berlin">Berlin</option>
                      <option value="Paris">Paris</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Other Information Section */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsOtherInfoExpanded(!isOtherInfoExpanded)}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 text-left bg-[#FAFAFA] rounded-t-lg"
                >
                  <h3 className="text-base font-semibold text-gray-900">Other Information</h3>
                  {isOtherInfoExpanded ? (
                    <HiChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <HiChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {isOtherInfoExpanded && (
                  <div className="px-4 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-normal text-gray-700 mb-1">
                        No of employees
                      </label>
                      <div className="relative">
                        <select
                          value={formData.numberOfEmployees}
                          onChange={(e) => handleChange('numberOfEmployees', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10"
                        >
                          <option value="">Select an option</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="501-1000">501-1000</option>
                          <option value="1000+">1000+</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <HiChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-gray-700 mb-1">
                        Estimated potential
                      </label>
                      <input
                        type="text"
                        value={formData.estimatedPotential}
                        onChange={(e) => handleChange('estimatedPotential', e.target.value)}
                        placeholder="£0,000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-gray-700 mb-1">
                        Lead status
                      </label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10"
                        >
                          <option value="">Select an option</option>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="nurturing">Nurturing</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <HiChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-normal text-gray-700 mb-1">
                        Lead Source
                      </label>
                      <div className="relative">
                        <select
                          value={formData.source}
                          onChange={(e) => handleChange('source', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10"
                        >
                          <option value="">Select an option</option>
                          <option value="website">Website</option>
                          <option value="referral">Referral</option>
                          <option value="social-media">Social Media</option>
                          <option value="email-campaign">Email Campaign</option>
                          <option value="cold-call">Cold Call</option>
                          <option value="trade-show">Trade Show</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <HiChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

