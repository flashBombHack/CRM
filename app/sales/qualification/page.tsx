"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateLeadModal, { CreateLeadFormData } from "@/components/CreateLeadModal";
import QualificationActionsDropdown from "@/components/QualificationActionsDropdown";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { qualificationsApi, CreateQualificationRequest } from "@/lib/api-client";
import { HiSearch, HiChevronDown, HiPlus } from "react-icons/hi";

interface Qualification {
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
  noOfEmployees?: string | null;
  estimatedPotential?: number | null;
  productInterest: string[];
}

interface QualificationsResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: Qualification[];
  };
  errors: string[];
  responseCode: number;
}

export default function QualificationPage() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedQualifications, setSelectedQualifications] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [deleteQualificationId, setDeleteQualificationId] = useState<string | null>(null);
  const { toasts, success, error, removeToast } = useToast();

  const fetchQualifications = useCallback(async () => {
    try {
      setLoading(true);
      const response: QualificationsResponse = await qualificationsApi.getQualifications(pageIndex, pageSize);
      if (response.isSuccess && response.data) {
        setQualifications(response.data.data);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  const getStatusColor = (status: string | null) => {
    if (!status) return "text-gray-500";
    const statusLower = status.toLowerCase();
    if (statusLower === "qualified") return "text-green-600";
    if (statusLower === "in qualification") return "text-yellow-600";
    return "text-gray-500";
  };

  const getStatusDotColor = (status: string | null) => {
    if (!status) return "bg-gray-500";
    const statusLower = status.toLowerCase();
    if (statusLower === "qualified") return "bg-green-600";
    if (statusLower === "in qualification") return "bg-yellow-600";
    return "bg-gray-500";
  };

  const getQualificationName = (qualification: Qualification) => {
    if (qualification.firstName) return qualification.firstName;
    if (qualification.email) return qualification.email.split("@")[0];
    return "Unknown";
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQualifications(new Set());
    } else {
      setSelectedQualifications(new Set(qualifications.map((q) => q.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectQualification = (qualificationId: string) => {
    const newSelected = new Set(selectedQualifications);
    if (newSelected.has(qualificationId)) {
      newSelected.delete(qualificationId);
    } else {
      newSelected.add(qualificationId);
    }
    setSelectedQualifications(newSelected);
    setSelectAll(newSelected.size === qualifications.length);
  };

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

  const handleCreateQualification = async (formData: CreateLeadFormData) => {
    try {
      const qualificationData = prepareQualificationData(formData);
      const response = await qualificationsApi.createQualification(qualificationData);

      if (response.isSuccess) {
        success('Qualification created successfully!');
        await fetchQualifications();
        setIsModalOpen(false);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to create qualification';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to create qualification. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const handleEditQualification = async (formData: CreateLeadFormData) => {
    if (!editingQualification) return;
    
    try {
      const qualificationData = prepareQualificationData(formData);
      const response = await qualificationsApi.updateQualification(editingQualification.id, qualificationData);

      if (response.isSuccess) {
        success('Qualification updated successfully!');
        await fetchQualifications();
        setEditingQualification(null);
        setIsModalOpen(false);
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

  const handleDeleteQualification = async () => {
    if (!deleteQualificationId) return;

    try {
      const response = await qualificationsApi.deleteQualification(deleteQualificationId);

      if (response.isSuccess) {
        success('Qualification deleted successfully!');
        await fetchQualifications();
        setDeleteQualificationId(null);
      } else {
        const errorMessage = response.message || response.errors?.[0] || 'Failed to delete qualification';
        error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0] || 
                          err.message || 
                          'Failed to delete qualification. Please try again.';
      error(errorMessage);
      throw err;
    }
  };

  const openEditModal = (qualification: Qualification) => {
    qualificationsApi.getQualificationById(qualification.id).then((response) => {
      if (response.isSuccess && response.data) {
        const fullQualification = response.data;
        const updatedQualification: Qualification = {
          ...qualification,
          noOfEmployees: fullQualification.noOfEmployees || null,
          estimatedPotential: fullQualification.estimatedPotential || null,
        };
        setEditingQualification(updatedQualification);
        setIsModalOpen(true);
      }
    }).catch(() => {
      setEditingQualification(qualification);
      setIsModalOpen(true);
    });
  };

  const openDeleteConfirm = (qualificationId: string) => {
    setDeleteQualificationId(qualificationId);
  };

  return (
    <ProtectedRoute>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQualification(null);
        }}
        onSubmit={editingQualification ? handleEditQualification : handleCreateQualification}
        initialData={editingQualification ? {
          firstName: editingQualification.firstName || '',
          role: editingQualification.role || '',
          companyName: editingQualification.companyName || '',
          email: editingQualification.email || '',
          phoneNumber: editingQualification.phoneNumber || '',
          website: editingQualification.website || '',
          preferredContactMethod: editingQualification.preferredContactMethod || '',
          country: editingQualification.country || '',
          city: editingQualification.city || '',
          source: editingQualification.source || '',
          status: editingQualification.status || '',
          productInterest: editingQualification.productInterest || [],
          numberOfEmployees: (editingQualification as any).noOfEmployees || '',
          estimatedPotential: (editingQualification as any).estimatedPotential ? `£${(editingQualification as any).estimatedPotential.toLocaleString('en-GB')}` : '',
        } : null}
        isEditMode={!!editingQualification}
      />
      
      {/* Delete Confirmation Dialog */}
      {deleteQualificationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Qualification</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this qualification? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteQualificationId(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQualification}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
        
          <main className="flex-1 overflow-y-auto bg-[#F2F8FC] p-6">
            {/* Main Container with Border */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Qualifications Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Qualification</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      New qualification
                    </button>
                    <button className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1 border border-gray-300">
                      More <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Total Qualifications: {totalCount}</span>
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
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>Sources: All</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option>Status: All</option>
                  </select>
                </div>
              </div>

              {/* Qualifications Table */}
              <div className="px-6 py-4">
                <div className="bg-[#FAFAFA] border border-[#C4C7CC] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-[#C4C7CC]">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product Interest</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : qualifications.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            No qualifications found
                          </td>
                        </tr>
                      ) : (
                        qualifications.map((qualification) => (
                          <tr
                            key={qualification.id}
                            className="border-b border-[#C4C7CC] hover:bg-white/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedQualifications.has(qualification.id)}
                                onChange={() => handleSelectQualification(qualification.id)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <a 
                                href={`/sales/qualification/${qualification.id}`}
                                className="text-primary hover:underline text-sm font-medium"
                              >
                                {getQualificationName(qualification)}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {qualification.companyName || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex flex-col">
                                {qualification.email && <span>{qualification.email}</span>}
                                {qualification.phoneNumber && <span>{qualification.phoneNumber}</span>}
                                {!qualification.email && !qualification.phoneNumber && <span>-</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                {qualification.productInterest && qualification.productInterest.length > 0 ? (
                                  <>
                                    {qualification.productInterest.slice(0, 2).map((interest, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                    {qualification.productInterest.length > 2 && (
                                      <span className="px-2 py-0.5 bg-[#FF7898] text-white text-xs font-semibold rounded-full">
                                        +{qualification.productInterest.length - 2}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {qualification.source ? (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                                  {qualification.source}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {qualification.status ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusDotColor(qualification.status)}`}></div>
                                  <span className={`text-sm font-medium ${getStatusColor(qualification.status)}`}>
                                    {qualification.status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <QualificationActionsDropdown
                                qualificationId={qualification.id}
                                onEdit={() => openEditModal(qualification)}
                                onDelete={() => openDeleteConfirm(qualification.id)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageIndex(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {Math.min((pageIndex - 1) * pageSize + 1, totalCount)} - {Math.min(pageIndex * pageSize, totalCount)} of {totalCount} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageIndex}
                    onChange={(e) => setPageIndex(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">of {Math.ceil(totalCount / pageSize)} page{Math.ceil(totalCount / pageSize) !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                    disabled={pageIndex === 1}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    aria-label="Previous page"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPageIndex((prev) => Math.min(Math.ceil(totalCount / pageSize), prev + 1))}
                    disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    aria-label="Next page"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

