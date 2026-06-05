// VideoSection.tsx
import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getImageUrl } from "../utils/fileHelper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  video: any;
  positionVideo: number;
  height: number; // ← از ShowWatchSlide میاد
  score?: number;
  result?: string;
  countLiked?: number;
  isLiked?: boolean;
  showLiked?: boolean;
  endTime?: boolean;
  isPlaying: boolean;
  onVideoPlay: () => void;
}

export default function VideoSection({
  score,
  result,
  countLiked,
  isPlaying,
  onVideoPlay,
  video,
  positionVideo,
  height,
}: Props) {
  const [isMounted, setIsMounted] = React.useState(true);

  const videoUrl =
    positionVideo === 0
      ? getImageUrl(video?.attachmentInserted)
      : getImageUrl(video?.attachmentMatched);

  const player = useVideoPlayer(videoUrl ?? "", (p) => {
    p.loop = true;
  });

  React.useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  React.useEffect(() => {
    if (!player || !isMounted) return;
    try {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      // player already released
    }
  }, [isPlaying, player, isMounted]);

  return (
    <View style={[styles.container, { height }]}>
      <TouchableOpacity
        style={{ width: SCREEN_WIDTH, height }}
        activeOpacity={1}
        onPress={onVideoPlay}
      >
        {isMounted && videoUrl ? (
          <VideoView
            player={player}
            style={{ width: SCREEN_WIDTH, height }}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.placeholder, { height }]} />
        )}
      </TouchableOpacity>

      <View style={styles.topOverlay} pointerEvents="none">
        <Text style={styles.scoreText}>Score: {score ?? "-"}</Text>
      </View>

      <View style={styles.bottomOverlay} pointerEvents="none">
        <Text style={styles.text}>Result: {result ?? "-"}</Text>
        <Text style={styles.text}>Likes: {countLiked ?? 0}</Text>
      </View>
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
  placeholder: {
    width: SCREEN_WIDTH,
    backgroundColor: "#111",
  },
  topOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 2,
  },
  scoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
});
