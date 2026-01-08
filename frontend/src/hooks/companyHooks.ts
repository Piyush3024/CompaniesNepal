import { useEffect, useCallback } from "react";
import { useCompanyStore } from "../store/companyStore";
import { useAuthStore } from "../store/authStore";
import {
  CreateCompanyData,
  UpdateCompanyData,
  CompanyQueryParams,
  FilterCompaniesParams,
  SearchCompaniesParams,
  UpdateStatusData,
} from "../types/companytType";


export const useCompany = () => {
  const {
    companies,
    currentCompany,
    myCompanies,
    companyTypes,
    isLoading,
    error,
    pagination,
    isCompaniesLoaded,
    isMyCompaniesLoaded,
    isCompanyTypesLoaded,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    getCompanyBySlug,
    getAllCompanies,
    getMyCompanies,
    getPremiumCompanies,
    getVerifiedCompanies,
    getTopRatedCompanies,
    getBlockedCompanies,
    searchCompanies,
    filterCompanies,
    toggleBlockStatus,
    updatePremiumStatus,
    updateVerificationStatus,
    checkSlugUniqueness,
    recalculateStats,
    getCompanyTypes,
    clearError,
    clearCurrentCompany,
    clearCompanies,
    setCurrentCompany,
  } = useCompanyStore();

  return {
    
    companies,
    currentCompany,
    myCompanies,
    companyTypes,
    isLoading,
    error,
    pagination,
    isCompaniesLoaded,
    isMyCompaniesLoaded,
    isCompanyTypesLoaded,

   
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    getCompanyBySlug,
    getAllCompanies,
    getMyCompanies,
    getPremiumCompanies,
    getVerifiedCompanies,
    getTopRatedCompanies,
    getBlockedCompanies,
    searchCompanies,
    filterCompanies,
    toggleBlockStatus,
    updatePremiumStatus,
    updateVerificationStatus,
    checkSlugUniqueness,
    recalculateStats,
    getCompanyTypes,
    clearError,
    clearCurrentCompany,
    clearCompanies,
    setCurrentCompany,
  };
};


export const useCompanyCRUD = () => {
  const {
    createCompany,
    updateCompany,
    deleteCompany,
    isLoading,
    error,
    clearError,
  } = useCompanyStore();

  const handleCreate = useCallback(
    async (data: CreateCompanyData) => {
      clearError();
      return await createCompany(data);
    },
    [createCompany, clearError]
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateCompanyData) => {
      clearError();
      return await updateCompany(id, data);
    },
    [updateCompany, clearError]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      clearError();
      return await deleteCompany(id);
    },
    [deleteCompany, clearError]
  );

  return {
    createCompany: handleCreate,
    updateCompany: handleUpdate,
    deleteCompany: handleDelete,
    isLoading,
    error,
    clearError,
  };
};


export const useCompanyDetails = (idOrSlug?: string, autoFetch = true) => {
  const {
    currentCompany,
    isLoading,
    error,
    getCompanyById,
    getCompanyBySlug,
    clearCurrentCompany,
    clearError,
  } = useCompanyStore();

  const fetchCompany = useCallback(async () => {
    if (!idOrSlug) return;

    clearError();

    // Check if it's an encoded ID (typically starts with specific pattern) or a slug
    // For simplicity, we'll try to fetch by ID first, then by slug if it fails
    const isLikelySlug = !/^\w+$/.test(idOrSlug) || idOrSlug.includes('-');

    if (isLikelySlug) {
      return await getCompanyBySlug(idOrSlug);
    } else {
      return await getCompanyById(idOrSlug);
    }
  }, [idOrSlug, getCompanyById, getCompanyBySlug, clearError]);

  useEffect(() => {
    if (autoFetch && idOrSlug) {
      fetchCompany();
    }

    // Cleanup on unmount
    return () => {
      if (autoFetch) {
        clearCurrentCompany();
      }
    };
  }, [idOrSlug, autoFetch, fetchCompany, clearCurrentCompany]);

  return {
    company: currentCompany,
    isLoading,
    error,
    refetch: fetchCompany,
    clearError,
  };
};


