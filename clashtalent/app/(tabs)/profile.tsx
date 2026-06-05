import { MaterialIcons } from "@expo/vector-icons"; // برای دکمه بستن مدال
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

import ProfileAchievements from "@/src/components/ProfileAchievements";
import ProfileBio from "@/src/components/ProfileBio";
import ProfileHeader from "@/src/components/ProfileHeader";
import { usePagination } from "@/src/hook/usePagination";
import { userAttachmentList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const main = useAppSelector((state) => state?.main);
  const userIdWhantToShow = route.params?.userData;
  const socket = main.socketConfig;
  const userId = main?.userLogin?.user?.id;

  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});

  // جایگزین useDisclose نیتیو-بیس
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const findImg: any = !!userIdWhantToShow?.user
    ? getImageUrl(userIdWhantToShow?.profile)
    : getImageUrl(main?.userLogin?.profile);

  const { data, isLoading, hasMore, fetchNextPage, refresh } = usePagination(
    userAttachmentList,
    {
      take: 6,
      extraParams: {
        id: userIdWhantToShow?.user?.id || main?.userLogin?.user?.id,
      },
    },
  );

  useEffect(() => {
    const handleGetAddLike = (data: { userId: number; movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) + 1,
      }));
    };

    const handleGetRemoveLike = (data: { userId: number; movieId: number }) => {
      setVideoLikes((prev) => ({
        ...prev,
        [data.movieId]: (prev[data.movieId] || 0) - 1,
      }));
    };

    if (socket) {
      socket.on("add_liked_response", handleGetAddLike);
      socket.on("remove_liked_response", handleGetRemoveLike);
    }
    return () => {
      if (socket) {
        socket.off("add_liked_response", handleGetAddLike);
        socket.off("remove_liked_response", handleGetRemoveLike);
      }
    };
  }, [socket]);

  useEffect(() => {
    const score = userIdWhantToShow?.score || main?.userLogin?.score || 0;
    let calc = score <= 100 ? score : score % 100 || 100;
    setPercentage(Math.min(Math.max(calc, 1), 100));
  }, [main?.userLogin?.score, userIdWhantToShow]);

  const renderHeader = () => (
    <YStack bg="$backgroundPaper" gap="$4" pb="$4">
      <ProfileHeader
        userImage={findImg}
        userName={
          userIdWhantToShow?.user?.userName || main?.userLogin?.user?.userName
        }
        score={userIdWhantToShow?.score || main?.userLogin?.score}
        followersCount={main?.allFollowerList?.length}
        followingCount={main?.allFollingList?.getMapFollowingId?.length}
        onEditPress={onOpen}
      />
      <ProfileBio
        rankScore={main?.userLogin?.score}
        bio={"This is me jenifer I am the best"}
        location={"Tehran, Iran"}
        rankPercentage={percentage}
        website={"http://te.me/jenifer159"}
      />
      <ProfileAchievements />
    </YStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <YStack f={1} bg="$backgroundDefault">
        <FlatList
          data={["data"]} // داده‌های اصلی شما اینجا قرار می‌گیرند
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={
            ({ item }) => null // <VideosProfileItem match={item} videoLikes={videoLikes} />
          }
          onEndReached={() => {
            if (hasMore && !isLoading) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            isLoading ? (
              <YStack p="$4" jc="center" ai="center">
                <Spinner color="$primaryMain" size="large" />
              </YStack>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refresh} />
          }
        />

        {/* جایگزین Modal نیتیو-بیس با Modal ری‌اکت نیتیو و استایل‌های Tamagui */}
        <Modal
          visible={isOpen}
          onRequestClose={onClose}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <YStack f={1} bg="$backgroundDefault">
              <XStack
                jc="space-between"
                ai="center"
                p="$4"
                borderBottomWidth={1}
                borderColor="$divider"
              >
                <Text fontSize="$5" fontWeight="bold" color="$textPrimary">
                  Edit Profile
                </Text>
                <Pressable onPress={onClose} hitSlop={10}>
                  <MaterialIcons name="close" size={24} color="black" />
                </Pressable>
              </XStack>
              {/* <View f={1} p="$4">
                <EditProfile setShowEditProfile={onClose} />
              </View> */}
            </YStack>
          </SafeAreaView>
        </Modal>
      </YStack>
    </SafeAreaView>
  );
};

export default Profile;
