import {
  categoryList,
  followerList,
  followingList,
  profileAttachment,
} from "@/src/services/masterServices";
import { getToken } from "@/src/services/tokenServices";
import {
  RsetAllFollowerList,
  RsetCategory,
  RsetGiveUserOnlines,
  RsetSocketConfig,
  RsetUserLogin,
} from "@/src/slices/main";
import { logger } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useLocalSearchParams,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const main = useSelector((state: any) => state.main);
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const socket = useMemo(() => io("http://171.22.25.222:4005"), []);
  const userId = main?.userId;
  const isChat = pathname?.includes("chat");
  const [chatInfo, setChatInfo] = useState({
    userIdLogin: null as number | null,
    reciveUserId: null as number | null,
  });

  const load = async () => {
    const t = await AsyncStorage.getItem("token");
    logger.info("ggggggggggggggggggggggggggggggggg");
    console.log(t);

    if (!t) return;
    fixGetUser(t);
  };

  const loadDataWithId = async (userId: number) => {
    if (!userId) return;
    try {
      const [cat, followingRes, followerRes] = await Promise.all([
        categoryList(),
        followingList(userId),
        followerList(userId),
      ]);
      dispatch(RsetCategory(cat?.data?.data || []));
      dispatch(RsetAllFollowerList(followerRes?.data?.data || []));
    } catch (e) {
      logger.error("init error", e);
    }
  };

  const fixGetUser = async (token: any) => {
    try {
      const decoded: any = jwtDecode(token);
      const userIdToken: any = Object.values(decoded)?.[1];
      logger.info("userIdToken", userIdToken);
      logger.info("userId", userId);
      const resImageProfile = await profileAttachment(userId || userIdToken);
      logger.info("resImageProfile", resImageProfile);
      const userData = resImageProfile?.data?.data;
      dispatch(RsetUserLogin(userData));

      await loadDataWithId(Number(userId));
    } catch {
      await AsyncStorage.removeItem("token");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const newReciveUserId = isChat ? Number(params?.user) || null : null;
    if (
      chatInfo.userIdLogin !== userId ||
      chatInfo.reciveUserId !== newReciveUserId
    ) {
      setChatInfo({
        userIdLogin: userId || null,
        reciveUserId: newReciveUserId,
      });
    }
  }, [pathname, params?.user, userId]);

  useEffect(() => {
    if (!socket || !chatInfo.userIdLogin) return;
    dispatch(RsetSocketConfig(socket));
    socket.emit("register_user", chatInfo.userIdLogin);
    socket.on("all_user_online", (data: any) => {
      dispatch(RsetGiveUserOnlines(data));
    });
    return () => {
      socket.off("all_user_online");
    };
  }, [socket, chatInfo.userIdLogin]);

  useEffect(() => {
    if (main?.userLogin?.user?.id) {
      loadDataWithId(main.userLogin.user.id);
    }
  }, [main?.userLogin?.user?.id]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      const inAuthGroup = segments[0] === "(auth)";

      if (!token && !inAuthGroup) {
        router.replace("/login");
      } else if (token && inAuthGroup) {
        router.replace("/(tabs)/watch");
      }
    };

    checkAuth();
  }, [segments]);

  return <>{children}</>;
}
