import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Button, Text, View, XStack } from "tamagui";
import BaseInput from "./BaseInput";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPreviewStepProps {
  videoSrc: string;
  movieData: any;
  onMovieDataChange: (data: any) => void;
  onCancel: () => void;
  onNext: (trimData?: {
    startTime: number;
    endTime: number;
    originalSrc: string;
    duration: number;
  }) => void;
}

const VideoPreviewStep: React.FC<VideoPreviewStepProps> = ({
  videoSrc,
  movieData,
  onMovieDataChange,
  onCancel,
  onNext,
}) => {
  const videoRef = useRef<Video>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 0]);
  const [videoLayout, setVideoLayout] = useState({
    width: SCREEN_WIDTH - 32,
    height: 300,
  });

  const handleVideoLoad = (status: any) => {
    if (!status.isLoaded) return;

    // set duration
    if (status.durationMillis) {
      const secs = status.durationMillis / 1000;
      setDuration(secs);
      setTrimRange([0, secs]);
    }

    if (status.naturalSize) {
      const { width: natW, height: natH } = status.naturalSize;
      const videoRatio = natW / natH;
      const maxWidth = SCREEN_WIDTH - 32;
      const maxHeight = SCREEN_HEIGHT * 0.55;
      const containerRatio = maxWidth / maxHeight;

      let finalWidth: number;
      let finalHeight: number;

      if (videoRatio > containerRatio) {
        finalWidth = maxWidth;
        finalHeight = maxWidth / videoRatio;
      } else {
        finalHeight = maxHeight;
        finalWidth = maxHeight * videoRatio;
      }

      setVideoLayout({ width: finalWidth, height: finalHeight });
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || trimRange[1] === 0) return;

    const currentSecs = status.positionMillis / 1000;

    // loop بین trim points
    if (currentSecs >= trimRange[1]) {
      videoRef.current?.setPositionAsync(trimRange[0] * 1000);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setTrimRange(values);
    videoRef.current?.setPositionAsync(values[0] * 1000);
  };

  const handleNextPress = () => {
    onMovieDataChange({
      title,
      trimStart: trimRange[0],
      trimEnd: trimRange[1],
      duration,
    });
    onNext({
      startTime: trimRange[0],
      endTime: trimRange[1],
      originalSrc: videoSrc,
      duration, // اضافه شد
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View flex={1} backgroundColor="#111827">
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={16}
      >
        <View
          style={{
            width: videoLayout.width,
            height: videoLayout.height,
            backgroundColor: "black",
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#374151",
          }}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoSrc }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            style={StyleSheet.absoluteFillObject}
            onLoad={handleVideoLoad}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            shouldPlay
            isLooping={false}
            isMuted={false}
          />
        </View>
      </View>
      <View
        padding={20}
        paddingBottom={32}
        backgroundColor="#1f2937"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
      >
        {duration > 0 ? (
          <>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginBottom={12}
            >
              <BaseInput
                flex={1}
                value={title}
                onChangeText={(text: string) => setTitle(text)}
                placeholder="Title"
                colorType="primary"
                variant="outline"
                marginRight="$2"
              />
              <Button bg="transparent" chromeless onPress={handleNextPress}>
                Next
              </Button>
            </XStack>

            <View alignItems="center" marginBottom={16}>
              <MultiSlider
                values={[trimRange[0], trimRange[1]]}
                min={0}
                max={duration}
                step={0.5}
                sliderLength={SCREEN_WIDTH - 80}
                onValuesChange={handleSliderChange}
                selectedStyle={{ backgroundColor: "#10b981" }}
                unselectedStyle={{ backgroundColor: "#4b5563" }}
                markerStyle={{
                  backgroundColor: "#059669",
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                trackStyle={{ height: 6, borderRadius: 3 }}
              />
            </View>
          </>
        ) : (
          <Text textAlign="center" color="#9ca3af" marginBottom={16}>
            در حال بارگذاری اطلاعات ویدیو...
          </Text>
        )}

        <Button
          pos="absolute"
          r="$2"
          bg="transparent"
          chromeless
          onPress={handleNextPress}
        >
          Next
        </Button>
        <BaseInput
          value={title}
          onChangeText={(text: string) => setTitle(text)}
          placeholder="Title"
          paddingRight="$10"
          colorType="primary"
          variant="outline"
        />
      </View>
    </View>
  );
};

export default VideoPreviewStep;
