
export interface Area {
  id: string;
  name: string;
}

export interface CompanyType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationStatus {
  id: string;
  name: string;
}

export interface CompanyBranch {
  id: string;
  branch_name: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  area_id?: string;
  area?: Area;
}

export interface CompanyCategory {
  id: string;
  name: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  [key: string]: string | undefined;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  slug: string;
  description?: string;
  established_year?: number;
  registration_number?: string;
  social_media_links?: SocialMediaLinks;
  documents_url?: string[];
  is_blocked: boolean;
  is_premium: boolean;
  is_verified: boolean;
  verified_at?: string;
  average_rating?: number;
  total_reviews: number;
  total_products: number;
  total_inquiries: number;
  area_id?: string;
  company_type_id: string;
  verification_status_id?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  
 
  area?: Area;
  company_type?: CompanyType;
  verification_status?: VerificationStatus;
  branches?: CompanyBranch[];
  categories?: CompanyCategory[];
}



export interface CreateCompanyData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  established_year?: number;
  registration_number?: string;
  social_media_links?: SocialMediaLinks;
  company_type_id: string;
  area_id?: string;
  slug?: string;
  

  logo?: File;
  documents?: File[];
  

  branches?: CreateBranchData[];
  categories?: string[];
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  established_year?: number;
  registration_number?: string;
  social_media_links?: SocialMediaLinks;
  company_type_id?: string;
  area_id?: string;
  slug?: string;
  

  logo?: File;
  documents?: File[];
}

export interface CreateBranchData {
  branch_name: string;
  phone?: string;
  email?: string;
  area_id?: string;
  is_active?: boolean;
}



export interface CompanyFilters {

  company_type_id?: string;
  area_id?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  is_blocked?: boolean;
  

  min_rating?: number;
  max_rating?: number;
  

  min_year?: number;
  max_year?: number;
  

  min_reviews?: number;
  max_reviews?: number;
  

  min_products?: number;
  max_products?: number;
  

  min_inquiries?: number;
  max_inquiries?: number;
  
  
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'average_rating' | 'total_reviews' | 'total_products' | 'total_inquiries' | 'established_year' | 'verified_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyQueryParams extends PaginationParams, SortParams {
  includeBlocked?: boolean;
  includeRelations?: boolean;
}

export interface FilterCompaniesParams extends CompanyFilters, CompanyQueryParams {}

export interface SearchCompaniesParams extends CompanyQueryParams {
  query: string;
}


export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  min_reviews?: number;
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  data?: Company;
}

export interface CompaniesResponse {
  success: boolean;
  message: string;
  data?: Company[];
  meta?: PaginationMeta;
}

export interface SlugCheckResponse {
  success: boolean;
  isUnique: boolean;
  slug: string;
  message: string;
}

export interface CompanyStatsResponse {
  success: boolean;
  message: string;
  data?: {
    total_products: number;
    total_inquiries: number;
    total_reviews: number;
    average_rating: number | null;
  };
}

export interface CompanyTypesResponse {
  success: boolean;
  message: string;
  data?: CompanyType[];
}

export interface UpdateStatusData {
  is_premium?: boolean;
  is_verified?: boolean;
  verification_status_id?: string;
}


export interface CompanyError {
  success: false;
  message: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}



export interface CompanyState {

  companies: Company[];
  currentCompany: Company | null;
  myCompanies: Company[];
  companyTypes: CompanyType[];
  isLoading: boolean;
  error: string | null;
  
 
  pagination: PaginationMeta | null;
  
 
  isCompaniesLoaded: boolean;
  isMyCompaniesLoaded: boolean;
  isCompanyTypesLoaded: boolean;
  

  createCompany: (data: CreateCompanyData) => Promise<CompanyResponse>;
  updateCompany: (id: string, data: UpdateCompanyData) => Promise<CompanyResponse>;
  deleteCompany: (id: string) => Promise<{ success: boolean; message: string }>;
  getCompanyById: (id: string) => Promise<CompanyResponse>;
  getCompanyBySlug: (slug: string) => Promise<CompanyResponse>;
  

  getAllCompanies: (params?: CompanyQueryParams) => Promise<CompaniesResponse>;
  getMyCompanies: (params?: CompanyQueryParams) => Promise<CompaniesResponse>;
  getPremiumCompanies: (params?: CompanyQueryParams) => Promise<CompaniesResponse>;
  getVerifiedCompanies: (params?: CompanyQueryParams) => Promise<CompaniesResponse>;
  getTopRatedCompanies: (params?: CompanyQueryParams & { min_reviews?: number }) => Promise<CompaniesResponse>;
  getBlockedCompanies: (params?: CompanyQueryParams) => Promise<CompaniesResponse>;
  
  
  searchCompanies: (params: SearchCompaniesParams) => Promise<CompaniesResponse>;
  filterCompanies: (params: FilterCompaniesParams) => Promise<CompaniesResponse>;
  
  
  toggleBlockStatus: (id: string) => Promise<CompanyResponse>;
  updatePremiumStatus: (id: string, isPremium: boolean) => Promise<CompanyResponse>;
  updateVerificationStatus: (id: string, data: UpdateStatusData) => Promise<CompanyResponse>;
  
 
  checkSlugUniqueness: (slug: string, excludeId?: string) => Promise<SlugCheckResponse>;
  recalculateStats: (id: string) => Promise<CompanyStatsResponse>;
  getCompanyTypes: () => Promise<CompanyTypesResponse>;
  
   
  clearError: () => void;
  clearCurrentCompany: () => void;
  clearCompanies: () => void;
  setCurrentCompany: (company: Company | null) => void;
}