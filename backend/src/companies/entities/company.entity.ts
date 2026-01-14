import { Exclude, Expose, Type } from 'class-transformer';

export class CompanyBranchEntity {
  @Expose()
  id: string;

  @Expose()
  branch_name: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  is_active: boolean;

  @Expose()
  area_id: string | null;

  @Expose()
  @Type(() => AreaEntity)
  area?: AreaEntity;
}

export class CompanyCategoryEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class AreaEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class CompanyTypeEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class VerificationStatusEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class CompanyEntity {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string | null;

  @Expose()
  phone: string | null;

  @Expose()
  website: string | null;

  @Expose()
  logo_url: string | null;

  @Expose()
  slug: string;

  @Expose()
  description: string | null;

  @Expose()
  established_year: number | null;

  @Expose()
  registration_number: string | null;

  @Expose()
  social_media_links: Record<string, string> | null;

  @Expose()
  documents_url: string[] | null;

  @Expose()
  is_blocked: boolean;

  @Expose()
  is_premium: boolean;

  @Expose()
  is_verified: boolean;

  @Expose()
  verified_at: Date | null;

  @Expose()
  average_rating: number | null;

  @Expose()
  total_reviews: number;

  @Expose()
  total_products: number;

  @Expose()
  total_inquiries: number;

  @Expose()
  area_id: string | null;

  @Expose()
  company_type_id: string;

  @Expose()
  verification_status_id: string | null;

  @Expose()
  created_by: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date | null;

  // Relations
  @Expose()
  @Type(() => AreaEntity)
  area?: AreaEntity;

  @Expose()
  @Type(() => CompanyTypeEntity)
  company_type?: CompanyTypeEntity;

  @Expose()
  @Type(() => VerificationStatusEntity)
  verification_status?: VerificationStatusEntity;

  @Expose()
  @Type(() => CompanyBranchEntity)
  branches?: CompanyBranchEntity[];

  @Expose()
  @Type(() => CompanyCategoryEntity)
  categories?: CompanyCategoryEntity[];
}

export class CompanyStatsEntity {
  @Expose()
  total_products: number;

  @Expose()
  total_inquiries: number;

  @Expose()
  total_reviews: number;

  @Expose()
  average_rating: number | null;
}

export class PaginatedCompaniesEntity {
  @Expose()
  @Type(() => CompanyEntity)
  data: CompanyEntity[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
