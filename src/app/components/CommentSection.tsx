import { useState } from 'react';
import { User, Send, Sparkles } from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onAddComment: (postId: number, username: string, commentText: string) => void;
}

const generateUsername = () => {
  const adjectives = ['Cosmic', 'Stellar', 'Lunar', 'Solar', 'Mystic', 'Wandering', 'Silent', 'Dreamy'];
  const nouns = ['Explorer', 'Voyager', 'Dreamer', 'Wanderer', 'Seeker', 'Observer', 'Thinker', 'Writer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

export function CommentSection({ postId, comments, onAddComment }: CommentSectionProps) {
  const [username, setUsername] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const finalUsername = username.trim() || generateUsername();
      onAddComment(postId, finalUsername, commentText);
      setCommentText('');
      setUsername('');
    }
  };

  const handleGenerateUsername = () => {
    setUsername(generateUsername());
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-white rounded-[16px] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{c.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-foreground">{c.commentText}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-6 shadow-sm">
        <h3 className="mb-4">Leave a comment</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">Username (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name or generate one"
                className="flex-1 px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleGenerateUsername}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm">Comment</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Post Comment</span>
          </button>
        </div>
      </form>
    </div>
  );
}
