import React from "react";
import { Input, FormControl, IInputProps, Icon } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";

interface BaseInputProps extends IInputProps {
  label?: string;
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];
  errorMessage?: string;
  isInvalid?: boolean;
}

const BaseInput: React.FC<BaseInputProps> = ({
  label,
  iconName,
  errorMessage,
  isInvalid,
  ...props
}) => {
  return (
    <FormControl isInvalid={isInvalid}>
      {label && <FormControl.Label>{label}</FormControl.Label>}

      <Input
        size="lg"
        variant="outline"
        bg="white"
        backgroundColor="white"

        borderColor="gray.300"

        _focus={{
          bg: "white",
          backgroundColor: "white",
          borderColor: "primary.500",
        }}

        _hover={{
          bg: "white",
          backgroundColor: "white",
        }}

        _disabled={{
          bg: "white",
          backgroundColor: "white",
          opacity: 1,
        }}

        InputLeftElement={
          iconName ? (
            <Icon
              as={<MaterialIcons name={iconName} />}
              size={5}
              ml="2"
              color="muted.400"
            />
          ) : undefined
        }

        {...props}
      />

      {errorMessage && (
        <FormControl.ErrorMessage>
          {errorMessage}
        </FormControl.ErrorMessage>
      )}
    </FormControl>
  );
};

export default BaseInput;