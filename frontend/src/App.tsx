import { useEffect } from 'react';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { RootState, AppDispatch } from './store/store';
import { fetchStories } from './store/storySlice';
import { setUserFromToken } from './store/userSlice';
import StoryList from './components/StoryList';
import LoginPage from './components/LoginPage';
import StoryEditor from './components/StoryEditor';
import RegisterPage from './components/RegisterPage';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(setUserFromToken(token));
    }
    dispatch(fetchStories());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={user ? <StoryList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/stories/:id"
          element={user ? <StoryEditor /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
