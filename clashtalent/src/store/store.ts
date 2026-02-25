import { configureStore } from '@reduxjs/toolkit';
import mainReducer from '@/src/slices/main';

export const store = configureStore({
  reducer: {
    main: mainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;