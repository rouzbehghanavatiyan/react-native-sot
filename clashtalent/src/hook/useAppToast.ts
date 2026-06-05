// // hooks/useAppToast.tsx
// import React from "react";
// import { useToast, HStack, Text, Pressable, Icon, Box } from "native-base";
// import { MaterialIcons } from "@expo/vector-icons";

// type ToastType = "error" | "success" | "warning" | "info";

// interface ShowToastParams {
//   message: string;
//   type?: ToastType;
//   duration?: number;
// }

// export const useAppToast = () => {
//   const toast = useToast();

//   const showToast = ({ message, type = "error", duration = 4000 }: ShowToastParams) => {
//     const getToastStyles = () => {
//       switch (type) {
//         case "success":
//           return { border: "green.500", text: "green.700", icon: "check-circle" };
//         case "warning":
//           return { border: "yellow.500", text: "yellow.700", icon: "warning" };
//         case "info":
//           return { border: "blue.500", text: "blue.700", icon: "info" };
//         default: // error
//           return { border: "red.500", text: "red.700", icon: "error" };
//       }
//     };

//     const styles = getToastStyles();

//     // استفاده از متد show در هوک نیتیو بیس
//     toast.show({
//       duration,
//       placement: "top", // می‌توانید "bottom" هم بگذارید
//       render: ({ id }) => {
//         return (
//           <Box
//             bg="white"
//             px={4}
//             py={3}
//             rounded="lg"
//             shadow={4}
//             borderLeftWidth={5} // یک استایل مدرن‌تر برای توست
//             borderLeftColor={styles.border}
//             mb={2}
//             mx={4}
//             minW="90%"
//           >
//             <HStack alignItems="center" justifyContent="space-between">
//               <HStack alignItems="center" flex={1}>
//                 <Icon
//                   as={MaterialIcons}
//                   name={styles.icon as any}
//                   color={styles.border}
//                   size={6}
//                   mr={2}
//                 />
//                 <Text fontSize="sm" fontWeight="medium" color={styles.text} flex={1}>
//                   {message}
//                 </Text>
//               </HStack>

//               <Pressable
//                 onPress={() => toast.close(id)} // بستن دستی توست
//                 p={1}
//               >
//                 <Icon as={MaterialIcons} name="close" color="gray.400" size={5} />
//               </Pressable>
//             </HStack>
//           </Box>
//         );
//       },
//     });
//   };

//   return { showToast };
// };