export const useCompanyList = (params?: CompanyQueryParams, autoFetch = true) => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    isCompaniesLoaded,
    getAllCompanies,
    clearError,
  } = useCompanyStore();

  const fetchCompanies = useCallback(async () => {
    clearError();
    return await getAllCompanies(params);
  }, [getAllCompanies, params, clearError]);

  useEffect(() => {
    if (autoFetch && !isCompaniesLoaded) {
      fetchCompanies();
    }
  }, [autoFetch, isCompaniesLoaded, fetchCompanies]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    refetch: fetchCompanies,
    clearError,
  };
};


export const useMyCompanies = (params?: CompanyQueryParams, autoFetch = true) => {
  const {
    myCompanies,
    pagination,
    isLoading,
    error,
    isMyCompaniesLoaded,
    getMyCompanies,
    clearError,
  } = useCompanyStore();

  const fetchMyCompanies = useCallback(async () => {
    clearError();
    return await getMyCompanies(params);
  }, [getMyCompanies, params, clearError]);

  useEffect(() => {
    if (autoFetch && !isMyCompaniesLoaded) {
      fetchMyCompanies();
    }
  }, [autoFetch, isMyCompaniesLoaded, fetchMyCompanies]);

  return {
    companies: myCompanies,
    pagination,
    isLoading,
    error,
    refetch: fetchMyCompanies,
    clearError,
  };
};


export const usePremiumCompanies = (
  params?: CompanyQueryParams,
  autoFetch = false
) => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    getPremiumCompanies,
    clearError,
  } = useCompanyStore();

  const fetchPremiumCompanies = useCallback(async () => {
    clearError();
    return await getPremiumCompanies(params);
  }, [getPremiumCompanies, params, clearError]);

  useEffect(() => {
    if (autoFetch) {
      fetchPremiumCompanies();
    }
  }, [autoFetch, fetchPremiumCompanies]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    refetch: fetchPremiumCompanies,
    clearError,
  };
};


export const useVerifiedCompanies = (
  params?: CompanyQueryParams,
  autoFetch = false
) => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    getVerifiedCompanies,
    clearError,
  } = useCompanyStore();

  const fetchVerifiedCompanies = useCallback(async () => {
    clearError();
    return await getVerifiedCompanies(params);
  }, [getVerifiedCompanies, params, clearError]);

  useEffect(() => {
    if (autoFetch) {
      fetchVerifiedCompanies();
    }
  }, [autoFetch, fetchVerifiedCompanies]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    refetch: fetchVerifiedCompanies,
    clearError,
  };
};


export const useTopRatedCompanies = (
  params?: CompanyQueryParams & { min_reviews?: number },
  autoFetch = false
) => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    getTopRatedCompanies,
    clearError,
  } = useCompanyStore();

  const fetchTopRatedCompanies = useCallback(async () => {
    clearError();
    return await getTopRatedCompanies(params);
  }, [getTopRatedCompanies, params, clearError]);

  useEffect(() => {
    if (autoFetch) {
      fetchTopRatedCompanies();
    }
  }, [autoFetch, fetchTopRatedCompanies]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    refetch: fetchTopRatedCompanies,
    clearError,
  };
};


export const useCompanySearch = () => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    searchCompanies,
    clearCompanies,
    clearError,
  } = useCompanyStore();

  const handleSearch = useCallback(
    async (params: SearchCompaniesParams) => {
      clearError();
      return await searchCompanies(params);
    },
    [searchCompanies, clearError]
  );

  const resetSearch = useCallback(() => {
    clearCompanies();
    clearError();
  }, [clearCompanies, clearError]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    search: handleSearch,
    resetSearch,
    clearError,
  };
};


export const useCompanyFilter = () => {
  const {
    companies,
    pagination,
    isLoading,
    error,
    filterCompanies,
    clearCompanies,
    clearError,
  } = useCompanyStore();

  const handleFilter = useCallback(
    async (params: FilterCompaniesParams) => {
      clearError();
      return await filterCompanies(params);
    },
    [filterCompanies, clearError]
  );

  const resetFilters = useCallback(() => {
    clearCompanies();
    clearError();
  }, [clearCompanies, clearError]);

  return {
    companies,
    pagination,
    isLoading,
    error,
    filter: handleFilter,
    resetFilters,
    clearError,
  };
};


