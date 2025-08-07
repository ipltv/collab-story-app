import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { updateStoryContent } from '../store/storySlice';

export default function StoryEditor() {
  const currentStory = useSelector((state: RootState) => state.story.currentStory);
  const dispatch = useDispatch();

  if (!currentStory) return <div className="p-4">Select a story to edit.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Editing: {currentStory.title}</h2>
      <textarea
        className="textarea textarea-bordered w-full"
        rows={10}
        value={currentStory.content}
        onChange={(e) => dispatch(updateStoryContent(e.target.value))}
      ></textarea>
    </div>
  );
}