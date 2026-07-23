import ImageRank from "@/src/components/ImageRank";
import { topScoreList } from "@/src/services/masterServices";
import { getImageUrl } from "@/src/utils/fileHelper";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
      {/* <Text style={styles.mainTitle}>News</Text> 

      <View style={styles.lastMatchCard}>
        <Text style={styles.lastMatchText}>Last match:</Text>

        <View style={styles.matchRow}>
          <View style={styles.player}>
            <Image
              source={{ uri: "https://placehold.co/80" }}
              style={styles.avatar}
            />
            <Text>20</Text>
          </View>

          <View style={styles.lossBox}>
            <Text style={styles.lossText}>Loss</Text>
          </View>

          <View style={styles.player}>
            <Image
              source={{ uri: "https://placehold.co/80" }}
              style={styles.avatar}
            />
            <Text>30</Text>
          </View>
        </View>

        <Text style={styles.quote}>
          “Winning isn’t everything, but the courage to try and the strength to
          persevere are what truly define success.”
        </Text>
      </View> */}
      {/* <MainTitle title="Top score" /> */}
      <ScrollView style={{ flex: 1 }}>
        {categories.map((category) => {
          console.log("category", category);
          return (
            <View key={category.id} style={styles.category}>
              <View style={styles.categoryHeader}>
                <View style={styles.iconBox}>{category.icon}</View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {category.users.map((userTop: any, index: number) => {
                  const userInfo = {
                    userProfile: userTop?.profile,
                    user: {
                      userName: userTop?.userName,
                      id: userTop?.userId,
                    },
                    score: userTop?.score,
                  };
                  return (
                    <View key={index} style={styles.userCard}>
                      <ImageRank
                        userInfo={userInfo}
                        imgSize={85}
                        score={userTop.score}
                        imgSrc={getImageUrl(userTop?.profile)}
                      />
                      <Text style={styles.userName}>{userTop.userName}</Text>
                      <Text style={styles.userTime}>{userTop.time}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}

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
});
