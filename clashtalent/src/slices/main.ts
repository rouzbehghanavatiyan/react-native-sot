import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Pagination {
  take: number;
  skip: number;
  hasMore: boolean;
}

interface DataState<T = any> {
  pagination: Pagination;
  data: T[];
}

interface MainState {
  showTimerButtn: boolean;
  lastMatch: any[];
  unreadMessagesCount: number;
  watchVideo: DataState;
  homeMatch: DataState;
  showWatchMatch: DataState;
}

const initialPagination: Pagination = {
  take: 6,
  skip: 0,
  hasMore: true,
};

const initialDataState: DataState = {
  pagination: initialPagination,
  data: [],
};

const initialState: MainState = {
  showTimerButtn: false,
  lastMatch: [],
  unreadMessagesCount: 0,
  watchVideo: { ...initialDataState },
  homeMatch: { ...initialDataState },
  showWatchMatch: { ...initialDataState },
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    // ---------------- WATCH ----------------
    setPaginationWatch: (state, action: PayloadAction<Pagination>) => {
      state.watchVideo.pagination = action.payload;
    },

    setWatchData: (state, action: PayloadAction<any[]>) => {
      state.watchVideo.data = action.payload;
    },

    appendWatchData: (state, action: PayloadAction<any[]>) => {
      state.watchVideo.data = [...state.watchVideo.data, ...action.payload];
    },

    // ---------------- HOME ----------------
    setPaginationHome: (state, action: PayloadAction<Pagination>) => {
      state.homeMatch.pagination = action.payload;
    },

    setHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = action.payload;
    },

    appendHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
    },

    // ---------------- SHOW WATCH ----------------
    setPaginationShowWatch: (state, action: PayloadAction<Pagination>) => {
      state.showWatchMatch.pagination = action.payload;
    },

    setShowWatchData: (state, action: PayloadAction<any[]>) => {
      state.showWatchMatch.data = action.payload;
    },

    appendShowWatchData: (state, action: PayloadAction<any[]>) => {
      state.showWatchMatch.data = [
        ...state.showWatchMatch.data,
        ...action.payload,
      ];
    },

    // ---------------- OTHER ----------------
    setUnreadMessagesCount: (state, action: PayloadAction<number>) => {
      state.unreadMessagesCount = action.payload;
    },

    setLastMatch: (state, action: PayloadAction<any[]>) => {
      state.lastMatch = action.payload;
    },

    setShowTimerButton: (state, action: PayloadAction<boolean>) => {
      state.showTimerButtn = action.payload;
    },

    resetWatchState: (state) => {
      state.watchVideo = { ...initialDataState };
    },
  },
});

export const {
  setPaginationWatch,
  setWatchData,
  appendWatchData,

  setPaginationHome,
  setHomeData,
  appendHomeData,

  setPaginationShowWatch,
  setShowWatchData,
  appendShowWatchData,

  setUnreadMessagesCount,
  setLastMatch,
  setShowTimerButton,
  resetWatchState,
} = mainSlice.actions;

export default mainSlice.reducer;
