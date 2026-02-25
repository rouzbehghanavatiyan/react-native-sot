import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { setPaginationWatch } from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { Colors } from "@/src/theme/color";
import { Icon } from "@/src/components/Icon";

interface PropsTypes {
  handleGetAllMatch: (id: number) => void;
  skills?: { id: number; name: string; icon?: string }[];
  selectFiltered: number | null;
  setSelectFiltered: any;
}
 

const Filtered: React.FC<PropsTypes> = ({
  skills,
  handleGetAllMatch,
  selectFiltered,
  setSelectFiltered,
}) => {
  const dispatch = useAppDispatch();

  const handleIconClick = (id: number) => {
    if (selectFiltered === id) return;

    setSelectFiltered(id);
    dispatch(
      setPaginationWatch({
        take: 6,
        skip: 0,
        hasMore: true,
      }),
    );

    handleGetAllMatch(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {skills?.map((item) => {
          console.log(item);
          
          const isSelected = selectFiltered === item.id;
          return (
            <View key={item.id} style={styles.itemWrapper}>
              <TouchableOpacity
                style={[styles.circle, isSelected && styles.selectedCircle]}
                onPress={() => handleIconClick(item.id)}
              >
                {item.id !== 0 && item.icon && (
                  <Icon
                    name={item?.icon || "star"}
                    size={20}
                    color={isSelected ? Colors.primary_dark : "#999"}
                  />
                )}
              </TouchableOpacity>

              <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Filtered;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  scrollContainer: {
    paddingHorizontal: 10,
  },
  itemWrapper: {
    alignItems: "center",
    marginRight: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    borderColor: Colors.primary_dark,
    backgroundColor: "#f0f8ff",
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  selectedLabel: {
    color: Colors.primary_dark,
  },
});
