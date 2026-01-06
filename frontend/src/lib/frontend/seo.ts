

import { Metadata } from 'next';
import { SITE_CONFIG } from './constants';
import { useCompanySettings, useContactSettings } from '@/src/components/providers/SettingsProvider';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article' | 'profile';
  section?: string;
  tags?: string[];
}

interface StructuredDataProps {
  type: 'Article' | 'WebPage' | 'Organization' | 'EducationalOrganization';
  title: string;
  description: string;
  url?: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  organizationName?: string;
}

export function generateStructuredData({
  type,
  title,
  description,
  url,
  image,
  author,
  publishedTime,
  modifiedTime,
  organizationName = SITE_CONFIG.name,
}: StructuredDataProps) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description,
    url: url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url,
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
    }),
  };

  switch (type) {
    case 'Article':
      return {
        ...baseStructuredData,
        headline: title,
        ...(author && { author: { '@type': 'Person', name: author } }),
        ...(publishedTime && { datePublished: publishedTime }),
        ...(modifiedTime && { dateModified: modifiedTime }),
        publisher: {
          '@type': 'Organization',
          name: organizationName,
          logo: {
            '@type': 'ImageObject',
            url: SITE_CONFIG.ogImage,
          },
        },
      };

    case 'EducationalOrganization':
      return {
        ...baseStructuredData,
        '@type': 'EducationalOrganization',
        name: organizationName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kathmandu',
          addressCountry: 'Nepal',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: useContactSettings().contactPhone,
          email: useContactSettings().contactEmail,
          contactType: 'customer service',
        },
      };

    case 'WebPage':
    default:
      return {
        ...baseStructuredData,
        isPartOf: {
          '@type': 'WebSite',
          name: organizationName,
          url: SITE_CONFIG.url,
        },
        about: {
          '@type': 'Organization',
          name: organizationName,
        },
      };
  }
}

export function generateSEO({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  url,
  noIndex = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  type = 'website',
  section,
  tags = [],
}: SEOProps = {}): Metadata {
  const siteTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title;
  const canonicalUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;
  
  // Combine default keywords with page-specific ones
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords].join(', ');

  return {
    title: siteTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : undefined,
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }),
    openGraph: {
      type: type,
      locale: 'en_US',
      url: canonicalUrl,
      title: siteTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: siteTitle,
          type: 'image/jpeg',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description,
      images: [image],
      creator: SITE_CONFIG.links.twitter || undefined,
      site: SITE_CONFIG.links.twitter || undefined,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-US': canonicalUrl,
      },
    },
    verification: {
      // google: SITE_CONFIG.googleSiteVerification || undefined,
    },
    other: {
      ...(SITE_CONFIG.links.facebook && {
        'fb:app_id': SITE_CONFIG.links.facebook,
      }),
    },
  };
}

// Hook for dynamic SEO updates
export function useDynamicSEO(seoProps: SEOProps) {
  const metadata = generateSEO(seoProps);
  
  // Update document title
  if (typeof document !== 'undefined' && metadata.title) {
    document.title = metadata.title as string;
  }
  
  return metadata;
}

// Utility for generating breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `${SITE_CONFIG.url}${breadcrumb.url}`,
    })),
  };
}