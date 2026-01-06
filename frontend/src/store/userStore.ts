import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { api } from "../lib/axios";
import { useAuthStore } from "./authStore";

import {
  User,
  UsersListResponse,
  CreateUserData,
  UserResponse,
  UpdateUserData,
  UpdateRoleData,
  UserFilters,
  UserState,
  
} from "../types/userTypes";

export const useUserStore = create<UserState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      users: [],
      admins: [],
      authors: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      isInitiallyLoaded: false,
      filters: {
        role: "ALL",
        search: "",
        sortBy: "username",
        sortOrder: "asc",
      },
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,

      // Fetch all users
      fetchUsers: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<UsersListResponse>("/api/users");
          const { data, success } = response.data;

          if (success && data) {
            set({
              users: data,
              totalUsers: data.length,
              isLoading: false,
              isInitiallyLoaded: true,
            });

            // Separate admins and authors
            const admins = data.filter((user) => user.role === "admin");
            const authors = data.filter((user) => user.role === "author");

            set({ admins, authors });
          } else {
            throw new Error("Failed to fetch users");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch users";
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Fetch user by ID
      fetchUserById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<UserResponse>(`/api/users/${id}`);
          const { data, success } = response.data;

          set({ isLoading: false });

          if (success && data) {
            set({ selectedUser: data });
            return data;
          } else {
            throw new Error("User not found");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch user";
          set({
            isLoading: false,
            error: errorMessage,
            selectedUser: null,
          });
          return null;
        }
      },

      // Create new user (Admin only)
      createUser: async (userData: CreateUserData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<UserResponse>(
            "/api/auth/register",
            userData
          );
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            // Add to users list
            const { users } = get();
            set({ users: [...users, data] });

            // Update role-specific lists
            if (data.role === "admin") {
              const { admins } = get();
              set({ admins: [...admins, data] });
            } else if (data.role === "author") {
              const { authors } = get();
              set({ authors: [...authors, data] });
            }

            // Update total count
            set((state) => ({ totalUsers: state.totalUsers + 1 }));
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to create user";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      // Update user
      updateUser: async (id: string, userData: UpdateUserData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.put<UserResponse>(
            `/api/users/${id}`,
            userData
          );
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            // Update in users list
            const { users } = get();
            const updatedUsers = users.map((user) =>
              user.id === id ? data : user
            );
            set({ users: updatedUsers });

            // Update role-specific lists
            const { admins, authors } = get();
            if (data.role === "admin") {
              const updatedAdmins = admins.map((admin) =>
                admin.id === id ? data : admin
              );
              set({ admins: updatedAdmins });
            } else if (data.role === "author") {
              const updatedAuthors = authors.map((author) =>
                author.id === id ? data : author
              );
              set({ authors: updatedAuthors });
            }

            // Update selected user if it's the same
            const { selectedUser } = get();
            if (selectedUser?.id === id) {
              set({ selectedUser: data });
            }

            // Sync with auth store if current user
            const authUser = useAuthStore.getState().user;
            if (authUser?.id === id) {
              useAuthStore.setState({
                user: {
                  ...authUser,
                  username: data.username,
                  email: data.email,
                  role: data.role.toLowerCase() as "admin" | "author",
                },
              });
            }
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to update user";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

    
      // Update user role (Admin only)
      updateUserRole: async (id: string, roleData: UpdateRoleData) => {
        const currentState = get();

        // Find current user to check if role is actually changing
        const currentUser = currentState.users.find((u) => u.id === id);
        if (!currentUser) {
          return {
            success: false,
            message: "User not found",
          };
        }

        // Don't make API call if role hasn't changed
        if (currentUser.role === roleData.role) {
          return {
            success: true,
            message: "Role unchanged",
            data: currentUser,
          };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.put<UserResponse>(
            `/api/users/${id}/role`,
            roleData
          );
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            // Update in users list
            const { users } = get();
            const updatedUsers = users.map((user) =>
              user.id === id
                ? { ...user, ...data, updatedAt: new Date().toISOString() }
                : user
            );
            set({ users: updatedUsers });

            // Update role-specific lists - remove from old, add to new
            const { admins, authors } = get();

            // Remove from current role list
            if (currentUser.role === "admin") {
              set({ admins: admins.filter((admin) => admin.id !== id) });
            } else if (currentUser.role === "author") {
              set({ authors: authors.filter((author) => author.id !== id) });
            }

            // Add to new role list
            if (data.role === "admin") {
              const updatedAdmins = admins.filter((admin) => admin.id !== id);
              set({ admins: [...updatedAdmins, data] });
            } else if (data.role === "author") {
              const updatedAuthors = authors.filter(
                (author) => author.id !== id
              );
              set({ authors: [...updatedAuthors, data] });
            }

            // Update selected user if it's the same
            const { selectedUser } = get();
            if (selectedUser?.id === id) {
              set({ selectedUser: data });
            }

            // Sync with auth store if current user (role change)
            const authUser = useAuthStore.getState().user;
            if (authUser?.id === id) {
              useAuthStore.setState({
                user: {
                  ...authUser,
                  role: data.role.toLowerCase() as "admin" | "author",
                },
              });
            }

            console.log("User role updated successfully:", data); // Debug log
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          console.error("Role update API error:", error); // Debug log
          const errorMessage =
            error.response?.data?.message || "Failed to update user role";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },
     
     
      // Delete user (Admin only)
      deleteUser: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.delete(`/api/users/${id}`);
          const { success, message } = response.data;

          set({ isLoading: false });

          if (success) {
            // Remove from all lists
            const { users, admins, authors } = get();
            const userToDelete = users.find((u) => u.id === id);

            set({
              users: users.filter((user) => user.id !== id),
              totalUsers: get().totalUsers - 1,
            });

            if (userToDelete?.role === "admin") {
              set({ admins: admins.filter((admin) => admin.id !== id) });
            } else if (userToDelete?.role === "author") {
              set({ authors: authors.filter((author) => author.id !== id) });
            }

            // Clear selected user if it was deleted
            const { selectedUser } = get();
            if (selectedUser?.id === id) {
              set({ selectedUser: null });
            }
          } else {
            set({ error: message });
          }

          return { success, message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to delete user";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      // Fetch admins
      fetchAdmins: async () => {
        set({ isLoading: true, error: null });

        try {
          const response =
            await api.get<UsersListResponse>("/api/users/admins");
          const { data, success } = response.data;

          if (success && data) {
            set({
              admins: data,
              isLoading: false,
            });
          } else {
            throw new Error("Failed to fetch admins");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch admins";
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Fetch authors
      fetchAuthors: async () => {
        set({ isLoading: true, error: null });

        try {
          const response =
            await api.get<UsersListResponse>("/api/users/authors");
          const { data, success } = response.data;

          if (success && data) {
            set({
              authors: data,
              isLoading: false,
            });
          } else {
            throw new Error("Failed to fetch authors");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch authors";
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Set selected user
      setSelectedUser: (user: User | null) => {
        set({ selectedUser: user });
      },

      // Set filters
      setFilters: (newFilters: Partial<UserFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Refresh all user data
      refreshUserData: async () => {
        await Promise.all([get().fetchUsers()]);
      },

      // Get filtered users based on current filters
      getFilteredUsers: () => {
        const { users, filters } = get();
        let filteredUsers = [...users];

        // Filter by role
        if (filters.role && filters.role !== "ALL") {
          filteredUsers = filteredUsers.filter(
            (user) => user.role === filters.role
          );
        }

        // Filter by search query
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
          );
        }

        // Sort users
        if (filters.sortBy) {
          filteredUsers.sort((a, b) => {
            let aValue: any = a[filters.sortBy!];
            let bValue: any = b[filters.sortBy!];

            // Handle null values
            if (aValue === null) aValue = "";
            if (bValue === null) bValue = "";

            // Convert to strings for comparison if needed
            if (typeof aValue === "string") {
              aValue = aValue.toLowerCase();
            }
            if (typeof bValue === "string") {
              bValue = bValue.toLowerCase();
            }

            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return filters.sortOrder === "desc" ? -comparison : comparison;
          });
        }

        return filteredUsers;
      },

      // Search users
      searchUsers: (query: string) => {
        set((state) => ({
          filters: { ...state.filters, search: query },
        }));
      },

      // Sync with auth store
      syncWithAuthStore: () => {
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          const { users } = get();
          const currentUser = users.find((u) => u.id === authUser.id);
          if (currentUser) {
            // Update auth store with latest user data
            useAuthStore.setState({
              user: {
                ...authUser,
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role.toLowerCase() as "admin" | "author",
              },
            });
          }
        }
      },

      // Handle real-time user update
      handleUserUpdate: (updatedUser: User) => {
        const { users, admins, authors } = get();

        // Update in users list
        const updatedUsers = users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
        set({ users: updatedUsers });

        // Update role-specific lists
        if (updatedUser.role === "admin") {
          const updatedAdmins = admins.some(
            (admin) => admin.id === updatedUser.id
          )
            ? admins.map((admin) =>
                admin.id === updatedUser.id ? updatedUser : admin
              )
            : [...admins, updatedUser];
          set({ admins: updatedAdmins });

          // Remove from authors if role changed
          set({
            authors: authors.filter((author) => author.id !== updatedUser.id),
          });
        } else if (updatedUser.role === "author") {
          const updatedAuthors = authors.some(
            (author) => author.id === updatedUser.id
          )
            ? authors.map((author) =>
                author.id === updatedUser.id ? updatedUser : author
              )
            : [...authors, updatedUser];
          set({ authors: updatedAuthors });

          // Remove from admins if role changed
          set({
            admins: admins.filter((admin) => admin.id !== updatedUser.id),
          });
        }

        // Update selected user if it's the same
        const { selectedUser } = get();
        if (selectedUser?.id === updatedUser.id) {
          set({ selectedUser: updatedUser });
        }

        // Sync with auth store if current user
        get().syncWithAuthStore();
      },

      // Handle real-time user deletion
      handleUserDelete: (userId: string) => {
        const { users, admins, authors, selectedUser } = get();

        set({
          users: users.filter((user) => user.id !== userId),
          admins: admins.filter((admin) => admin.id !== userId),
          authors: authors.filter((author) => author.id !== userId),
          totalUsers: get().totalUsers - 1,
        });

        // Clear selected user if it was deleted
        if (selectedUser?.id === userId) {
          set({ selectedUser: null });
        }
      },
    })),
    {
      name: "user-store",
    }
  )
);

