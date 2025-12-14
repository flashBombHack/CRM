"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  HiChevronDown, 
  HiDotsVertical, 
  HiChartBar, 
  HiUserGroup, 
  HiSpeakerphone, 
  HiTicket, 
  HiCreditCard, 
  HiCheckCircle, 
  HiRefresh, 
  HiSupport 
} from "react-icons/hi";

// Revenue forecast data for all 12 months - matching design
const revenueForecastData = [
  { month: "Jan", revenue: 120000 },
  { month: "Feb", revenue: 150000 },
  { month: "Mar", revenue: 180000 },
  { month: "Apr", revenue: 720000 },
  { month: "May", revenue: 60000 },
  { month: "Jun", revenue: 200000 },
  { month: "Jul", revenue: 250000 },
  { month: "Aug", revenue: 300000 },
  { month: "Sep", revenue: 350000 },
  { month: "Oct", revenue: 620000 },
  { month: "Nov", revenue: 400000 },
  { month: "Dec", revenue: 450000 },
];

export default function ReportsPage() {
  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overviewRef.current && !overviewRef.current.contains(event.target as Node)) {
        setShowOverviewDropdown(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header Section */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Overview Analytics</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Overview Analytics Dropdown */}
                    <div className="relative" ref={overviewRef}>
                      <button
                        onClick={() => setShowOverviewDropdown(!showOverviewDropdown)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900 flex items-center gap-2"
                      >
                        Overview Analytics
                        <HiChevronDown className="w-4 h-4" />
                      </button>
                      {showOverviewDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                          <button 
                            onClick={() => setShowOverviewDropdown(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Overview Analytics
                          </button>
                          <button 
                            onClick={() => setShowOverviewDropdown(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Sales Analytics
                          </button>
                          <button 
                            onClick={() => setShowOverviewDropdown(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Revenue Analytics
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Export and AI Ideas Buttons */}
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={exportRef}>
                        <button
                          onClick={() => setShowExportDropdown(!showExportDropdown)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          Export
                          <HiChevronDown className="w-4 h-4" />
                        </button>
                        {showExportDropdown && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                            <button 
                              onClick={() => setShowExportDropdown(false)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Export as PDF
                            </button>
                            <button 
                              onClick={() => setShowExportDropdown(false)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Export as CSV
                            </button>
                            <button 
                              onClick={() => setShowExportDropdown(false)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Export as Excel
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                        AI ideas
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Season Revenue Summary Section */}
              <div className="px-6 py-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Season Revenue Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Revenue (YTD) */}
                  <div className="bg-[#F7F8F8] rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Total Revenue (YTD)</div>
                    <div className="text-2xl font-bold text-gray-900">£4,230,000</div>
                  </div>

                  {/* Forecasted Revenue (Next 90 Days) */}
                  <div className="bg-[#F7F8F8] rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Forecasted Revenue (Next 90 Days)</div>
                    <div className="text-2xl font-bold text-gray-900">£620,000</div>
                  </div>

                  {/* Total Pipeline Value */}
                  <div className="bg-[#F7F8F8] rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Total Pipeline Value</div>
                    <div className="text-2xl font-bold text-gray-900">£1,350,000</div>
                  </div>

                  {/* Deals Closed YTD / Win Rate */}
                  <div className="bg-[#F7F8F8] rounded-lg p-4 border border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Deals Closed YTD / Win Rate</div>
                    <div className="text-2xl font-bold text-gray-900">84 / 27%</div>
                  </div>
                </div>
              </div>

              {/* Revenue Forecast Section */}
              <div className="px-6 py-6 border-b border-gray-200">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Revenue Forecast</h2>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      This year
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                      <HiDotsVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={revenueForecastData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      horizontal={true}
                      vertical={true}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 800000]}
                      ticks={[0, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000]}
                      tickFormatter={(value) => `£${value / 1000}k`}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#374151",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        padding: "8px 12px",
                      }}
                      formatter={(value: number) => [
                        `• £${(value / 1000).toFixed(0)}k`,
                        "",
                      ]}
                      labelFormatter={() => "6:08 PM, 2025"}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#0072CE"
                      radius={[8, 8, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Year Label below X-axis */}
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">2025</span>
                </div>
              </div>

              {/* Data Tables Section */}
              <div className="px-6 py-6 border-b border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pipeline by Product Line Table */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline by Product Line</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-xs font-semibold text-gray-700 pb-3">Product</th>
                            <th className="text-right text-xs font-semibold text-gray-700 pb-3">Opportunities</th>
                            <th className="text-right text-xs font-semibold text-gray-700 pb-3">Pipeline Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Hospitality Packages</td>
                            <td className="text-sm text-gray-900 text-right py-3">22</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£820,000</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Sponsorship Assets</td>
                            <td className="text-sm text-gray-900 text-right py-3">14</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£390,000</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Digital Advertising</td>
                            <td className="text-sm text-gray-900 text-right py-3">9</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£140,000</td>
                          </tr>
                          <tr>
                            <td className="text-sm text-gray-700 py-3">Corporate Events</td>
                            <td className="text-sm text-gray-900 text-right py-3">4</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£65,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sponsorship Revenue by Category Table */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sponsorship Revenue by Category</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-xs font-semibold text-gray-700 pb-3">Category</th>
                            <th className="text-right text-xs font-semibold text-gray-700 pb-3">Revenue</th>
                            <th className="text-right text-xs font-semibold text-gray-700 pb-3">% Contribution</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Pitchside Boards</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£520,000</td>
                            <td className="text-sm text-gray-900 text-right py-3">45%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Digital Screens</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£320,000</td>
                            <td className="text-sm text-gray-900 text-right py-3">28%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Programme Ads</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£90,000</td>
                            <td className="text-sm text-gray-900 text-right py-3">8%</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="text-sm text-gray-700 py-3">Social Media</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£180,000</td>
                            <td className="text-sm text-gray-900 text-right py-3">15%</td>
                          </tr>
                          <tr>
                            <td className="text-sm text-gray-700 py-3">Other</td>
                            <td className="text-sm font-bold text-gray-900 text-right py-3">£50,000</td>
                            <td className="text-sm text-gray-900 text-right py-3">4%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cards Grid */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Sales Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiChartBar className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Sales Analytics</span>
                  </div>

                  {/* Partnership Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiUserGroup className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Partnership Analytics</span>
                  </div>

                  {/* Marketing Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiSpeakerphone className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Marketing Analytics</span>
                  </div>

                  {/* Ticketing Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiTicket className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Ticketing Analytics</span>
                  </div>

                  {/* Finance & Payment Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiCreditCard className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Finance & Payment Analytics</span>
                  </div>

                  {/* Delivery & Activation Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiCheckCircle className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Delivery & Activation Analytics</span>
                  </div>

                  {/* Renewals & Retention Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiRefresh className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Renewals & Retention Analytics</span>
                  </div>

                  {/* Customer Service Analytics */}
                  <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
                    <HiSupport className="w-8 h-8 text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-700">Customer Service Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
