import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { CommentSection } from "../components/CommentSection";
import { Post, Comment } from "../types";
import * as api from "../api";

interface BlogPostProps {
  onAddComment: (postId: number, username: string, commentText: string) => void;
  onAddKudo: (postId: number) => void;
}

export function BlogPost({ onAddComment, onAddKudo }: BlogPostProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<(Post & { comments: Comment[] }) | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(Number(id));
    }
  }, [id]);

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true);
      const data = await api.getPost(postId);
      setPost(data);
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2>Post not found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleLike = async () => {
    if (!hasLiked) {
      await onAddKudo(post.id);
      setPost({ ...post, kudosCount: post.kudosCount + 1 });
      setHasLiked(true);
    }
  };

  const handleAddComment = async (
    postId: number,
    username: string,
    commentText: string,
  ) => {
    await onAddComment(postId, username, commentText);
    fetchPost(postId);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all posts</span>
        </button>

        <article className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm">
          <header className="mb-8">
            <h1 className="mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <time>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Heart
                  className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span>{post.kudosCount}</span>
              </div>
            </div>
          </header>

          <div className="prose max-w-none mb-8">
            {post.images.map((image) => (
              <div
                key={image.id}
                className="mb-6 rounded-[16px] overflow-hidden"
              >
                <img src={image.s3Url} alt="" className="w-full h-auto" />
              </div>
            ))}
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                hasLiked
                  ? "bg-red-50 text-red-600 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/80"
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? "fill-red-600" : ""}`} />
              <span>{hasLiked ? "Liked" : "Like"}</span>
            </button>
          </div>
        </article>

        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5" />
            <h2>Comments ({post.comments.length})</h2>
          </div>
          <CommentSection
            postId={post.id}
            comments={post.comments}
            onAddComment={handleAddComment}
          />
        </div>
      </div>
    </div>
  );
}