export const useCompanyAdmin = () => {
  const { user } = useAuthStore();
  const {
    toggleBlockStatus,
    updatePremiumStatus,
    updateVerificationStatus,
    recalculateStats,
    getBlockedCompanies,
    isLoading,
    error,
    clearError,
  } = useCompanyStore();

  const isAdmin = user?.role?.name === "admin";

  const handleToggleBlock = useCallback(
    async (id: string) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      clearError();
      return await toggleBlockStatus(id);
    },
    [toggleBlockStatus, isAdmin, clearError]
  );

  const handleUpdatePremium = useCallback(
    async (id: string, isPremium: boolean) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      clearError();
      return await updatePremiumStatus(id, isPremium);
    },
    [updatePremiumStatus, isAdmin, clearError]
  );

  const handleUpdateVerification = useCallback(
    async (id: string, data: UpdateStatusData) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      clearError();
      return await updateVerificationStatus(id, data);
    },
    [updateVerificationStatus, isAdmin, clearError]
  );

  const handleRecalculateStats = useCallback(
    async (id: string) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      clearError();
      return await recalculateStats(id);
    },
    [recalculateStats, isAdmin, clearError]
  );

  const handleGetBlockedCompanies = useCallback(
    async (params?: CompanyQueryParams) => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }
      clearError();
      return await getBlockedCompanies(params);
    },
    [getBlockedCompanies, isAdmin, clearError]
  );

  return {
    isAdmin,
    toggleBlockStatus: handleToggleBlock,
    updatePremiumStatus: handleUpdatePremium,
    updateVerificationStatus: handleUpdateVerification,
    recalculateStats: handleRecalculateStats,
    getBlockedCompanies: handleGetBlockedCompanies,
    isLoading,
    error,
    clearError,
  };
};


export const useSlugChecker = () => {
  const { checkSlugUniqueness } = useCompanyStore();

  const checkSlug = useCallback(
    async (slug: string, excludeId?: string) => {
      return await checkSlugUniqueness(slug, excludeId);
    },
    [checkSlugUniqueness]
  );

  return {
    checkSlug,
  };
};


export const useCompanyTypes = (autoFetch = true) => {
  const {
    companyTypes,
    isLoading,
    error,
    isCompanyTypesLoaded,
    getCompanyTypes,
    clearError,
  } = useCompanyStore();

  const fetchCompanyTypes = useCallback(async () => {
    clearError();
    return await getCompanyTypes();
  }, [getCompanyTypes, clearError]);

  useEffect(() => {
    if (autoFetch && !isCompanyTypesLoaded) {
      fetchCompanyTypes();
    }
  }, [autoFetch, isCompanyTypesLoaded, fetchCompanyTypes]);

  return {
    companyTypes,
    isLoading,
    error,
    refetch: fetchCompanyTypes,
    clearError,
  };
};


export const useCompanyPermissions = (companyId?: string) => {
  const { user } = useAuthStore();
  const { currentCompany } = useCompanyStore();

  const isAdmin = user?.role?.name === "admin";
  const isSeller = user?.role?.name === "seller";
  const isOwner = currentCompany?.created_by === user?.id;

  const canEdit = isAdmin || (isSeller && isOwner);
  const canDelete = isAdmin;
  const canManageStatus = isAdmin;
  const canCreate = isAdmin || isSeller;

  return {
    isAdmin,
    isSeller,
    isOwner,
    canEdit,
    canDelete,
    canManageStatus,
    canCreate,
  };
};


export const useCompanyStats = (companyId?: string) => {
  const { currentCompany } = useCompanyStore();

  const company = currentCompany?.id === companyId ? currentCompany : null;

  const stats = {
    totalProducts: company?.total_products || 0,
    totalInquiries: company?.total_inquiries || 0,
    totalReviews: company?.total_reviews || 0,
    averageRating: company?.average_rating || 0,
    isPremium: company?.is_premium || false,
    isVerified: company?.is_verified || false,
    isBlocked: company?.is_blocked || false,
  };

  const hasReviews = stats.totalReviews > 0;
  const hasProducts = stats.totalProducts > 0;
  const hasInquiries = stats.totalInquiries > 0;

  return {
    stats,
    hasReviews,
    hasProducts,
    hasInquiries,
    company,
  };
};


export const useInitializeCompanyTypes = () => {
  const { getCompanyTypes, isCompanyTypesLoaded } = useCompanyStore();

  useEffect(() => {
    if (!isCompanyTypesLoaded) {
      getCompanyTypes();
    }
  }, [getCompanyTypes, isCompanyTypesLoaded]);

  return { isLoaded: isCompanyTypesLoaded };
};