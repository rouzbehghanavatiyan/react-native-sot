import MainTitle from "@/src/components/MainTitle";
import Notification from "@/src/components/Notification";
import TopScoreItem from "@/src/components/TopScoreItem";
import { topScoreList } from "@/src/services/masterServices";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ScrollView, YStack } from "tamagui";

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  users: any[];
}

export default function TopScoreScreen() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "music",
      title: "Music",
      icon: <MaterialIcons name="music-note" size={22} color="black" />,
      users: [],
    },
    {
      id: "sport",
      title: "Sport",
      icon: <FontAwesome5 name="running" size={20} color="black" />,
      users: [],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleGetAllScore = async () => {
    setIsLoading(true);

    try {
      const res = await topScoreList();
      const { data, status } = res?.data;

      if (status === 0) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            users: data,
          })),
        );
      }
    } catch (error) {
      console.log("Error fetching scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllScore();
  }, []);

  return (
    <YStack flex={1} bg="$background">
      <MainTitle title="Notification" showBack={false} />

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <Notification />
        <MainTitle title="Top score" showBack={false} />
        <TopScoreItem categories={categories} />
        {isLoading && (
          <YStack ai="center" py="$4">
            <ActivityIndicator size="large" />
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
