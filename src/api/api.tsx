'use client';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import SITE_LINKS from '@/utils/SITE_LINKS';
import type { RootState } from './store';
import {
  setAccessToken, setUser, setLogout,
} from './authSlice';

interface FailedResponse<S, D> {
  status: S,
  data: D,
}

// interface PaginatedPesponse<T> {
//   count: number,
//   next: string | null,
//   previous: string | null,
//   results: T,
// }

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface RegisterSuccessResponse {
  message: string,
  user_id: number,
}

export type RegisterFailedResponse = FailedResponse<
  400, Record<keyof RegisterFormData, string[]>
>;

export interface ResendEmailConfirmationFormData {
  user_id: number,
}

export interface ResendEmailConfirmationSuccessResponse {
  status: string,
  retry_after: number,
}

export type ResendEmailConfirmationFailedResponse = FailedResponse<
  429, {
    status: string,
    retry_after: number,
  }
> | FailedResponse<404, { detail: string }>

export interface ConfirmEmailFormData {
  token: string,
}

export interface ConfirmEmailSuccessResponse {
  status: string
}

export interface LoginFormData {
  email: string,
  password: string,
}

export interface LoginSuccessResponse {
  access: string,
}

export type LoginFailedResponse = FailedResponse<
  400, Record<keyof LoginFormData, []>
> | FailedResponse<401, { detail: string }>

export type RefreshAccessTokenSuccessResponse = LoginSuccessResponse;

export interface RequestPasswordResetFormData {
  email: string,
}

export interface RequestPasswordResetSuccessResponse {
  detail: string,
  retry_after: number,
}

export type ResetPasswordFailedResponse = FailedResponse<
  400, Record<keyof RequestPasswordResetFormData, string[]>
> | FailedResponse<
  429, { detail: string, retry_after: number }
>

export interface ConfirmPasswordResetFormData {
  token: string,
  new_password: string,
}

export interface ConfirmPasswordResetSuccessResponse {
  detail: string,
}

export type ConfirmPasswordResetFailedResponse = FailedResponse<
  400, { detail: string }
> | FailedResponse<
  400, { new_password: string }
> | FailedResponse<
  400, { token: string }
>

export interface UserProfile {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  is_email_confirmed: boolean,
}

export type GetUserProfileSuccessResponse = UserProfile;

export interface UpdateUserProfileFormData {
  first_name?: string,
  last_name?: string,
  email?: string,
}

export type UpdateUserProfileSuccessResponse = UserProfile;

export type UpdateUserProfileFailedResponse = FailedResponse<
  400, Record<keyof UpdateUserProfileFormData, string[]>
>;

// export const PAGE_SIZE_QUERY_PARAM_KEY = 'page_size';
// export const DEFAULT_PAGE_SIZE = 10;

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://127.0.0.1:8000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const access = (getState() as RootState).auth.accessToken;

    if (access) {
      headers.set('authorization', `Bearer ${access}`);
    }

    return headers;
  },
});

