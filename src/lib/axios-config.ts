import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

import { Config } from "./config";
import { clearAppData } from "@/components/auth/hook/query/use-logout";
import { getAuthToken } from "./auth-utils";

/** Browser paths where a JWT-style 401 should not force navigation to login. */
const PUBLIC_ROUTE_PREFIXES = ["/login", "/acharyawebsite"] as const;

function isPublicRoutePathname(pathname: string): boolean {
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
console.log("baseurl", Config.API_URL);
const Axios = axios.create({
  baseURL: Config.API_URL,
  timeout: 50000,
});

export const AxiosPublic = axios.create({
  baseURL: Config.API_URL,
  timeout: 50000,
});

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  let token = getAuthToken();
  if (!token) {
    const isPublicRoute =
      typeof window !== "undefined" && isPublicRoutePathname(window.location.pathname);
    if (!isPublicRoute) {
      console.warn("⚠️ No token found ");
    }
  }
  if (token) {
    if (config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
};

const responseSuccessInterceptor = (response: AxiosResponse) => {
  return response;
};

const responseErrorInterceptor = (error: any) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;
    console.log("errorMessage", errorMessage);
    const USER_AUTHENTICATION_FAILED = "Unauthorized";
    const JWT_SIGNATURE_ERROR =
      "JWT signature does not match locally computed signature. JWT validity cannot be asserted and should not be trusted.";
    const JWT_EXPIRED_ERROR = "Unauthorized OR URl_INCORRECET OR JWT has expired";
    const isJWTExpired = status === 401 && errorMessage?.includes(JWT_EXPIRED_ERROR);
    if (
      isJWTExpired ||
      errorMessage?.includes(USER_AUTHENTICATION_FAILED) ||
      errorMessage?.includes(JWT_SIGNATURE_ERROR)
    ) {
      const skipHardLogout =
        typeof window !== "undefined" && isPublicRoutePathname(window.location.pathname);
      if (!skipHardLogout) {
        try {
          clearAppData();
        } finally {
          if (typeof window !== "undefined") {
            window.location.replace("/login");
          }
        }
      }
    }
    const customError = {
      message: error.response?.data?.message || error.message || "Unknown error, code: 999",
      status,
      details: error.response?.data || null,
    };
    return Promise.reject(customError);
  }
  return Promise.reject({
    message: "Unexpected error occurred code: 998",
    status: 500,
  });
};

Axios.interceptors.request.use(requestInterceptor);
Axios.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

AxiosPublic.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

AxiosPublic.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default Axios;

export interface ApiError {
  message: string;
  status: number;
  details?: {
    data?: {
      message?: string;
      username?: string;
    };
  } | null;
}
