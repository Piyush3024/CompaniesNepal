import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { api } from "../lib/axios";
import {
  Company,
  CompanyState,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyResponse,
  CompaniesResponse,
  CompanyQueryParams,
  FilterCompaniesParams,
  SearchCompaniesParams,
  SlugCheckResponse,
  CompanyStatsResponse,
  CompanyTypesResponse,
  UpdateStatusData,
} from "../types/companytType";


const prepareFormData = (data: CreateCompanyData | UpdateCompanyData): FormData => {
  const formData = new FormData();

 
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'logo' || key === 'documents' || key === 'branches' || key === 'categories') {
      return; 
    }

    if (value !== undefined && value !== null) {
      if (key === 'social_media_links' && typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value));
      } else {
        formData.append(key, value as string);
      }
    }
  });

 
  if ('logo' in data && data.logo instanceof File) {
    formData.append('logo', data.logo);
  }

  
  if ('documents' in data && Array.isArray(data.documents)) {
    data.documents.forEach((doc) => {
      if (doc instanceof File) {
        formData.append('documents', doc);
      }
    });
  }

  
  if ('branches' in data && Array.isArray(data.branches)) {
    formData.append('branches', JSON.stringify(data.branches));
  }


  if ('categories' in data && Array.isArray(data.categories)) {
    formData.append('categories', JSON.stringify(data.categories));
  }

  return formData;
};


const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};


