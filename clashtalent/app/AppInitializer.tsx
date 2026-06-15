import {
  categoryList,
  followerList,
  followingList,
  profileAttachment,
} from "@/src/services/masterServices";
import {
  RsetAllFollowerList,
  RsetAllFollowingList,
  RsetCategory,
  RsetGiveUserOnlines,
  RsetSocketConfig,
  RsetUserId,
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
import { io } from "socket.io-client";

type JwtPayload = {
  [key: string]: any;
};

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  const SOCKET_URL = "http://192.168.133.157:4005";

  const main = useSelector((state: any) => state.main);

  const token = main?.userLogin?.token || main?.token || null;
  const userId = main?.userId;
  const userLoginId = main?.userLogin?.user?.id || main?.userLogin?.userId;

  const [isInitializing, setIsInitializing] = useState(true);
  const isChat = pathname?.includes("chat");
  const socket = useMemo(() => {
    return io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
  }, []);

  const getUserIdFromToken = useCallback((savedToken: string) => {
    try {
      const decoded: JwtPayload = jwtDecode(savedToken);

      return (
        decoded?.userId ||
        decoded?.UserId ||
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

  const isChat = pathname?.includes("chat");

  const receiveUserId = useMemo(() => {
    if (!isChat) return null;

    const rawUser = params?.user;

    if (Array.isArray(rawUser)) {
      return Number(rawUser[0]) || null;
    }

    return Number(rawUser) || null;
  }, [isChat, params?.user]);

  const getUserIdFromToken = useCallback((token: string) => {
    const decoded: JwtPayload = jwtDecode(token);

    return decoded.userId || decoded.id || decoded.sub || null;
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

        /**
         * اگر following هم داخل store داری، اینجا dispatch مربوط به خودش را اضافه کن.
         * فعلاً فقط call شده که مثل کد قبلی‌ات باقی بماند.
         */
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

        if (!userIdFromToken) {
          throw new Error("Invalid user id from token");
        }

        dispatch(
          RsetUserLogin({
            token: savedToken,
            user: userData?.user,
            profile: userData,
          }),
        );

        dispatch(RsetUserId(userIdFromToken));

        const profileRes = await profileAttachment(userIdFromToken);
        const userData = profileRes?.data?.data;

        if (userData) {
          dispatch(RsetUserLogin(userData));
        }

        const finalUserId = Number(userData?.user?.id || userIdFromToken);

        await loadUserMasterData(finalUserId);
      } catch (error) {
        logger.error("loadCurrentUser error", error);

        await AsyncStorage.removeItem("token");

        dispatch(
          RsetUserLogin({
            token: null,
            userId: null,
          }),
        );

        dispatch(RsetUserId(null));
      }
    },
    [dispatch, getUserIdFromToken, loadUserMasterData],
  );

  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      if (savedToken) {
        await loadCurrentUser(savedToken);
      }
    } catch (error) {
      logger.error("initializeAuth error", error);
    } finally {
      setIsInitializing(false);
    }
  }, [loadCurrentUser]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isLoggedIn = Boolean(token || userId || userLoginId);

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/login");
      return;
    }

    if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)/watch");
    }
  }, [isInitializing, segments, token, userId, userLoginId, router]);

  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!activeUserId) return;

    loadUserMasterData(activeUserId);
  }, [userLoginId, userId, loadUserMasterData]);

  /**
   * مدیریت Socket
   */
  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!activeUserId) return;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("register_user", activeUserId);

      dispatch(
        RsetSocketConfig({
          socketId: socket.id,
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
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("connect_error", handleConnectError);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("all_user_online", handleAllUsersOnline);
    };
  }, [socket, userLoginId, userId, dispatch]);

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

  return <>{children}</>;
}
