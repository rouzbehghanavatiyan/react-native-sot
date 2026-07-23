import ShowWatchSlide from "@/src/components/VideoSlide";
import { attachmentListByInviteId } from "@/src/services/masterServices";
import {
  RsetShowWatch,
  appendShowWatch,
  resetShowWatchState,
  setPaginationShowWatch,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchScreen() {
  const { inviteId } = useLocalSearchParams<{ inviteId: string }>();
  const dispatch = useAppDispatch();
  const { data, pagination } = useAppSelector(
    (state) => state.main.showWatchMatch,
  );
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loadingRef = useRef(false);
  const paginationRef = useRef(pagination);

  const fetchVideos = useCallback(
    async (reset = false) => {
      if (!inviteId) return;

      const inviteIdNumber = Number(inviteId);
      if (Number.isNaN(inviteIdNumber)) return;

      if (loadingRef.current) return;

      const currentPagination = paginationRef.current;
      if (!reset && !currentPagination.hasMore) return;

      try {
        loadingRef.current = true;
        setLoading(true);

        const currentSkip = reset ? 0 : currentPagination.skip;
        const currentTake = currentPagination.take || 6;

        const res = await attachmentListByInviteId({
          skip: currentSkip,
          take: currentTake,
          inviteId: inviteIdNumber,
        });

        const newData = res?.data || [];

        if (reset) {
          dispatch(RsetShowWatch(newData));
        } else {
          dispatch(appendShowWatch(newData));
        }

        dispatch(
          setPaginationShowWatch({
            take: currentTake,
            skip: currentSkip + currentTake,
            hasMore: newData.length === currentTake,
          }),
        );
      } catch (error: any) {
        console.log("error:", error?.message);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [inviteId, dispatch],
  );

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    dispatch(resetShowWatchState());
    paginationRef.current = { take: 6, skip: 0, hasMore: true };
    fetchVideos(true);
  }, [inviteId, fetchVideos]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const visibleIndex = viewableItems[0]?.index ?? 0;
      setCurrentIndex(visibleIndex);
    }
  }).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item?.id ?? index}`}
        renderItem={({ item, index }) => (
          <View style={styles.page}>
            <ShowWatchSlide
              video={item}
              index={index}
              isActive={currentIndex === index}
            />
          </View>
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => fetchVideos(false)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#fff" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  page: {
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
});
