import React from "react";
import { Input, InputProps, styled } from "tamagui";

type InputVariant = "outline" | "filled" | "unstyled";
type ColorType = "primary" | "secondary" | "success" | "warning" | "error";

export interface BaseInputProps extends InputProps {
  variant?: InputVariant;
  colorType?: ColorType;
  hasError?: boolean;
}

const StyledInput: any = styled(Input, {
  name: "BaseInput",

  borderRadius: "$4",
  borderWidth: 1,
  paddingHorizontal: "$3",
  height: 44,

  focusStyle: {
    outlineWidth: 0,
  },

  variants: {
    variant: {
      outline: {
        backgroundColor: "$background",
      },
      filled: {
        backgroundColor: "$backgroundHover",
        borderColor: "transparent",
      },
      unstyled: {
        backgroundColor: "transparent",
        borderWidth: 0,
        paddingHorizontal: 0,
      },
    },

    disabledState: {
      true: {
        opacity: 0.6,
        pointerEvents: "none",
      },
      false: {
        opacity: 1,
      },
    },
  } as const,

  defaultVariants: {
    variant: "outline",
    disabledState: false,
  },
});

const colorMap: Record<ColorType, string> = {
  primary: "$primaryMain",
  secondary: "$secondaryMain",
  success: "$successMain",
  warning: "$warningMain",
  error: "$errorMain",
};

const BaseInput = React.forwardRef<any, BaseInputProps>(
  (
    {
      variant = "outline",
      colorType = "primary",
      hasError = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const mainColor = colorMap[colorType];
    const borderColor = hasError ? "$red10" : mainColor;

    const dynamicStyles =
      variant === "unstyled"
        ? {}
        : {
            borderColor,
            focusStyle: {
              borderColor,
            },
          };

    return (
      <StyledInput
        ref={ref}
        variant={variant}
        disabledState={Boolean(disabled)}
        disabled={disabled}
        {...dynamicStyles}
        {...props}
      />
    );
  },
);

BaseInput.displayName = "BaseInput";

export default BaseInput;
