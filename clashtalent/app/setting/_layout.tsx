import MainTitle from "@/src/components/MainTitle";
import SoftLink from "@/src/components/SoftLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertDialog, Button, Text, View, XStack, YStack } from "tamagui";

export default function SettingLayout() {
  const router = useRouter();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);

      // پاک کردن کامل AsyncStorage
      await AsyncStorage.clear();

      setLogoutDialogOpen(false);

      // انتقال به صفحه لاگین
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAcceptCategory = async (category: any) => {
    if (category.name === "Signout") {
      setLogoutDialogOpen(true);
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

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        {/* حذف کردن AlertDialog.Portal */}
        <AlertDialog.Overlay
          key="overlay"
          opacity={0.45}
          bg="black"
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <AlertDialog.Content
          key="content"
          bordered
          elevate
          animation="quick"
          enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          exitStyle={{ opacity: 0, scale: 0.95, y: 10 }}
          width="85%"
          maxWidth={360}
          bg="$backgroundPaper"
          borderRadius="$4"
          p="$5"
        >
          <YStack space="$4">
            <YStack space="$2">
              <AlertDialog.Title>
                <Text fontSize="$4" fontWeight="700" color="$textPrimary">
                  Sign out
                </Text>
              </AlertDialog.Title>

              <AlertDialog.Description>
                <Text fontSize="$2" color="$textSecondary">
                  Are you sure you want to sign out? Your local session data
                  will be removed.
                </Text>
              </AlertDialog.Description>
            </YStack>

            <XStack jc="flex-end" space="$3">
              <AlertDialog.Cancel asChild>
                <Button
                  disabled={isLoggingOut}
                  bg="$grey200"
                  color="$textPrimary"
                  borderRadius="$3"
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button
                  disabled={isLoggingOut}
                  onPress={handleLogoutConfirm}
                  bg="$errorMain"
                  color="white"
                  borderRadius="$3"
                  fontWeight="700"
                >
                  {isLoggingOut ? "Signing out..." : "Confirm"}
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog>
    </SafeAreaView>
  );
}
