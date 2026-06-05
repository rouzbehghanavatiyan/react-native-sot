import ShowWatchSlide from "@/src/components/VideoSlide";
import { useShowWatch } from "@/src/hook/useShowWatch";
import { followerAttachmentList } from "@/src/services/masterServices";
import {
  appendHomeData,
  resetHomeState,
  setPaginationHome,
} from "@/src/slices/main";
import { useAppSelector } from "@/src/store/reduxHookType";
import { logger } from "@/src/utils/logger";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Comments from "../comments";

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;
  const userIdLogin = main?.userLogin?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const usableHeight = height - headerHeight - tabBarHeight;
  const customFetchNextPage = useCallback(
    async (params: any) => {
      const res = await followerAttachmentList({
        skip: params.skip,
        take: params.take,
        userIdLogin,
      });

      logger.error("res?.data?.data", res?.data?.data);

      return res?.data?.data ?? [];
    },
    [userIdLogin],
  );

  const {
    data,
    openDropdowns,
    setOpenDropdowns,
    currentlyPlayingId,
    handleVideoPlay,
    toggleDropdown,
    dropdownItems,
    handleSlideChange,
  } = useShowWatch({
    inviteId: userIdLogin,
    data: reduxData,
    pagination,
    customFetchNextPage,
    paginationAction: setPaginationHome,
    resetAction: resetHomeState,
    appendAction: appendHomeData,
  });

  const handleSnapToItem = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      handleSlideChange(index);
    },
    [handleSlideChange],
  );
  const [showComments, setShowComments] = useState(false);
  const [commentInfo, setCommentInfo] = useState<any>(null);
  const [commentPosition, setCommentPosition] = useState(0);

  const handleOpenComments = (video: any, position: number) => {
    setCommentInfo(video);
    setCommentPosition(position);
    setShowComments(true);
  };

  return (
    <View style={styles.container}>
      <Carousel
        vertical
        width={width}
        height={usableHeight}
        data={data}
        onSnapToItem={handleSnapToItem}
        renderItem={({ item, index }) => (
          <ShowWatchSlide
            video={item}
            index={index}
            currentlyPlayingId={currentlyPlayingId}
            // openDropdowns={openDropdowns}
            onVideoPlay={handleVideoPlay}
            // toggleDropdown={toggleDropdown}
            // dropdownItems={dropdownItems}
            // setOpenDropdowns={setOpenDropdowns}
            // isActive={currentIndex === index}
            // onOpenComments={handleOpenComments}
          />
        )}
      />
      {showComments && commentInfo && (
        <Comments
          positionVideo={commentPosition}
          commentUserInfo={commentInfo}
          showComments={showComments}
          setShowComments={setShowComments}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default HomeScreen;
