// types/interfaces.ts
export interface Application {
  id: number;
  application_number: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  nationality?: string;
  religion?: string;
  blood_group?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  phone: string;
  email: string;
  permanent_address: string;
  temporary_address?: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  program_applied: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'document_verification' | 'provisionally_selected' | 'enrollment_completed' | 'rejected' | 'cancelled' | 'waitlisted';
  entrance_test_rollNumber?: string;
  entrance_test_date?: string;
  entrance_test_score?: number;
  declaration_agreed: boolean;
  terms_agreed: boolean;
  admin_notes?: string;
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  deleted_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'author';
  isTemporaryPassword: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published' | 'archived';
  post_type: 'blog' | 'news' | 'announcement';
  is_featured: boolean;
  view_count?: number;
  author_id: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  sort_order?: number;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  featured_image?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  event_type?: 'seminar' | 'workshop' | 'conference' | 'cultural' | 'sports' | 'graduation' | 'other';
  registration_required?: boolean;
  registration_link?: string;
  is_published: boolean;
  is_featured: boolean;
  view_count?: number;
  created_by: number;
  updated_by?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: number;
  full_name: string;
  designation?: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  bio?: string;
  profile_image?: string;
  email?: string;
  phone?: string;
  social_links?: any;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  duration?: string;
  degree_type?: 'bachelor' | 'master' | 'diploma' | 'certificate';
  affiliated_university?: string;
  total_seats?: number;
  eligibility_criteria?: string;
  career_prospects?: string;
  featured_image?: string;
  brochure_file?: string;
  tuition_fee?: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  notice_type: 'general' | 'academic' | 'exam' | 'admission' | 'result' | 'event' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachment?: string;
  is_published: boolean;
  is_featured: boolean;
  valid_from?: string;
  valid_until?: string;
  view_count?: number;
  author_id: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  student_name: string;
  program_id?: number;
  program_name?: string;
  slug: string;
  graduation_year?: number;
  current_position?: string;
  company?: string;
  content: string;
  rating?: number;
  student_image?: string;
  video_file?: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: number;
  company_name: string;
  logo?: string;
  website_url?: string;
  partnership_type?: 'internship' | 'placement' | 'training' | 'research' | 'mou' | 'general';
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  partnership_date?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiry_type?: 'admission' | 'general' | 'complaint' | 'suggestion' | 'partnership' | 'technical';
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  responded_at?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  original_name: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type?: 'image' | 'document' | 'video' | 'audio' | 'other';
  alt_text?: string;
  caption?: string;
  uploaded_by: number;
  created_at: string;
}

export interface Setting {
  id: number;
  setting_key: string;
  setting_value?: string;
  setting_type?: 'text' | 'number' | 'boolean' | 'json' | 'file' | 'email' | 'url';
  group_name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  validation?: any;
  options?: any;
  is_public?: boolean;
  is_required?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}