// utils/formValidation.ts
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validatePageForm = (formData: {
  title: string;
  content: string;
  slug?: string;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!formData.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (formData.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters long' });
  } else if (formData.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }

  // Content validation
  if (!formData.content?.trim() || formData.content === '<p></p>') {
    errors.push({ field: 'content', message: 'Content is required' });
  } else if (formData.content.replace(/<[^>]*>/g, '').trim().length < 10) {
    errors.push({ field: 'content', message: 'Content must be at least 10 characters long' });
  }

  // Slug validation
  if (formData.slug) {
    if (!/^[a-z0-9-]+$/i.test(formData.slug)) {
      errors.push({ field: 'slug', message: 'Slug must contain only letters, numbers, and hyphens' });
    } else if (formData.slug.length > 100) {
      errors.push({ field: 'slug', message: 'Slug must be less than 100 characters' });
    } else if (formData.slug.startsWith('-') || formData.slug.endsWith('-')) {
      errors.push({ field: 'slug', message: 'Slug cannot start or end with a hyphen' });
    }
  }

  // Sort order validation
  if (formData.sort_order !== undefined && formData.sort_order !== 0) {
    if (isNaN(formData.sort_order) || formData.sort_order < 0) {
      errors.push({ field: 'sort_order', message: 'Sort order must be a positive number' });
    } else if (formData.sort_order > 9999) {
      errors.push({ field: 'sort_order', message: 'Sort order must be less than 10000' });
    }
  }

  // Meta title validation
  if (formData.meta_title && formData.meta_title.length > 60) {
    errors.push({ field: 'meta_title', message: 'Meta title should be less than 60 characters for better SEO' });
  }

  // Meta description validation
  if (formData.meta_description && formData.meta_description.length > 160) {
    errors.push({ field: 'meta_description', message: 'Meta description should be less than 160 characters for better SEO' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: `File size (${formatFileSize(file.size)}) exceeds the 5MB limit` };
  }

  // Check image dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // You can add dimension checks here if needed
      if (img.width < 100 || img.height < 100) {
        resolve({ isValid: false, error: 'Image dimensions should be at least 100x100 pixels' });
      } else if (img.width > 4000 || img.height > 4000) {
        resolve({ isValid: false, error: 'Image dimensions should not exceed 4000x4000 pixels' });
      } else {
        resolve({ isValid: true });
      }
    };
    img.onerror = () => {
      resolve({ isValid: false, error: 'Invalid image file' });
    };
    img.src = URL.createObjectURL(file);
  }) as any;
};

// Hook for form state management
import { useState, useCallback } from 'react';

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validator: (values: T) => ValidationResult
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== name));
  }, []);

  const updateTouched = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(() => {
    const result = validator(values);
    setErrors(result.errors);
    return result.isValid;
  }, [values, validator]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldError = useCallback((fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string) => {
    return errors.some(error => error.field === fieldName);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    setIsSubmitting,
    validate,
    reset,
    getFieldError,
    hasFieldError,
    isValid: errors.length === 0
  };
};