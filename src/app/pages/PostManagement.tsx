import { useNavigate } from 'react-router';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Post } from '../types';

interface PostManagementProps {
  isLoggedIn: boolean;
  posts: Post[];
  onDelete: (postId: number) => void;
}

export function PostManagement({ isLoggedIn, posts, onDelete }: PostManagementProps) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleDelete = (postId: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete(postId);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Manage Posts</h1>
            <p className="text-muted-foreground">{posts.length} total posts</p>
          </div>
          <button
            onClick={() => navigate('/admin/new')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            Create New Post
          </button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[20px] p-6 shadow-sm flex items-center gap-6"
            >
              {post.images[0] && (
                <img
                  src={post.images[0].s3Url}
                  alt={post.title}
                  className="w-32 h-32 object-cover rounded-[12px] flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="mb-2 truncate">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{post.kudosCount} kudos</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="p-3 rounded-full hover:bg-accent transition-colors"
                  title="View post"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate(`/admin/edit/${post.id}`)}
                  className="p-3 rounded-full hover:bg-accent transition-colors"
                  title="Edit post"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-3 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="bg-white rounded-[20px] p-12 text-center">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <button
                onClick={() => navigate('/admin/new')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
