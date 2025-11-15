import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { authApi } from "../user/services/authApi";
import { driverAuthApi } from "../driver/services/driverAuthApi";
import { driverApi } from "../driver/services/driverApi";
import { stuffAuthApi } from "../stuff/services/stuffAuthApi";
import { stuffApi } from "../stuff/services/stuffApi";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import { userApi } from "../user/services/userApi";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  debug: true,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [driverAuthApi.reducerPath]: driverAuthApi.reducer,
    [driverApi.reducerPath]: driverApi.reducer,
    [stuffAuthApi.reducerPath]: stuffAuthApi.reducer,
    [stuffApi.reducerPath]: stuffApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(driverAuthApi.middleware)
      .concat(driverApi.middleware)
      .concat(stuffAuthApi.middleware)
      .concat(stuffApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
