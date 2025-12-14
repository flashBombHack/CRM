"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { leadsApi } from "@/lib/api-client";
import { HiPlus, HiChevronDown, HiCheck, HiPencil, HiDocument, HiPhone } from "react-icons/hi";
import ConvertLeadModal, { ConvertLeadFormData } from "@/components/ConvertLeadModal";

interface LeadDetail {
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
  productInterest: string[];
}

interface LeadDetailResponse {
  isSuccess: boolean;
  message: string | null;
  data: LeadDetail;
  errors: string[];
  responseCode: number;
}

const statusStages = ["New", "Nurturing", "Contacted", "Qualified", "Unqualified"];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isContactInfoExpanded, setIsContactInfoExpanded] = useState(true);
  const [isMetricExpanded, setIsMetricExpanded] = useState(true);
  const [isIntakeInfoExpanded, setIsIntakeInfoExpanded] = useState(true);
  const [isActivityTimelineExpanded, setIsActivityTimelineExpanded] = useState(true);
  const [isLeadQualificationExpanded, setIsLeadQualificationExpanded] = useState(true);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response: LeadDetailResponse = await leadsApi.getLeadById(params.id as string);
        if (response.isSuccess && response.data) {
          setLead(response.data);
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLead();
    }
  }, [params.id]);

  const getStatusIndex = (status: string | null) => {
    if (!status) return 0;
    const statusLower = status.toLowerCase();
    const index = statusStages.findIndex(s => s.toLowerCase() === statusLower);
    return index >= 0 ? index : 0;
  };

  const currentStatusIndex = getStatusIndex(lead?.status || null);
  const estimatedPotential = "£8,000–£15,000"; // Demo data

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

  if (!lead) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
              <div className="text-center py-12">Lead not found</div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const leadName = lead.firstName || lead.email?.split("@")[0] || "Unknown";
  const displayName = lead.firstName ? `Mr. ${lead.firstName}` : leadName;

  return (
    <ProtectedRoute>
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
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Leads details</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => router.push("/sales/leads")}
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

                {/* Navigation Tabs */}
                <div className="flex items-center gap-3 sm:gap-6 border-b border-gray-200 overflow-x-auto">
                  {["Overview", "Tasks", "Files", "Notes"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? "text-primary border-b-2 border-primary"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="px-3 sm:px-6 py-4 sm:py-6">
                {/* Overview Tab Content */}
                {activeTab === "Overview" && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Lead Information Card */}
                    <div className="bg-[#E6F1FB] rounded-lg p-4 sm:p-6 border border-gray-200">
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
                              <button 
                                onClick={() => setIsConvertModalOpen(true)}
                                className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 sm:flex-none whitespace-nowrap"
                              >
                                Convert to opportunity
                              </button>
                              <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 sm:flex-none whitespace-nowrap">
                                Edit
                              </button>
                              <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 sm:flex-none whitespace-nowrap">
                                Assign owner
                              </button>
                              <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none whitespace-nowrap">
                                More <HiChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Row - Company, Status, Estimated Potential */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Company</p>
                              <p className="text-base text-gray-900">{lead.companyName || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary rounded-full">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-sm font-medium text-primary">
                                  {lead.status || "New"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Estimated Potential</p>
                              <p className="text-base text-gray-900">{estimatedPotential}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Pipeline - Arrow Cards */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full gap-4 sm:gap-0">
                      <div className="flex items-center flex-1 overflow-x-auto" style={{ marginLeft: 0 }}>
                        {statusStages.map((stage, index) => {
                          const isActive = index === currentStatusIndex;
                          const isLast = index === statusStages.length - 1;
                          const isFirst = index === 0;
                          
                          return (
                            <div 
                              key={stage} 
                              className="relative flex items-center min-w-[120px] sm:min-w-0" 
                              style={{ 
                                flex: 1,
                                marginLeft: isFirst ? 0 : '-16px',
                                zIndex: statusStages.length - index
                              }}
                            >
                              {/* Arrow Card */}
                              <div
                                className={`relative flex items-center justify-center w-full ${
                                  isActive
                                    ? "bg-primary text-white"
                                    : "text-gray-900"
                                } py-3 h-12 pl-3 sm:pl-4 pr-4 sm:pr-6 ${isFirst ? "rounded-l-lg" : ""}`}
                                style={{
                                  backgroundColor: isActive ? undefined : "#F7F8F8",
                                  clipPath: isFirst
                                    ? "polygon(0 0, calc(100% - 16px) 0, calc(100% - 6px) 45%, calc(100% - 6px) 55%, calc(100% - 16px) 100%, 0 100%)"
                                    : "polygon(16px 0, 6px 45%, 6px 55%, 16px 100%, calc(100% - 16px) 100%, calc(100% - 6px) 55%, calc(100% - 6px) 45%, calc(100% - 16px) 0)",
                                }}
                              >
                                {isActive && (
                                  <HiCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                                )}
                                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{stage}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Mark Status Button */}
                      <button className="sm:ml-6 px-3 sm:px-4 py-2 bg-transparent text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap">
                        <HiCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Mark current status</span>
                        <span className="sm:hidden">Mark status</span>
                      </button>
                    </div>

                    {/* Contact Information and Actions Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column - Contact Information */}
                      <div className="bg-[#FAFAFA] rounded-lg">
                        <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsContactInfoExpanded(!isContactInfoExpanded)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <HiChevronDown className={`w-4 h-4 transition-transform ${isContactInfoExpanded ? '' : '-rotate-90'}`} />
                              </button>
                              <h3 className="text-xs sm:text-sm font-bold text-gray-700">Contact Information</h3>
                            </div>
                            <button className="text-gray-600 hover:text-gray-900">
                              <HiPencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {isContactInfoExpanded && (
                          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Name</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">{lead.firstName || lead.email?.split("@")[0] || "Unknown"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Role</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">{lead.role || "Nil"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Company</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">{lead.companyName || "Nil"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Email</span>
                              <a href={`mailto:${lead.email}`} className="text-xs sm:text-sm text-blue-600 hover:underline font-medium text-right sm:text-left break-all">
                                {lead.email || "Nil"}
                              </a>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Phone</span>
                              <a href={`tel:${lead.phoneNumber}`} className="text-xs sm:text-sm text-blue-600 hover:underline font-medium text-right sm:text-left">
                                {lead.phoneNumber || "Nil"}
                              </a>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Website</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left break-all">{lead.website || "Nil"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Preferred Contact Method</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">{lead.preferredContactMethod || "Nil"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Location (optional)</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">
                                {lead.city && lead.country ? `${lead.city}, ${lead.country}` : lead.city || lead.country || "Nil"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Actions and Metrics */}
                      <div className="space-y-4 sm:space-y-6">
                        {/* Action Buttons */}
                        <div className="flex items-center border border-black rounded-lg overflow-hidden">
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 whitespace-nowrap">
                            Add note
                          </button>
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 whitespace-nowrap">
                            Add task
                          </button>
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 whitespace-nowrap">
                            Log call
                          </button>
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-r border-black hover:bg-primary hover:text-white transition-colors flex-1 whitespace-nowrap">
                            Send email
                          </button>
                          <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent hover:bg-primary hover:text-white transition-colors flex-1 whitespace-nowrap">
                            Upload file
                          </button>
                        </div>

                        {/* Empty State for Reminders/Tasks */}
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-xs sm:text-sm text-gray-700 mb-1">No reminders or tasks</p>
                          <p className="text-xs text-gray-500">Get started by sending an email, add task and more.</p>
                        </div>

                        {/* Metric Section */}
                        <div className="bg-[#FAFAFA] rounded-lg">
                          <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsMetricExpanded(!isMetricExpanded)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <HiChevronDown className={`w-4 h-4 transition-transform ${isMetricExpanded ? '' : '-rotate-90'}`} />
                              </button>
                              <h3 className="text-xs sm:text-sm font-bold text-gray-700">Metric</h3>
                            </div>
                          </div>
                          {isMetricExpanded && (
                            <div className="p-3 sm:p-4">
                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 border border-gray-300">
                                  <p className="text-xs text-gray-500 mb-1 sm:mb-2">Response Likelihood</p>
                                  <p className="text-sm sm:text-base font-bold text-gray-900">62%</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 border border-gray-300">
                                  <p className="text-xs text-gray-500 mb-1 sm:mb-2">Conversion Probability</p>
                                  <p className="text-sm sm:text-base font-bold text-gray-900">35%</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 border border-gray-300">
                                  <p className="text-xs text-gray-500 mb-1 sm:mb-2">Estimated Deal Size</p>
                                  <p className="text-sm sm:text-base font-bold text-gray-900">£12,000</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 border border-gray-300">
                                  <p className="text-xs text-gray-500 mb-1 sm:mb-2">Priority</p>
                                  <p className="text-sm sm:text-base font-bold text-gray-900">Medium</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Intake Information and Activity Timelines Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column - Intake Information */}
                      <div className="bg-[#FAFAFA] rounded-lg">
                        <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsIntakeInfoExpanded(!isIntakeInfoExpanded)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <HiChevronDown className={`w-4 h-4 transition-transform ${isIntakeInfoExpanded ? '' : '-rotate-90'}`} />
                              </button>
                              <h3 className="text-xs sm:text-sm font-bold text-gray-700">Intake Information</h3>
                            </div>
                            <button className="text-gray-600 hover:text-gray-900">
                              <HiPencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {isIntakeInfoExpanded && (
                          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Lead Source</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">Website Enquiry</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Captured Date</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">04 Feb 2025, 11:24 AM</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Captured By</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left">Automated (Web Form)</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <span className="text-xs sm:text-sm text-gray-500">Original Message</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-medium text-right sm:text-left italic">"Interested in matchday hospitality package for corporate guests."</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-500">Product Interest</span>
                              <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
                                <span className="px-3 py-1 text-xs sm:text-sm text-gray-900 font-medium rounded border" style={{ backgroundColor: '#FFF8FA', borderColor: '#FFE4EA' }}>
                                  Hospitality packages
                                </span>
                                <span className="px-3 py-1 text-xs sm:text-sm text-gray-900 font-medium rounded border" style={{ backgroundColor: '#FFF8FA', borderColor: '#FFE4EA' }}>
                                  Box / Lounge
                                </span>
                                <span className="px-3 py-1 text-xs sm:text-sm text-gray-900 font-medium rounded border" style={{ backgroundColor: '#FFF8FA', borderColor: '#FFE4EA' }}>
                                  Sponsorship Asset
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 p-3 sm:p-4 rounded-lg border flex items-start gap-3" style={{ backgroundColor: '#F2F8FC', borderColor: '#CCE3F5' }}>
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
                                </svg>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-900">
                                <span className="font-semibold">High match</span> — 3 products align with this lead&apos;s company size.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Activity Timelines */}
                      <div className="bg-[#FAFAFA] rounded-lg">
                        <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsActivityTimelineExpanded(!isActivityTimelineExpanded)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <HiChevronDown className={`w-4 h-4 transition-transform ${isActivityTimelineExpanded ? '' : '-rotate-90'}`} />
                            </button>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-700">Activity Timelines</h3>
                          </div>
                        </div>
                        {isActivityTimelineExpanded && (
                          <div className="p-3 sm:p-4 space-y-4">
                            {/* Today Section */}
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Today</p>
                              <div className="space-y-3">
                                {/* Note Activity */}
                                <div className="flex items-start gap-2">
                                  <button className="text-gray-400 hover:text-gray-600 mt-0.5">
                                    <HiChevronDown className="w-3 h-3" />
                                  </button>
                                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0 p-1">
                                    <HiPencil className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-900 font-medium">You added a note</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Lead is evaluating hospitality options for Q1.</p>
                                      </div>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">3:15 PM</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Call Activity */}
                                <div className="flex items-start gap-2">
                                  <button className="text-gray-400 hover:text-gray-600 mt-0.5">
                                    <HiChevronDown className="w-3 h-3 rotate-[-90deg]" />
                                  </button>
                                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 p-1">
                                    <HiPhone className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-900 font-medium">Call logged</p>
                                      </div>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">2:59 PM</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 2 days ago Section */}
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">2 days ago</p>
                              <div className="space-y-3">
                                {/* File Upload Activity */}
                                <div className="flex items-start gap-2">
                                  <button className="text-gray-400 hover:text-gray-600 mt-0.5">
                                    <HiChevronDown className="w-3 h-3" />
                                  </button>
                                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0 p-1">
                                    <HiDocument className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm text-gray-900 font-medium">Uploaded a file</p>
                                      </div>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">8:30 AM</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lead Qualification and Right Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column - Lead Qualification */}
                      <div className="bg-[#FAFAFA] rounded-lg">
                        <div className="px-3 sm:px-4 py-3 border-b border-gray-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsLeadQualificationExpanded(!isLeadQualificationExpanded)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <HiChevronDown className={`w-4 h-4 transition-transform ${isLeadQualificationExpanded ? '' : '-rotate-90'}`} />
                              </button>
                              <h3 className="text-xs sm:text-sm font-bold text-gray-700">Lead Qualification</h3>
                            </div>
                            <button className="text-gray-600 hover:text-gray-900">
                              <HiPencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {isLeadQualificationExpanded && (
                          <div className="p-3 sm:p-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: '#FEFAF3', borderColor: '#FDECCE' }}>
                                <p className="text-xs text-gray-500 mb-1 sm:mb-2">Lead Score</p>
                                <p className="text-sm sm:text-base font-bold text-gray-900">72 / 100 (Warm)</p>
                              </div>
                              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                                <p className="text-xs text-gray-500 mb-1 sm:mb-2">Engagement Level</p>
                                <p className="text-sm sm:text-base font-bold text-gray-900">Opened 2 emails, clicked 1 link</p>
                              </div>
                              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                                <p className="text-xs text-gray-500 mb-1 sm:mb-2">Last Contact Attempt</p>
                                <p className="text-sm sm:text-base font-bold text-gray-900">2 days ago</p>
                              </div>
                              <div className="rounded-lg p-3 sm:p-4 border" style={{ backgroundColor: '#F7F8F8', borderColor: '#E1E3E6' }}>
                                <p className="text-xs text-gray-500 mb-1 sm:mb-2">Next Suggested Step</p>
                                <p className="text-sm sm:text-base font-bold text-gray-900">Schedule a discovery call</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - Placeholder for future content */}
                      <div></div>
                    </div>
                  </div>
                )}

                {/* Other Tabs - Empty for now */}
                {activeTab !== "Overview" && (
                  <div className="text-center py-12 text-gray-500">
                    {activeTab} content coming soon
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Convert Lead Modal */}
      <ConvertLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        onSubmit={async (data: ConvertLeadFormData) => {
          // Handle form submission
          console.log('Convert lead data:', data);
          // TODO: Implement API call to convert lead
          setIsConvertModalOpen(false);
        }}
        leadData={{
          firstName: lead?.firstName || null,
          lastName: null, // You may need to add this to the LeadDetail interface
          companyName: lead?.companyName || null,
        }}
      />
    </ProtectedRoute>
  );
}
