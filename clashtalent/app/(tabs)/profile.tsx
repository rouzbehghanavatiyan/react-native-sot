import ProfileAchievements from "@/src/components/ProfileAchievements";
import ProfileBio from "@/src/components/ProfileBio";
import ProfileHeader from "@/src/components/ProfileHeader";
import { usePagination } from "@/src/hook/usePagination";
import { userAttachmentList } from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, SafeAreaView } from "react-native";
import { Spinner, YStack } from "tamagui";
import VideosProfileItem from "../profile/VideosProfileItem";

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const main = useAppSelector((state) => state?.main);
  const userIdWhantToShow = route.params?.userData;
  const socket = main.socketConfig;
  const userId = main?.userLogin?.user?.id;
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});

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

  console.log("data", data);

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
    <YStack bg="$grey100" gap="$4" p="$2">
      <ProfileHeader
        userImage={findImg}
        userName={
          userIdWhantToShow?.user?.userName || main?.userLogin?.user?.userName
        }
        score={userIdWhantToShow?.score || main?.userLogin?.score}
        followersCount={main?.allFollowerList?.length}
        followingCount={main?.allFollowingList?.length}
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
          data={data}
          keyExtractor={(item) => item.inviteInserted.id.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <VideosProfileItem
              activeVideoId={activeVideoId}
              onPlay={(id: string | null) => setActiveVideoId(id)}
              video={item}
              videoLikes={videoLikes}
            />
          )}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() =>
            isLoading ? (
              <YStack p="$4" jc="center" ai="center">
                <Spinner color="$primaryMain" size="large" />
              </YStack>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading && data.length === 0}
              onRefresh={refresh}
            />
          }
          onEndReached={async () => {
            if (hasMore && !isLoading && !isFetchingMore) {
              setIsFetchingMore(true);
              await fetchNextPage();
              setIsFetchingMore(false);
            }
          }}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      </YStack>
    </SafeAreaView>
  );
};

export default Profile;
