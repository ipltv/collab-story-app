import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setCurrentStory } from '../store/storySlice';

export default function StoryList() {
    const { stories } = useSelector((state: RootState) => state.story);
    const dispatch = useDispatch();

    if (!Array.isArray(stories) || stories.length === 0) {
        return (
            <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                <span className="text-sm">No stories found.</span>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Your Stories
            </h2>
            <ul className="space-y-3">
                {stories.map((story) => (
                    <li 
                        key={story.id} 
                        className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ease-in-out rounded-lg shadow-sm border border-gray-200"
                        onClick={() => dispatch(setCurrentStory(story))}
                    >
                        <span className="text-base font-medium text-gray-700">
                            {story.title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}