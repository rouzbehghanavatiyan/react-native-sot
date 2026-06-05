import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addAttachment,
  addInvite,
  addMovie,
  removeInvite,
} from "../services/masterServices";

interface VideoState {
  videoSrc: string | null;
  videoFile: any | null;
  showTimeout: boolean;
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  uploadStatus: "idle" | "success" | "failed";
  resMovieData: any | null;
  movieData: {
    parentId: number | null;
    userId: number | null;
    movieId: number | null;
    status: number | null;
    inviteId: number | null;
    title: string;
    desc: string;
    trimStart: number;
    trimEnd: number;
    duration: number;
  };
}

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
    { userId, gearId, mode, allFormData, socket, movieMeta }: any,
    { rejectWithValue, dispatch },
  ) => {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const localGearId = await AsyncStorage.getItem("gearId");
      const postData = {
        userId,
        description: movieMeta?.desc ?? "",
        title: movieMeta?.title ?? "",
        subSubCategoryId: gearId || localGearId || null,
        modeId: mode?.typeMode || null,
      };

      const movieRes = await addMovie(postData);
      console.log(movieRes);
      const movieDataRes = movieRes?.data?.data;

      if (movieRes?.data?.status !== 0) {
        throw new Error("Error in recording initial movie information");
      }

      let inviteData = null;
      if (mode?.typeMode === 3) {
        const formData = new FormData();

        // تغییر: نحوه اپند کردن فایل در FormData ری‌اکت نیتیو
        if (allFormData?.video) {
          formData.append("formFile", {
            uri: allFormData.video.uri,
            name: allFormData.video.fileName || "video.mp4",
            type: allFormData.video.mimeType || "video/mp4",
          } as any);
        }

        if (allFormData?.imageCover) {
          formData.append("formFile", {
            uri: allFormData?.imageCover?.uri,
            name: allFormData?.imageCover?.fileName || "cover.jpg",
            type: allFormData?.imageCover?.mimeType || "image/jpeg",
          } as any);
        }

        formData.append("attachmentId", movieDataRes?.id);
        formData.append("attachmentType", "mo");
        formData.append("attachmentName", "movies");

        const attachRes = await addAttachment(formData);
        if (attachRes.data.status !== 0) {
          throw new Error("Error in uploading attachments!");
        }

        const postInvite = {
          parentId: null,
          userId: userId || null,
          movieId: movieDataRes?.id || null,
          status: 0,
        };

        const inviteRes = await addInvite(postInvite);
        // dispatch(RsetIsLoading(false));
        // dispatch(RsetShowTimerButtn(true));

        inviteData = inviteRes?.data?.data;
        if (inviteData?.userId !== 0 && socket) {
          if (timeoutId) clearTimeout(timeoutId);
          // dispatch(RsetShowTimerButtn(false));
          socket.emit("add_invite_offline", inviteData);
        } else {
          timeoutId = setTimeout(() => {
            // dispatch(
            //   RsetMessageModal({
            //     show: true,
            //     title: "An unexpected error occurred. Please try again.",
            //     icon: "danger",
            //   })
            // );
          }, 60000); // 60 seconds
        }
      }

      return {
        modeType: mode?.typeMode,
        movieData: movieDataRes,
        inviteData: inviteData,
      };
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      // dispatch(RsetShowTimerButtn(false));
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
