import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_API_URL;

interface User {
    id: number;
    username: string;
    email: string;
    stories: number[];
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const setUserFromToken = createAsyncThunk(
    'user/setUserFromToken',
    async (token: string, thunkAPI) => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (
        credentials: { username: string; password: string },
        thunkAPI
    ) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);//ToDo: handle token storage securely
            await thunkAPI.dispatch(setUserFromToken(accessToken));
            return accessToken;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (credentials: { username: string; email: string; password: string }, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, credentials);
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            await thunkAPI.dispatch(setUserFromToken(accessToken));
            return accessToken;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, thunkAPI) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = Cookies.get('refreshToken');
            if (accessToken && refreshToken) {
                // Send logout request to server. 
                // Acctualy, server-side doen't expext payload for logout (only header), but we can send it for consistency and future use
                await axios.post(`${API_URL}/api/auth/logout`, { refreshToken }, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            localStorage.removeItem('accessToken');
            Cookies.remove('refreshToken');

            return true;
        } catch (err: any) {
            // Even if logout fails, we clear local state
            // This is important to ensure client-side state is consistent
            localStorage.removeItem('accessToken');
            Cookies.remove('refreshToken');
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Logout failed, but client state cleared');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setUserFromToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setUserFromToken.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(setUserFromToken.rejected, (state, action) => {
                if (action.payload === "Invalid or expired token.") {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.error = null;
                } else {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.error = action.payload as string;
                }
            });
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });
    },
});

export const { login, logout, clearError } = userSlice.actions;
export default userSlice.reducer;
