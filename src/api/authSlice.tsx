/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from './api';

export interface AuthState {
  accessToken: string | null,
  user: UserProfile | null,
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    setUser(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
    },
    setLogout(state) {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const {
  setAccessToken, setUser, setLogout,
} = authSlice.actions;
export default authSlice.reducer;
