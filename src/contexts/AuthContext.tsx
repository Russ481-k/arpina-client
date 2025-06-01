"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

// Define LoginCredentials if it's not already defined/imported elsewhere
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ROLE_USER" | "ROLE_ADMIN"; // User roles
  requiresPasswordChange?: boolean; // Added for forced password change
}

interface AuthContextType {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  // tempRoleOverride?: "ROLE_USER" | "ROLE_ADMIN"; // For testing, to be removed
  // setTempRoleOverride: (role?: "ROLE_USER" | "ROLE_ADMIN") => void; // For testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // const [tempRoleOverride, setTempRoleOverride] = useState<"ROLE_USER" | "ROLE_ADMIN" | undefined>();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          // Here, you might want to verify the token or user session with the backend
          // For this mock, we'll just use the stored user
          setUser(parsedUser);
        }
      } catch (e) {
        console.error("Failed to initialize auth from localStorage", e);
        localStorage.removeItem("user"); // Clear corrupted data
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock users
    const mockUsers: Record<string, User> = {
      "user@example.com": {
        id: "1",
        name: "일반 사용자",
        email: "user@example.com",
        role: "ROLE_USER",
      },
      "admin@example.com": {
        id: "2",
        name: "관리자",
        email: "admin@example.com",
        role: "ROLE_ADMIN",
      },
      "temp@example.com": {
        // User who needs to change password
        id: "3",
        name: "임시비번 사용자",
        email: "temp@example.com",
        role: "ROLE_USER",
        requiresPasswordChange: true,
      },
      "tempadmin@example.com": {
        // Admin who needs to change password (edge case)
        id: "4",
        name: "임시비번 관리자",
        email: "tempadmin@example.com",
        role: "ROLE_ADMIN",
        requiresPasswordChange: true,
      },
    };

    const foundUser = Object.values(mockUsers).find(
      (u) => u.email === credentials.email
    );

    if (foundUser && credentials.password === "password123") {
      // Simplified password check
      // Simulate successful login
      const loggedInUser: User = { ...foundUser }; // Create a new object for the state

      // For testing: if tempRoleOverride is set, use it.
      // if (tempRoleOverride) {
      //   loggedInUser.role = tempRoleOverride;
      // }

      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setError(null);

      // Redirect after login based on role and password change status
      if (loggedInUser.requiresPasswordChange) {
        router.push("/mypage/change-password");
        // No toast here, AuthGuard will handle toasts for subsequent navigation attempts
      } else if (loggedInUser.role === "ROLE_ADMIN") {
        router.push("/admin/dashboard"); // Example admin page
      } else {
        router.push("/"); // Default for ROLE_USER
      }
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setUser(null);
      localStorage.removeItem("user");
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // localStorage.removeItem("tempRoleOverride"); // Clear if used
    // setTempRoleOverride(undefined);
    setError(null);
    router.push("/login"); // Redirect to login page on logout
    toaster.create({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
      type: "success",
    });
  };

  // ... rest of the existing code ...

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
