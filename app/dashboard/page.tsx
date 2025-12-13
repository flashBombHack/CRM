"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HiArrowRight, HiUser, HiChartBar, HiChevronDown } from "react-icons/hi";

// Demo data for Sales Revenue Analytics - All 12 months
const revenueData = [
  { time: "Jan", revenue: 120000 },
  { time: "Feb", revenue: 150000 },
  { time: "Mar", revenue: 180000 },
  { time: "Apr", revenue: 140000 },
  { time: "May", revenue: 200000 },
  { time: "Jun", revenue: 150000 },
  { time: "Jul", revenue: 180000 },
  { time: "Aug", revenue: 220000 },
  { time: "Sep", revenue: 250000 },
  { time: "Oct", revenue: 280000 },
  { time: "Nov", revenue: 300000 },
  { time: "Dec", revenue: 325000 },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 bg-[#F2F8FC]">
          {/* Dashboard Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* Leads Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <HiUser className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-600">Leads</h3>
                </div>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  This week <HiChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#FFF8FA] rounded-lg">
                <span className="text-sm text-gray-600">Website</span>
                <span className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full">
                  8
                </span>
                <span className="ml-auto px-2 py-0.5 bg-[#E1E3E6] text-gray-600 text-xs font-medium rounded-lg">
                  +2 more
                </span>
              </div>
              <a
                href="#"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                View leads <HiArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Opportunities Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <HiChartBar className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-600">Opportunities</h3>
                </div>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                  This quarter <HiChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">£ 325,000</p>
                  <p className="text-xs text-gray-500 font-medium">+14% vs last quarter</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#FFF8FA] rounded-lg">
                <span className="text-sm text-gray-600">New Opportunities</span>
                <span className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full">
                  £85k
                </span>
                <span className="ml-auto px-2 py-0.5 bg-[#E1E3E6] text-gray-600 text-xs font-medium rounded-lg">
                  +1 more
                </span>
              </div>
              <a
                href="#"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                View opportunities <HiArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Proposals Awaiting Response Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <HiChartBar className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-600">Proposals Awaiting Response</h3>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <div className="mb-4 px-3 py-2 bg-[#FFF8FA] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Corporate Box Package</span>
                  <span className="text-sm font-semibold text-gray-900">£12,500</span>
                </div>
              </div>
              <a
                href="#"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                View all proposals <HiArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sales Data Table Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Sales Data Table</h2>
                <h3 className="text-sm font-medium text-gray-600">Sales Revenue Analytics</h3>
              </div>
              {/* Time Filters */}
              <div className="flex gap-2">
                {["1D", "1W", "1M", "1Y", "ALL"].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filter === "1Y"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-gray-900">
                £325,000 <span className="text-green-600 text-xl">+22% generated</span>
              </p>
            </div>

            {/* Area Chart with Gradient */}
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0072CE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0072CE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
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
                  domain={[0, 300000]}
                  ticks={[50000, 100000, 150000, 200000, 250000]}
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
                    `£${(value / 1000).toFixed(0)}k`,
                    "",
                  ]}
                  labelFormatter={(label) => `6:08 PM, 2025`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0072CE"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#0072CE", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Pipeline Stage Summary and Activation Tasks Section - Inside same card */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pipeline Stage Summary */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Stage Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-600 pb-2">Stage</th>
                          <th className="text-right text-xs font-medium text-gray-600 pb-2">Count</th>
                          <th className="text-right text-xs font-medium text-gray-600 pb-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="text-sm text-gray-700 py-2">Discovery</td>
                          <td className="text-sm text-gray-900 text-right py-2">3</td>
                          <td className="text-sm text-gray-900 text-right py-2">£22k</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="text-sm text-gray-700 py-2">Proposal sent</td>
                          <td className="text-sm text-gray-900 text-right py-2">4</td>
                          <td className="text-sm text-gray-900 text-right py-2">£41k</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="text-sm text-gray-700 py-2">Negotiation</td>
                          <td className="text-sm text-gray-900 text-right py-2">2</td>
                          <td className="text-sm text-gray-900 text-right py-2">£55k</td>
                        </tr>
                        <tr>
                          <td className="text-sm text-gray-700 py-2">Verbal Agreement</td>
                          <td className="text-sm text-gray-900 text-right py-2">1</td>
                          <td className="text-sm text-gray-900 text-right py-2">£18k</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activation Tasks Status */}
                <div className="border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Activation Tasks Status</h3>
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm font-semibold text-gray-900 mb-1">No activation tasks yet</p>
                    <p className="text-xs text-gray-500">Tasks appear after invoices are paid.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities Section - Separate Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                View all <HiArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Activity Card 1 - Proposal */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Proposal</h4>
                <p className="text-xs text-gray-600 mb-2">You sent a proposal to John Doe.</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>

              {/* Activity Card 2 - Lead */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Lead</h4>
                <p className="text-xs text-gray-600 mb-2">
                  You added a new lead - <span className="font-semibold text-gray-900">BlueTech Ltd</span>
                </p>
                <p className="text-xs text-gray-400">4 hours ago</p>
              </div>

              {/* Activity Card 3 - Invoice */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Invoice</h4>
                <p className="text-xs text-gray-600 mb-2">You changed the status of an invoice to paid.</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>

              {/* Activity Card 4 - Activation */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Activation</h4>
                <p className="text-xs text-gray-600 mb-2">You updated a logo.</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>

              {/* Activity Card 5 - Invoice */}
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">Invoice</h4>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="text-primary font-semibold">Sarah Jones</span> created a new invoice.
                </p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}

