import React from 'react';
import { Button, IButtonProps, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

interface BaseButtonProps extends IButtonProps {
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  isLoading?: boolean;
  isDisabled?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = ({
  children,
  iconName,
  isLoading,
  isDisabled,
  ...props
}) => {
  return (
    <Button
      size="lg"
      colorScheme="primary"
      _text={{ fontWeight: 'bold' }}
      leftIcon={
        iconName ? (
          <Icon as={MaterialIcons} name={iconName} size="sm" />
        ) : undefined
      }
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      _disabled={{
        opacity: 0.6,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default BaseButton;