import { useContactStore } from "../store/useContactStore";
import { useAuthStore } from "../store/authStore";

export const useContacts = () => {
  const {
    contacts,
    isLoading,
    error,
    filters,
    getFilteredContacts,
    isInitiallyLoaded,
    fetchContacts,
    clearError,
  } = useContactStore();

  return {
    contacts,
    filteredContacts: getFilteredContacts(),
    isLoading,
    error,
    filters,
    isInitiallyLoaded,
    fetchContacts,
    clearError,
  };
};

export const useContactActions = () => {
  const {
    createContact,
    updateContact,
    deleteContact,
    updateContactStatus,
    setFilters,
    searchContacts,
    refreshContactData,
    fetchContactById,
  } = useContactStore();

  return {
    createContact,
    updateContact,
    deleteContact,
    updateContactStatus,
    setFilters,
    searchContacts,
    refreshContactData,
    fetchContactById,
  };
};

export const useContactSelection = () => {
  const { selectedContact, setSelectedContact, fetchContactById } = useContactStore();

  return {
    selectedContact,
    setSelectedContact,
    fetchContactById,
  };
};

// Initialize contact store
export const initializeContactStore = () => {
  const { fetchContacts } = useContactStore.getState();
  const authUser = useAuthStore.getState().user;

  // Only fetch if user is authenticated
  if (authUser) {
    fetchContacts();
  }
};

// Sync contact store with auth store
useAuthStore.subscribe((state) => {
  const isAuthenticated = state.isAuthenticated;
  const { isInitiallyLoaded } = useContactStore.getState();
  if (isAuthenticated && !isInitiallyLoaded) {
    const { fetchContacts } = useContactStore.getState();
    fetchContacts();
  } else {
    // Clear contact store when logged out
    useContactStore.setState({
      contacts: [],
      selectedContact: null,
      error: null,
      isInitiallyLoaded: false,
    });
  }
});