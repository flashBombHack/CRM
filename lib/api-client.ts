import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://democrm-rsqo.onrender.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token management utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken: (refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  removeRefreshToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
  
  setTokenExpiry: (expiresIn: number): void => {
    if (typeof window === 'undefined') return;
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },
  
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() >= parseInt(expiryTime, 10);
  },
  
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        tokenStorage.clearAll();
        // Redirect to login if we're on client side
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }

      try {
        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        // Handle 500 errors silently - endpoint might be under construction
        if (response.status === 500) {
          console.warn('Token refresh endpoint returned 500 - continuing with existing token');
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          // Return the original request with existing token
          // The request might still work if the token hasn't actually expired
          return apiClient(originalRequest);
        }

        const data = await response.json().catch(() => ({
          isSuccess: false,
          message: 'Failed to parse response',
          data: null,
          errors: ['Failed to parse response'],
          responseCode: 0,
        }));

        if (response.ok && data.isSuccess && data.data) {
          const { token, refreshToken: newRefreshToken, expiresIn } = data.data;
          
          tokenStorage.setToken(token);
          tokenStorage.setRefreshToken(newRefreshToken);
          tokenStorage.setTokenExpiry(expiresIn);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          processQueue(null, token);
          isRefreshing = false;

          return apiClient(originalRequest);
        }

        // For non-500 errors, only logout if token is actually expired
        // Otherwise, try to continue with existing token
        if (tokenStorage.isTokenExpired()) {
          processQueue(error, null);
          isRefreshing = false;
          tokenStorage.clearAll();
          
          // Redirect to login if we're on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
          
          return Promise.reject(error);
        } else {
          // Token might still be valid, continue with existing token
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Only logout if token is actually expired
        if (tokenStorage.isTokenExpired()) {
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;
          tokenStorage.clearAll();
          
          // Redirect to login if we're on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
        } else {
          // Token might still be valid, continue with existing token
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          // Return original request with existing token
          return apiClient(originalRequest);
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Functions
export interface CreateLeadRequest {
  firstName: string;
  role: string | null;
  companyName: string;
  email: string;
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

export const leadsApi = {
  getLeads: async (pageIndex: number = 1, pageSize: number = 20) => {
    const response = await apiClient.get('/api/Leads', {
      params: {
        pageIndex,
        pageSize,
      },
    });
    return response.data;
  },
  getLeadById: async (id: string) => {
    const response = await apiClient.get(`/api/Leads/${id}`);
    return response.data;
  },
  moveToOpportunity: async (id: string) => {
    const response = await apiClient.post(`/api/Leads/${id}/move-to-opportunity`);
    return response.data;
  },
  createLead: async (leadData: CreateLeadRequest) => {
    const response = await apiClient.post('/api/Leads', leadData);
    return response.data;
  },
  updateLead: async (id: string, leadData: CreateLeadRequest) => {
    const response = await apiClient.put(`/api/Leads/update/${id}`, leadData);
    return response.data;
  },
  deleteLead: async (id: string) => {
    const response = await apiClient.delete(`/api/Leads/${id}`);
    return response.data;
  },
};

// Analytics API
export interface SeasonRevenueSummary {
  totalRevenueYTD: number;
  forecastedRevenueNext90Days: number;
  totalPipelineValue: number;
  dealsClosedYTD: number;
  winRate: number;
}

export interface SeasonRevenueSummaryResponse {
  isSuccess: boolean;
  message: string | null;
  data: SeasonRevenueSummary | null;
  errors: string[];
  responseCode: number;
}

export interface RevenueForecastItem {
  month: string;
  year: number;
  revenue: number;
}

export interface RevenueForecastResponse {
  isSuccess: boolean;
  message: string | null;
  data: RevenueForecastItem[] | null;
  errors: string[];
  responseCode: number;
}

export interface PipelineByProductLineItem {
  product: string;
  opportunities: number;
  pipelineValue: number;
}

export interface PipelineByProductLineResponse {
  isSuccess: boolean;
  message: string | null;
  data: PipelineByProductLineItem[] | null;
  errors: string[];
  responseCode: number;
}

export interface SponsorshipRevenueByCategoryItem {
  category: string;
  revenue: number;
  percentageContribution: number;
}

export interface SponsorshipRevenueByCategoryResponse {
  isSuccess: boolean;
  message: string | null;
  data: SponsorshipRevenueByCategoryItem[] | null;
  errors: string[];
  responseCode: number;
}

export const analyticsApi = {
  getSeasonRevenueSummary: async (
    year?: number
  ): Promise<SeasonRevenueSummaryResponse> => {
    const response = await apiClient.get('/api/Analytics/season-revenue-summary', {
      params: {
        year: year ?? null,
      },
    });
    return response.data;
  },
  getRevenueForecast: async (
    year?: number
  ): Promise<RevenueForecastResponse> => {
    const response = await apiClient.get('/api/Analytics/revenue-forecast', {
      params: {
        year: year ?? null,
      },
    });
    return response.data;
  },
  getPipelineByProductLine: async (): Promise<PipelineByProductLineResponse> => {
    const response = await apiClient.get('/api/Analytics/pipeline-by-product-line');
    return response.data;
  },
  getSponsorshipRevenueByCategory: async (
    year?: number
  ): Promise<SponsorshipRevenueByCategoryResponse> => {
    const response = await apiClient.get(
      '/api/Analytics/sponsorship-revenue-by-category',
      {
        params: {
          year: year ?? null,
        },
      }
    );
    return response.data;
  },
};

// AI Ideas API
export interface AiIdeasAnswerData {
  answer: string | null;
  data: any | null;
  entityType: string | null;
  count: number | null;
  summary: string | null;
}

export interface AiIdeasAskResponse {
  isSuccess: boolean;
  message: string | null;
  data: AiIdeasAnswerData | null;
  errors: string[];
  responseCode: number;
}

export const aiIdeasApi = {
  ask: async (query: string): Promise<AiIdeasAskResponse> => {
    const response = await apiClient.post("/api/AiIdeas/ask", {
      query,
    });
    return response.data;
  },
};

// Opportunities API
export interface OpportunityListItem {
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

export interface OpportunitiesListResponse {
  isSuccess: boolean;
  message: string | null;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    data: OpportunityListItem[];
  } | null;
  errors: string[];
  responseCode: number;
}

export const opportunitiesApi = {
  getOpportunities: async (
    pageIndex: number = 1,
    pageSize: number = 20
  ): Promise<OpportunitiesListResponse> => {
    const response = await apiClient.get('/api/Opportunities', {
      params: {
        pageIndex,
        pageSize,
      },
    });
    return response.data;
  },
  createProposalForOpportunity: async (id: string, payload: Omit<CreateProposalRequest, 'company' | 'firstName' | 'lastName' | 'email'>) => {
    const response = await apiClient.post(`/api/Opportunities/${id}/create-proposal`, payload);
    return response.data;
  },
  createContractForOpportunity: async (
    id: string,
    payload: {
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
    }
  ) => {
    const response = await apiClient.post(`/api/Opportunities/${id}/create-contract`, payload);
    return response.data;
  },
};

// Contracts API
export interface ContractInvoiceItem {
  installment: string;
  price: number;
  dueDate: string;
}

export interface CreateContractRequest {
  name: string;
  companyName: string;
  email: string;
  phoneNumber: string | null;
  status: string;
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
}

export const contractsApi = {
  getContracts: async (pageIndex: number = 1, pageSize: number = 20, status: string | null = null) => {
    const response = await apiClient.get('/api/Contracts', {
      params: {
        pageIndex,
        pageSize,
        ...(status && status !== 'All contracts' && { status }),
      },
    });
    return response.data;
  },
  getContractById: async (id: string) => {
    const response = await apiClient.get(`/api/Contracts/${id}`);
    return response.data;
  },
  createContract: async (contractData: CreateContractRequest) => {
    const response = await apiClient.post('/api/Contracts', contractData);
    return response.data;
  },
  deleteContract: async (id: string) => {
    const response = await apiClient.delete(`/api/Contracts/${id}`);
    return response.data;
  },
  updateContract: async (id: string, contractData: CreateContractRequest) => {
    const response = await apiClient.put(`/api/Contracts/update/${id}`, contractData);
    return response.data;
  },
};

// Invoices API
export interface InvoiceItem {
  id?: string | null;
  item: string | null;
  qty: number | null;
  price: number | null;
}

export interface CreateInvoiceRequest {
  companyName: string;
  primaryName: string;
  email: string;
  phoneNumberCountryCode: string | null;
  phoneNumber: string | null;
  billingAddress: string | null;
  totalAmount: number;
  amountBilled: number;
  amountDue: number;
  billedOnDate: string;
  dueDate: string;
  status: string;
  invoiceNotes: string | null;
  contractId: string | null;
  packageSold: string | null;
  contractValue: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  invoiceItems: InvoiceItem[];
}

export const invoicesApi = {
  getInvoices: async (pageIndex: number = 1, pageSize: number = 20, status: string | null = null) => {
    const response = await apiClient.get('/api/Invoices', {
      params: {
        pageIndex,
        pageSize,
        ...(status && status !== 'All invoices' && { status }),
      },
    });
    return response.data;
  },
  getInvoiceById: async (id: string) => {
    const response = await apiClient.get(`/api/Invoices/${id}`);
    return response.data;
  },
  createInvoice: async (invoiceData: CreateInvoiceRequest) => {
    const response = await apiClient.post('/api/Invoices', invoiceData);
    return response.data;
  },
  updateInvoice: async (id: string, invoiceData: CreateInvoiceRequest) => {
    const response = await apiClient.put(`/api/Invoices/update/${id}`, invoiceData);
    return response.data;
  },
  deleteInvoice: async (id: string) => {
    const response = await apiClient.delete(`/api/Invoices/${id}`);
    return response.data;
  },
};

// Proposals API
export interface ProposalInvoiceItem {
  installment: string;
  price: number;
  dueDate: string;
}

export interface CreateProposalRequest {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  package: string | null;
  terms: string | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  discount: number | null;
  total: number | null;
  cvResumeFileName: string | null;
  cvResumeFilePath: string | null;
  status: string;
  proposalInvoiceItems: ProposalInvoiceItem[] | null;
}

export const proposalsApi = {
  getProposals: async (pageIndex: number = 1, pageSize: number = 20, status: string | null = null) => {
    const response = await apiClient.get('/api/Proposals', {
      params: {
        pageIndex,
        pageSize,
        ...(status && { status }),
      },
    });
    return response.data;
  },
  getProposalById: async (id: string) => {
    const response = await apiClient.get(`/api/Proposals/${id}`);
    return response.data;
  },
  createProposal: async (proposalData: CreateProposalRequest) => {
    const response = await apiClient.post('/api/Proposals', proposalData);
    return response.data;
  },
  updateProposal: async (id: string, proposalData: CreateProposalRequest) => {
    const response = await apiClient.put(`/api/Proposals/update/${id}`, proposalData);
    return response.data;
  },
  deleteProposal: async (id: string) => {
    const response = await apiClient.delete(`/api/Proposals/${id}`);
    return response.data;
  },
};

export default apiClient;

