"use client";

import { useAuthInitializer } from "@/context/AuthContext";

export default function AuthInitializer() {
  useAuthInitializer();
  return null;
}
