import { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "../../src/services/authService";
import { saveToken } from "@/src/services/tokenServices";
import {
  Box,
  Text,
  Heading,
  Link,
  VStack,
  HStack,
  useToast,
  Pressable,
  Icon,
  Image,
} from "native-base";
import { Alert, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BaseButton from "../../src/components/BaseButtom";
import BaseInput from "../../src/components/BaseInput";
import { Colors } from "@/src/theme/color";
import ImageLogo from "@/src/assets/images/logocircle.png";

export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await login({
        userName,
        password,
      });

      const token = response?.data?.token;
      await saveToken(token);

      if (response?.status === 0) {
        router.replace("/(tabs)/watch");
      } else {
        Alert.alert("Login Failed", "Invalid username or password");
      }
    } catch (error: any) {
      toast.show({
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg="gray.100" justifyContent="center" alignItems="center">
      <Box w="90%" maxW="400px">
        <VStack space={5}>
          <Box alignItems="center">
            <Image
              width={90}
              height={90}
              source={ImageLogo}
              style={styles.logo}
            />
            <Heading
              size="xl"
              fontFamily={"logoFont"}
              color={Colors.primary_dark}
              mb="2"
            >
              Clash Talent
            </Heading>
            <Text fontSize="md" color="muted.500">
              Login
            </Text>
          </Box>
          <VStack space={4}>
            <BaseInput
              placeholder="Username"
              value={userName}
              onChangeText={setUserName}
            />
            <BaseInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              InputRightElement={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    as={MaterialIcons}
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={5}
                    mr="2"
                    color="muted.400"
                  />
                </Pressable>
              }
            />

            <Link
              _text={{ fontSize: "xs", color: "primary.500" }}
              alignSelf="flex-end"
            >
              Forgot Password?
            </Link>

            <BaseButton
              mt="2"
              onPress={handleLogin}
              isLoading={loading}
              iconName="login"
            >
              Sign In
            </BaseButton>
          </VStack>

          <HStack justifyContent="center" mt="4">
            <Text fontSize="sm" color="muted.500">
              Don't have an account?{" "}
            </Text>
            <Link
              _text={{
                color: "primary.500",
                fontWeight: "medium",
                fontSize: "sm",
              }}
            >
              Sign Up
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop:5,
    borderRadius:100
  },
});
