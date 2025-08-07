import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

export default function StoryDetails() {
    const { currentStory } = useSelector((state: RootState) => state.story);

    if (!currentStory) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-500">
                <span className="text-lg">Select a story to view its content.</span>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {currentStory.title}
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentStory.content}
            </div>
        </div>
    );
}