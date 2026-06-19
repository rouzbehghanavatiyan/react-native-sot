import { addFollower, removeFollower } from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Separator, Text, View, XStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import Follows from "./Follows";
import ImageRank from "./ImageRank";

interface OptionTopProps {
  video: any;
  positionVideo: number;
  openDropdowns: { [key: number]: boolean };
  score: any;
  setOpenDropdowns: any;
  toggleDropdown: (position: string) => void;
  dropdownItems: (video: any) => any[];
  userIdLogin: string | null;
  main: any;
}

const OptionTop: React.FC<OptionTopProps> = ({
  video,
  positionVideo,
  score,
  dropdownItems,
  userIdLogin,
  main,
}) => {
  const router = useRouter();
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUserId = main?.userLogin?.user?.id;

  const profile =
    positionVideo === 0
      ? video?.profileInserted
        ? getImageUrl(video.profileInserted)
        : null
      : video?.profileMatched
        ? getImageUrl(video.profileMatched)
        : null;

  const userInfo =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;

  const checkMyVideo =
    userInfo?.id && currentUserId ? userInfo.id !== currentUserId : false;

  const userScore =
    positionVideo === 0 ? video?.scoreInserted : video?.scoreMatched;

  useEffect(() => {
    const getInitialFollowStatus = () => {
      try {
        if (positionVideo === 0) {
          return video?.isFollowedMeInserted === true;
        } else {
          return video?.isFollowedMeMatched === true;
        }
      } catch (error) {
        console.error("Error getting follow status:", error);
        return false;
      }
    };

    setLocalIsFollowed(getInitialFollowStatus());
  }, [video, positionVideo]);

  const handleFallowClick = async (video: any, position: number) => {
    if (isLoadingFollow) return;
    const userIdFollow =
      position === 0 ? video?.userInserted?.id : video?.userMatched?.id;
    const postData = {
      userId: userIdLogin || null,
      followerId: userIdFollow || null,
    };

    const newFollowStatus = !localIsFollowed;

    try {
      setIsLoadingFollow(true);

      if (localIsFollowed) {
        await removeFollower(postData);
      } else {
        await addFollower(postData);
      }

      setLocalIsFollowed(newFollowStatus);
    } catch (error) {
      console.error("Error in follow operation:", error);
      setLocalIsFollowed(localIsFollowed);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSendMessage = () => {
    setMenuOpen(false);
    if (!userInfo?.id) return;
    router.push({
      pathname: `/chat/${userInfo.id}`,
      params: {
        userId: userInfo.id,
        userName: userInfo?.userName || "",
        score: userScore || "",
        profile: profile || "",
      },
    });
  };

  // ----- گزارش کاربر -----
  const handleReport = () => {
    setMenuOpen(false);
    if (!userInfo?.id) return;

    // اینجا می‌تونید مودال ریپورت رو باز کنید یا API ریپورت رو صدا بزنید
    console.log("Report user:", userInfo.id);
  };

  // ----- ترکیب آیتم‌های ثابت با آیتم‌های دینامیک قبلی -----
  const getMenuItems = () => {
    let items: any[] = [];

    try {
      items =
        dropdownItems && typeof dropdownItems === "function"
          ? dropdownItems(video)
          : [];
    } catch (error) {
      console.error("Error getting dropdown items:", error);
    }

    const customItems = [
      {
        label: "Send Message",
        icon: "chat",
        onClick: handleSendMessage,
      },
      {
        label: "Report",
        icon: "flag",
        onClick: handleReport,
      },
    ];

    return items.length > 0
      ? [...customItems, { divider: true }, ...items]
      : customItems;
  };

  return (
    <View position="absolute" top={0} left={0} right={0} zIndex={1}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.5)", "rgba(255, 255, 255, 0)"]}
        style={{ width: "100%" }}
      >
        <XStack
          px="$3"
          py="$2"
          gap="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <View flex={5}>
            <ImageRank
              userInfo={video}
              positionVideo={positionVideo}
              userNameStyle={{ color: "#f3f4f6" }}
              userName={userInfo?.userName || ""}
              imgSize={55}
              imgSrc={profile}
              score={score}
            />
          </View>
          <View flex={2} alignItems="center">
            {checkMyVideo && (
              <Follows
                title={localIsFollowed ? "Unfollow" : "Follow"}
                onFollowClick={() => handleFallowClick(video, positionVideo)}
                bgColor="white"
              />
            )}
          </View>
          <View flex={1} alignItems="flex-end">
            {checkMyVideo && (
              <>
                <Pressable
                  hitSlop={10}
                  style={{ padding: 4 }}
                  onPress={() => setMenuOpen(true)}
                >
                  <MaterialIcons name="more-vert" size={28} color="white" />
                </Pressable>

                <Modal
                  visible={menuOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setMenuOpen(false)}
                >
                  <Pressable
                    style={styles.backdrop}
                    onPress={() => setMenuOpen(false)}
                  >
                    <View style={styles.menuContainer}>
                      <View
                        backgroundColor="white"
                        borderRadius={10}
                        borderWidth={1}
                        borderColor="#E5E7EB"
                        w={190}
                        p="$2"
                        elevationAndroid={4}
                      >
                        {getMenuItems().map((item: any, index: number) => {
                          if (item.divider) {
                            return (
                              <Separator
                                key={`divider-${index}`}
                                my="$2"
                                w="100%"
                              />
                            );
                          }
                          return (
                            <View
                              key={index}
                              onPress={item.onClick}
                              cursor="pointer"
                              p="$2"
                              pressStyle={{
                                backgroundColor: "$backgroundHover",
                              }}
                              borderRadius="$2"
                            >
                              <XStack gap="$3" alignItems="center" w="100%">
                                {item.icon && (
                                  <MaterialIcons
                                    name={item.icon}
                                    size={20}
                                    color="#4b5563"
                                  />
                                )}
                                <Text fontSize="$4" color="$textPrimary">
                                  {item.label}
                                </Text>
                              </XStack>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </Pressable>
                </Modal>
              </>
            )}
          </View>
        </XStack>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  menuContainer: {
    position: "absolute",
    top: 50,
    right: 12,
  },
});

export default OptionTop;
