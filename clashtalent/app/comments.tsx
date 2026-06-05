import ImageRank from "@/src/components/ImageRank";
import MessageInput from "@/src/components/MessageInput";
import {
  addComment,
  commentList,
  removeComment,
} from "@/src/services/masterServices";
import { useAppSelector } from "@/src/store/reduxHookType";
import asyncWrapper from "@/src/utils/asyncWrapper";
import { getImageUrl } from "@/src/utils/fileHelper";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Keyboard, Pressable, useWindowDimensions } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

const Comments: React.FC<any> = ({
  positionVideo,
  setShowComments,
  commentUserInfo,
  showComments,
}) => {
  const main = useAppSelector((state: any) => state?.main);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<any>(null);
  const { height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["80%"], []);
  const [title, setTitle] = useState<string>("");
  const [allComments, setAllComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showStickers, setShowStickers] = useState<boolean>(false);
  const [answerInfo, setAnswerInfo] = useState<any>(null);

  const getMovieId =
    positionVideo === 0
      ? commentUserInfo?.attachmentInserted?.attachmentId
      : commentUserInfo?.attachmentMatched?.attachmentId;

  useEffect(() => {
    if (!showComments) {
      setAllComments([]);
      setAnswerInfo(null);
      setTitle("");
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
      return;
    }

    bottomSheetRef.current?.snapToIndex(0);
    handleGetAllList();
  }, [showComments]);

  const handleGetAllList = async () => {
    setIsLoading(true);
    try {
      const res = await commentList(getMovieId);
      const { data, status } = res?.data || {};

      if (status === 0 && data) {
        const commentsHierarchy = data.reduce((acc: any, comment: any) => {
          if (!comment.parentId) {
            acc.push({ ...comment, replies: [] });
          } else {
            const parentComment = acc.find(
              (c: any) => c.id === comment.parentId,
            );
            if (parentComment) {
              parentComment.replies.push(comment);
            }
          }
          return acc;
        }, []);
        setAllComments(commentsHierarchy);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setTitle((prev: any) => prev + emoji.emoji);
    setShowStickers(false);
  };

  const handleSendMessage = async () => {
    if (title.trim() !== "") {
      const postData: any = {
        userId: main?.userLogin?.user?.id,
        movieId: getMovieId,
        desc: title.trim(),
        ParentId: answerInfo?.id || null,
      };
      const res = await addComment(postData);
      const { status } = res?.data || {};

      if (status === 0) {
        setTitle("");
        handleGetAllList();
        setAnswerInfo(null);
        Keyboard.dismiss();
      }
    }
  };

  const handleAnswerComments = (item: any) => {
    setAnswerInfo((prev: any) => (prev?.id === item?.id ? null : item));
    inputRef.current?.focus();
  };

  const handleRemoveComment = asyncWrapper(async (item: any) => {
    const res: any = await removeComment(item?.id);
    if (res?.data?.status === 0) {
      handleGetAllList();
    }
  });

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderCommentItem = ({ item }: { item: any }) => (
    <YStack bg="$backgroundDefault" py="$2">
      <XStack jc="space-between" ai="flex-start">
        <ImageRank
          userInfo="text-black"
          imgSize={35}
          userName={item.userName}
          score={item.score}
          imgSrc={getImageUrl(item.profile)}
        />
        <XStack gap="$3">
          <Pressable hitSlop={10} onPress={() => handleAnswerComments(item)}>
            <MaterialIcons name="reply" size={20} color="gray" />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => handleRemoveComment(item)}>
            <MaterialIcons name="delete-outline" size={20} color="gray" />
          </Pressable>
        </XStack>
      </XStack>
      <Text ml="$5" color="$textPrimary" fontSize="$3">
        {item.desc}
      </Text>

      {item?.replies?.length > 0 &&
        item?.replies?.map((reply: any) => (
          <YStack
            key={reply.id}
            ml="$8"
            mt="$3"
            pl="$3"
            borderLeftWidth={2}
            borderColor="$divider"
          >
            <XStack jc="space-between" ai="flex-start">
              <ImageRank
                userInfo="text-black"
                imgSize={30}
                userName={reply.userName}
                score={reply.score}
                imgSrc={getImageUrl(reply.profile)}
              />
              <Pressable
                hitSlop={10}
                onPress={() => handleRemoveComment(reply)}
              >
                <MaterialIcons name="delete-outline" size={16} color="red" />
              </Pressable>
            </XStack>
            <Text ml="$5" color="$textSecondary" fontSize="$3">
              {reply.desc}
            </Text>
          </YStack>
        ))}
    </YStack>
  );

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        index={showComments ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() => setShowComments(false)}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <YStack f={1} bg="$backgroundPaper">
          <XStack
            ai="center"
            px="$2"
            pb="$2"
            borderBottomWidth={1}
            borderColor="$divider"
          >
            <View f={1} ai="flex-start">
              <ImageRank
                imgSize={40}
                userName={
                  positionVideo === 0
                    ? commentUserInfo?.userInserted?.userName
                    : commentUserInfo?.userMatched?.userName
                }
                imgSrc={
                  positionVideo === 0
                    ? getImageUrl(commentUserInfo?.profileInserted)
                    : getImageUrl(commentUserInfo?.profileMatched)
                }
              />
            </View>
            <View f={1} ai="center">
              <Text fontWeight="bold" fontSize="$4" color="$textPrimary">
                Reacts
              </Text>
            </View>
            <View f={1} ai="flex-end">
              <Pressable
                onPress={() => setShowComments(false)}
                style={{ padding: 4 }}
              >
                <MaterialIcons name="close" size={24} color="black" />
              </Pressable>
            </View>
          </XStack>

          <View f={1}>
            {isLoading ? (
              <YStack f={1} jc="center" ai="center">
                <Spinner color="$primaryMain" size="large" />
              </YStack>
            ) : (
              <BottomSheetFlatList
                data={allComments}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderCommentItem}
                contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
                ListEmptyComponent={
                  <Text ta="center" color="$textSecondary" mt="$10">
                    No comments yet. Be the first to comment!
                  </Text>
                }
              />
            )}
          </View>

          {/* Input Area */}
          <YStack
            bg="$backgroundPaper"
            borderTopWidth={1}
            borderColor="$divider"
            px="$3"
            py="$2"
          >
            {answerInfo && (
              <XStack
                jc="space-between"
                ai="center"
                bg="$backgroundDefault"
                p="$2"
                br="$2"
                mb="$2"
              >
                <Text fontSize="$2" color="$textSecondary">
                  Replying to{" "}
                  <Text fontWeight="bold">@{answerInfo.userName}</Text>
                </Text>
                <Pressable hitSlop={10} onPress={() => setAnswerInfo(null)}>
                  <MaterialIcons name="cancel" size={16} color="gray" />
                </Pressable>
              </XStack>
            )}
            <MessageInput
              itsComment={true}
              title={title}
              setTitle={setTitle}
              handleSendMessage={handleSendMessage}
              titleInputRef={inputRef}
              setShowStickers={setShowStickers}
              onEmojiSelect={handleEmojiSelect}
              showStickers={showStickers}
            />
          </YStack>
        </YStack>
      </BottomSheet>
    </Portal>
  );
};

export default Comments;
