import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

interface Story {
    id: number;
    title: string;
    content: string;
    author: number;
    contributors: number[];
}

interface StoryState {
    stories: Story[];
    currentStory: Story | null;
    loading: boolean;
    error: string | null;
}

const initialState: StoryState = {
    stories: [],
    currentStory: null,
    loading: false,
    error: null,
};

export const fetchStories = createAsyncThunk(
    'story/fetchStories',
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/stories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch stories');
        }
    }
);

const storySlice = createSlice({
    name: 'story',
    initialState,
    reducers: {
        setStories(state, action: PayloadAction<Story[]>) {
            state.stories = action.payload;
        },
        setCurrentStory(state, action: PayloadAction<Story>) {
            state.currentStory = action.payload;
        },
        updateStoryContent(state, action: PayloadAction<string>) {
            if (state.currentStory) {
                state.currentStory.content = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action: PayloadAction<Story[]>) => {
                state.stories = Array.isArray(action.payload) ? action.payload : [];
                state.loading = false;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setStories, setCurrentStory, updateStoryContent } = storySlice.actions;
export default storySlice.reducer;
