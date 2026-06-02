import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("auth_session");
      setIsAuthenticated(session === "true");
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === "admin" && password === "071096@123321") {
      localStorage.setItem("auth_session", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("auth_session");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}
