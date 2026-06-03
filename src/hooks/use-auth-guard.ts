import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useUserStore } from "@/store/use-user-store";
import { getAuthData, getAuthenticatedUser } from "@/lib/auth-utils";
const publicRoutes = ["/login", "/acharyawebsite"];
export const useAuthGuard = ({ isProtectedRoute }: { isProtectedRoute?: boolean }) => {
  const router = useRouter();
  const navigate = router.navigate;
  const location = router.state.location;
  const { data, isAuthenticated, decodedToken } = getAuthenticatedUser();
  const { setUser, user } = useUserStore();
  console.log("suer", user);
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    const isPublic = publicRoutes.includes(location.pathname);
    if (!isAuthenticated && isProtectedRoute && !isPublic) {
      navigate({ to: "/login", replace: true });
    }
    console.log("data", data);
    if (!decodedToken) return;

    setUser({
      id: decodedToken?.sub as string,
      role: decodedToken?.role as string,
      campusId: decodedToken?.campusId as string,
      email: data?.user.email,
    });
    if (!isAuthenticated && !isPublic) {
      navigate({ to: "/login", replace: true });
    }
    if (isAuthenticated && location.pathname === "/login") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [location.pathname, navigate]);
};
