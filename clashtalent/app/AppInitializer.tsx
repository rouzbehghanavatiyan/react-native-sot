import {
  categoryList,
  followerList,
  followingList,
  profileAttachment,
} from "@/src/services/masterServices";

import {
  RsetAllFollowerList,
  RsetCategory,
  RsetGiveUserOnlines,
  RsetSocketConfig,
  RsetUserId,
  RsetUserLogin,
} from "@/src/slices/main";

import { logger } from "@/src/utils/logger";
import { socketClient } from "@/src/utils/socketClient";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "@tamagui/core";

import {
  useLocalSearchParams,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";

import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";

type JwtPayload = {
  [key: string]: any;
};

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const main = useSelector((state: any) => state.main);

  const token = main?.userLogin?.token || main?.token || null;
  const userId = main?.userId;
  const userLoginId = main?.userLogin?.user?.id || main?.userLogin?.userId;

  const [isInitializing, setIsInitializing] = useState(true);

  const isChat = pathname?.includes("chat");

  const receiveUserId = useMemo(() => {
    if (!isChat) return null;

    const rawUser = params?.user;

    if (Array.isArray(rawUser)) {
      return Number(rawUser[0]) || null;
    }

    return Number(rawUser) || null;
  }, [isChat, params?.user]);

  const getUserIdFromToken = useCallback((savedToken: string) => {
    try {
      const decoded: JwtPayload = jwtDecode(savedToken);

      return (
        decoded?.userId ||
        decoded?.UserId ||
        decoded?.id ||
        decoded?.nameid ||
        decoded?.sub ||
        decoded?.[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        null
      );
    } catch (error) {
      logger.error("jwtDecode error", error);
      return null;
    }
  }, []);

  const loadUserMasterData = useCallback(
    async (targetUserId: number) => {
      if (!targetUserId || isNaN(targetUserId)) return;

      try {
        const [cat, followingRes, followerRes] = await Promise.all([
          categoryList(),
          followingList(targetUserId),
          followerList(targetUserId),
        ]);

        dispatch(RsetCategory(cat?.data?.data || []));
        dispatch(RsetAllFollowerList(followerRes?.data?.data || []));

        logger.info("following list", followingRes?.data?.data || []);
      } catch (error) {
        logger.error("loadUserMasterData error", error);
      }
    },
    [dispatch],
  );

  const loadCurrentUser = useCallback(
    async (savedToken: string) => {
      try {
        const userIdFromToken = Number(getUserIdFromToken(savedToken));

        if (!userIdFromToken || isNaN(userIdFromToken)) {
          throw new Error("Invalid user id from token");
        }

        dispatch(RsetUserId(userIdFromToken));

        try {
          // بخش درخواست API
          const profileRes = await profileAttachment(userIdFromToken);
          const userData = profileRes?.data?.data;

          if (userData) {
            dispatch(
              RsetUserLogin({
                ...userData,
                token: savedToken,
                userId: userData?.user?.id || userIdFromToken,
              }),
            );
          } else {
            dispatch(
              RsetUserLogin({
                token: savedToken,
                userId: userIdFromToken,
              }),
            );
          }

          const finalUserId = Number(userData?.user?.id || userIdFromToken);
          await loadUserMasterData(finalUserId);
        } catch (apiError: any) {
          // اگر فقط API خطا داد، توکن را پاک نکنیم (شاید مشکل اینترنت باشد)
          console.log(
            "❌ Profile API Error:",
            apiError?.response?.data || apiError?.message,
          );
          logger.error("API call failed in loadCurrentUser", apiError);

          // باز هم استیت های اولیه را ست میکنیم تا کاربر در اپلیکیشن بماند
          dispatch(
            RsetUserLogin({
              token: savedToken,
              userId: userIdFromToken,
            }),
          );
        }
      } catch (error: any) {
        // این بخش فقط زمانی اجرا میشود که توکن کلا نامعتبر باشد
        console.log("❌ Token/Auth Error:", error?.message);
        logger.error("loadCurrentUser error", error);

        await AsyncStorage.removeItem("token");

        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
      }
    },
    [dispatch, getUserIdFromToken, loadUserMasterData],
  );

  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      if (!savedToken) {
        dispatch(RsetUserLogin(null));
        dispatch(RsetUserId(null));
        return;
      }

      await loadCurrentUser(savedToken);
    } catch (error) {
      logger.error("initializeAuth error", error);
    } finally {
      setIsInitializing(false);
    }
  }, [loadCurrentUser, dispatch]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isLoggedIn = Boolean(token);

    if (!isLoggedIn && !inAuthGroup && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (isLoggedIn && inAuthGroup && pathname !== "/(tabs)/watch") {
      router.replace("/(tabs)/watch");
    }
  }, [isInitializing, segments, token, userId, userLoginId, pathname, router]);

  // useEffect(() => {
  //   const activeUserId = Number(userLoginId || userId);

  //   if (!activeUserId || isNaN(activeUserId)) return;

  //   loadUserMasterData(activeUserId);
  // }, [userLoginId, userId, loadUserMasterData]);

  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!activeUserId || isNaN(activeUserId)) return;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socketClient.id);

      socketClient.emit("register_user", activeUserId);

      dispatch(
        RsetSocketConfig({
          socketId: socketClient.id,
          connected: true,
        }),
      );
    };

    const handleConnectError = (error: any) => {
      console.log("❌ Socket connect_error:", error?.message || error);

      dispatch(
        RsetSocketConfig({
          socketId: null,
          connected: false,
        }),
      );
    };

    const handleDisconnect = (reason: string) => {
      console.log("⚠️ Socket disconnected:", reason);

      dispatch(
        RsetSocketConfig({
          socketId: null,
          connected: false,
        }),
      );
    };

    const handleAllUsersOnline = (data: any) => {
      dispatch(RsetGiveUserOnlines(data));
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("connect_error", handleConnectError);
    socketClient.on("disconnect", handleDisconnect);
    socketClient.on("all_user_online", handleAllUsersOnline);

    if (!socketClient.connected) {
      socketClient.connect();
    } else {
      socketClient.emit("register_user", activeUserId);

      dispatch(
        RsetSocketConfig({
          socketId: socketClient.id,
          connected: true,
        }),
      );
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("connect_error", handleConnectError);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("all_user_online", handleAllUsersOnline);
    };
  }, [userLoginId, userId, dispatch]);

  useEffect(() => {
    if (!receiveUserId) return;

    logger.info("receiveUserId", receiveUserId);
  }, [receiveUserId]);

  if (isInitializing) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      {children}
      {isInitializing && (
        <View
          flex={1}
          justifyContent="center"
          alignItems="center"
          position="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
        >
          <ActivityIndicator />
        </View>
      )}
    </>
  );
}
