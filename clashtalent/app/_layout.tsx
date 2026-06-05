import { store } from "@/src/store/store";
import { PortalProvider } from "@gorhom/portal";
import { TamaguiProvider, View } from "@tamagui/core";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import tamaguiConfig from "../tamagui.config";
import { AppInitializer } from "./AppInitializer";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    logoFont: require("../src/assets/fonts/DancingScript-Regular.ttf"),
    playFair: require("../src/assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf"),
    PlusJakartaSans: require("../src/assets/fonts/PlusJakartaSans-Regular.ttf"),
  });

  console.log("Layouttttttttttttttttt");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <SafeAreaProvider>
          <PortalProvider>
            <Provider store={store}>
              <AppInitializer>
                {fontsLoaded ? (
                  <Slot />
                ) : (
                  <View flex={1} justifyContent="center" alignItems="center">
                    <ActivityIndicator />
                  </View>
                )}
              </AppInitializer>
            </Provider>
          </PortalProvider>
        </SafeAreaProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
