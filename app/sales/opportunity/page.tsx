"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import SvgIcon from "@/components/SvgIcon";
import { HiSearch, HiChevronDown, HiDotsVertical, HiPlus, HiUser } from "react-icons/hi";
import { opportunitiesApi, OpportunitiesListResponse, OpportunityListItem, CreateProposalRequest, ContractInvoiceItem } from "@/lib/api-client";
import CreateProposalModal, { CreateProposalFormData } from "@/components/CreateProposalModal";
import CreateContractModal, { CreateContractFormData } from "@/components/CreateContractModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

interface OpportunityCard {
  id: string;
  name: string;
  amount: number | null;
  companyName: string;
  date: string;
  stage: string;
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
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuOpportunityId, setActiveMenuOpportunityId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [modalOpportunityId, setModalOpportunityId] = useState<string | null>(null);
  const { toasts, success, error, removeToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const response: OpportunitiesListResponse = await opportunitiesApi.getOpportunities(1, 50);
        if (response.isSuccess && response.data && Array.isArray(response.data.data)) {
          const mapped: OpportunityCard[] = response.data.data.map((item: OpportunityListItem) => {
            const name =
              item.firstName ||
              item.companyName ||
              item.email?.split("@")[0] ||
              "Unknown";

            // Map backend status to simple stage buckets for the board
            const status = item.status?.toLowerCase() || "";
            let stage = "qualify";
            if (status.includes("meeting") || status.includes("present")) {
              stage = "meet-present";
            } else if (status.includes("proposal") || status.includes("propose")) {
              stage = "propose";
            } else if (status.includes("negotiat")) {
              stage = "negotiate";
            } else if (status.includes("closed") || status.includes("won") || status.includes("lost")) {
              stage = "closed";
            }

            return {
              id: item.id,
              name,
              amount: item.estimatedPotential,
              companyName: item.companyName || "—",
              // Backend doesn't currently provide a created date in this payload
              date: "",
              stage,
            };
          });
          setOpportunities(mapped);
        } else {
          setOpportunities([]);
        }
      } catch (err) {
        console.error("Error fetching opportunities:", err);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Close the floating menu when clicking anywhere else (but not while a modal is open)
  useEffect(() => {
    if (!activeMenuOpportunityId || isProposalModalOpen || isContractModalOpen) return;

    const handleClickOutside = () => {
      setActiveMenuOpportunityId(null);
      setMenuPosition(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMenuOpportunityId]);

  const activeOpportunity = activeMenuOpportunityId
    ? opportunities.find((opp) => opp.id === activeMenuOpportunityId) || null
    : null;

  const modalOpportunity = modalOpportunityId
    ? opportunities.find((opp) => opp.id === modalOpportunityId) || null
    : null;

  const buildProposalPayloadFromForm = (form: CreateProposalFormData): Omit<CreateProposalRequest, 'company' | 'firstName' | 'lastName' | 'email'> => {
    const convertDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}T00:00:00.000Z`;
      }
      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      } catch {
        // ignore
      }
      return null;
    };

    const convertPrice = (priceStr: string): number | null => {
      if (!priceStr || priceStr.trim() === '') return null;
      const cleaned = priceStr.replace(/[£,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    return {
      phoneNumber: form.phoneNumber || null,
      package: form.package || null,
      terms: form.terms || null,
      startDate: convertDate(form.startDate),
      endDate: convertDate(form.endDate),
      price: convertPrice(form.price),
      discount: convertPrice(form.discount),
      total: convertPrice(form.total),
      cvResumeFileName: form.cvResume ? form.cvResume.name : null,
      cvResumeFilePath: form.cvResume ? form.cvResume.name : null,
      status: form.status || "Draft",
      proposalInvoiceItems: form.proposalInvoiceItems.map((item) => ({
        installment: item.installment || "",
        price: convertPrice(item.price) || 0,
        dueDate: convertDate(item.dueDate) || new Date().toISOString(),
      })),
    };
  };

  const buildContractPayloadFromForm = async (form: CreateContractFormData): Promise<{
    details: string | null;
    season: string | null;
    startDate: string | null;
    endDate: string | null;
    totalAgreedPrice: number | null;
    discount: string | null;
    finalPrice: number | null;
    cvResumeBase64: string | null;
    cvResumeFileName: string | null;
    contractInvoiceItems: ContractInvoiceItem[];
  }> => {
    const convertDate = (dateStr: string): string | null => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}T00:00:00.000Z`;
      }
      return null;
    };

    const convertPrice = (priceStr: string): number | null => {
      if (!priceStr || priceStr.trim() === '') return null;
      const cleaned = priceStr.replace(/[£,]/g, '').replace('000', '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    let cvResumeBase64: string | null = null;
    let cvResumeFileName: string | null = null;

    if (form.cvResume) {
      cvResumeFileName = form.cvResume.name;
      cvResumeBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.includes(",") ? result.split(",")[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(form.cvResume as File);
      });
    }

    const convertDueDate = (dateStr: string): string => {
      if (!dateStr || dateStr.trim() === "") return new Date().toISOString();
      try {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const day = parts[0].padStart(2, "0");
          const month = parts[1].padStart(2, "0");
          const year = parts[2];
          return `${year}-${month}-${day}T00:00:00.000Z`;
        }
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
      } catch {
        // ignore
      }
      return new Date().toISOString();
    };

    return {
      details: form.contractDetails || null,
      season: form.season || null,
      startDate: convertDate(form.startDate),
      endDate: convertDate(form.endDate),
      totalAgreedPrice: convertPrice(form.totalAgreedPrice),
      discount: form.discount || null,
      finalPrice: convertPrice(form.finalPrice),
      cvResumeBase64,
      cvResumeFileName,
      contractInvoiceItems: form.invoiceItems.map((item) => ({
        installment: item.instalment,
        price: convertPrice(item.price) || 0,
        dueDate: convertDueDate(item.dueDate),
      })),
    };
  };

