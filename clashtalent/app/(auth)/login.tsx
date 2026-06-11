import Logo from "@/src/assets/images/logocircle.png";
import BaseButton from "@/src/components/BaseButtom";
import BaseInput from "@/src/components/BaseInput";
import { login } from "@/src/services/authService";
import { saveToken } from "@/src/services/tokenServices";
import { RsetUserId, RsetUserLogin } from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import { validateFormLogin } from "@/src/utils/errorValidation";
import { FormErrors, FormValues } from "@/src/utils/GlobalType";
import { Check, Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Alert } from "react-native";
import { Checkbox, Image, Text, View, XStack, YStack } from "tamagui";

const LoginScreen: React.FC<any> = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<any>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const dispatch = useAppDispatch();
  const handleInputChange = (name: keyof FormValues, value: string) => {
    setFormState((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async () => {
    if (loading || loginAttempts >= 3) return;
    const isValid = validateFormLogin(formState, setErrors);
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
        dispatch(RsetUserLogin({ token, userId }));
        dispatch(RsetUserId(userId));
        router.replace("/(tabs)/watch");
      }
    } catch (error: any) {
      setLoginAttempts((prev) => prev + 1);
      setErrors((prev) => ({
        ...prev,
        general: "Something went wrong. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" px="$4">
      <YStack
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
                src={Logo}
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
            <BaseInput
              label="Username"
              value={formState.username}
              onChangeText={(text) => handleInputChange("username", text)}
              placeholder="username"
              colorType="primary"
              hasError={!!errors.username}
              variant="outline"
              errorMessage={errors.username}
            />
            {!!errors.username && (
              <Text color="$errorMain" fontSize="$3">
                {errors.username}
              </Text>
            )}
          </YStack>

          <YStack gap="$2">
            <View position="relative">
              <BaseInput
                label="Password"
                secureTextEntry={!showPassword}
                value={formState.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="password"
                errorMessage={errors.password}
                rightIcon={
                  <View
                    onPress={() => setShowPassword((prev) => !prev)}
                    cursor="pointer"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </View>
                }
              />
            </View>
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
            onPress={handleSubmit}
            width="100%"
          >
            {loading ? "Signing in..." : "Sign in"}
          </BaseButton>

          <BaseButton
            appearance="ghost"
            colorType="primary"
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
};
export default LoginScreen;
