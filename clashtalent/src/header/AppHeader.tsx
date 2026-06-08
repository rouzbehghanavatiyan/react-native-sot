import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { H1 } from "tamagui";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";

const AppHeader = () => {
  const router = useRouter();
  const pathname: any = usePathname();
  const dispatch = useAppDispatch();

  const socket = useAppSelector((state) => state.main.socketConfig);
  const currentUser = useAppSelector((state) => state.main.userLogin?.user);
  const unreadCount = useAppSelector((state) => state.main.unreadMessagesCount);

  const routes = useMemo(
    () => ({
      isWatch: pathname === "/watch",
      isProfile: pathname === "/profile",
      isShowWatch: pathname === "/watch/show",
      isNotification: pathname === "/notification",
      isMessage: pathname === "/privateMessage",
      isTopScore: pathname === "/topScore",
    }),
    [pathname],
  );
  const titleMap: Record<string, string> = {
    "/topScore": "Top score",
    "/profile": "Profile",
    "/notification": "Notifications",
  };
  const headerTitle = titleMap[pathname] || "Clash Talent";

  const handleReadConfirmation = (data: any) => {
    // if (currentUser?.id === data.receiver) {
    //   dispatch(clearUnreadCount());
    // }
  };

  const handleReceiveMessage = (data: any) => {
    // if (currentUser?.id === data?.recieveId) {
    //   dispatch(incrementUnreadCount());
    // }
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read_confirmation", handleReadConfirmation);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read_confirmation", handleReadConfirmation);
    };
  }, [socket, currentUser]);

  const handleBack = () => router.back();

  const ActionIcons = () => (
    <View style={styles.iconContainer}>
      <TouchableOpacity
      // onPress={() => router.push("/store")}
      >
        <Ionicons name="ticket-outline" size={22} color="#10153D" />
      </TouchableOpacity>

      <TouchableOpacity
        // onPress={() => router.push("/messages")}
        style={{ marginLeft: 16 }}
      >
        <View>
          <Ionicons name="mail-outline" size={22} color="#10153D" />
          {unreadCount > 0 && <View style={styles.badge} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (routes.isShowWatch) return null;

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {/* {!routes.isWatch && (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#10153D" />
          </TouchableOpacity>
        )} */}

        <H1
          style={styles.logo}
          fontFamily="$logo"
          // mt="$4"  <-- این را حذف کن، چون متن را از بالا هل می‌دهد پایین
          color="$textPrimary"
          size="$6"
        >
          {headerTitle}
        </H1>
      </View>

      {routes.isProfile ? (
        <TouchableOpacity
        // onPress={() => router.push("/setting")}
        >
          <Ionicons name="settings-outline" size={22} color="#10153D" />
        </TouchableOpacity>
      ) : (
        <ActionIcons />
      )}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    height: 45,
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#222222",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1.6,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontFamily: "logoFont",
    fontSize: 20,
    color: "#10153D",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
});
