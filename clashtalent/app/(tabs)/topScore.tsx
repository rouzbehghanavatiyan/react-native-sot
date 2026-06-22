import ImageRank from "@/src/components/ImageRank";
import MainTitle from "@/src/components/MainTitle";
import TopScoreItem from "@/src/components/TopScoreItem";
import { topScoreList } from "@/src/services/masterServices";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

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
    <View style={styles.container}>
      <MainTitle title="Notification" showBack={false} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack>
          <XStack
            ai="center"
            bg="$backgroundPaper"
            px="$3"
            borderColor="$divider"
            gap="$3"
          >
            <ImageRank userName="Jhan so" />
            <YStack f={1}>
              <Text fontSize="$2" color="$textSecondary">
                2 minutes ago
              </Text>
            </YStack>
            <YStack px="$3" py="$1" br="$10" bg="$errorMain">
              <Text fontSize="$3" color="white" fontWeight="700">
                Loss
              </Text>
            </YStack>
          </XStack>
          <XStack
            ai="center"
            bg="$backgroundPaper"
            px="$3"
            borderColor="$divider"
            gap="$3"
          >
            <ImageRank userName="Jhan so" />
            <YStack f={1}>
              <Text fontSize="$2" color="$textSecondary">
                2 minutes ago
              </Text>
            </YStack>
            <YStack px="$3" py="$1" br="$10" bg="$errorMain">
              <Text fontSize="$3" color="white" fontWeight="700">
                Loss
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <MainTitle title="Top score" showBack={false} />
        <TopScoreItem categories={categories} styles={styles} />

        {isLoading && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  lastMatchCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  lastMatchText: {
    marginBottom: 10,
  },

  matchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  player: {
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },

  lossBox: {
    marginHorizontal: 16,
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  lossText: {
    color: "white",
    fontWeight: "bold",
  },

  quote: {
    textAlign: "center",
    fontWeight: "600",
  },

  category: {
    marginBottom: 1,
    paddingBottom: 1,
  },

  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderTopWidth: 1,
    borderColor: "#d8d8d8",
  },

  iconBox: {
    // backgroundColor: "#eee",
    width: 40, // اندازه ثابت برای عرض
    height: 40, // اندازه ثابت برای ارتفاع
    // borderColor: "#575757",
    // borderWidth: 1,
    // borderRadius: 20,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  userCard: {
    width: 90,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center",
    marginLeft: 16,
  },

  userImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  userName: {
    marginTop: 6,
    fontSize: 13,
  },

  userTime: {
    fontSize: 11,
    color: "gray",
  },
  notificationSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },

  notificationSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  notificationAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  winAvatar: {
    backgroundColor: "#DCFCE7",
  },

  lossAvatar: {
    backgroundColor: "#FFE4E6",
  },

  notificationAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  notificationContent: {
    flex: 1,
  },

  notificationText: {
    fontSize: 13,
    color: "#374151",
  },

  notificationName: {
    fontWeight: "800",
    color: "#111827",
  },

  notificationTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 3,
  },

  notificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  winBadge: {
    backgroundColor: "#ECFDF5",
  },

  lossBadge: {
    backgroundColor: "#FFF1F2",
  },

  notificationBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  winBadgeText: {
    color: "#16A34A",
  },

  lossBadgeText: {
    color: "#E11D48",
  },
});
