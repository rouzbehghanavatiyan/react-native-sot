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
  RsetUserLogin,
} from "@/src/slices/main";
import { logger } from "@/src/utils/logger";
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
  const main = useSelector((state: any) => state.main);
  const token = main?.token;
  const userId = main?.userId;
  const userLoginId = main?.userLogin?.user?.id;
  const [isInitializing, setIsInitializing] = useState(true);
  const isChat = pathname?.includes("chat");
  const socket = useMemo(() => {
    return io("http://171.22.25.222:4005", {
      autoConnect: true,
    });
  }, []);

  const receiveUserId = useMemo(() => {
    if (!isChat) return null;
    return Number(params?.user) || null;
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

        dispatch(RsetCategory(cat?.data?.data ?? []));
        dispatch(RsetAllFollowerList(followerRes?.data?.data ?? []));
        dispatch(RsetAllFollowingList(followingRes?.data?.data ?? []));
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
    if (!isInitializing) {
      const inAuthGroup = segments[0] === "(auth)";
      const isLoggedIn = Boolean(token || userId || userLoginId);

      if (!isLoggedIn && !inAuthGroup) {
        router.replace("/login");
        return;
      }

      if (isLoggedIn && inAuthGroup) {
        router.replace("/(tabs)/watch");
      }
    }
  }, [isInitializing, segments, token, userId, userLoginId, router]);

  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!activeUserId) return;

    loadUserMasterData(activeUserId);
  }, [userLoginId, userId, loadUserMasterData]);

  useEffect(() => {
    const activeUserId = Number(userLoginId || userId);

    if (!socket || !activeUserId) return;

    dispatch(RsetSocketConfig(socket));

    socket.emit("register_user", activeUserId);

    const handleAllUsersOnline = (data: any) => {
      dispatch(RsetGiveUserOnlines(data));
    };

    socket.on("all_user_online", handleAllUsersOnline);

    return () => {
      socket.off("all_user_online", handleAllUsersOnline);
    };
  }, [socket, userLoginId, userId, dispatch]);

  useEffect(() => {
    if (!receiveUserId) return;
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
