import { addFollower, removeFollower } from "@/src/services/masterServices";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable } from "react-native";
import { View, XStack } from "tamagui";
import { getImageUrl } from "../utils/fileHelper";
import DropDownOption, { DropDownItem } from "./DropDownOption";
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
  const moreButtonRef = useRef<any>(null);
  const [anchor, setAnchor] = useState<any>(null);

  const handleOpenMenu = () => {
    // موقعیت واقعی آیکون more-vert رو نسبت به صفحه (window) اندازه می‌گیریم
    moreButtonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  };

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
    const isFollowed =
      positionVideo === 0
        ? video?.isFollowedMeInserted
        : video?.isFollowedMeMatched;
    setLocalIsFollowed(!!isFollowed);
  }, [video, positionVideo]);

  const handleFallowClick = async () => {
    if (isLoadingFollow) return;
    const userIdFollow =
      positionVideo === 0 ? video?.userInserted?.id : video?.userMatched?.id;
    const postData = {
      userId: userIdLogin || null,
      followerId: userIdFollow || null,
    };
    try {
      setIsLoadingFollow(true);
      if (localIsFollowed) {
        await removeFollower(postData);
      } else {
        await addFollower(postData);
      }
      setLocalIsFollowed(!localIsFollowed);
    } catch (error) {
      console.error("Error in follow operation:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSendMessage = () => {
    if (!userInfo?.id) return;

    router.push({
      pathname: `/chat/${userInfo.id}`,
      params: {
        userId: String(userInfo.id),
        userName: userInfo?.userName || "",
        score: String(userScore || ""),
        profile: profile || "",
      },
    });
  };

  const handleReport = () => {
    if (!userInfo?.id) return;

    console.log("Report user:", userInfo.id);
  };

  const handleSave = () => {
    console.log("Save video:", video);
  };

  const menuItems = useMemo<DropDownItem[]>(
    () => [
      {
        label: "Send Message",
        icon: "chat",
        onPress: handleSendMessage,
      },
      {
        label: "Save",
        icon: "grade",
        onPress: handleSave,
      },
      {
        label: "Report",
        icon: "flag",
        onPress: handleReport,
        danger: true,
      },
    ],
    [userInfo?.id, userInfo?.userName, userScore, profile, video],
  );

  const getMenuItems = () => {
    const customItems = [
      { label: "Send Message", icon: "chat", onClick: handleSendMessage },
      { label: "Report", icon: "flag", onClick: handleReport },
      { label: "Save", icon: "grade", onClick: handleReport },
      // { label: "duel", icon: "handshake", onClick: handleReport },
    ];
    return { items: customItems };
  };

  const isTopPosition = positionVideo === 0;

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
                onFollowClick={handleFallowClick}
                bgColor="white"
              />
            )}
          </View>
          <View flex={1} alignItems="flex-end">
            {checkMyVideo && (
              <>
                <View ref={moreButtonRef} collapsable={false}>
                  <Pressable
                    hitSlop={10}
                    style={{ padding: 4 }}
                    onPress={handleOpenMenu}
                  >
                    <MaterialIcons name="more-vert" size={28} color="white" />
                  </Pressable>
                </View>
                <DropDownOption
                  visible={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  items={menuItems}
                  anchor={anchor}
                />
              </>
            )}
          </View>
        </XStack>
      </LinearGradient>
    </View>
  );
};

export default OptionTop;
