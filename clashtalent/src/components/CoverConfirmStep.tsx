import React from "react";
import { Image, Text, View, XStack } from "tamagui";
import { useAppSelector } from "../store/reduxHookType";

interface CoverConfirmStepProps {
  coverImage: string;
  onBack: () => void;
  onAccept: () => void;
  isLoading: boolean;
}

export const CoverConfirmStep: React.FC<CoverConfirmStepProps> = ({
  coverImage,
  onBack,
  onAccept,
  isLoading,
}) => {
  const showTimerButtn = useAppSelector((state) => state.main.showTimerButtn);

  return (
    <View p="$5">
      {!!coverImage && (
        <View mb="$4">
          <Text fontWeight="bold" mb="$2" color="$textPrimary">
            Your cover:
          </Text>
          <Image
            source={{ uri: coverImage }}
            alt="Video Cover"
            w="100%"
            maxWidth={400}
            h={300}
            resizeMode="contain"
            bg="black"
            borderRadius="$2"
            alignSelf="center"
          />
        </View>
      )}

      <XStack mt="$4" justifyContent="space-between" alignItems="center">
        {/* <Button
          variant="outLine_secondary"
          onPress={onBack}
          label="Back"
          style={{ borderWidth: 1, borderColor: "#ccc" }}
        />

        <Button
          variant="green"
          label="Start"
          loading={isLoading}
          btnTimer={showTimerButtn}
          onPress={onAccept}
          style={{ width: 176 }}
        >
          <ButtonTimer show={showTimerButtn} />
        </Button> */}
      </XStack>
    </View>
  );
};
