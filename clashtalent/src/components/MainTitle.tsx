import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PropType {
  title: string;
  handleBack?: () => void;
  rightComponent?: React.ReactNode;
}

const MainTitle: React.FC<PropType> = ({
  title,
  handleBack,
  rightComponent,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {handleBack && (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#30f197"
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.side}>{rightComponent}</View>
    </View>
  );
};

export default MainTitle;

const styles = StyleSheet.create({
  container: {
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f7f7",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
    
  },
  side: {
    width: 50,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "PlusJakartaSans",
  },
});