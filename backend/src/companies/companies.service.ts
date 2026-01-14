import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadService } from '../file/file-upload.service';
import { Request } from 'express';
import { encodeId, decodeId } from '../common/utils/secure.util';
import { UserWithRole } from '../auth/types/user-with-role.type';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  FilterCompaniesDto,
  SortQueryDto,
  SearchQueryDto,
  TopRatedQueryDto,
  UpdatePremiumStatusDto,
  UpdateVerificationStatusDto,
} from './dto';
import { COMPANY_ERRORS } from './constants/company.constants';
import {
  CompanyWithRelations,
  CompanyResponse,
  CompanyResponseBase,
  CompanyResponseWithRelations,
  companyWithRelations,
} from './types/company-response.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private async generateSlug(
    name: string,
    excludeId?: number,
  ): Promise<string> {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let uniqueSlug = slug;
    let counter = 1;

    while (
      await this.prisma.companies.findFirst({
        where: {
          slug: uniqueSlug,
          NOT: excludeId ? { id: excludeId } : undefined,
        },
      })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async recalculateCompanyStats(companyId: number) {
    try {
      const [productsCount, inquiriesCount, reviewsData] = await Promise.all([
        this.prisma.products.count({ where: { company_id: companyId } }),
        this.prisma.inquiries.count({ where: { company_id: companyId } }),
        this.prisma.company_reviews.aggregate({
          where: { company_id: companyId },
          _count: true,
          _avg: { rating: true },
        }),
      ]);

      const totalReviews = reviewsData._count || 0;
      const averageRating = reviewsData._avg.rating || null;

      await this.prisma.companies.update({
        where: { id: companyId },
        data: {
          total_products: productsCount,
          total_inquiries: inquiriesCount,
          total_reviews: totalReviews,
          average_rating: averageRating,
        },
      });

      return {
        total_products: productsCount,
        total_inquiries: inquiriesCount,
        total_reviews: totalReviews,
        average_rating: averageRating,
      };
    } catch (error) {
      this.logger.error('Error recalculating company stats:', error);
      throw error;
    }
  }

  private formatCompanyResponse(
    company: CompanyWithRelations,
    req: Request,
    includeRelations: boolean = false,
  ): CompanyResponse {
    const formatted: CompanyResponseBase = {
      id: encodeId(company.id),
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      logo_url: this.fileUploadService.generateFileUrl(req, company.logo_url),
      slug: company.slug,
      description: company.description,
      established_year: company.established_year,
      registration_number: company.registration_number,
      social_media_links: company.social_media_links
        ? (JSON.parse(company.social_media_links) as Record<string, string>)
        : null,
      documents_url: company.documents_url
        ? this.fileUploadService.generateFileUrls(
            req,
            JSON.parse(company.documents_url),
          )
        : null,
      is_blocked: company.is_blocked,
      is_premium: company.is_premium,
      is_verified: company.is_verified,
      verified_at: company.verified_at,
      average_rating: company.average_rating
        ? parseFloat(company.average_rating.toString())
        : null,
      total_reviews: company.total_reviews,
      total_products: company.total_products,
      total_inquiries: company.total_inquiries,
      area_id: company.area_id ? encodeId(company.area_id) : null,
      company_type_id: encodeId(company.company_type_id),
      verification_status_id: company.verification_status_id
        ? encodeId(company.verification_status_id)
        : null,
      created_by: encodeId(company.created_by),
      created_at: company.created_at,
      updated_at: company.updated_at,
    };

    if (includeRelations) {
      const withRelations: CompanyResponseWithRelations = {
        ...formatted,
      };

      if (company.areas) {
        withRelations.area = {
          id: encodeId(company.areas.id),
          name: company.areas.name,
        };
      }

      if (company.company_type) {
        withRelations.company_type = {
          id: encodeId(company.company_type.id),
          name: company.company_type.name,
        };
      }

      if (company.verification_status) {
        withRelations.verification_status = {
          id: encodeId(company.verification_status.id),
          name: company.verification_status.status_name,
        };
      }

      if (company.company_branches) {
        withRelations.branches = company.company_branches.map((branch) => ({
          id: encodeId(branch.id),
          branch_name: branch.branch_name,
          phone: branch.phone,
          email: branch.email,
          is_active: branch.is_active,
          area_id: branch.area_id ? encodeId(branch.area_id) : null,
          area: branch.areas
            ? {
                id: encodeId(branch.areas.id),
                name: branch.areas.name,
              }
            : null,
        }));
      }

      if (company.company_categories) {
        withRelations.categories = company.company_categories.map((cc) => ({
          id: encodeId(cc.category.id),
          name: cc.category.name,
        }));
      }

      return withRelations;
    }

    return formatted;
  }

  async create(
    createCompanyDto: CreateCompanyDto,
    files: {
      logo_url?: Express.Multer.File[];
      documents_url?: Express.Multer.File[];
    },
    user: UserWithRole,
    req: Request,
  ): Promise<CompanyResponse> {
    try {
      // Decode IDs
      const decodedCompanyTypeId = decodeId(createCompanyDto.company_type_id);
      const decodedAreaId = createCompanyDto.area_id
        ? decodeId(createCompanyDto.area_id)
        : null;

      // Validate company type exists
      const companyType = await this.prisma.company_type.findUnique({
        where: { id: decodedCompanyTypeId },
      });

      if (!companyType) {
        throw new BadRequestException(COMPANY_ERRORS.INVALID_COMPANY_TYPE);
      }

      // Validate area if provided
      if (decodedAreaId) {
        const area = await this.prisma.areas.findUnique({
          where: { id: decodedAreaId },
        });

        if (!area) {
          throw new BadRequestException(COMPANY_ERRORS.INVALID_AREA);
        }
      }

      // Generate slug
      const slug =
        createCompanyDto.slug ||
        (await this.generateSlug(createCompanyDto.name));

      // Check for existing slug
      const existingSlug = await this.prisma.companies.findFirst({
        where: { slug },
      });

      if (existingSlug) {
        throw new BadRequestException(COMPANY_ERRORS.SLUG_EXISTS);
      }

      // Handle file uploads
      const uploadedFiles = this.fileUploadService.getUploadedFiles(files);
      const finalLogoPath = uploadedFiles.logo_url as string | undefined;
      const finalDocumentPaths = uploadedFiles.documents_url
        ? Array.isArray(uploadedFiles.documents_url)
          ? uploadedFiles.documents_url
          : [uploadedFiles.documents_url]
        : [];

      // Parse social media links
      let parsedSocialMediaLinks: string | null = null;
      if (createCompanyDto.social_media_links) {
        try {
          parsedSocialMediaLinks =
            typeof createCompanyDto.social_media_links === 'string'
              ? createCompanyDto.social_media_links
              : JSON.stringify(createCompanyDto.social_media_links);
        } catch (error) {
          this.logger.error('Error parsing social media links:', error);
        }
      }

      // Create company with transaction
      const company = await this.prisma.$transaction(async (tx) => {
        // Create company
        const newCompany = await tx.companies.create({
          data: {
            name: createCompanyDto.name,
            email: createCompanyDto.email,
            phone: createCompanyDto.phone,
            website: createCompanyDto.website,
            slug,
            description: createCompanyDto.description,
            established_year: createCompanyDto.established_year,
            registration_number: createCompanyDto.registration_number,
            social_media_links: parsedSocialMediaLinks,
            logo_url: finalLogoPath || null,
            documents_url:
              finalDocumentPaths.length > 0
                ? JSON.stringify(finalDocumentPaths)
                : null,
            company_type_id: decodedCompanyTypeId,
            area_id: decodedAreaId,
            created_by: user.id,
            verified_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Add creator to company_users
        await tx.company_users.create({
          data: {
            company_id: newCompany.id,
            user_id: user.id,
            created_at: new Date(),
          },
        });

        // Create branches if provided
        if (
          createCompanyDto.branches &&
          Array.isArray(createCompanyDto.branches) &&
          createCompanyDto.branches.length > 0
        ) {
          const branchData = createCompanyDto.branches.map((branch) => ({
            company_id: newCompany.id,
            branch_name: branch.branch_name,
            phone: branch.phone,
            email: branch.email,
            area_id: branch.area_id ? decodeId(branch.area_id) : null,
            is_active: branch.is_active !== undefined ? branch.is_active : true,
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await tx.company_branches.createMany({
            data: branchData,
          });
        }

        // Create categories if provided
        if (
          createCompanyDto.categories &&
          Array.isArray(createCompanyDto.categories) &&
          createCompanyDto.categories.length > 0
        ) {
          for (const category of createCompanyDto.categories) {
            // Find or create category
            let existingCategory = await tx.categories.findFirst({
              where: { name: category.name },
            });

            if (!existingCategory) {
              existingCategory = await tx.categories.create({
                data: { name: category.name },
              });
            }

            // Link category to company
            await tx.company_categories.create({
              data: {
                company_id: newCompany.id,
                category_id: existingCategory.id,
              },
            });
          }
        }

        return newCompany;
      });

      // Fetch complete company data with relations
      const completeCompany = await this.prisma.companies.findUnique({
        where: { id: company.id },
        ...companyWithRelations,
      });
      if (!completeCompany) {
        throw new NotFoundException('Company not found after creation');
      }
      return this.formatCompanyResponse(completeCompany, req, true);
    } catch (error) {
      this.logger.error('Error creating company:', error);
      throw error;
    }
  }

  async findByIdOrSlug(
    idOrSlug: string,
    user: UserWithRole | null,
    req: Request,
  ) {
    let company: CompanyWithRelations | null;
    const decodedId = decodeId(idOrSlug);

    if (decodedId) {
      company = await this.prisma.companies.findUnique({
        where: { id: decodedId },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
          company_branches: {
            where: { is_active: true },
            include: { areas: true },
          },
          company_categories: {
            include: { category: true },
          },
        },
      });
    } else {
      company = await this.prisma.companies.findUnique({
        where: { slug: idOrSlug },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
          company_branches: {
            where: { is_active: true },
            include: { areas: true },
          },
          company_categories: {
            include: { category: true },
          },
        },
      });
    }

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    // Check if blocked (only show to admins)
    if (company.is_blocked && user?.role?.name !== 'admin') {
      throw new ForbiddenException(COMPANY_ERRORS.BLOCKED_COMPANY);
    }

    return this.formatCompanyResponse(company, req, true);
  }

  async findAll(query: SortQueryDto, user: UserWithRole | null, req: Request) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: { is_blocked?: boolean } = {};

    // Only admins can see blocked companies
    if (user?.role?.name !== ('admin' as string)) {
      where.is_blocked = false;
    }

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPremium(query: SortQueryDto, req: Request) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'average_rating',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      is_premium: true,
      is_blocked: false,
    };

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findVerified(query: SortQueryDto, req: Request) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'verified_at',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where = {
      is_verified: true,
      is_blocked: false,
    };

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTopRated(query: TopRatedQueryDto, req: Request) {
    const { page = 1, limit = 10, min_reviews = 5 } = query;
    const skip = (page - 1) * limit;

    const where = {
      is_blocked: false,
      total_reviews: { gte: min_reviews },
      average_rating: { not: null },
    };

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ average_rating: 'desc' }, { total_reviews: 'desc' }],
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        min_reviews,
      },
    };
  }

  async findBlocked(query: SortQueryDto, req: Request) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where = { is_blocked: true };

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyCompanies(query: SortQueryDto, user: UserWithRole, req: Request) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    // Get companies where user is in company_users
    const companyUsers = await this.prisma.company_users.findMany({
      where: { user_id: user.id },
      select: { company_id: true },
    });

    const companyIds = companyUsers.map((cu) => cu.company_id);

    const where = { id: { in: companyIds } };

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...companyWithRelations,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(query: SearchQueryDto, user: UserWithRole | null, req: Request) {
    const {
      query: searchQuery,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.companiesWhereInput = {};

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { email: { contains: searchQuery } },
        { phone: { contains: searchQuery } },
        { registration_number: { contains: searchQuery } },
      ];
    }

    // Only show non-blocked companies to non-admins
    if (user?.role?.name !== 'admin') {
      where.is_blocked = false;
    }

    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company: CompanyWithRelations) =>
        this.formatCompanyResponse(company, req, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async filter(
    filterDto: FilterCompaniesDto,
    user: UserWithRole | null,
    req: Request,
  ) {
    const {
      // Pagination
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',

      // Filters
      company_type_id,
      area_id,
      is_premium,
      is_verified,
      is_blocked,
      min_rating,
      max_rating,
      min_year,
      max_year,
      min_reviews,
      max_reviews,
      min_products,
      max_products,
      min_inquiries,
      max_inquiries,
      search,
      includeRelations = true,
    } = filterDto;

    const skip = (page - 1) * limit;
    const where: CompanyWithRelations | Prisma.companiesWhereInput = {};

    // Filter by company type
    if (company_type_id) {
      const decodedTypeId = decodeId(company_type_id);
      if (decodedTypeId) {
        where.company_type_id = decodedTypeId;
      }
    }

    // Filter by area
    if (area_id) {
      const decodedAreaId = decodeId(area_id);
      if (decodedAreaId) {
        where.area_id = decodedAreaId;
      }
    }

    // Filter by premium status
    if (is_premium !== undefined) {
      where.is_premium = is_premium;
    }

    // Filter by verified status
    if (is_verified !== undefined) {
      where.is_verified = is_verified;
    }

    // Filter by blocked status (admin only)
    if (is_blocked !== undefined && user?.role?.name === 'admin') {
      where.is_blocked = is_blocked;
    } else if (user?.role?.name !== 'admin') {
      where.is_blocked = false;
    }

    // Filter by rating range
    if (min_rating || max_rating) {
      where.average_rating = {};
      if (min_rating) {
        where.average_rating.gte = min_rating;
      }
      if (max_rating) {
        where.average_rating.lte = max_rating;
      }
    }

    // Filter by established year range
    if (min_year || max_year) {
      where.established_year = {};
      if (min_year) {
        where.established_year.gte = min_year;
      }
      if (max_year) {
        where.established_year.lte = max_year;
      }
    }

    // Filter by review count range
    if (min_reviews || max_reviews) {
      where.total_reviews = {};
      if (min_reviews) {
        where.total_reviews.gte = min_reviews;
      }
      if (max_reviews) {
        where.total_reviews.lte = max_reviews;
      }
    }

    // Filter by product count range
    if (min_products || max_products) {
      where.total_products = {};
      if (min_products) {
        where.total_products.gte = min_products;
      }
      if (max_products) {
        where.total_products.lte = max_products;
      }
    }

    // Filter by inquiry count range
    if (min_inquiries || max_inquiries) {
      where.total_inquiries = {};
      if (min_inquiries) {
        where.total_inquiries.gte = min_inquiries;
      }
      if (max_inquiries) {
        where.total_inquiries.lte = max_inquiries;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { registration_number: { contains: search } },
      ];
    }

    // Build include object for relations
    const include = includeRelations
      ? {
          areas: true,
          company_type: true,
          verification_status: true,
          company_branches: {
            where: { is_active: true },
            include: { areas: true },
          },
          company_categories: {
            include: { category: true },
          },
        }
      : {};

    // Execute query
    const [companies, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      data: companies.map((company: CompanyWithRelations) =>
        this.formatCompanyResponse(company, req, includeRelations),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        appliedFilters: {
          company_type_id,
          area_id,
          is_premium,
          is_verified,
          is_blocked,
          rating: {
            min: min_rating,
            max: max_rating,
          },
          year: {
            min: min_year,
            max: max_year,
          },
          reviews: {
            min: min_reviews,
            max: max_reviews,
          },
          products: {
            min: min_products,
            max: max_products,
          },
          inquiries: {
            min: min_inquiries,
            max: max_inquiries,
          },
          search,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
    };
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    files: {
      logo_url?: Express.Multer.File[];
      documents_url?: Express.Multer.File[];
    },
    user: UserWithRole,
    req: Request,
  ) {
    const decodedId = decodeId(id);

    // Check if company exists
    const existingCompany = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!existingCompany) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    // Check permissions - sellers can only update their own companies
    if (user.role.name === 'seller') {
      const companyUser = await this.prisma.company_users.findFirst({
        where: {
          company_id: decodedId,
          user_id: user.id,
        },
      });

      if (!companyUser) {
        throw new ForbiddenException(COMPANY_ERRORS.PERMISSION_DENIED);
      }
    }

    // Validate company type if provided
    let decodedCompanyTypeId: number | undefined;
    if (updateCompanyDto.company_type_id) {
      decodedCompanyTypeId = decodeId(updateCompanyDto.company_type_id);
      const companyType = await this.prisma.company_type.findUnique({
        where: { id: decodedCompanyTypeId },
      });

      if (!companyType) {
        throw new BadRequestException(COMPANY_ERRORS.INVALID_COMPANY_TYPE);
      }
    }

    // Validate area if provided
    let decodedAreaId: number | null | undefined;
    if (updateCompanyDto.area_id !== undefined) {
      decodedAreaId = updateCompanyDto.area_id
        ? decodeId(updateCompanyDto.area_id)
        : null;

      if (decodedAreaId) {
        const area = await this.prisma.areas.findUnique({
          where: { id: decodedAreaId },
        });

        if (!area) {
          throw new BadRequestException(COMPANY_ERRORS.INVALID_AREA);
        }
      }
    }

    // Check slug uniqueness if name is being updated
    let slug: string | undefined;
    if (
      updateCompanyDto.name &&
      updateCompanyDto.name !== existingCompany.name
    ) {
      slug =
        updateCompanyDto.slug ||
        (await this.generateSlug(updateCompanyDto.name, decodedId));

      const existingSlug = await this.prisma.companies.findFirst({
        where: {
          slug,
          NOT: { id: decodedId },
        },
      });

      if (existingSlug) {
        throw new BadRequestException(COMPANY_ERRORS.SLUG_EXISTS);
      }
    }

    // Handle file uploads
    const uploadedFiles = this.fileUploadService.getUploadedFiles(files);
    const newLogoPath = uploadedFiles.logo_url as string | undefined;
    const newDocumentPaths = uploadedFiles.documents_url
      ? Array.isArray(uploadedFiles.documents_url)
        ? uploadedFiles.documents_url
        : [uploadedFiles.documents_url]
      : undefined;

    // Parse social media links
    let parsedSocialMediaLinks: string | undefined;
    if (updateCompanyDto.social_media_links !== undefined) {
      try {
        parsedSocialMediaLinks =
          typeof updateCompanyDto.social_media_links === 'string'
            ? updateCompanyDto.social_media_links
            : JSON.stringify(updateCompanyDto.social_media_links);
      } catch (error) {
        this.logger.error('Error parsing social media links:', error);
      }
    }

    // Prepare update data
    const updateData: Prisma.companiesUpdateInput = {
      ...(updateCompanyDto.name && { name: updateCompanyDto.name }),
      ...(updateCompanyDto.email !== undefined && {
        email: updateCompanyDto.email,
      }),
      ...(updateCompanyDto.phone !== undefined && {
        phone: updateCompanyDto.phone,
      }),
      ...(updateCompanyDto.website !== undefined && {
        website: updateCompanyDto.website,
      }),
      ...(updateCompanyDto.description !== undefined && {
        description: updateCompanyDto.description,
      }),
      ...(updateCompanyDto.established_year && {
        established_year: updateCompanyDto.established_year,
      }),
      ...(updateCompanyDto.registration_number !== undefined && {
        registration_number: updateCompanyDto.registration_number,
      }),
      ...(parsedSocialMediaLinks !== undefined && {
        social_media_links: parsedSocialMediaLinks,
      }),
      ...(decodedCompanyTypeId && { company_type_id: decodedCompanyTypeId }),
      ...(updateCompanyDto.area_id !== undefined && { area_id: decodedAreaId }),
      ...(slug && { slug }),
      updated_at: new Date(),
    };

    // Handle logo update
    if (newLogoPath) {
      if (existingCompany.logo_url) {
        try {
          await this.fileUploadService.deleteFile(existingCompany.logo_url);
        } catch (error) {
          this.logger.error('Error deleting old logo:', error);
        }
      }
      updateData.logo_url = newLogoPath;
    }

    // Handle documents update
    if (newDocumentPaths && newDocumentPaths.length > 0) {
      if (existingCompany.documents_url) {
        try {
          await this.fileUploadService.deleteFilesFromJson(
            existingCompany.documents_url,
          );
        } catch (error) {
          this.logger.error('Error deleting old documents:', error);
        }
      }
      updateData.documents_url = JSON.stringify(newDocumentPaths);
    }

    // Update company
    const company = await this.prisma.companies.update({
      where: { id: decodedId },
      data: updateData,
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
        company_branches: {
          include: { areas: true },
        },
        company_categories: {
          include: { category: true },
        },
      },
    });

    return this.formatCompanyResponse(company, req, true);
  }

  async remove(id: string, user: UserWithRole) {
    const decodedId = decodeId(id);

    // Check if company exists
    const company = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    // Check permissions - only admin can delete
    if (user.role.name !== 'admin') {
      throw new ForbiddenException(COMPANY_ERRORS.ONLY_ADMINS_CAN_DELETE);
    }

    // Delete files
    if (company.logo_url) {
      try {
        await this.fileUploadService.deleteFile(company.logo_url);
      } catch (error) {
        this.logger.error('Error deleting logo:', error);
      }
    }

    if (company.documents_url) {
      try {
        await this.fileUploadService.deleteFilesFromJson(company.documents_url);
      } catch (error) {
        this.logger.error('Error deleting documents:', error);
      }
    }

    // Delete company (cascade will handle related records)
    await this.prisma.companies.delete({
      where: { id: decodedId },
    });

    return { message: 'Company deleted successfully' };
  }

  async toggleBlockStatus(id: string, req: Request) {
    const decodedId = decodeId(id);

    const company = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    const updatedCompany = await this.prisma.companies.update({
      where: { id: decodedId },
      data: {
        is_blocked: !company.is_blocked,
        updated_at: new Date(),
      },
      ...companyWithRelations,
    });

    return {
      message: `Company ${updatedCompany.is_blocked ? 'blocked' : 'unblocked'} successfully`,
      data: this.formatCompanyResponse(updatedCompany, req, true),
    };
  }

  async updatePremiumStatus(
    id: string,
    updatePremiumStatusDto: UpdatePremiumStatusDto,
    req: Request,
  ) {
    const decodedId = decodeId(id);

    const company = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    const updatedCompany = await this.prisma.companies.update({
      where: { id: decodedId },
      data: {
        is_premium: updatePremiumStatusDto.is_premium,
        updated_at: new Date(),
      },
      ...companyWithRelations,
    });

    return {
      message: 'Company premium status updated successfully',
      data: this.formatCompanyResponse(updatedCompany, req, true),
    };
  }

  async updateVerificationStatus(
    id: string,
    updateVerificationStatusDto: UpdateVerificationStatusDto,
    req: Request,
  ) {
    const decodedId = decodeId(id);

    const company = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    const updateData: Prisma.companiesUncheckedUpdateInput = {
      updated_at: new Date(),
    };

    if (updateVerificationStatusDto.is_verified !== undefined) {
      updateData.is_verified = updateVerificationStatusDto.is_verified;
      if (updateData.is_verified && !company.verified_at) {
        updateData.verified_at = new Date();
      }
    }

    if (updateVerificationStatusDto.verification_status_id) {
      const decodedStatusId = decodeId(
        updateVerificationStatusDto.verification_status_id,
      );
      const status = await this.prisma.verification_status.findUnique({
        where: { id: decodedStatusId },
      });

      if (!status) {
        throw new BadRequestException(
          COMPANY_ERRORS.INVALID_VERIFICATION_STATUS,
        );
      }

      updateData.verification_status_id = decodedStatusId;
    }

    const updatedCompany = await this.prisma.companies.update({
      where: { id: decodedId },
      data: updateData,
      ...companyWithRelations,
    });

    return {
      message: 'Company verification status updated successfully',
      data: this.formatCompanyResponse(updatedCompany, req, true),
    };
  }

  async checkSlugUniqueness(slug: string, excludeId?: string) {
    const decodedCompanyId = excludeId ? decodeId(excludeId) : null;

    const existingCompany = await this.prisma.companies.findFirst({
      where: {
        slug,
        NOT: decodedCompanyId ? { id: decodedCompanyId } : undefined,
      },
    });

    return {
      isUnique: !existingCompany,
      slug,
      message: existingCompany ? 'Slug is already in use' : 'Slug is available',
    };
  }

  async recalculateStats(id: string) {
    const decodedId = decodeId(id);

    const company = await this.prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      throw new NotFoundException(COMPANY_ERRORS.NOT_FOUND);
    }

    const stats = await this.recalculateCompanyStats(decodedId);

    return {
      message: 'Company statistics recalculated successfully',
      data: stats,
    };
  }

  async getCompanyTypes() {
    const companyTypes = await this.prisma.company_type.findMany({
      orderBy: { name: 'asc' },
    });

    return companyTypes.map((type) => ({
      ...type,
      id: encodeId(type.id),
    }));
  }
}
