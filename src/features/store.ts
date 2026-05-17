import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  createTransform,
  PURGE,
  REGISTER,
  REHYDRATE,
  type PersistConfig,
} from "redux-persist";
import storage from "redux-persist/es/storage";
import authReducer from "./auth/authSlice";
import musicReducer from "./music/musicSlice";
import { chatReducer } from "@/features/websocket/chat";
import audioPlayerReducer from "./music/audioPlayerSlice";
import musicSessionReducer from "./music/musicSessionSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  music: musicReducer,
  chat: chatReducer,
  audioPlayer: audioPlayerReducer,
  musicSession: musicSessionReducer,
});

const musicSessionTransform = createTransform(
  (inboundState: any) => ({
    session: inboundState.session,
    activeHostUserId: inboundState.activeHostUserId,
    isHost: inboundState.isHost,
    sessionToken: inboundState.sessionToken,
    friendSessionsByHostId: {},
    isConnecting: false,
    isConnected: false,
    error: null,
  }),
  (outboundState: any) => ({
    ...outboundState,
    friendSessionsByHostId: outboundState?.friendSessionsByHostId ?? {},
    isConnecting: false,
    isConnected: false,
    error: null,
  }),
  { whitelist: ["musicSession"] }
);

type RootReducerState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootReducerState> = {
  key: "root",
  storage,
  whitelist: ["auth", "music", "audioPlayer", "musicSession"],
  transforms: [musicSessionTransform],
};

const persistedReducer = persistReducer<RootReducerState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
