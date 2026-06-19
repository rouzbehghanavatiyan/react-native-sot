import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { socketClient } from "@/src/utils/socketClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MailOpen } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

interface MessageData {
  id?: number;
  sender: number;
  recipient?: number;
  recieveId?: number;
  userNameSender?: string;
  score?: number;
  [key: string]: any;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [userSender, setUserSender] = useState<MessageData[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<number, boolean>>(
    {},
  );

  const handleRedirect = async (data: MessageData) => {
    await AsyncStorage.setItem(`message_read_${data.sender}`, "true");

    setUnreadMessages((prev) => ({
      ...prev,
      [data.sender]: false,
    }));

    router.push({
      pathname: "/privateMessage",
      params: {
        id: String(data.sender),
        userInfo: JSON.stringify(data),
      },
    });
  };

  const handleMessagesReadConfirmation = useCallback(
    (data: { sender: number }) => {
      setUnreadMessages((prev) => ({
        ...prev,
        [data.sender]: false,
      }));
    },
    [],
  );

  const handleGetUserMessages = useCallback(async () => {
    // if (!userIdLogin) return;
    // try {
    //   setIsLoading(true);
    //   const res = await allUserMessagese(userIdLogin);
    //   const { data, status } = res?.data || {};
    //   if (status === 0) {
    //     setUserSender(data || []);
    //   }
    // } catch (error) {
    //   console.log("Get user messages error:", error);
    // } finally {
    //   setIsLoading(false);
    // }
  }, [userIdLogin]);

  const handleReceiveMessage = useCallback(
    async (data: MessageData) => {
      if (userIdLogin === data?.recieveId) {
        await AsyncStorage.setItem(`message_read_${data.sender}`, "false");

        setUnreadMessages((prev) => ({
          ...prev,
          [data.sender]: true,
        }));
      }
    },
    [userIdLogin],
  );

  useEffect(() => {
    if (!socketClient) return;

    socketClient.on("receive_message", handleReceiveMessage);
    socketClient.on(
      "messages_read_confirmation",
      handleMessagesReadConfirmation,
    );

    return () => {
      socketClient.off("receive_message", handleReceiveMessage);
      socketClient.off(
        "messages_read_confirmation",
        handleMessagesReadConfirmation,
      );
    };
  }, [socketClient, handleReceiveMessage, handleMessagesReadConfirmation]);

  useEffect(() => {
    handleGetUserMessages();
  }, [handleGetUserMessages]);

  useEffect(() => {
    const loadStoredReadStatus = async () => {
      const storedReadStatus: Record<number, boolean> = {};

      for (const user of userSender) {
        const value = await AsyncStorage.getItem(`message_read_${user.sender}`);
        const isUnread = value !== "true";

        storedReadStatus[user.sender] = isUnread;
      }

      setUnreadMessages(storedReadStatus);
    };

    if (userSender.length > 0) {
      loadStoredReadStatus();
    }
  }, [userSender]);

  if (isLoading) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg="$background"
      >
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack flex={1} bg="$background">
        <MainTitle title="Messages" />
        {userSender.length > 0 ? (
          userSender.map((user) => {
            const fixImage = getImageUrl(user);
            const uniqueKey = `${user?.id}-${user?.sender}`;

            return (
              <Pressable key={uniqueKey} onPress={() => handleRedirect(user)}>
                <XStack
                  position="relative"
                  alignItems="center"
                  px="$2"
                  py="$2"
                  borderBottomWidth={1}
                  borderBottomColor="$gray5"
                  bg="$gray2"
                >
                  <ImageRank
                    userName={user?.userNameSender}
                    imgSize={50}
                    score={user?.score || 0}
                    imgSrc={fixImage || "default-profile-image.png"}
                  />

                  {unreadMessages[user.sender] && (
                    <View
                      position="absolute"
                      right="$4"
                      width={14}
                      height={14}
                      borderRadius={999}
                      bg="$red10"
                    />
                  )}
                </XStack>
              </Pressable>
            );
          })
        ) : (
          <YStack
            flex={1}
            bg="white"
            alignItems="center"
            justifyContent="center"
            p="$4"
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$2"
              p="$4"
              borderRadius="$4"
            >
              <MailOpen size={26} color="#333" />
              <Text color="$gray11" fontSize="$5">
                Empty messages
              </Text>
            </XStack>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
};

export default ChatRoom;
