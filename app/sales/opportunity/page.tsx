"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import SvgIcon from "@/components/SvgIcon";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus, HiUser } from "react-icons/hi";

interface Opportunity {
  id: string;
  name: string;
  amount: number;
  companyName: string;
  date: string;
  stage: string;
}

interface OpportunitiesResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Opportunity[];
  };
  errors: string[];
  responseCode: number;
}

// Helper function to darken a color for better text visibility
const darkenColor = (color: string): string => {
  // Remove # if present
  const hex = color.replace('#', '');
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Darken by 60% for better visibility
  const newR = Math.max(0, Math.floor(r * 0.4));
  const newG = Math.max(0, Math.floor(g * 0.4));
  const newB = Math.max(0, Math.floor(b * 0.4));
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const STAGES = [
  { id: "qualify", name: "Qualify", bgColor: "#F3FBF8", borderColor: "#CFF1E6", textColor: darkenColor("#CFF1E6") },
  { id: "meet-present", name: "Meet & Present", bgColor: "#FFF8FA", borderColor: "#FFE4EA", textColor: darkenColor("#FFE4EA") },
  { id: "propose", name: "Propose", bgColor: "#FBF6F2", borderColor: "#F1DDCD", textColor: darkenColor("#F1DDCD") },
  { id: "negotiate", name: "Negotiate", bgColor: "#F2F8FC", borderColor: "#CCE3F5", textColor: darkenColor("#CCE3F5") },
  { id: "closed", name: "Closed", bgColor: "#FEF5F5", borderColor: "#FCDADA", textColor: darkenColor("#FCDADA") },
];

export default function OpportunityPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for now - replace with API call later
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOpportunities: Opportunity[] = [
        { id: "1", name: "Harvey Collins", amount: 12000, companyName: "Collins Industrial Supply", date: "Dec 9, 2025", stage: "qualify" },
        { id: "2", name: "Millie Dawson", amount: 11000, companyName: "Dawson PR & Media", date: "Dec 10, 2025", stage: "qualify" },
        { id: "3", name: "John Smith", amount: 15000, companyName: "Smith Corp", date: "Dec 11, 2025", stage: "qualify" },
        { id: "4", name: "Sarah Johnson", amount: 18000, companyName: "Johnson Industries", date: "Dec 12, 2025", stage: "qualify" },
        { id: "5", name: "Mike Brown", amount: 20000, companyName: "Brown Solutions", date: "Dec 13, 2025", stage: "qualify" },
        { id: "6", name: "Emma Wilson", amount: 13000, companyName: "Wilson Group", date: "Dec 8, 2025", stage: "meet-present" },
        { id: "7", name: "David Lee", amount: 16000, companyName: "Lee Enterprises", date: "Dec 9, 2025", stage: "meet-present" },
        { id: "8", name: "Lisa Anderson", amount: 14000, companyName: "Anderson Co", date: "Dec 7, 2025", stage: "propose" },
        { id: "9", name: "Tom Harris", amount: 17000, companyName: "Harris Ltd", date: "Dec 8, 2025", stage: "propose" },
        { id: "10", name: "Amy Taylor", amount: 19000, companyName: "Taylor Inc", date: "Dec 9, 2025", stage: "propose" },
        { id: "11", name: "Chris Martin", amount: 22000, companyName: "Martin Systems", date: "Dec 10, 2025", stage: "propose" },
        { id: "12", name: "Rachel Green", amount: 25000, companyName: "Green Tech", date: "Dec 6, 2025", stage: "negotiate" },
        { id: "13", name: "James White", amount: 21000, companyName: "White Solutions", date: "Dec 7, 2025", stage: "negotiate" },
        { id: "14", name: "Olivia Black", amount: 23000, companyName: "Black Industries", date: "Dec 8, 2025", stage: "negotiate" },
        { id: "15", name: "Noah Gray", amount: 24000, companyName: "Gray Corp", date: "Dec 9, 2025", stage: "negotiate" },
        { id: "16", name: "Sophia Blue", amount: 26000, companyName: "Blue Enterprises", date: "Dec 10, 2025", stage: "negotiate" },
        { id: "17", name: "Lucas Red", amount: 27000, companyName: "Red Group", date: "Dec 11, 2025", stage: "negotiate" },
        { id: "18", name: "Mia Yellow", amount: 28000, companyName: "Yellow Inc", date: "Dec 5, 2025", stage: "closed" },
        { id: "19", name: "Ethan Purple", amount: 29000, companyName: "Purple Systems", date: "Dec 6, 2025", stage: "closed" },
        { id: "20", name: "Isabella Orange", amount: 30000, companyName: "Orange Tech", date: "Dec 7, 2025", stage: "closed" },
        { id: "21", name: "Aiden Pink", amount: 31000, companyName: "Pink Solutions", date: "Dec 8, 2025", stage: "closed" },
      ];
      setOpportunities(mockOpportunities);
      setLoading(false);
    }, 500);
  }, []);

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Stage 3 - Opportunities</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2">
                      <HiPlus className="w-4 h-4" />
                      New opportunity
                    </button>
                    <button className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <button className="px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                    All Opportunities <HiChevronDown className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button className="p-2 text-primary hover:text-primary-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 max-w-md">
                    <HiSearch className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search this list"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none flex-1 text-sm"
                    />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="p-4 overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {STAGES.map((stage) => {
                    const stageOpportunities = getOpportunitiesByStage(stage.id);
                    return (
                      <div key={stage.id} className="flex-shrink-0 w-[280px]">
                        {/* Column Header */}
                        <div className="bg-[#E1E3E6] rounded-lg px-2 py-2.5 mb-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="px-2.5 py-1 rounded border text-xs font-medium"
                              style={{
                                backgroundColor: stage.bgColor,
                                borderColor: stage.borderColor,
                                color: stage.textColor,
                              }}
                            >
                              {stage.name} {stageOpportunities.length}
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-0.5 hover:bg-white/50 rounded transition-colors">
                                <HiPlus className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                              <button className="p-0.5 hover:bg-white/50 rounded transition-colors">
                                <HiDotsVertical className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2">
                          {loading ? (
                            <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                          ) : stageOpportunities.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm">No opportunities</div>
                          ) : (
                            stageOpportunities.map((opportunity) => (
                              <div
                                key={opportunity.id}
                                className="bg-[#F7F8F8] rounded-lg p-3 relative cursor-pointer hover:shadow-md transition-shadow"
                              >
                                <button className="absolute top-2 right-2 p-0.5 hover:bg-white/50 rounded transition-colors">
                                  <HiDotsVertical className="w-4 h-4 text-gray-400" />
                                </button>
                                
                                <div className="pr-6 pb-5">
                                  <h3 className="font-bold text-sm text-gray-900 mb-1">{opportunity.name}</h3>
                                  <p className="text-sm text-gray-700 mb-2">{formatCurrency(opportunity.amount)}</p>
                                  
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                      <SvgIcon
                                        src="/assets/icons/briefcaseIcon.svg"
                                        color="currentColor"
                                        width={14}
                                        height={14}
                                        className="flex-shrink-0"
                                      />
                                      <span className="truncate">{opportunity.companyName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                      <SvgIcon
                                        src="/assets/icons/calendarIcon.svg"
                                        color="currentColor"
                                        width={14}
                                        height={14}
                                        className="flex-shrink-0"
                                      />
                                      <span>{opportunity.date}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Profile Icon at bottom right - affected by card padding */}
                                <div className="absolute bottom-3 right-3">
                                  <div className="w-6 h-6 bg-[#E1E3E6] rounded-full flex items-center justify-center">
                                    <HiUser className="w-3.5 h-3.5 text-black" />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