// refreshPromise prevents race conditions in case more than one request is fired
// with stale access token, so refreshPromise prevents more than one request to /refresh
// simultaneously
let refreshPromise: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let { accessToken } = (api.getState() as RootState).auth;

  if (!accessToken) {
    const accessFromLocalStorage = localStorage.getItem('accessToken');

    if (accessFromLocalStorage) {
      api.dispatch(setAccessToken(accessFromLocalStorage));
      accessToken = accessFromLocalStorage;
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error
    && result.error.status === 401
    && accessToken
    && !refreshPromise
  ) {
    refreshPromise = (async () => {
      try {
        const { data } = await baseQuery({
          url: '/auth/refresh/',
          method: 'POST',
        }, api, extraOptions);

        if ('access' in (data as RefreshAccessTokenSuccessResponse)) {
          const newAccessToken = (data as RefreshAccessTokenSuccessResponse).access;

          localStorage.setItem('accessToken', newAccessToken);
          api.dispatch(setAccessToken(newAccessToken));

          const { data: userProfile } = await baseQuery({
            url: '/user-profile/',
            method: 'GET',
          }, api, extraOptions);

          if (userProfile) {
            localStorage.setItem('user', JSON.stringify(userProfile));
            api.dispatch(setUser(userProfile as UserProfile));
          }

          return newAccessToken;
        }

        return null;
      } catch {
        api.dispatch(setLogout());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = SITE_LINKS.login;
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  const newAccess = await refreshPromise;

  if (newAccess) {
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<RegisterSuccessResponse, RegisterFormData>({
      query: (registerFormData) => ({
        url: 'auth/register/',
        method: 'POST',
        body: registerFormData,
      }),
    }),
    resendEmailConfirmation: builder
      .mutation<ResendEmailConfirmationSuccessResponse, ResendEmailConfirmationFormData>({
        query: (confirmationData) => ({
          url: 'auth/resend-confirm-email/',
          method: 'POST',
          body: confirmationData,
        }),
      }),
    confirmEmail: builder
      .mutation<ConfirmEmailSuccessResponse, ConfirmEmailFormData>({
        query: (confirmationData) => ({
          url: '/auth/confirm-email/',
          method: 'POST',
          body: confirmationData,
        }),
      }),
    login: builder
      .mutation<LoginSuccessResponse, LoginFormData>({
        query: (loginFormData) => ({
          url: '/auth/login/',
          method: 'POST',
          body: loginFormData,
        }),
        async onQueryStarted(_, { queryFulfilled, dispatch }) {
          try {
            const { data } = await queryFulfilled;

            if ('access' in data) {
              dispatch(setAccessToken(data.access));
              localStorage.setItem('accessToken', data.access);
            }

            dispatch(api.endpoints.getUserProfile.initiate(null));
          } catch {
            // ignore or handle somehow this error
          }
        },
      }),
    refreshAccessToken: builder
      .mutation<RefreshAccessTokenSuccessResponse, unknown>({
        query: () => ({
          url: '/auth/refresh/',
          method: 'POST',
        }),
      }),
    logout: builder.mutation<null, null>({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
        credentials: 'include',
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch {
          // ignore or handle somehow this error
        } finally {
          dispatch(setLogout());
          dispatch(api.util.resetApiState());

          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      },
    }),
    requestPasswordReset: builder
      .mutation<RequestPasswordResetSuccessResponse, RequestPasswordResetFormData>({
        query: (requestPasswordResetFormData) => ({
          url: '/auth/request-password-reset/',
          method: 'POST',
          body: requestPasswordResetFormData,
        }),
      }),
    confirmPasswordReset: builder
      .mutation<ConfirmPasswordResetSuccessResponse, ConfirmPasswordResetFormData>({
        query: (confirmPasswordResetFormData) => ({
          url: '/auth/confirm-password-reset/',
          method: 'POST',
          body: confirmPasswordResetFormData,
        }),
      }),
    getUserProfile: builder.query<GetUserProfileSuccessResponse, null>({
      query: () => ({
        url: '/user-profile/',
        method: 'GET',
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data) {
            dispatch(setUser(data));
            localStorage.setItem('user', JSON.stringify(data));
          }
        } catch {
          // ignore or handle somehow this error
        }
      },
    }),
    updateUserProfile: builder
      .mutation<UpdateUserProfileSuccessResponse, UpdateUserProfileFormData>({
        query: (updateUserProfileFormData) => ({
          url: '/user-profile/',
          method: 'PUT',
          body: updateUserProfileFormData,
        }),
        async onQueryStarted(_, { queryFulfilled, dispatch }) {
          try {
            const { data: updatedProfile } = await queryFulfilled;

            dispatch(api.util.upsertQueryData(
              'getUserProfile',
              null,
              updatedProfile,
            ));
          } catch {
            // ignore or handle somehow this error
          }
        },
      }),
  }),
});

export const {
  useRegisterMutation,
  useResendEmailConfirmationMutation,
  useConfirmEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = api;
