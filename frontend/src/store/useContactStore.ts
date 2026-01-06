import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { api } from "../lib/axios";
import { useAuthStore } from "./authStore";
import { cleanFormData } from "../utils/cleanObject";

import {
  Contact,
  ContactsListResponse,
  CreateContactData,
  ContactResponse,
  UpdateContactData,
  ContactFilters,
  ContactState,
} from "../types/contactTypes";

export const useContactStore = create<ContactState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      contacts: [],
      selectedContact: null,
      isLoading: false,
      error: null,
      isInitiallyLoaded: false,
      filters: {
        status: "ALL",
        inquiry_type: "ALL",
        search: "",
        sortBy: "created_at",
        sortOrder: "desc",
      },
      currentPage: 1,
      totalPages: 1,
      totalContactsCount: 0,

      // Fetch all contacts
      fetchContacts: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<ContactsListResponse>("/api/contacts", {
            params: { limit: 100 },
          });
          const { data, success, meta } = response.data;

          if (success && data) {
            set({
              contacts: data,
              totalContactsCount: meta?.total || data.length,
              totalPages: meta?.totalPages || 1,
              isLoading: false,
              isInitiallyLoaded: true,
            });
          } else {
            throw new Error("Failed to fetch contacts");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch contacts";
          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Fetch contact by ID
      fetchContactById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get<ContactResponse>(`/api/contacts/${id}`);
          const { data, success } = response.data;

          set({ isLoading: false });

          if (success && data) {
            set({ selectedContact: data });
            return data;
          } else {
            throw new Error("Contact not found");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch contact";
          set({
            isLoading: false,
            error: errorMessage,
            selectedContact: null,
          });
          return null;
        }
      },

      // Create new contact
      createContact: async (contactData: CreateContactData) => {
        set({ isLoading: true, error: null });

        try {
          
          // const formData = cleanFormData(contactData);
          // console.log("Cleaned form data:", formData);

          const response = await api.post<ContactResponse>("/api/contacts", contactData);
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            const { contacts } = get();
            set({ contacts: [...contacts, data] });
            set((state) => ({ totalContactsCount: state.totalContactsCount + 1 }));
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to create contact";
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

      // Update contact
      updateContact: async (id: string, contactData: UpdateContactData) => {
        set({ isLoading: true, error: null });

        try {
          const formData = cleanFormData(contactData);

          const response = await api.patch<ContactResponse>(
            `/api/contacts/${id}/status`,
            formData
          );
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            const { contacts } = get();
            const updatedContacts = contacts.map((contact) =>
              contact.id === id ? data : contact
            );
            set({ contacts: updatedContacts });

            const { selectedContact } = get();
            if (selectedContact?.id === id) {
              set({ selectedContact: data });
            }
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to update contact";
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

      // Delete contact
      deleteContact: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.delete(`/api/contacts/${id}`);
          const { success, message } = response.data;

          set({ isLoading: false });

          if (success) {
            const { contacts } = get();
            set({
              contacts: contacts.filter((contact) => contact.id !== id),
              totalContactsCount: get().totalContactsCount - 1,
            });

            const { selectedContact } = get();
            if (selectedContact?.id === id) {
              set({ selectedContact: null });
            }
          } else {
            set({ error: message });
          }

          return { success, message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to delete contact";
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

      // Update contact status
      updateContactStatus: async (id: string, status: Contact['status']) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.patch<ContactResponse>(
            `/api/contacts/${id}/status`,
            { status }
          );
          const { success, message, data } = response.data;

          set({ isLoading: false });

          if (success && data) {
            const { contacts } = get();
            const updatedContacts = contacts.map((contact) =>
              contact.id === id ? data : contact
            );
            set({ contacts: updatedContacts });

            const { selectedContact } = get();
            if (selectedContact?.id === id) {
              set({ selectedContact: data });
            }
          } else {
            set({ error: message });
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to update contact status";
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

      // Set selected contact
      setSelectedContact: (contact: Contact | null) => {
        set({ selectedContact: contact });
      },

      // Set filters
      setFilters: (newFilters: Partial<ContactFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Refresh all contact data
      refreshContactData: async () => {
        await Promise.all([get().fetchContacts()]);
      },

      // Get filtered contacts based on current filters
      getFilteredContacts: () => {
        const { contacts, filters } = get();
        let filteredContacts = [...contacts];

        // Filter by status
        if (filters.status && filters.status !== 'ALL') {
          filteredContacts = filteredContacts.filter(
            (contact) => contact.status === filters.status
          );
        }

        // Filter by inquiry_type
        if (filters.inquiry_type && filters.inquiry_type !== 'ALL') {
          filteredContacts = filteredContacts.filter(
            (contact) => contact.inquiry_type === filters.inquiry_type
          );
        }

        // Filter by search query
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredContacts = filteredContacts.filter(
            (contact) =>
              contact.full_name.toLowerCase().includes(searchLower) ||
              contact.email.toLowerCase().includes(searchLower) ||
              (contact.subject && contact.subject.toLowerCase().includes(searchLower)) ||
              contact.message.toLowerCase().includes(searchLower)
          );
        }

        // Sort contacts
        if (filters.sortBy) {
          filteredContacts.sort((a, b) => {
            let aValue: any = a[filters.sortBy!];
            let bValue: any = b[filters.sortBy!];

            // Handle dates
            if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
              aValue = new Date(aValue);
              bValue = new Date(bValue);
            }

            // Handle null values
            if (aValue === null) aValue = '';
            if (bValue === null) bValue = '';

            // Convert to strings for comparison if needed
            if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
            }
            if (typeof bValue === 'string') {
              bValue = bValue.toLowerCase();
            }

            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return filters.sortOrder === 'desc' ? -comparison : comparison;
          });
        }

        return filteredContacts;
      },

      // Search contacts
      searchContacts: (query: string) => {
        set((state) => ({
          filters: { ...state.filters, search: query },
        }));
      },
    })),
    {
      name: 'contact-store',
    }
  )
);