// frontend/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";

interface AuthContextProps {
  token: string | null;
  userId: string | null;
  userName: string | null;
  planType: "free" | "pro";
  isAuthenticated: boolean;
  setPlanType: (plan: "free" | "pro") => void;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [planType, setPlanType] = useState<"free" | "pro">("free");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUser = useCallback(async () => {
    const storedToken = Cookies.get("token");
    const storedUserId = Cookies.get("user_id");
    const storedPlan = Cookies.get("plan_type") as "free" | "pro" | undefined;

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      if (storedPlan) {
        setPlanType(storedPlan);
      }

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setUserName(res.data.name);
      } catch (error) {
        console.error("Failed to fetch user name", error);
        // Clear cookies if the token is invalid
        Cookies.remove("token");
        Cookies.remove("user_id");
        Cookies.remove("plan_type");
        setToken(null);
        setUserId(null);
        setUserName(null);
        setPlanType("free");
      }
    }
    setIsInitialized(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, userId, userName, planType, isAuthenticated: !!token, setPlanType, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;

export const useAuthInitializer = () => {
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
};