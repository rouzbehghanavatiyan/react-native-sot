import {
  goToStep,
  prepareVideoFileThunk,
  removeInviteThunk,
  resetVideoState,
  setMovieData,
  setMovieMeta,
  updateMovieData,
  uploadFullProcessThunk,
} from "@/src/slices/video";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/reduxHookType";

export const useEditVideo = ({
  showEditMovie,
  routeVideoSrc,
  setShowEditMovie,
  allFormData,
  mode,
}: any) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const {
    videoSrc,
    isLoading,
    currentStep,
    movieData,
    resMovieData,
    uploadStatus,
  } = useAppSelector((state) => state.video);
  const hasPrepared = useRef(false);
  const main = useAppSelector((state) => state.main);
  const socket = main?.socketConfig;
  const userIdLogin = main?.userLogin?.user?.id;
  const gearId = main?.createTalent?.gear?.id;

  useEffect(() => {
    if (showEditMovie && allFormData?.video && !hasPrepared.current) {
      hasPrepared.current = true;
      dispatch(prepareVideoFileThunk(allFormData.video));
      if (userIdLogin) {
        dispatch(setMovieMeta({ userId: userIdLogin }));
      }
    }
  }, [showEditMovie, allFormData?.video, userIdLogin, dispatch]);

  const handleUploadVideo = useCallback(() => {
    console.log("BSDFDSFDIHSDFOHSDIUFHSDUIFH");

    dispatch(
      uploadFullProcessThunk({
        userId: userIdLogin,
        gearId,
        mode,
        allFormData,
        socket,
        movieMeta: movieData,
      }),
    );
  }, [dispatch, userIdLogin, gearId, mode, allFormData, socket, movieData]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      dispatch(goToStep(currentStep - 1));
    }
    if (movieData?.inviteId) {
      dispatch(removeInviteThunk(movieData.inviteId));
    }
  }, [dispatch, currentStep, movieData]);

  const handleNextStep = (trimData?: {
    startTime: number;
    endTime: number;
    originalSrc: string;
    duration: number;
  }) => {
    if (trimData) {
      dispatch(
        updateMovieData({
          trimStart: trimData.startTime,
          trimEnd: trimData.endTime,
          duration: trimData.duration,
        }),
      );
    }
    dispatch(goToStep(2));
  };

  useEffect(() => {
    if (!socket || !showEditMovie) return;

    const handleInviteResponse = (data: any) => {
      console.log("Socket response received:", data);
      setShowEditMovie(false);
      dispatch(resetVideoState()); // اول استیت پاک شود
      navigation.navigate("Profile"); // تغییر سینتکس نویگیشن
    };

    socket.on("add_invite_offline_response", handleInviteResponse);

    return () => {
      socket.off("add_invite_offline_response", handleInviteResponse);
    };
  }, [socket, showEditMovie, navigation, setShowEditMovie, dispatch]);

  useEffect(() => {
    if (uploadStatus === "success" && mode?.typeMode === 3 && !socket) {
      setShowEditMovie(false);
      navigation.navigate("Profile"); // تغییر سینتکس نویگیشن
    }
  }, [uploadStatus, mode, socket, navigation, setShowEditMovie]);

  return {
    videoSrc,
    isLoadingBtn: isLoading,
    resMovieData,
    currentStep,
    movieData,
    setMovieData: (data: any) => dispatch(setMovieData(data)),
    handleUploadVideo,
    handleBack,
    updateMovieMeta: (updates: any) => dispatch(setMovieMeta(updates)),
    handleNextStep,
  };
};
