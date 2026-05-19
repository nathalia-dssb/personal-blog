import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ImagePlus, X, Save } from "lucide-react";
import { Post } from "../types";
import * as api from "../api";

interface EditPostProps {
  isLoggedIn: boolean;
  onUpdatePost: (
    id: number,
    title: string,
    content: string,
    files: File[],
  ) => void;
}

export function EditPost({ isLoggedIn, onUpdatePost }: EditPostProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
      setTitle(data.title);
      setContent(data.content);
      setPreviews(data.images.map((img) => img.s3Url));
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <h2>Post not found</h2>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles([...files, file]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews([...previews, reader.result as string]);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setFiles(
      files.filter((_, i) => i !== index - (previews.length - files.length)),
    );
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onUpdatePost(post.id, title, content, files);
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Edit Post</h1>
          <p className="text-muted-foreground">Update your content</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[24px] p-8 shadow-sm space-y-6"
        >
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story..."
              rows={12}
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Images</label>
            <div className="flex gap-2 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="w-full px-6 py-8 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Click to upload image
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG or GIF from your PC
                  </p>
                </div>
              </button>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {previews.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>Update Post</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-8 py-3 bg-accent hover:bg-accent/80 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
