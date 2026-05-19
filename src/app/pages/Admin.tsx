import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ImagePlus, X, Save } from 'lucide-react';

interface AdminProps {
  isLoggedIn: boolean;
  onCreatePost: (title: string, content: string, files: File[]) => void;
}

export function Admin({ isLoggedIn, onCreatePost }: AdminProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  if (!isLoggedIn) {
    navigate('/login');
    return null;
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
      
      e.target.value = '';
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onCreatePost(title, content, files);
      setTitle('');
      setContent('');
      setFiles([]);
      setPreviews([]);
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Create New Post</h1>
          <p className="text-muted-foreground">Share your thoughts with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] p-8 shadow-sm space-y-6">
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
                  <p className="font-medium text-foreground">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or GIF from your PC</p>
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
              <span>Publish Post</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
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
