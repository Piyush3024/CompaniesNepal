import { useAuth } from "./authHooks";

export const useGoogleAuth = () => {
  const { login } = useAuth();

  const initiateGoogleLogin = () => {
    // Redirect to your backend OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return {
    initiateGoogleLogin,
  };
};