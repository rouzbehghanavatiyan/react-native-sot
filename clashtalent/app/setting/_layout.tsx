import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "tamagui";

export default function SettingLayout() {
  const router = useRouter();

  const handleAcceptCategory = async (category: any) => {
    if (category.name === "Signout") {
      Alert.alert("Sign out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();

              router.replace("/login");
            } catch (error) {
              console.log("Logout error:", error);
            }
          },
        },
      ]);

      return;
    }

    if (category.name === "Profile") {
      router.push("/profile");
      return;
    }

    if (category.name === "Support") {
      router.push("/support");
      return;
    }

    if (category.name === "About us") {
      router.push("/about");
      return;
    }

    if (category.name === "Mark") {
      router.push("/mark");
      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MainTitle title="Setting" />
      <View flex={1} px="$2" py="$2" bg="$gray2">
        <SoftLink
          handleAcceptCategory={handleAcceptCategory}
          categories={[
            {
              name: "Signout",
              id: 1,
              icon: "logout",
            },
            {
              name: "Profile",
              id: 2,
              icon: "person",
            },
            {
              name: "Support",
              id: 3,
              icon: "support-agent",
            },
            {
              name: "About us",
              id: 4,
              icon: "info",
            },
            {
              name: "Mark",
              id: 5,
              icon: "star",
            },
          ]}
          isLoading={false}
        />
      </View>
    </SafeAreaView>
  );
}
