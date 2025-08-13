// frontend/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface AuthContextProps {
  token: string | null;
  userId: string | null;
  planType: "free" | "pro";
  isAuthenticated: boolean;
  setPlanType: (plan: "free" | "pro") => void;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [planType, setPlanType] = useState<"free" | "pro">("free");

  useEffect(() => {
    const storedToken = Cookies.get("token");
    const storedUserId = Cookies.get("user_id");
    const storedPlan = Cookies.get("plan_type") as "free" | "pro" | undefined;

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      if (storedPlan) {
        setPlanType(storedPlan);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, userId, planType, isAuthenticated: !!token, setPlanType }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
