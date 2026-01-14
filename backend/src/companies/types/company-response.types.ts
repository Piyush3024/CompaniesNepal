import { Prisma } from '@prisma/client';

// Define the include type for company queries with relations
export const companyWithRelations =
  Prisma.validator<Prisma.companiesDefaultArgs>()({
    include: {
      areas: true,
      company_type: true,
      verification_status: true,
      company_branches: {
        include: {
          areas: true,
        },
      },
      company_categories: {
        include: {
          category: true,
        },
      },
    },
  });

// Extract the type from the validator
export type CompanyWithRelations = Prisma.companiesGetPayload<
  typeof companyWithRelations
>;

// Define the formatted response types
export interface FormattedArea {
  id: string;
  name: string;
}

export interface FormattedCompanyType {
  id: string;
  name: string;
}

export interface FormattedVerificationStatus {
  id: string;
  name: string;
}

export interface FormattedBranch {
  id: string;
  branch_name: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  area_id: string | null;
  area: FormattedArea | null;
}

export interface FormattedCategory {
  id: string;
  name: string;
}

// Base company response (without relations)
export interface CompanyResponseBase {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  slug: string;
  description: string | null;
  established_year: number | null;
  registration_number: string | null;
  social_media_links: Record<string, string> | null;
  documents_url: string[] | null;
  is_blocked: boolean;
  is_premium: boolean;
  is_verified: boolean;
  verified_at: Date;
  average_rating: number | null;
  total_reviews: number;
  total_products: number;
  total_inquiries: number;
  area_id: string | null;
  company_type_id: string;
  verification_status_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date | null;
}

// Company response with relations
export interface CompanyResponseWithRelations extends CompanyResponseBase {
  area?: FormattedArea;
  company_type?: FormattedCompanyType;
  verification_status?: FormattedVerificationStatus;
  branches?: FormattedBranch[];
  categories?: FormattedCategory[];
}

// Union type for the response (with or without relations)
export type CompanyResponse =
  | CompanyResponseBase
  | CompanyResponseWithRelations;
