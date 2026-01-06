import { useUserStore } from "../store/userStore";
import { useAuthStore } from "../store/authStore"
export const useUsers = () => {
  const {
    users,
    admins,
    authors,
    isLoading,
    error,
    filters,
    getFilteredUsers,
    isInitiallyLoaded,
    fetchUsers,
    clearError,
  } = useUserStore();

  return {
    users,
    admins,
    authors,
    filteredUsers: getFilteredUsers(),
    isLoading,
    error,
    filters,
    isInitiallyLoaded,
    fetchUsers,
    clearError,
  };
};

export const useUserActions = () => {
  const {
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    setFilters,
    searchUsers,
    refreshUserData,
  } = useUserStore();

  return {
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    setFilters,
    searchUsers,
    refreshUserData,
  };
};

export const useUserSelection = () => {
  const { selectedUser, setSelectedUser, fetchUserById } = useUserStore();

  return {
    selectedUser,
    setSelectedUser,
    fetchUserById,
  };
};

// Initialize user store
export const initializeUserStore = () => {
  const { fetchUsers } = useUserStore.getState();
  const authUser = useAuthStore.getState().user;

  // Only fetch if user is authenticated
  if (authUser) {
    fetchUsers();
  }
};

// Sync user store with auth store
useAuthStore.subscribe((state) => {
  const isAuthenticated = state.isAuthenticated;
  const { isInitiallyLoaded } = useUserStore.getState(); // Get the flag
  
  if (isAuthenticated && !isInitiallyLoaded) { 
    const { fetchUsers, syncWithAuthStore } = useUserStore.getState();
    fetchUsers().then(() => syncWithAuthStore());
  } else if (!isAuthenticated) {
    
    useUserStore.setState({
      users: [],
      admins: [],
      authors: [],
      selectedUser: null,
      error: null,
      isInitiallyLoaded: false, 
    });
  }
});
