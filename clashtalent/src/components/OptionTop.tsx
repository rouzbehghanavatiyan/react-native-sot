import { addFollower, removeFollower } from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Popover, Separator, Text, View, XStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import Follows from "./Follows";
import ImageRank from "./ImageRank";

interface OptionTopProps {
  video: any;
  positionVideo: number;
  openDropdowns: { [key: number]: boolean };
  score: any;
  setOpenDropdowns: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
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
  const [localIsFollowed, setLocalIsFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
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
        console.log("Unfollow successful");
      } else {
        await addFollower(postData);
        console.log("Follow successful");
      }

      setLocalIsFollowed(newFollowStatus);
    } catch (error) {
      console.error("Error in follow operation:", error);
      setLocalIsFollowed(localIsFollowed);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const getDropdownItems = () => {
    try {
      return dropdownItems && typeof dropdownItems === "function"
        ? dropdownItems(video)
        : [];
    } catch (error) {
      console.error("Error getting dropdown items:", error);
      return [];
    }
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
              <Popover size="$5" allowFlip placement="bottom-end">
                <Popover.Trigger asChild>
                  <Pressable hitSlop={10} style={{ padding: 4 }}>
                    <MaterialIcons name="more-vert" size={28} color="white" />
                  </Pressable>
                </Popover.Trigger>

                <Popover.Content
                  borderWidth={1}
                  borderColor="$borderColor"
                  enterStyle={{ y: -10, opacity: 0 }}
                  exitStyle={{ y: -10, opacity: 0 }}
                  elevate
                  // animation={[
                  //   "quick",
                  //   {
                  //     opacity: {
                  //       overshootClamping: true,
                  //     },
                  //   },
                  // ]}
                >
                  <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
                  <View w={190} p="$2">
                    {getDropdownItems().map((item: any, index: number) => {
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
                          pressStyle={{ backgroundColor: "$backgroundHover" }}
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
                </Popover.Content>
              </Popover>
            )}
          </View>
        </XStack>
      </LinearGradient>
    </View>
  );
};

export default OptionTop;
