import { Icon } from "@/src/components/Icon";
import { addComment, commentList } from "@/src/services/masterServices";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
// import { addComment, getCommentList } from "../services/masterServices";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImageRank from "@/src/components/ImageRank";
import { getImageUrl } from "@/src/utils/fileHelper";
import { useAppSelector } from "@/src/store/reduxHookType";

interface CommentsProps {
  visible: boolean;
  onClose: () => void;
  video: any;
  positionVideo: number;
  userIdLogin: string | null;
}

const Comments: React.FC<CommentsProps> = ({
  visible,
  onClose,
  video,
  positionVideo,
  userIdLogin,
  commentUserInfo,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const userInfo = useAppSelector((state) => state.main?.userLogin);
  const userProfile = getImageUrl(userInfo?.profile);
  const main = useAppSelector((state) => state?.main);
  const [answerData, setAnswerData] = useState<any>({});

  const movieId =
    positionVideo === 0
      ? video?.attachmentInserted?.attachmentId
      : video?.attachmentMatched?.attachmentId;

  // const getMovieId =
  //   positionVideo === 0
  //     ? commentUserInfo?.attachmentInserted?.attachmentId
  //     : commentUserInfo?.attachmentMatched?.attachmentId;

  const ownerUser =
    positionVideo === 0 ? video?.userInserted : video?.userMatched;

  const fetchComments = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    try {
      const res = await commentList(movieId);
      setComments(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (visible && movieId) {
      fetchComments();
    }
    if (!visible) {
      setText("");
    }
  }, [visible, movieId, fetchComments]);

  const handleSend = useCallback(
    async (e) => {
      const trimmed = text.trim();
      e.preventDefault();
      if (!trimmed || !movieId || sending) return;

      setSending(true);

      const tempComment = {
        id: `temp-${Date.now()}`,
        text: trimmed,
        userId: userIdLogin,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [tempComment, ...prev]);
      setText("");
      if (text !== "") {
        const postData: any = {
          userId: main?.userLogin?.user?.id,
          movieId: movieId,
          desc: text.trim(),
          ParentId: answerData?.id || null,
        };
        const res = await addComment(postData);
        const { data, status } = res?.data;
        if (status === 0) {
          setText("");
          fetchComments();
          // titleInputRef.current?.focus();
          // setAnswerInfo(null);
        }
      }
      try {
        await addComment({
          movieId,
          userId: userIdLogin,
          text: trimmed,
        });
      } catch (error) {
        console.error("Error sending comment:", error);
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      } finally {
        setSending(false);
      }
    },
    [text, movieId, userIdLogin, sending],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          flex={1}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="flex-end"
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <View flex={1} justifyContent="flex-end">
                <View
                  backgroundColor="#1c1c1e"
                  borderTopLeftRadius={24}
                  borderTopRightRadius={24}
                  height="80%"
                  paddingTop={12}
                  paddingHorizontal={12}
                  paddingBottom={0}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    pb={12}
                    borderBottomWidth={0.5}
                    borderBottomColor="#2c2c2e"
                  >
                    <View width={32} />

                    <YStack alignItems="center">
                      <View
                        width={40}
                        height={4}
                        borderRadius={2}
                        backgroundColor="#666"
                        mb={10}
                      />

                      <Text color="white" fontSize={16} fontWeight="700">
                        Comments
                      </Text>
                    </YStack>

                    <TouchableOpacity
                      onPress={onClose}
                      hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                      }}
                    >
                      <Icon name="close" color="white" size={22} />
                    </TouchableOpacity>
                  </XStack>

                  {loading ? (
                    <View flex={1} justifyContent="center" alignItems="center">
                      <ActivityIndicator color="#fff" />
                    </View>
                  ) : (
                    <FlatList
                      contentContainerStyle={{
                        paddingBottom: 10,
                      }}
                      style={{ flex: 1 }}
                      data={comments}
                      keyExtractor={(item, index) =>
                        item?.id?.toString() || index.toString()
                      }
                      inverted
                      renderItem={({ item }) => (
                        <XStack py={10} px={4} gap={10} alignItems="flex-start">
                          {/* Avatar */}
                          <View
                            width={36}
                            height={36}
                            borderRadius={18}
                            backgroundColor="#ff0000"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Text color="white" fontSize={12}>
                              {(item?.user?.name || "5")[0]}
                            </Text>
                          </View>

                          <YStack flex={1}>
                            <Text color="white">
                              <Text fontWeight="bold">
                                {item?.user?.name || "User"}{" "}
                              </Text>

                              <Text color="#fff">{item?.text}</Text>
                            </Text>

                            <XStack gap={12} mt={4}>
                              <Text color="#8e8e93" fontSize={12}>
                                2h
                              </Text>

                              <Text
                                color="#8e8e93"
                                fontSize={12}
                                fontWeight="600"
                              >
                                Reply
                              </Text>
                            </XStack>
                          </YStack>

                          <TouchableOpacity>
                            <Icon
                              name="heart-outline"
                              size={16}
                              color="#8e8e93"
                            />
                          </TouchableOpacity>
                        </XStack>
                      )}
                      ListEmptyComponent={
                        <View
                          flex={1}
                          justifyContent="center"
                          alignItems="center"
                          py={20}
                        >
                          <Text color="#888">
                            No comments yet. Be the first to comment!
                          </Text>
                        </View>
                      }
                    />
                  )}
                  <XStack
                    alignItems="center"
                    borderTopWidth={0.5}
                    borderTopColor="#2c2c2e"
                    pt={10}
                    pb={insets.bottom}
                    px={4}
                    gap={10}
                  >
                    <ImageRank imgSrc={userProfile} imgSize={30} />
                    <TextInput
                      value={text}
                      onChangeText={setText}
                      placeholder="Add a comment..."
                      placeholderTextColor="#8e8e93"
                      style={{
                        flex: 1,
                        color: "#fff",
                        fontSize: 15,
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={!text.trim() || sending}
                    >
                      <Text
                        color={text.trim() ? "#0095F6" : "#555"}
                        fontWeight="700"
                      >
                        <Icon name="send" color="gray" />
                      </Text>
                    </TouchableOpacity>
                  </XStack>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Comments;
