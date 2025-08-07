import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store/store';
import { setCurrentStory } from '../store/storySlice';
import AddStoryForm from './AddStoryForm';
import StoryDetails from './StoryDetails';
import { logoutUser } from '../store/userSlice';

export default function StoryList() {
    const { stories } = useSelector((state: RootState) => state.story);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };


    if (!Array.isArray(stories) || stories.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Your Stories</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
                <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-50 rounded-lg shadow-md border border-gray-200 mb-4">
                    <span className="text-sm">No stories found.</span>
                </div>
                <AddStoryForm />
            </div>
        );
    }

    return (
        <div className="flex gap-6 p-6">
            <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Your Stories</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
                    <AddStoryForm />
                <ul className="space-y-3 mt-4">
                    {stories.map((story) => (
                        <li
                            key={story.id}
                            className="cursor-pointer p-4 bg-green-50 hover:bg-blue-100 transition-colors duration-200 ease-in-out rounded-lg shadow-sm border border-gray-200"
                            onClick={() => dispatch(setCurrentStory(story))}
                        >
                            <span className="text-base font-medium text-gray-700">
                                {story.title}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1">
                <StoryDetails />
            </div>
        </div>
    );
}