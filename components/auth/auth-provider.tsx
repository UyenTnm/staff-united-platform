"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { Employee } from "@/lib/employees/employees";
import { loadCurrentEmployee } from "@/lib/auth/auth-client";

type AuthContextType = {
  employee: Employee | null;
  loading: boolean;
  refreshEmployee: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshEmployee() {
    const current = await loadCurrentEmployee();

    setEmployee(current);

    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      const current = await loadCurrentEmployee();

      setEmployee(current);
      setLoading(false);
    }

    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        employee,
        loading,
        refreshEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
