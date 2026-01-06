// Types
export interface Contact {
  id: string; // encoded ID
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  inquiry_type: 'admission' | 'general' | 'complaint' | 'suggestion' | 'partnership' | 'technical';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  response: string | null;
  responded_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFilters {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed' | 'ALL';
  inquiry_type?: 'admission' | 'general' | 'complaint' | 'suggestion' | 'partnership' | 'technical' | 'ALL';
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'status' | 'inquiry_type';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateContactData {
  full_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  inquiry_type?: 'admission' | 'general' | 'complaint' | 'suggestion' | 'partnership' | 'technical';
}

export interface UpdateContactData {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: Contact;
}

export interface ContactsListResponse {
  success: boolean;
  message?: string;
  data: Contact[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ContactError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}

export interface ContactState {
  // State
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  filters: ContactFilters;
  isInitiallyLoaded: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalContactsCount: number;

  // Actions - CRUD Operations
  fetchContacts: () => Promise<void>;
  fetchContactById: (id: string) => Promise<Contact | null>;
  createContact: (contactData: CreateContactData) => Promise<ContactResponse>;
  updateContact: (id: string, contactData: UpdateContactData) => Promise<ContactResponse>;
  deleteContact: (id: string) => Promise<{ success: boolean; message: string }>;
  updateContactStatus: (id: string, status: Contact['status']) => Promise<ContactResponse>;

  // Utility actions
  setSelectedContact: (contact: Contact | null) => void;
  setFilters: (filters: Partial<ContactFilters>) => void;
  clearError: () => void;
  refreshContactData: () => Promise<void>;

  // Search and filter
  getFilteredContacts: () => Contact[];
  searchContacts: (query: string) => void;
}