  const getOpportunitiesByStage = (stageId: string) => {
    const filtered = opportunities.filter(
      (opp) =>
        opp.stage === stageId &&
        (opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return filtered;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) {
      return "—";
    }
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
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                    const menuWidth = 224; // w-56
                                    const estimatedMenuHeight = 260; // approximate

                                    let top = rect.bottom + 8;
                                    let left = rect.right - menuWidth;

                                    if (left < 8) left = 8;
                                    if (left + menuWidth > window.innerWidth - 8) {
                                      left = window.innerWidth - menuWidth - 8;
                                    }

                                    if (top + estimatedMenuHeight > window.innerHeight - 8) {
                                      top = Math.max(8, rect.top - estimatedMenuHeight - 8);
                                    }

                                    setActiveMenuOpportunityId(opportunity.id);
                                    setMenuPosition({ top, left });
                                  }}
                                  className="absolute top-2 right-2 p-0.5 hover:bg-white/50 rounded transition-colors"
                                >
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

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Floating opportunity actions menu rendered above all containers */}
      {activeOpportunity && menuPosition && (
        <div
          className="fixed z-[2000] w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Move to stage
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {STAGES.map((targetStage) => (
              <button
                key={targetStage.id}
                type="button"
                disabled={targetStage.id === activeOpportunity.stage}
                onClick={(e) => {
                  e.stopPropagation();
                  if (targetStage.id === activeOpportunity.stage) return;
                  setOpportunities((prev) =>
                    prev.map((opp) =>
                      opp.id === activeOpportunity.id
                        ? { ...opp, stage: targetStage.id }
                        : opp
                    )
                  );
                  setActiveMenuOpportunityId(null);
                  setMenuPosition(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-gray-50 ${
                  targetStage.id === activeOpportunity.stage
                    ? "text-gray-400 cursor-default"
                    : "text-gray-700"
                }`}
              >
                <span>{targetStage.name}</span>
                {targetStage.id === activeOpportunity.stage && (
                  <span className="text-[10px] uppercase tracking-wide">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="px-3 pb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </p>
            </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
                if (activeOpportunity) {
                  setModalOpportunityId(activeOpportunity.id);
                  setIsProposalModalOpen(true);
                  setActiveMenuOpportunityId(null);
                  setMenuPosition(null);
                }
            }}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50"
          >
            Add proposal
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
                if (activeOpportunity) {
                  setModalOpportunityId(activeOpportunity.id);
                  setIsContractModalOpen(true);
                  setActiveMenuOpportunityId(null);
                  setMenuPosition(null);
                }
            }}
            className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50"
          >
            Add contract
          </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // In-session removal only
                setOpportunities((prev) =>
                  prev.filter((opp) => opp.id !== activeOpportunity.id)
                );
                setActiveMenuOpportunityId(null);
                setMenuPosition(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50"
            >
              Remove from board
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuOpportunityId(null);
                setMenuPosition(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Proposal Modal (from opportunity) */}
      {modalOpportunity && (
        <CreateProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setModalOpportunityId(null);
          }}
          onSubmit={async (formData: CreateProposalFormData) => {
            try {
              const payload = buildProposalPayloadFromForm(formData);
              const response = await opportunitiesApi.createProposalForOpportunity(
                modalOpportunity.id,
                payload
              );
              if (response?.isSuccess) {
                success("Proposal created successfully!");
                setIsProposalModalOpen(false);
                setModalOpportunityId(null);
                router.push("/sales/proposal");
              } else {
                const msg =
                  response?.message ||
                  response?.errors?.[0] ||
                  "Failed to create proposal for opportunity";
                error(msg);
                throw new Error(msg);
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0] ||
                err?.message ||
                "Failed to create proposal for opportunity. Please try again.";
              error(msg);
              throw err;
            }
          }}
          initialData={null}
          isEditMode={false}
          hideContactFields={true}
        />
      )}

      {/* Add Contract Modal (from opportunity) */}
      {modalOpportunity && (
        <CreateContractModal
          isOpen={isContractModalOpen}
          onClose={() => {
            setIsContractModalOpen(false);
            setModalOpportunityId(null);
          }}
          onSubmit={async (formData: CreateContractFormData) => {
            try {
              const payload = await buildContractPayloadFromForm(formData);
              const response = await opportunitiesApi.createContractForOpportunity(
                modalOpportunity.id,
                payload
              );
              if (response?.isSuccess) {
                success("Contract created successfully!");
                setIsContractModalOpen(false);
                setModalOpportunityId(null);
                router.push("/sales/contracts");
              } else {
                const msg =
                  response?.message ||
                  response?.errors?.[0] ||
                  "Failed to create contract for opportunity";
                error(msg);
                throw new Error(msg);
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0] ||
                err?.message ||
                "Failed to create contract for opportunity. Please try again.";
              error(msg);
              throw err;
            }
          }}
          initialData={null}
          isEditMode={false}
          hideClientInfo={true}
        />
      )}
    </ProtectedRoute>
  );
}


