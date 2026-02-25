import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";

const AppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
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
      isMessage: pathname === "/privatemessage",
    }),
    [pathname],
  );

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
        {!routes.isWatch && (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#10153D" />
          </TouchableOpacity>
        )}

        <Text style={styles.logo}>Clash Talent</Text>
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

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontFamily: "logoFont",
    fontSize: 28,
    color: "#10153D",
    fontWeight: "bold",
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
