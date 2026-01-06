
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters except spaces, hyphens, and underscores
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

export const isValidSlug = (slug: string): boolean => {
  // Only lowercase letters, numbers, and hyphens
  // Must be between 3-100 characters
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

export const sanitizeSlug = (slug: string): string => {
  return generateSlug(slug);
};