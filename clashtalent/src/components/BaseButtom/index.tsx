import { palette } from "@/src/theme/color";
import { Appearance } from "@/src/utils/styleResolvers";
import React, { forwardRef } from "react";
import { Button, Spinner, styled } from "tamagui";
import { BaseButtonProps, ColorType } from "./type";

const StyledButton = styled(Button, {
  name: "BaseButton",

  borderRadius: "$4",
  borderWidth: 1,
  height: "$10",
  justifyContent: "center",
  alignItems: "center",

  pressStyle: {
    opacity: 0.85,
  },
});

const getVariantStyles = (
  appearance: Appearance,
  color: ReturnType<typeof getPalette>,
) => {
  switch (appearance) {
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: color.border,
        color: color.text,
      };

    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: color.text,
      };

    default:
      return {
        backgroundColor: color.bg,
        borderColor: color.border,
        color: color.contrast ?? "white",
      };
  }
};

const getPalette = (colorType: ColorType) => palette[colorType];

export const BaseButton = forwardRef<any, BaseButtonProps>(
  (
    {
      appearance = "solid",
      colorType = "primary",
      loading = false,
      fullWidth = false,
      disabled,
      icon,
      children,
      ...rest
    },
    ref,
  ) => {
    const color = getPalette(colorType);
    const styles = getVariantStyles(appearance, color);
    const isDisabled = disabled || loading;

    return (
      <StyledButton
        ref={ref}
        disabled={isDisabled}
        width={fullWidth ? "100%" : undefined}
        opacity={isDisabled ? 0.6 : 1}
        icon={
          loading ? (
            <Spinner color={appearance === "solid" ? "white" : color.text} />
          ) : (
            icon
          )
        }
        {...styles}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  },
);

BaseButton.displayName = "BaseButton";

export default BaseButton;
