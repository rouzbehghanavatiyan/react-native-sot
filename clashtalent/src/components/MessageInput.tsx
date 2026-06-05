import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Keyboard, Pressable, StyleSheet, TextInput } from "react-native";
import { View, XStack } from "tamagui";
import StickerOverlay from "./StickerOverlay";

interface MessageInputProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  titleInputRef: React.RefObject<TextInput>;
  setShowStickers: React.Dispatch<React.SetStateAction<boolean>>;
  showStickers: boolean;
  onEmojiSelect?: any;
  onInputFocus?: any;
  itsComment?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  title,
  setTitle,
  handleSendMessage,
  onEmojiSelect,
  titleInputRef,
  setShowStickers,
  showStickers,
  onInputFocus,
}) => {
  return (
    <View bg="$backgroundDefault">
      <XStack gap="$2" alignItems="flex-end" mb="$2">
        <View f={1}>
          <TextInput
            ref={titleInputRef}
            style={styles.input}
            multiline={true}
            placeholder="Message..."
            value={title}
            onChangeText={(text) => setTitle(text)}
            onFocus={() => {
              if (showStickers) setShowStickers(false);
              if (onInputFocus) onInputFocus();
            }}
          />
        </View>
        <XStack gap="$2" alignItems="center" justifyContent="center">
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowStickers(!showStickers);
            }}
          >
            <MaterialIcons name="mood" size={28} color="#4b5563" />
          </Pressable>
          <Pressable onPress={handleSendMessage}>
            <MaterialIcons name="send" size={28} color="#111827" />
          </Pressable>
        </XStack>
      </XStack>
      <StickerOverlay
        showStickers={showStickers}
        setShowStickers={setShowStickers}
        onEmojiSelect={onEmojiSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
    minHeight: 30,
    maxHeight: 30,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "white",
    fontSize: 14,
    textAlignVertical: "center",
  },
});

export default MessageInput;
