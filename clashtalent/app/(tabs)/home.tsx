import ShowWatchSlide from "@/src/components/VideoSlide";
import { useShowWatch } from "@/src/hook/useShowWatch";
import { followerAttachmentList } from "@/src/services/masterServices";
import {
  appendHomeMatch,
  resetHomeMatch,
  setPaginationHomeMatch,
} from "@/src/slices/main";
import { useAppSelector } from "@/src/store/reduxHookType";
import { logger } from "@/src/utils/logger";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Comments from "../comments";

const HomeScreen: React.FC = () => {
  const hasFetchedOnce = useRef(false);
  const main = useAppSelector((state) => state.main);
  const { pagination, data: reduxData } = main.homeMatch;
  const userIdLogin = main?.userLogin?.user?.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const usableHeight = height - headerHeight - tabBarHeight;

  const customFetchNextPage = useCallback(
    async (params: {
      skip: number;
      take: number;
      inviteId: string | undefined;
    }) => {
      if (!params.inviteId) return [];

      try {
        const res = await followerAttachmentList({
          skip: params.skip,
          take: params.take,
          userIdLogin: params.inviteId,
        });

        hasFetchedOnce.current = true;

        console.log("API DATA ARRAY", res?.data?.data);

        return res?.data?.data || [];
      } catch (error) {
        hasFetchedOnce.current = true;
        console.error("Error fetching data:", error);
        return [];
      }
    },
    [],
  );

  const {
    data,
    isLoading,
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
    paginationAction: setPaginationHomeMatch,
    resetAction: resetHomeMatch,
    appendAction: appendHomeMatch,
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

  const handleOpenComments = useCallback((video: any, position: number) => {
    setCommentInfo(video);
    setCommentPosition(position);
    setShowComments(true);
  }, []);

  logger.info("home data", data);

  const showInitialLoader =
    !hasFetchedOnce.current && (!data || data.length === 0);
  const showEmptyState =
    hasFetchedOnce.current && !isLoading && (!data || data.length === 0);
  return (
    <View style={styles.container}>
      {showInitialLoader ? (
        <View style={styles.loaderWrapper}>
          <Text>Loading...</Text>
        </View>
      ) : showEmptyState ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Content Available</Text>

            <Text style={styles.emptyText}>
              Dear user, there are no followers available to view at the moment.
              Please visit the Watch page to connect with more users!
            </Text>
          </View>
        </View>
      ) : (
        <Carousel
          vertical
          width={width}
          height={usableHeight}
          data={data || []}
          onSnapToItem={handleSnapToItem}
          renderItem={({ item, index }) => (
            <ShowWatchSlide
              showLiked={false}
              endTime={false}
              showScore
              showResult
              showCountLiked
              video={item}
              index={index}
              currentlyPlayingId={currentlyPlayingId}
              openDropdowns={openDropdowns}
              onVideoPlay={handleVideoPlay}
              toggleDropdown={toggleDropdown}
              dropdownItems={dropdownItems}
              setOpenDropdowns={setOpenDropdowns}
              handleToggleComments={handleOpenComments}
            />
          )}
        />
      )}
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

  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  emptyCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#9CA3AF",
    textAlign: "center",
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
