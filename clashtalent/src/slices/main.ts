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
  pagination: { ...initialPagination },
  data: [],
};

const initialState: any = {
  showTimerButtn: false,
  allFollingList: {},
  lastMatch: [],
  unreadMessagesCount: 0,
  watchVideo: { ...initialDataState },
  homeMatch: { ...initialDataState },
  showWatchMatch: { ...initialDataState },
  allFollowerList: [],
  category: [],
  userLogin: {},
  userId: 0,
  socketConfig: null,
  userOnlines: null,
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
    RsetAllFollowerList: (state, action: PayloadAction<any[]>) => {
      state.allFollowerList = action.payload;
    },
    RsetAllFollingList: (state, action: PayloadAction<any[]>) => {
      state.allFollingList = action.payload;
    },
    RsetLastMatch: (state, action: PayloadAction<any[]>) => {
      state.lastMatch = action.payload;
    },
    RsetCategory: (state, action: PayloadAction<any[]>) => {
      state.category = action.payload;
    },
    RsetUserLogin: (state, action: PayloadAction<any>) => {
      state.userLogin = action.payload;
    },
    RsetUserId: (state, action: PayloadAction<any>) => {
      state.userId = action.payload;
    },
    RsetSocketConfig: (state, action: PayloadAction<any>) => {
      state.socketConfig = action.payload;
    },
    RsetGiveUserOnlines: (state, action: PayloadAction<any>) => {
      state.userOnlines = action.payload;
    },
    setPaginationHome: (state, action: PayloadAction<Pagination>) => {
      state.homeMatch.pagination = action.payload;
    },
    setHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = action.payload;
    },
    RsetShowWatch: (state, action) => {
      state.showWatchMatch.data = action.payload;
    },
    appendHomeData: (state, action: PayloadAction<any[]>) => {
      state.homeMatch.data = [...state.homeMatch.data, ...action.payload];
    },
    setPaginationShowWatch: (state, action: PayloadAction<Pagination>) => {
      state.showWatchMatch.pagination = action.payload;
    },
    setShowWatchData: (state, action: PayloadAction<any[]>) => {
      state.showWatchMatch.data = action.payload;
    },
    appendShowWatch: (state, action) => {
      state.showWatchMatch.data = [
        ...state.showWatchMatch.data,
        ...action.payload,
      ];
    },
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
    resetHomeState: (state) => {
      state.homeMatch = { ...initialDataState };
    },
    resetShowWatchState: (state) => {
      state.showWatchMatch = {
        data: [],
        pagination: {
          take: 6,
          skip: 0,
          hasMore: true,
        },
      };
    },
    resetAllFeeds: (state) => {
      state.watchVideo = { ...initialDataState };
      state.homeMatch = { ...initialDataState };
      state.showWatchMatch = { ...initialDataState };
    },
  },
});

export const {
  // watch
  setPaginationWatch,
  setWatchData,
  appendWatchData,

  // home
  setPaginationHome,
  setHomeData,
  appendHomeData,

  // showWatch
  setPaginationShowWatch,
  setShowWatchData,
  appendShowWatch,

  // other
  setUnreadMessagesCount,
  setLastMatch,
  setShowTimerButton,

  RsetUserId,
  resetWatchState,
  resetHomeState,
  resetShowWatchState,
  resetAllFeeds,
  RsetAllFollowerList,
  RsetAllFollingList,
  RsetLastMatch,
  RsetCategory,
  RsetUserLogin,
  RsetSocketConfig,
  RsetGiveUserOnlines,
  RsetShowWatch,
} = mainSlice.actions;

export default mainSlice.reducer;
