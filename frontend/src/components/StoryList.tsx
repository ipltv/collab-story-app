import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setCurrentStory } from '../store/storySlice';

export default function StoryList() {
    const { stories } = useSelector((state: RootState) => state.story);
    const dispatch = useDispatch();

    if (!Array.isArray(stories)) {
        return <div>No stories found</div>;
    }
    
    return (
        <div className="p-4">
            <h2 className="text-xl mb-2">Stories</h2>
            <ul className="list-disc pl-5">
                {stories.map((story) => (
                    <li key={story.id} className="cursor-pointer" onClick={() => dispatch(setCurrentStory(story))}>
                        {story.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}