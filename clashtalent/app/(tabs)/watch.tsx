import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import {
  setPaginationWatch,
  setWatchData,
  appendWatchData,
  resetWatchState,
} from "@/src/slices/main";

import { attachmentList, subCategoryList } from "@/src/services/masterServices";
import VideoGroup from "@/src/components/VideoGroup";
import FilteredWatch from "@/app/(tabs)/FilteredWatch";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import MainTitle from "@/src/components/MainTitle";

export default function WatchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { pagination, data } = useAppSelector((state) => state.main.watchVideo);

  const [skills, setSkills] = useState<any[]>([]);
  const [selectFiltered, setSelectFiltered] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleGetFiltered = async () => {
    try {
      const res = await subCategoryList(1);
      const { data: skillData } = res?.data;
      const temp = [{ id: 0, name: "All" }, ...skillData];
      console.log("datadatadatadata", skillData);
      setSkills(temp);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- GET MATCH DATA ----------------
  const handleGetAllMatch = async (skillId: number) => {
    if (loading || !pagination.hasMore) return;

    try {
      setLoading(true);

      const res = await attachmentList({
        skip: pagination.skip,
        take: pagination.take,
        subCatId: skillId,
      });

      const newData = res?.data || [];

      if (pagination.skip === 0) {
        dispatch(setWatchData(newData));
      } else {
        dispatch(appendWatchData(newData));
      }

      dispatch(
        setPaginationWatch({
          take: pagination.take,
          skip: pagination.skip + pagination.take,
          hasMore: newData.length === pagination.take,
        }),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER CHANGE ----------------
  const handleFilterChange = (skillId: number) => {
    setSelectFiltered(skillId);

    dispatch(resetWatchState());

    dispatch(
      setPaginationWatch({
        take: 6,
        skip: 0,
        hasMore: true,
      }),
    );

    handleGetAllMatch(skillId);
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    handleGetFiltered();
  }, []);

  useEffect(() => {
    handleFilterChange(selectFiltered);
  }, []);

  // ---------------- NAVIGATION ----------------
  const handleShowMatch = (item: any) => {
    // router.push({
    //   pathname: '/watch-detail',
    //   params: { id: item?.inviteInserted?.id },
    // });
  };

  return (
    <View style={styles.container}>
      <MainTitle
        title="Filtered"
        // handleBack={() => router.back()}
      />
      <FilteredWatch
        skills={skills}
        handleGetAllMatch={handleFilterChange}
        selectFiltered={selectFiltered}
        setSelectFiltered={setSelectFiltered}
      />
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <VideoGroup
            group={item}
            index={index}
            onPress={() => handleShowMatch(item)}
          />
        )}
        onEndReached={() => handleGetAllMatch(selectFiltered)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
