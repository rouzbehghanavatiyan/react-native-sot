import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: any;
}

 const formatIconName = (name: string) => {
  if (!name) return "";
  const withoutIcon = name.replace(/Icon$/, "");

  const kebab = withoutIcon
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
  return kebab;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#ff0000",
  onPress,
  style,
}) => {
  const formattedName = formatIconName(name);

  return (
    <MaterialIcons
      name={formattedName as any}
      size={size}
      color={color}
      onPress={onPress}
      style={style}
    />
  );
};