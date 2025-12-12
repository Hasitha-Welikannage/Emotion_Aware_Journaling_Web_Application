import { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  registerUser,
} from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Load user on first render
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await getCurrentUser();
        if (!isMounted) return;

        if (response.success) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOGIN
  async function login(credentials) {
    setActionLoading(true);
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setUser(response.data);
        setAuthError(null);
      } else {
        setUser(null);
        setAuthError(response.message || "Login failed");
      }
    } catch (error) {
      setUser(null);
      setAuthError("Network error during login");
    } finally {
      setActionLoading(false);
    }
  }

  // REGISTER
  async function register(details) {
    setActionLoading(true);
    try {
      const response = await registerUser(details);
      if (response.success) {
        login({ email: details.email, password: details.password });
        setUser(response.data);
        setAuthError(null);
      } else {
        setUser(null);
        setAuthError(response.message || "Registration failed");
      }
    } catch {
      setUser(null);
      setAuthError("Network error during registration");
    } finally {
      setActionLoading(false);
    }
  }

  // LOGOUT
  async function logout() {
    setActionLoading(true);
    try {
      const response = await logoutUser();
      if (response.success) {
        setUser(null);
        setAuthError(null);
      } else {
        setAuthError(response.message || "Logout failed");
      }
    } catch {
      setAuthError("Network error during logout");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        actionLoading,
        authError,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
