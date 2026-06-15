import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import {
  addAttachment,
  addInvite,
  addMovie,
  removeInvite,
} from "../services/masterServices";
import { logger } from "../utils/logger";
import { RsetShowTimerButtn } from "./main";
import { VideoState } from "./type";

const initialState: VideoState = {
  videoSrc: null,
  videoFile: null,
  showTimeout: false,
  isLoading: false,
  error: null,
  currentStep: 1,
  uploadStatus: "idle",
  resMovieData: null,
  movieData: {
    parentId: null,
    userId: null,
    movieId: null,
    status: null,
    inviteId: null,
    title: "",
    desc: "",
    trimStart: 0,
    trimEnd: 0,
    duration: 0,
  },
};

export const prepareVideoFileThunk = createAsyncThunk(
  "video/prepareFile",
  async (fileAsset: any) => {
    // fileAsset چیزی شبیه به { uri: '...', fileName: '...', mimeType: '...' } است
    const src = fileAsset.uri;
    return { file: fileAsset, src };
  },
);

export const removeInviteThunk = createAsyncThunk(
  "video/removeInvite",
  async (inviteId: number) => {
    await removeInvite(inviteId);
    return inviteId;
  },
);

export const uploadFullProcessThunk = createAsyncThunk(
  "video/uploadFullProcess",
  async (
    { userId, gearId, mode, allFormData, socket, movieMeta, router }: any,
    { rejectWithValue, dispatch },
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const storedGearId = await AsyncStorage.getItem("gearId");

      const postData = {
        userId,
        description: movieMeta?.desc ?? "",
        title: movieMeta?.title ?? "",
        subSubCategoryId: gearId || storedGearId || null,
        modeId: mode?.typeMode || null,
      };

      const movieRes = await addMovie(postData);
      const movieDataRes = movieRes?.data;
      const movieId = movieRes?.data?.data?.id;

      logger.info("addMovie response", movieRes);

      if (movieDataRes?.status !== 0) {
        throw new Error("Error in recording initial movie information");
      }

      if (!movieId) {
        throw new Error("Movie id is missing");
      }

      const formData = new FormData();

      if (allFormData?.video) {
        formData.append("formFile", {
          uri: allFormData.video.uri,
          name: allFormData.video.name || "video.mp4",
          type: allFormData.video.type || "video/mp4",
        } as any);
      }

      if (allFormData?.imageCover) {
        formData.append("formFile", {
          uri: allFormData.imageCover.uri,
          name: allFormData.imageCover.name || "cover.jpg",
          type: allFormData.imageCover.type || "image/jpeg",
        } as any);
      }

      formData.append("attachmentId", String(movieId));
      formData.append("attachmentType", "mo");
      formData.append("attachmentName", "movies");

      logger.info("attachment formData", formData);

      const attachRes = await addAttachment(formData);

      if (attachRes?.data?.status !== 0) {
        throw new Error("Error in recording movie attachment!");
      }

      const postInvite = {
        parentId: null,
        userId: userId || null,
        movieId: movieId || null,
        status: 0,
      };

      const inviteRes = await addInvite(postInvite);

      logger.info("invite response", inviteRes);

      if (inviteRes?.data?.status !== 0) {
        throw new Error("Error in creating invite");
      }

      const inviteData = inviteRes?.data?.data;

      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(true));

      if (!socket || !socket.connected) {
        timeoutId = setTimeout(() => {
          dispatch(RsetShowTimerButtn(false));
          Alert.alert("Socket is not connected. Please try again.");
        }, 60000);

        return {
          modeType: mode?.typeMode,
          movieData: movieDataRes,
          inviteData,
        };
      }

      /**
       * ارسال socket با ACK
       */
      const socketResult: any = await new Promise((resolve, reject) => {
        socket
          .timeout(20000)
          .emit("add_invite_offline", inviteData, (err: any, response: any) => {
            if (err) {
              reject(new Error("Socket timeout"));
              return;
            }

            resolve(response);
          });
      });

      logger.info("add_invite_offline socketResult", socketResult);

      if (socketResult?.status !== 0) {
        throw new Error(socketResult?.message || "Socket invite failed");
      }

      /**
       * اگر socket موفق بود، تایمر را خاموش کن
       */
      if (timeoutId) clearTimeout(timeoutId);

      dispatch(RsetShowTimerButtn(false));

      /**
       * Redirect به profile بعد از موفقیت socket
       */
      if (router) {
        router.replace("/(tabs)/profile");
      }

      return {
        modeType: mode?.typeMode,
        movieData: movieDataRes,
        inviteData,
        socketResult,
      };
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      dispatch(RsetIsLoading(false));
      dispatch(RsetShowTimerButtn(false));

      Alert.alert(error?.message || "Upload failed");

      return rejectWithValue(error.message || "Upload failed");
    }
  },
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    RsetIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setVideoSrc(state, action: PayloadAction<string>) {
      state.videoSrc = action.payload;
    },
    setMovieData(state, action: PayloadAction<VideoState["movieData"]>) {
      state.movieData = action.payload;
    },
    updateMovieData(
      state,
      action: PayloadAction<Partial<VideoState["movieData"]>>,
    ) {
      state.movieData = { ...state.movieData, ...action.payload };
    },
    // clearVideo(state) {
    //   state.videoSrc = "";
    //   state.movieData = null;
    // },
    resetVideoState: () => initialState,

    setMovieMeta: (state, action) => {
      state.movieData.title = action.payload.title ?? state.movieData.title;
      state.movieData.desc = action.payload.desc ?? state.movieData.desc;
      state.movieData.userId = action.payload.userId ?? state.movieData.userId;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(prepareVideoFileThunk.fulfilled, (state, action) => {
        state.videoFile = action.payload.file;
        state.videoSrc = action.payload.src;
      })
      .addCase(uploadFullProcessThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadStatus = "idle";
      })
      .addCase(uploadFullProcessThunk.fulfilled, (state, action) => {
        state.uploadStatus = "success";
        state.isLoading = false; // اضافه شد تا لودینگ متوقف شود

        const { movieData, inviteData, modeType } = action.payload;

        state.resMovieData = movieData;
        state.movieData.movieId = movieData?.id;

        if (inviteData) {
          state.movieData.inviteId = inviteData.id;
        }

        if (modeType === 4) {
          state.currentStep = 3;
        }
      })
      .addCase(uploadFullProcessThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.uploadStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(removeInviteThunk.fulfilled, (state) => {
        state.movieData.inviteId = null;
      });
  },
});

export const {
  resetVideoState,
  setMovieData,
  setMovieMeta,
  goToStep,
  RsetIsLoading,
  updateMovieData,
  setVideoSrc,
} = videoSlice.actions;

export default videoSlice.reducer;
