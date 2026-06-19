import ImageRank from "@/src/components/ImageRank";
import { useAppSelector } from "@/src/store/reduxHookType";
import { socketClient } from "@/src/utils/socketClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import ChatHeader from "./ChatHeader";

interface MessageType {
  id?: number;
  userProfile: string;
  sender: number;
  recieveId: number;
  title: string;
  time: string;
  userNameSender?: string;
}

export default function PrivateChat() {
  const { id, userName, profile, score } = useLocalSearchParams<{
    id: string;
    userName: string;
    profile: string;
    score: any;
  }>();
  const userScore = Number(score);
  const main = useAppSelector((state) => state?.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const reciveUserId = Number(id);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const paginationRef = useRef({
    skip: 0,
    take: 10,
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!title.trim()) return;

    const timeString = new Date().toTimeString().slice(0, 5);

    const message: MessageType = {
      sender: userIdLogin,
      recieveId: reciveUserId,
      title: title.trim(),
      time: timeString,
      userProfile: "",
    };
    socketClient?.emit("send_message", message);
    setMessages((prev) => [...prev, message]);
    setTitle("");
    scrollToBottom();
  };

  const handleReciveMessage = useCallback(
    (data: MessageType) => {
      const shouldShow =
        (data.sender === userIdLogin && data.recieveId === reciveUserId) ||
        (data.recieveId === userIdLogin && data.sender === reciveUserId);

      if (!shouldShow) return;

      setMessages((prev) => [...prev, data]);

      scrollToBottom();
    },
    [userIdLogin, reciveUserId],
  );

  const getMessages = async () => {
    // try {
    //   setIsLoading(true);
    //   const res = await userMessages(
    //     userIdLogin,
    //     reciveUserId,
    //     paginationRef.current.skip,
    //     paginationRef.current.take,
    //   );
    //   setMessages(res?.data?.messages || []);
    //   scrollToBottom();
    // } catch (err) {
    //   console.log("fetch messages error", err);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  useEffect(() => {
    if (!socketClient) return;

    getMessages();

    socketClient.on("receive_message", handleReciveMessage);

    return async () => {
      socketClient.off("receive_message", handleReciveMessage);

      if (reciveUserId) {
        await AsyncStorage.setItem(`message_read_${reciveUserId}`, "true");

        socketClient.emit("mark_messages_as_read", {
          sender: reciveUserId,
          receiver: userIdLogin,
        });
      }
    };
  }, [socketClient, reciveUserId]);

  const renderMessage = ({ item }: { item: MessageType }) => {
    const isOwn = item.sender === userIdLogin;

    return (
      <XStack
        justifyContent={isOwn ? "flex-end" : "flex-start"}
        alignItems="flex-end"
        px="$3"
        py="$2"
      >
        {!isOwn && <ImageRank imgSrc={item.userProfile} imgSize={35} />}
        <YStack
          maxWidth="70%"
          bg={isOwn ? "white" : "$orange5"}
          borderRadius="$4"
          px="$3"
          py="$2"
          mx="$2"
        >
          <Text>{item.title}</Text>

          <Text fontSize={10} color="$gray10">
            {item?.time?.slice(0, 5)}
          </Text>
        </YStack>
        {isOwn && <ImageRank imgSrc={item.userProfile} imgSize={35} />}
      </XStack>
    );
  };

  return (
    <YStack flex={1} bg="$background">
      <ChatHeader userName={userName} userProfile={profile} score={userScore} />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item.id || index}`}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* <MessageInput
        title={title}
        setTitle={setTitle}
        handleSendMessage={handleSendMessage}
      /> */}
    </YStack>
  );
}
