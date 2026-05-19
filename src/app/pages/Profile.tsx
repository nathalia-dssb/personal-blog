import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ImagePlus, Save, User } from 'lucide-react';
import { Author } from '../types';

interface ProfileProps {
  isLoggedIn: boolean;
  author: Author | null;
  onUpdateAuthor: (name: string, bio: string, avatar: File | null) => void;
}

export function Profile({ isLoggedIn, author, onUpdateAuthor }: ProfileProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(author?.name || '');
  const [bio, setBio] = useState(author?.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(author?.avatarUrl || null);

  useEffect(() => {
    if (author) {
      setName(author.name);
      setBio(author.bio || '');
      setPreview(author.avatarUrl);
    }
  }, [author]);

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setAvatar(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateAuthor(name, bio, avatar);
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] p-8 shadow-sm space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4 group">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-accent flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ImagePlus className="w-8 h-8 text-white" />
              </button>
            </div>
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
              className="text-primary font-medium hover:underline"
            >
              Change Photo
            </button>
          </div>

          <div>
            <label className="block mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Profile</span>
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
