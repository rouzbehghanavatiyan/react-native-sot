import axios from "axios";
import { router } from "expo-router"; // اگر از Expo Router استفاده می‌کنید
import { getToken, removeToken } from "./tokenServices";
// import { NavigationContainerRef } from '@react-navigation/native';

const baseURL = process.env.EXPO_PUBLIC_VITE_URL;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRedirecting) {
        isRedirecting = true;

        await removeToken();

        router.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);
