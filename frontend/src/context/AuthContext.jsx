import { createContext, useState, useEffect, useCallback } from "react";
import * as authApi from "../api/auth.api";
import * as userApi from "../api/user.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until initial session check resolves

  // On first load, ask the backend who we are via the httpOnly cookies —
  // this is what makes a page refresh keep you logged in without storing
  // anything in localStorage. A 401 here just means "not logged in",
  // which is expected and not an error state.
  const loadSession = useCallback(async () => {
    try {
      const { data } = await userApi.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.loginUser(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.registerUser(payload);
    return data; // registration doesn't log the user in — email must be verified first
  }, []);

  const logout = useCallback(async () => {
    await authApi.logoutUser();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser: loadSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}