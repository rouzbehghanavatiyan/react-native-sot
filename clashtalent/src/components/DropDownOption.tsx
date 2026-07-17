import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    useWindowDimensions,
} from "react-native";
import { Text, View, XStack } from "tamagui";

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

export interface DropDownItem {
  label: string;
  icon?: MaterialIconName;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DropDownOptionProps {
  visible: boolean;
  onClose: () => void;
  items: DropDownItem[];
  anchor: AnchorRect | null;
}

const MENU_WIDTH = 150;
const ITEM_HEIGHT = 50;
const MENU_VERTICAL_PADDING = 16;
const EDGE_MARGIN = 8;
const GAP_FROM_ICON = 6;
const RIGHT_INSET = 30; // 50px بیشتر به داخل صفحه

const DropDownOption: React.FC<DropDownOptionProps> = ({
  visible,
  onClose,
  items,
  anchor,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleItemPress = (item: DropDownItem) => {
    if (item.disabled) return;
    onClose();
    item.onPress();
  };

  const { top, left } = useMemo(() => {
    const estimatedMenuHeight =
      Math.max(items.length, 1) * ITEM_HEIGHT + MENU_VERTICAL_PADDING;

    let computedTop = 50;
    let computedLeft = screenWidth - MENU_WIDTH - RIGHT_INSET;

    if (anchor) {
      // منو نسبت به آیکن more-vert تراز می‌شود، اما 50px هم به داخل رانده می‌شود
      computedLeft = anchor.x + anchor.width - MENU_WIDTH - RIGHT_INSET;

      if (computedLeft < EDGE_MARGIN) {
        computedLeft = EDGE_MARGIN;
      }

      if (computedLeft + MENU_WIDTH > screenWidth - EDGE_MARGIN) {
        computedLeft = screenWidth - MENU_WIDTH - EDGE_MARGIN;
      }

      const spaceBelow = screenHeight - (anchor.y + anchor.height);
      const spaceAbove = anchor.y;

      if (spaceBelow >= estimatedMenuHeight + GAP_FROM_ICON) {
        computedTop = anchor.y + anchor.height + GAP_FROM_ICON;
      } else if (spaceAbove >= estimatedMenuHeight + GAP_FROM_ICON) {
        computedTop = anchor.y - estimatedMenuHeight - GAP_FROM_ICON;
      } else {
        computedTop = Math.max(
          EDGE_MARGIN,
          Math.min(anchor.y, screenHeight - estimatedMenuHeight - EDGE_MARGIN),
        );
      }
    }

    return { top: computedTop, left: computedLeft };
  }, [anchor, items.length, screenHeight, screenWidth]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.menuContainer, { top, left }]}>
              <View
                width={MENU_WIDTH}
                padding="$2"
                borderRadius={10}
                borderWidth={1}
                borderColor="#E5E7EB"
                backgroundColor="white"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 3 }}
                shadowOpacity={0.2}
                shadowRadius={6}
              >
                {items.map((item, index) => (
                  <Pressable
                    key={`${item.label}-${index}`}
                    disabled={item.disabled}
                    onPress={() => handleItemPress(item)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && !item.disabled && styles.menuItemPressed,
                      item.disabled && styles.menuItemDisabled,
                    ]}
                  >
                    <XStack gap="$1" alignItems="center" width="100%">
                      {item.icon && (
                        <MaterialIcons
                          name={item.icon}
                          size={15}
                          color={
                            item.danger
                              ? "#dc2626"
                              : item.disabled
                                ? "#9ca3af"
                                : "#4b5563"
                          }
                        />
                      )}

                      <Text
                        flex={1}
                        fontSize="$3"
                        color={
                          item.danger
                            ? "#dc2626"
                            : item.disabled
                              ? "#9ca3af"
                              : "#111827"
                        }
                      >
                        {item.label}
                      </Text>
                    </XStack>
                  </Pressable>
                ))}

                {items.length === 0 && (
                  <View padding="$2">
                    <Text textAlign="center" fontSize="$3" color="#6b7280">
                      No options available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
  },
  menuItem: {
    paddingHorizontal: 3,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  menuItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
});

export default DropDownOption;
