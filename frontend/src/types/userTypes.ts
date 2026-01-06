// Types
export interface User {
  id: string; // encoded ID
  username: string;
  email: string;
  role: "admin" | "author";
  isTemporaryPassword: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: "admin" | "author" | "ALL";
  search?: string;
  sortBy?: "username" | "email" | "role" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

export interface CreateUserData {
  username: string;
  email: string;
  role: "admin" | "author";
}

export interface UpdateUserData {
  username?: string;
  email?: string;
}

export interface UpdateRoleData {
  role: "admin" | "author";
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: User;
  count?: number;
}

export interface UsersListResponse {
  success: boolean;
  message?: string;
  data: User[];
  count?: number;
}

export interface UserError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}

export interface UserState {
  // State
  users: User[];
  admins: User[];
  authors: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  isInitiallyLoaded: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalUsers: number;

  // Actions - CRUD Operations
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  createUser: (userData: CreateUserData) => Promise<UserResponse>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<UserResponse>;
  updateUserRole: (
    id: string,
    roleData: UpdateRoleData
  ) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;

  // Specialized fetches
  fetchAdmins: () => Promise<void>;
  fetchAuthors: () => Promise<void>;

  // Utility actions
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  clearError: () => void;
  refreshUserData: () => Promise<void>;

  // Search and filter
  getFilteredUsers: () => User[];
  searchUsers: (query: string) => void;

  // Real-time updates
  syncWithAuthStore: () => void;
  handleUserUpdate: (updatedUser: User) => void;
  handleUserDelete: (userId: string) => void;
}