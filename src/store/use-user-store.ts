import { LoginResponse } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStoreState = {
  isAuthenticated: boolean;
  user: LoginResponse["user"] | null;
  counsellorId: string | null;
  studentId: string | null;
  setStudentId: (id: string) => void;
  setCounsellor: (id: string) => void;
  setUser: (data: LoginResponse["user"]) => void;
  logout: () => void;
};
export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      counsellorId: null,
      studentId: null,
      setStudentId: (id: string) => {
        set((state) => {
          return {
            studentId: id,
          };
        });
      },
      setCounsellor: (id: string) => {
        set((state) => {
          return {
            counsellorId: id,
          };
        });
      },

      setUser: (data: LoginResponse["user"]) => {
        set((state) => {
          return {
            isAuthenticated: true,
            user: data,
          };
        });
      },

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          counsellorId: null,
          studentId: null,
        }),
    }),
    {
      name: "user-store",
      // Only persist user data
      partialize: (state: UserStoreState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
