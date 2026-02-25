import { store } from "@/src/store/store";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import { NativeBaseProvider } from "native-base";
import { View } from "native-base";
import { ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    logoFont: require("../src/assets/fonts/DancingScript-Regular.ttf"),
    playFair: require("../src/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf"),
    PlusJakartaSans: require("../src/assets/fonts/PlusJakartaSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </NativeBaseProvider>
    </Provider>
  );
}
