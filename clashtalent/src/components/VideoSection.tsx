import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppSelector } from "../store/reduxHookType";
import { getImageUrl } from "../utils/fileHelper";
import OptionBottom from "./OptionBottom";
import OptionTop from "./OptionTop";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function VideoSection({
  score,
  result,
  countLiked,
  isPlaying,
  onVideoPlay,
  video,
  positionVideo,
  height,
  width,
  openDropdowns,
  setOpenDropdowns,
  toggleDropdown,
  dropdownItems,
  endTime,
  showLiked,
  externalIsLiked,
  handleToggleComments,
}: any) {
  const main = useAppSelector((state) => state.main);
  const userIdLogin = main?.userLogin?.user?.id;
  const socket = main?.socketConfig;

  const videoUrl =
    positionVideo === 0
      ? getImageUrl(video?.attachmentInserted)
      : getImageUrl(video?.attachmentMatched);

  const player = useVideoPlayer(videoUrl ?? "", (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, isPlaying]);

  if (!videoUrl) {
    return <View style={[styles.placeholder, { height }]} />;
  }

  return (
    <View style={[styles.container, { height }]}>
      <OptionTop
        main={main}
        video={video}
        userIdLogin={userIdLogin}
        positionVideo={positionVideo}
        openDropdowns={openDropdowns}
        score={score}
        setOpenDropdowns={setOpenDropdowns}
        toggleDropdown={toggleDropdown}
        dropdownItems={dropdownItems}
      />

      <TouchableOpacity
        activeOpacity={1}
        onPress={onVideoPlay}
        style={[styles.videoWrapper, { height }]}
      >
        <View style={styles.videoCenter}>
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
            contentFit="contain"
          />
        </View>

        <OptionBottom
          socket={socket}
          userIdLogin={userIdLogin}
          handleToggleComments={handleToggleComments}
          video={video}
          endTime={endTime}
          result={result}
          showLiked={showLiked}
          externalIsLiked={externalIsLiked}
          positionVideo={positionVideo}
          countLiked={
            positionVideo === 0 ? video?.likeInserted : video?.likeMatched
          }
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },

  videoWrapper: {
    width: "100%",
    flex: 1,
  },

  videoCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    width: SCREEN_WIDTH,
    backgroundColor: "#111",
  },
});
