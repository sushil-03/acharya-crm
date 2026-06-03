import { LoginResponse } from "@/types/user";
import { LOCAL_STORAGE_KEY } from "./config";

export const isTokenExpired = (token: string): boolean => {
  try {
    const jwtPayload = JSON.parse(window.atob(token.split(".")[1]));
    const timeNow = new Date().getTime();
    const isExpired = jwtPayload.exp * 1000 < timeNow;
    return isExpired;
  } catch {
    return true;
  }
};
const getBaseAuthRaw = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(LOCAL_STORAGE_KEY.AUTH_TOKEN);
};
export const setAuthData = async (data: LoginResponse) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOCAL_STORAGE_KEY.AUTH_TOKEN, JSON.stringify(data));
};

export const removeAuthData = async () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LOCAL_STORAGE_KEY.AUTH_TOKEN);
};
const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};
export const getJwtPayload = <T extends Record<string, unknown> = Record<string, unknown>>(
  token: string,
): T | null => {
  try {
    if (typeof window === "undefined") return null;
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payloadJson = window.atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson) as T;
  } catch {
    return null;
  }
};

export const getAuthData = () => {
  if (typeof window === "undefined") return null;

  const baseRaw = getBaseAuthRaw();
  if (!baseRaw) return null;

  const baseData = safeJsonParse<any>(baseRaw);
  //   const baseData = safeJsonParse<LoginResponse>(baseRaw);
  const baseToken = baseData?.accessToken;
  if (baseToken && isTokenExpired(baseToken)) {
    removeAuthData();
    return null;
  }
  const decodedToken = getJwtPayload<LoginResponse>(baseToken);
  return baseData;
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  const data = getAuthData();
  return data?.accessToken ?? null;
};

export const getAuthenticatedUser = () => {
  if (typeof window === "undefined") {
    return { data: null, isAuthenticated: false };
  }

  // Backend: Check if the token is valid
  const data = getAuthData();
  if (data?.accessToken && !isTokenExpired(data.accessToken)) {
    const decodedToken = getJwtPayload(data.accessToken);
    return { data, decodedToken, isAuthenticated: true };
  }

  return { data: null, isAuthenticated: false };
};
