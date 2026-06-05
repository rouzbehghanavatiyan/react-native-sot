import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  H1,
  Image,
  Input,
  Spinner,
  Text,
  XStack,
  YStack,
  useTheme,
} from "tamagui";

const Logo = require("../../src/assets/images/logocircle.png");

interface AppState {
  main?: {
    userLogin?: any; // تایپ واقعی userLogin را اینجا قرار دهید
    messageModal?: { show: boolean; title: string; icon: string };
  };
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
  passwordConfirmation?: string;
}

interface FormValues {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const main = useAppSelector((state: AppState) => state.main); // اگر از Redux استفاده می‌کنید
  const theme = useTheme(); // برای دسترسی به رنگ‌های تم

  const [inputs, setInputs] = useState<FormValues>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // تابع رجیستر کاربر (فرض شده است)
  const registerUser = async (postData: any) => {
    // این یک تابع dummy است. باید تابع واقعی registerUser را جایگزین کنید.
    console.log("Registering user:", postData);
    // شبیه‌سازی پاسخ API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (postData.UserName === "test" && postData.Password === "password") {
      return { data: { status: 0, message: "User registered successfully." } };
    } else if (postData.Email.includes("error")) {
      return { data: { status: 1, message: "Email is already in use." } };
    }
    return { data: { status: 1, message: "Registration failed. Try again." } };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!inputs.username?.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!inputs.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!inputs.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (inputs.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!inputs.passwordConfirmation) {
      newErrors.passwordConfirmation = "Password confirmation is required";
      isValid = false;
    } else if (inputs.passwordConfirmation !== inputs.password) {
      newErrors.passwordConfirmation = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: undefined }));
    try {
      const postData = {
        UserName: inputs.username,
        Password: inputs.password,
        Email: inputs.email,
        // DeviceType: "Mobile", // در صورت نیاز
      };

      const res = await registerUser(postData);
      const { status, message } = res?.data || {};

      // status 0 یا 2 معمولا به معنی موفقیت و نیاز به تایید ایمیل است
      if (status === 0 || status === 2) {
        // dispatch(
        //   setMessageModal({ // تابع dispatch برای نمایش مودال
        //     title: "Dear user, please check your email to verify your account.",
        //     show: true,
        //     icon: "email",
        //   }),
        // );
        setIsLoading(true); // شاید منظور true بوده برای نمایش لودینگ مودال؟ اگر نه false کنید
        // router.push('/auth/verify-email'); // یا به صفحه تایید ایمیل هدایت کنید
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message || "Registration failed. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred. Please try again later.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: keyof FormValues, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));

    // پاک کردن ارور مربوط به فیلد در صورت تایپ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <YStack f={1} jc="center" ai="center" bg="$backgroundDefault" p="$4">
      <YStack
        bg="$backgroundPaper"
        br="$4"
        p="$8"
        w="100%"
        maw={400}
        gap="$5"
        elevation={2}
      >
        {/* هدر و لوگو */}
        <YStack ai="center" mb="$4">
          <Link href="/" asChild>
            <Image
              source={Logo}
              width={100}
              height={100}
              br={50} // rounded-full
              cursor="pointer"
            />
          </Link>
          <H1 fontFamily="$logo" mt="$4" color="$textPrimary" size="$6">
            Clash Talent
          </H1>
          <Text color="$textSecondary" mt="$1">
            Create an Account
          </Text>
        </YStack>

        {/* خطای کلی */}
        {errors.general && (
          <Text
            color="$errorMain"
            bg="$errorMain"
            opacity={0.1}
            p="$3"
            br="$2"
            fontSize="$3"
          >
            {errors.general}
          </Text>
        )}

        <YStack gap="$1">
          <Text fontSize="$3" color="$textPrimary" fontWeight="500">
            Username
          </Text>
          <Input
            value={inputs.username || ""}
            onChangeText={(text) => handleInputChange("username", text)}
            placeholder="Enter your username"
            borderColor={errors.username ? "$errorMain" : "$divider"}
            focusStyle={{ borderColor: "$primaryMain", borderWidth: 2 }}
          />
          {errors.username && (
            <Text color="$errorMain" fontSize="$1">
              *{errors.username}
            </Text>
          )}
        </YStack>

        {/* Email */}
        <YStack gap="$1">
          <Text fontSize="$3" color="$textPrimary" fontWeight="500">
            Email
          </Text>
          <Input
            keyboardType="email-address"
            autoCapitalize="none"
            value={inputs.email || ""}
            onChangeText={(text) => handleInputChange("email", text)}
            placeholder="Enter your email"
            borderColor={errors.email ? "$errorMain" : "$divider"}
            focusStyle={{ borderColor: "$primaryMain", borderWidth: 2 }}
          />
          {errors.email && (
            <Text color="$errorMain" fontSize="$1">
              *{errors.email}
            </Text>
          )}
        </YStack>

        {/* Password */}
        <YStack gap="$1">
          <Text fontSize="$3" color="$textPrimary" fontWeight="500">
            Password
          </Text>
          <XStack ai="center" pos="relative">
            <Input
              f={1}
              secureTextEntry={!showPassword}
              value={inputs.password || ""}
              onChangeText={(text) => handleInputChange("password", text)}
              placeholder="Enter your password"
              borderColor={errors.password ? "$errorMain" : "$divider"}
              focusStyle={{ borderColor: "$primaryMain", borderWidth: 2 }}
              pr="$10"
            />
            <Button
              pos="absolute"
              r="$2"
              bg="transparent"
              icon={
                showPassword ? (
                  <EyeOff color="$textSecondary" />
                ) : (
                  <Eye color="$textSecondary" />
                )
              }
              onPress={() => setShowPassword(!showPassword)}
              chromeless
            />
          </XStack>
          {errors.password && (
            <Text color="$errorMain" fontSize="$1">
              *{errors.password}
            </Text>
          )}
        </YStack>

        {/* Confirm Password */}
        <YStack gap="$1">
          <Text fontSize="$3" color="$textPrimary" fontWeight="500">
            Confirm Password
          </Text>
          <XStack ai="center" pos="relative">
            <Input
              f={1}
              secureTextEntry={!showConfirmPassword}
              value={inputs.passwordConfirmation || ""}
              onChangeText={(text) =>
                handleInputChange("passwordConfirmation", text)
              }
              placeholder="Confirm your password"
              borderColor={
                errors.passwordConfirmation ? "$errorMain" : "$divider"
              }
              focusStyle={{ borderColor: "$primaryMain", borderWidth: 2 }}
              pr="$10"
            />
            <Button
              pos="absolute"
              r="$2"
              bg="transparent"
              icon={
                showConfirmPassword ? (
                  <EyeOff color="$textSecondary" />
                ) : (
                  <Eye color="$textSecondary" />
                )
              }
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              chromeless
            />
          </XStack>
          {errors.passwordConfirmation && (
            <Text color="$errorMain" fontSize="$1">
              *{errors.passwordConfirmation}
            </Text>
          )}
        </YStack>

        <Button
          mt="$4"
          bg="$primaryMain"
          backgroundColor="$primaryContrastText"
          onPress={handleSignUp}
          disabled={isLoading}
          icon={
            isLoading
              ? () => <Spinner color="$primaryContrastText" />
              : undefined
          }
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Button>

        {/* Login Link */}
        <XStack jc="center" gap="$2" mt="$2">
          <Text color="$textSecondary" fontSize="$3">
            Already have an account?
          </Text>
          <Link href="/" asChild>
            <Text
              color="$infoMain"
              fontWeight="600"
              cursor="pointer"
              hoverStyle={{ textDecorationLine: "underline" }}
            >
              Log In
            </Text>
          </Link>
        </XStack>
      </YStack>
      {/* {main?.messageModal?.show && <EmailModal />} */}
    </YStack>
  );
}
