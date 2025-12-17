"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { qualificationsApi, CreateQualificationRequest } from "@/lib/api-client";
import { leadsApi } from "@/lib/api-client";
import { HiPlus, HiChevronDown, HiCheck, HiPencil, HiDocument, HiPhone } from "react-icons/hi";
import CreateLeadModal, { CreateLeadFormData } from "@/components/CreateLeadModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

interface QualificationDetail {
  id: string;
  firstName: string | null;
  role: string | null;
  companyName: string | null;
  email: string | null;
  phoneNumber: string | null;
  website: string | null;
  preferredContactMethod: string | null;
  country: string | null;
  city: string | null;
  source: string | null;
  status: string | null;
  noOfEmployees: string | null;
  estimatedPotential: number | null;
  productInterest: string[];
}

interface QualificationDetailResponse {
  isSuccess: boolean;
  message: string | null;
  data: QualificationDetail;
  errors: string[];
  responseCode: number;
}

export default function QualificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [qualification, setQualification] = useState<QualificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQualificationChecklistExpanded, setIsQualificationChecklistExpanded] = useState(true);
  const [isQualificationScoreExpanded, setIsQualificationScoreExpanded] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [isLeadSnapshotExpanded, setIsLeadSnapshotExpanded] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  const fetchQualification = async () => {
    try {
      setLoading(true);
      const response: QualificationDetailResponse = await qualificationsApi.getQualificationById(params.id as string);
      if (response.isSuccess && response.data) {
        setQualification(response.data);
      }
    } catch (error) {
      console.error("Error fetching qualification:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchQualification();
    }
  }, [params.id]);

  const prepareQualificationData = (formData: CreateLeadFormData): CreateQualificationRequest => {
    const phoneNumber = formData.phoneNumber && formData.phoneNumber.trim() 
      ? formData.phoneNumber.trim() 
      : null;

    let estimatedPotential: number | null = null;
    if (formData.estimatedPotential && formData.estimatedPotential.trim()) {
      const cleanedValue = formData.estimatedPotential
        .replace(/[£$€,]/g, '')
        .trim();
      const parsed = parseFloat(cleanedValue);
      if (!isNaN(parsed)) {
        estimatedPotential = parsed;
      }
    }

    return {
      firstName: formData.firstName,
      role: formData.role || null,
      companyName: formData.companyName,
      email: formData.email,
      phoneNumber: phoneNumber,
      website: formData.website || null,
      preferredContactMethod: formData.preferredContactMethod || null,
      country: formData.country || null,
      city: formData.city || null,
      source: formData.source || null,
      status: formData.status || null,
      noOfEmployees: formData.numberOfEmployees || null,
      estimatedPotential: estimatedPotential,
      productInterest: formData.productInterest || [],
    };
  };

  const handleEditQualification = async (formData: CreateLeadFormData) => {
    if (!qualification) return;
    
    try {
      const qualificationData = prepareQualificationData(formData);
      const response = await qualificationsApi.updateQualification(qualification.id, qualificationData);

      if (response.isSuccess) {
        success('Qualification updated successfully!');
        await fetchQualification();
        setIsEditModalOpen(false);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to update qualification';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to update qualification. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const handleCreateLead = async (formData: CreateLeadFormData) => {
    try {
      const leadData = {
        firstName: formData.firstName,
        role: formData.role || null,
        companyName: formData.companyName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || null,
        website: formData.website || null,
        preferredContactMethod: formData.preferredContactMethod || null,
        country: formData.country || null,
        city: formData.city || null,
        source: formData.source || null,
        status: formData.status || null,
        noOfEmployees: formData.numberOfEmployees || null,
        estimatedPotential: formData.estimatedPotential ? parseFloat(formData.estimatedPotential.replace(/[£$€,]/g, '')) : null,
        productInterest: formData.productInterest || [],
      };
      const response = await leadsApi.createLead(leadData);

      if (response.isSuccess && response.data) {
        const leadId = response.data.id || response.data.data?.id;
        success('Lead created successfully!');
        setIsNewLeadModalOpen(false);
        if (leadId) {
          router.push(`/sales/leads/${leadId}`);
        } else {
          router.push('/sales/leads');
        }
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to create lead';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create lead. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  // Format estimatedPotential from API (number) to display format
  const formatEstimatedPotential = (value: number | null): string => {
    if (value === null || value === undefined) return "£8,000–£15,000";
    return `£${value.toLocaleString('en-GB')}`;
  };
  
  const estimatedPotential = qualification ? formatEstimatedPotential(qualification.estimatedPotential) : "£8,000–£15,000";

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
              <div className="text-center py-12">Loading...</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!qualification) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
              <div className="text-center py-12">Qualification not found</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const qualificationName = qualification.firstName || qualification.email?.split("@")[0] || "Unknown";
  const displayName = qualification.firstName ? `Mr. ${qualification.firstName}` : qualificationName;

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* White Container */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Page Header */}
              <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Lead Details - In Qualification</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsNewLeadModalOpen(true)}
                      className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                    >
                      <HiPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">New lead</span>
                      <span className="sm:hidden">New</span>
                    </button>
                    <button className="px-3 sm:px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 border border-gray-300 whitespace-nowrap">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-3 sm:px-6 py-4 sm:py-6">
                {/* Qualification Information Card */}
                <div className="bg-[#FEFAF3] rounded-lg p-4 sm:p-6 border border-gray-200 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 w-full">
                      {/* Top Row - Lead Name and Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Lead</p>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{displayName}</h3>
                        </div>

                        {/* Action Buttons - Joined together */}
                        <div className="flex items-center border border-black rounded-lg overflow-hidden w-full sm:w-auto">
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 sm:flex-none whitespace-nowrap">
                            Mark as qualified
                          </button>
                          <button 
                            onClick={() => router.push(`/sales/leads/${qualification.id}`)}
                            className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 sm:flex-none whitespace-nowrap"
                          >
                            View lead
                          </button>
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none whitespace-nowrap">
                            Disqualify
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row - Company, Lead Source, Product Interest, Status, Qualification Score */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 flex-wrap">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Company</p>
                          <p className="text-base text-gray-900">{qualification.companyName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Lead Source</p>
                          <p className="text-base text-gray-900">{qualification.source || "Website Enquiry"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Product Interest</p>
                          <div className="flex flex-wrap gap-1">
                            {qualification.productInterest && qualification.productInterest.length > 0 ? (
                              qualification.productInterest.map((interest, idx) => (
                                <span key={idx} className="text-sm font-medium text-gray-900">
                                  {interest}{idx < qualification.productInterest.length - 1 ? ',' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm font-medium text-gray-900">Hospitality, Sponsorship</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-yellow-500 rounded-full">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-yellow-700">
                              In Qualification
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Qualification Score</p>
                          <p className="text-base text-gray-900">72 / 100</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column - Qualification Details */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Qualification Checklist */}
                    <div className="bg-[#FAFAFA] rounded-lg">
                      <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsQualificationChecklistExpanded(!isQualificationChecklistExpanded)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <HiChevronDown className={`w-4 h-4 transition-transform ${isQualificationChecklistExpanded ? '' : '-rotate-90'}`} />
                            </button>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-700">Qualification Checklist</h3>
                          </div>
                          <button className="text-gray-600 hover:text-gray-900">
                            <HiPencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {isQualificationChecklistExpanded && (
                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm text-gray-500">Does the prospect have a realistic budget for this package?</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Yes</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm text-gray-500">Is this contact a decision-maker or influencer?</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Decision-maker</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm text-gray-500">Is there a clear commercial need?</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Brand exposure</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm text-gray-500">When are they looking to activate?</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Next season</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs sm:text-sm text-gray-500">How confident are you this will progress?</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">High</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Qualification Score */}
                    <div className="bg-[#FAFAFA] rounded-lg">
                      <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsQualificationScoreExpanded(!isQualificationScoreExpanded)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <HiChevronDown className={`w-4 h-4 transition-transform ${isQualificationScoreExpanded ? '' : '-rotate-90'}`} />
                          </button>
                          <h3 className="text-xs sm:text-sm font-bold text-gray-700">Qualification Score</h3>
                        </div>
                      </div>
                      {isQualificationScoreExpanded && (
                        <div className="p-3 sm:p-4">
                          {/* Progress Bar */}
                          <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
                            <div className="absolute inset-0 flex">
                              <div className="flex-1 bg-red-500"></div>
                              <div className="flex-1 bg-orange-500"></div>
                              <div className="flex-1 bg-green-500"></div>
                            </div>
                            <div 
                              className="absolute left-0 top-0 h-full bg-gray-300 opacity-50"
                              style={{ width: '72%' }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">72 / 100</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">Likely Qualified</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - History and Snapshot */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* History Summary */}
                    <div className="bg-[#FAFAFA] rounded-lg">
                      <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <HiChevronDown className={`w-4 h-4 transition-transform ${isHistoryExpanded ? '' : '-rotate-90'}`} />
                            </button>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-700">History Summary</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium">
                              Add note
                            </button>
                            <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium">
                              Log call
                            </button>
                          </div>
                        </div>
                      </div>
                      {isHistoryExpanded && (
                        <div className="p-3 sm:p-4 space-y-4">
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Today</p>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0 p-1">
                                  <HiPencil className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">You added a note</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Interested in box for 12 executives.</p>
                                  <span className="text-xs text-gray-500">2:59 PM</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">2 days ago</p>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 p-1">
                                  <HiPhone className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">Call logged</p>
                                  <span className="text-xs text-gray-500">8:30 AM</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lead Snapshot */}
                    <div className="bg-[#FAFAFA] rounded-lg">
                      <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsLeadSnapshotExpanded(!isLeadSnapshotExpanded)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <HiChevronDown className={`w-4 h-4 transition-transform ${isLeadSnapshotExpanded ? '' : '-rotate-90'}`} />
                            </button>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-700">Lead Snapshot</h3>
                          </div>
                          <button 
                            onClick={() => router.push(`/sales/leads/${qualification.id}`)}
                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
                          >
                            View full lead
                          </button>
                        </div>
                      </div>
                      {isLeadSnapshotExpanded && (
                        <div className="p-3 sm:p-4">
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300">
                              <p className="text-xs text-gray-500 mb-1 sm:mb-2">Lead Source</p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">{qualification.source || "Website"}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300">
                              <p className="text-xs text-gray-500 mb-1 sm:mb-2">Created</p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">Dec 12, 2025</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300">
                              <p className="text-xs text-gray-500 mb-1 sm:mb-2">Estimated Value</p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">{estimatedPotential}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-300">
                              <p className="text-xs text-gray-500 mb-1 sm:mb-2">Assigned To</p>
                              <p className="text-sm sm:text-base font-bold text-gray-900">Sarah Thompson</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Insight/Recommendation */}
                    <div className="p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: '#E6F1FB', borderColor: '#CCE3F5' }}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-900">
                          <span className="font-semibold">Similar leads from media agencies converted in 18 days on average.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Qualification Modal */}
      {qualification && (
        <CreateLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditQualification}
          initialData={{
            firstName: qualification.firstName || '',
            role: qualification.role || '',
            companyName: qualification.companyName || '',
            email: qualification.email || '',
            phoneNumber: qualification.phoneNumber || '',
            website: qualification.website || '',
            preferredContactMethod: qualification.preferredContactMethod || '',
            country: qualification.country || '',
            city: qualification.city || '',
            source: qualification.source || '',
            status: qualification.status || '',
            productInterest: qualification.productInterest || [],
            numberOfEmployees: qualification.noOfEmployees || '',
            estimatedPotential: qualification.estimatedPotential ? `£${qualification.estimatedPotential.toLocaleString('en-GB')}` : '',
          }}
          isEditMode={true}
        />
      )}

      {/* New Lead Modal */}
      <CreateLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={handleCreateLead}
        initialData={null}
        isEditMode={false}
      />
    </ProtectedRoute>
  );
}

