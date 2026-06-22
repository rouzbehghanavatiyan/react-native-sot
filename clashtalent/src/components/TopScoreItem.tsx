import React from "react";
import { ScrollView, Text, View } from "react-native";
import { getImageUrl } from "../utils/fileHelper";
import ImageRank from "./ImageRank";
// import { getImageUrl } from "...";

const TopScoreItem = ({ categories, styles }: any) => {
  return (
    <>
      {categories?.map((category: any) => {
        console.log("category", category);

        return (
          <View key={category.id} style={styles.category}>
            <View style={styles.categoryHeader}>
              <View style={styles.iconBox}>{category.icon}</View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {category.users?.map((userTop: any, index: number) => {
                const userInfo = {
                  userProfile: userTop?.profile,
                  user: {
                    userName: userTop?.userName,
                    id: userTop?.userId,
                  },
                  score: userTop?.score,
                };

                return (
                  <View key={userTop?.userId ?? index} style={styles.userCard}>
                    <ImageRank
                      userInfo={userInfo}
                      imgSize={85}
                      score={userTop?.score}
                      imgSrc={getImageUrl(userTop?.profile)}
                    />

                    <Text style={styles.userName}>{userTop?.userName}</Text>
                    <Text style={styles.userTime}>{userTop?.time}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );
      })}
    </>
  );
};

export default TopScoreItem;
