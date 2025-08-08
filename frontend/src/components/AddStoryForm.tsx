import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { addStory } from '../store/storySlice';

export default function AddStoryForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.story);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); 

    const handleAddStory = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            dispatch(addStory({ title, content })); 
            setTitle('');
            setContent('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Add a New Story
            </h3>
            <form onSubmit={handleAddStory} className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter new story title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    required
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write the story content here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
                    rows={4}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                        loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Adding...' : 'Add Story'}
                </button>
            </form>
        </div>
    );
}