export const useCompanyStore = create<CompanyState>()(
  devtools(
    persist(
      (set, get) => ({
       
        companies: [],
        currentCompany: null,
        myCompanies: [],
        companyTypes: [],
        isLoading: false,
        error: null,
        pagination: null,
        isCompaniesLoaded: false,
        isMyCompaniesLoaded: false,
        isCompanyTypesLoaded: false,

 
        createCompany: async (data: CreateCompanyData) => {
          set({ isLoading: true, error: null });

          try {
            const formData = prepareFormData(data);

            const response = await api.post<CompanyResponse>(
              "/api/companies",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            if (response.data.success && response.data.data) {
              // Add to myCompanies cache
              set((state) => ({
                myCompanies: [response.data.data!, ...state.myCompanies],
                currentCompany: response.data.data!,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to create company";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

   
        updateCompany: async (id: string, data: UpdateCompanyData) => {
          set({ isLoading: true, error: null });

          try {
            const formData = prepareFormData(data);

            const response = await api.patch<CompanyResponse>(
              `/api/companies/${id}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            if (response.data.success && response.data.data) {
              const updatedCompany = response.data.data;

              // Update in all relevant caches
              set((state) => ({
                companies: state.companies.map((c) =>
                  c.id === id ? updatedCompany : c
                ),
                myCompanies: state.myCompanies.map((c) =>
                  c.id === id ? updatedCompany : c
                ),
                currentCompany:
                  state.currentCompany?.id === id
                    ? updatedCompany
                    : state.currentCompany,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to update company";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        deleteCompany: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.delete<{ success: boolean; message: string }>(
              `/api/companies/${id}`
            );

            if (response.data.success) {
              // Remove from all caches
              set((state) => ({
                companies: state.companies.filter((c) => c.id !== id),
                myCompanies: state.myCompanies.filter((c) => c.id !== id),
                currentCompany:
                  state.currentCompany?.id === id ? null : state.currentCompany,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to delete company";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        getCompanyById: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.get<CompanyResponse>(
              `/api/companies/${id}`
            );

            if (response.data.success && response.data.data) {
              set({
                currentCompany: response.data.data,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch company";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

       
        getCompanyBySlug: async (slug: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.get<CompanyResponse>(
              `/api/companies/${slug}`
            );

            if (response.data.success && response.data.data) {
              set({
                currentCompany: response.data.data,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch company";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        getAllCompanies: async (params?: CompanyQueryParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isCompaniesLoaded: true,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

    
        getMyCompanies: async (params?: CompanyQueryParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies/my-companies${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                myCompanies: response.data.data,
                pagination: response.data.meta || null,
                isMyCompaniesLoaded: true,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch my companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

     
        getPremiumCompanies: async (params?: CompanyQueryParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies/premium-companies${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch premium companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        getVerifiedCompanies: async (params?: CompanyQueryParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies/verified-companies${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch verified companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },


        getTopRatedCompanies: async (params?: CompanyQueryParams & { min_reviews?: number }) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies/top-rated${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch top rated companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },


        getBlockedCompanies: async (params?: CompanyQueryParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = params ? buildQueryString(params) : '';
            const response = await api.get<CompaniesResponse>(
              `/api/companies/blocked-companies${queryString ? `?${queryString}` : ''}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch blocked companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        searchCompanies: async (params: SearchCompaniesParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = buildQueryString(params);
            const response = await api.get<CompaniesResponse>(
              `/api/companies/search?${queryString}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to search companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

   
        filterCompanies: async (params: FilterCompaniesParams) => {
          set({ isLoading: true, error: null });

          try {
            const queryString = buildQueryString(params);
            const response = await api.get<CompaniesResponse>(
              `/api/companies/filter?${queryString}`
            );

            if (response.data.success && response.data.data) {
              set({
                companies: response.data.data,
                pagination: response.data.meta || null,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to filter companies";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

       
        toggleBlockStatus: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.patch<CompanyResponse>(
              `/api/companies/${id}/toggle-block`
            );

            if (response.data.success && response.data.data) {
              const updatedCompany = response.data.data;

              set((state) => ({
                companies: state.companies.map((c) =>
                  c.id === id ? updatedCompany : c
                ),
                currentCompany:
                  state.currentCompany?.id === id
                    ? updatedCompany
                    : state.currentCompany,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to toggle block status";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

       
        updatePremiumStatus: async (id: string, isPremium: boolean) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.patch<CompanyResponse>(
              `/api/companies/${id}/premium`,
              { is_premium: isPremium }
            );

            if (response.data.success && response.data.data) {
              const updatedCompany = response.data.data;

              set((state) => ({
                companies: state.companies.map((c) =>
                  c.id === id ? updatedCompany : c
                ),
                currentCompany:
                  state.currentCompany?.id === id
                    ? updatedCompany
                    : state.currentCompany,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to update premium status";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

     
        updateVerificationStatus: async (id: string, data: UpdateStatusData) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.patch<CompanyResponse>(
              `/api/companies/${id}/verification`,
              data
            );

            if (response.data.success && response.data.data) {
              const updatedCompany = response.data.data;

              set((state) => ({
                companies: state.companies.map((c) =>
                  c.id === id ? updatedCompany : c
                ),
                currentCompany:
                  state.currentCompany?.id === id
                    ? updatedCompany
                    : state.currentCompany,
                isLoading: false,
              }));
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to update verification status";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        checkSlugUniqueness: async (slug: string, excludeId?: string) => {
          try {
            const queryString = excludeId ? `?excludeId=${excludeId}` : '';
            const response = await api.get<SlugCheckResponse>(
              `/api/companies/slug/${slug}/check${queryString}`
            );

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to check slug uniqueness";

            return {
              success: false,
              isUnique: false,
              slug,
              message: errorMessage,
            };
          }
        },

    
        recalculateStats: async (id: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await api.patch<CompanyStatsResponse>(
              `/api/companies/${id}/recalculate-stats`
            );

            if (response.data.success) {
              set({ isLoading: false });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to recalculate statistics";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        getCompanyTypes: async () => {
          // Return cached data if available
          const { companyTypes, isCompanyTypesLoaded } = get();
          if (isCompanyTypesLoaded && companyTypes.length > 0) {
            return {
              success: true,
              message: "Company types retrieved from cache",
              data: companyTypes,
            };
          }

          set({ isLoading: true, error: null });

          try {
            const response = await api.get<CompanyTypesResponse>(
              "/api/companies/companyType"
            );

            if (response.data.success && response.data.data) {
              set({
                companyTypes: response.data.data,
                isCompanyTypesLoaded: true,
                isLoading: false,
              });
            } else {
              set({ isLoading: false, error: response.data.message });
            }

            return response.data;
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message || "Failed to fetch company types";
            set({ isLoading: false, error: errorMessage });

            return {
              success: false,
              message: errorMessage,
            };
          }
        },

        clearError: () => {
          set({ error: null });
        },

        clearCurrentCompany: () => {
          set({ currentCompany: null });
        },

        clearCompanies: () => {
          set({
            companies: [],
            pagination: null,
            isCompaniesLoaded: false,
          });
        },

        setCurrentCompany: (company: Company | null) => {
          set({ currentCompany: company });
        },
      }),
      {
        name: "company-storage",
        partialize: (state) => ({
          companyTypes: state.companyTypes,
          isCompanyTypesLoaded: state.isCompanyTypesLoaded,
        }),
      }
    ),
    {
      name: "company-store",
    }
  )
);