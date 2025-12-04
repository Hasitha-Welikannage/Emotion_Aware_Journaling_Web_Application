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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      }

      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOGIN
  async function login(credentials) {
    setLoading(true);
    const response = await loginUser(credentials);

    if (response.success) {
      setUser(response.data);
      console.log("Logged in user:", response.data);
      setError(null);
    } else {
      setUser(null);
      setError(response.error || "Login failed");
    }

    setLoading(false);
    return response.success;
  }

  // REGISTER
  async function register(details) {
    setLoading(true);
    const response = await registerUser(details);

    if (response.success) {
      setUser(response.data);
      setError(null);
    } else {
      setUser(null);
      setError(response.error || "Registration failed");
    }

    setLoading(false);
    return response.success;
  }

  // LOGOUT
  async function logout() {
    setLoading(true);
    const response = await logoutUser();

    if (response.success) {
      setUser(null);
      setError(null);
    } else {
      setError(response.error || "Logout failed");
    }

    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
