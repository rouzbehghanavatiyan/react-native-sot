import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { login } from "@/src/services/authService";
import { saveToken } from "@/src/services/tokenServices";
import { RsetUserId } from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { Check, Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Alert } from "react-native";
import { Checkbox, Image, Text, View, XStack, YStack } from "tamagui";

type FormState = {
  username: string;
  password: string;
};

type FormErrors = {
  general: string;
  username: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    general: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleInputChange = (name: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      general: "",
      username: "",
      password: "",
    };

    if (!formState.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formState.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formState.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return !newErrors.username && !newErrors.password;
  };

  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    if (loading || loginAttempts >= 3) return;
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const response = await login({
        userName: formState.username,
        password: formState.password,
      });

      if (response?.status === 0) {
        await saveToken(response?.data?.token);
        const token = response?.data?.token;
        const decoded: any = jwtDecode(token);
        const userId: any = Object.values(decoded)?.[1];
        dispatch(RsetUserId(userId));
        router.replace("/(tabs)/watch");
      }
      setLoading(false);
    } catch (error: any) {
      setLoginAttempts((prev) => prev + 1);
      setErrors((prev) => ({
        ...prev,
        general: "Something went wrong. Please try again.",
      }));
      Alert.alert("Error", "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$backgroundDefault"
      px="$4"
    >
      <YStack
        backgroundColor="$backgroundPaper"
        borderRadius="$4"
        p="$6"
        width="100%"
        maxWidth={400}
        gap="$4"
        shadowColor="$shadowColor"
        shadowOpacity={0.08}
        shadowRadius={12}
      >
        <YStack alignItems="center" mb="$4">
          <Link href="/" asChild>
            <View cursor="pointer">
              <Image
                source={{ uri: "https://via.placeholder.com/100" }}
                width={100}
                height={100}
                borderRadius={50}
                alt="Logo"
              />
            </View>
          </Link>

          <Text fontSize="$6" fontWeight="bold" color="$textPrimary" mt="$4">
            Clash Talent
          </Text>

          <Text color="$textSecondary" mt="$2">
            Sign in to your account
          </Text>
        </YStack>

        <YStack gap="$4">
          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="600" color="$textPrimary">
              Username
            </Text>

            <BaseInput
              value={formState.username}
              onChangeText={(text) => handleInputChange("username", text)}
              placeholder="Enter your username"
              colorType="primary"
              hasError={!!errors.username}
              variant="outline"
            />

            {!!errors.username && (
              <Text color="$errorMain" fontSize="$3">
                {errors.username}
              </Text>
            )}
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="600" color="$textPrimary">
              Password
            </Text>
            <View position="relative">
              <BaseInput
                secureTextEntry={!showPassword}
                value={formState.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="Enter your password"
                paddingRight="$10"
                colorType="primary"
                hasError={!!errors.password}
                variant="outline"
              />

              <View
                position="absolute"
                right="$3"
                top={0}
                bottom={0}
                justifyContent="center"
                zIndex={10}
                onPress={() => setShowPassword((prev) => !prev)}
                cursor="pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} color="gray" />
                ) : (
                  <Eye size={20} color="gray" />
                )}
              </View>
            </View>
            {!!errors.password && (
              <Text color="$errorMain" fontSize="$3">
                {errors.password}
              </Text>
            )}
          </YStack>

          {!!errors.general && (
            <Text color="$errorMain" fontSize="$8" textAlign="center">
              {errors.general}
            </Text>
          )}

          <XStack alignItems="center" justifyContent="space-between" mt="$2">
            <XStack alignItems="center" gap="$2">
              <Checkbox id="remember-me" size="$8" defaultChecked={false}>
                <Checkbox.Indicator>
                  <Check />
                </Checkbox.Indicator>
              </Checkbox>

              <Text fontSize="$3" color="$textPrimary">
                Remember me
              </Text>
            </XStack>
          </XStack>

          <BaseButton
            appearance="solid"
            colorType="primary"
            loading={loading}
            // disabled={isDisabled}
            onPress={handleSubmit}
            width="100%"
          >
            {loading ? "Signing in..." : "Sign in"}
          </BaseButton>

          <BaseButton
            appearance="ghost"
            colorType="secondary"
            onPress={() => Alert.alert("Forgot Password", "Coming soon")}
          >
            Forgot password?
          </BaseButton>

          <XStack justifyContent="center" mt="$2" gap="$2" flexWrap="wrap">
            <Text fontSize="$3" color="$textPrimary">
              Don't have an account?
            </Text>

            <Link href="/signup" asChild>
              <Text
                fontSize="$3"
                color="$primaryMain"
                fontWeight="bold"
                cursor="pointer"
              >
                Sign up
              </Text>
            </Link>
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
