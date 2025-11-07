// frontend/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";

interface AuthContextProps {
  token: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null; // Added userEmail
  planType: "free" | "pro";
  isAuthenticated: boolean;
  isInitialized: boolean;
  setPlanType: (plan: "free" | "pro") => void;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Added userEmail state
  const [planType, setPlanType] = useState<"free" | "pro">("free");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        setUserEmail(res.data.email); // Set userEmail
      } catch (error) {
        console.error("Failed to fetch user data", error);
        // Clear cookies if the token is invalid
        Cookies.remove("token");
        Cookies.remove("user_id");
        Cookies.remove("plan_type");
        setToken(null);
        setUserId(null);
        setUserName(null);
        setUserEmail(null); // Clear userEmail
        setPlanType("free");
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchUser();
      setIsLoading(false);
    };
    initialize();
  }, [fetchUser]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ token, userId, userName, userEmail, planType, isAuthenticated: !!token, isInitialized, setPlanType, fetchUser }}
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