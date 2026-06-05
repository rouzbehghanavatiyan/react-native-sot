import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import VideoSection from "./VideoSection";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ShowWatchSlide({ video, isActive }: any) {
  const [playingPosition, setPlayingPosition] = React.useState<number>(0);
  const handleVideoPlay = (position: number) => {
    setPlayingPosition((prev) => (prev === position ? -1 : position));
  };
  const resultInserted =
    video?.likeInserted > video?.likeMatched
      ? "Win"
      : video?.likeInserted < video?.likeMatched
        ? "Loss"
        : "Draw";

  const resultMatched =
    video?.likeInserted < video?.likeMatched
      ? "Win"
      : video?.likeInserted > video?.likeMatched
        ? "Loss"
        : "Draw";

  const videoSections = [
    {
      likeCount: video?.likeInserted,
      attachment: video?.attachmentInserted,
      position: 0,
      score: video?.scoreInserted,
      user: video?.userInserted,
      isLiked:
        video?.likes?.[video?.attachmentInserted?.attachmentId]?.isLiked ||
        false,
      result: resultInserted,
    },
    {
      likeCount: video?.likeMatched,
      attachment: video?.attachmentMatched,
      position: 1,
      score: video?.scoreMatched,
      user: video?.userMatched,
      isLiked:
        video?.likes?.[video?.attachmentMatched?.attachmentId]?.isLiked ||
        false,
      result: resultMatched,
    },
  ];

  return (
    <View style={styles.container}>
      {videoSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.half}>
          <VideoSection
            video={video}
            attachment={section.attachment}
            positionVideo={section.position}
            score={section.score}
            result={section.result}
            countLiked={section.likeCount}
            isLiked={section.isLiked}
            showLiked={true}
            endTime={true}
            isPlaying={isActive}
            onVideoPlay={() => handleVideoPlay(section.position)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  half: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
});
