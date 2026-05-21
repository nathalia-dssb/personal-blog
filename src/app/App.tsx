import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Header } from './components/Header';
import { BlogList } from './pages/BlogList';
import { BlogPost } from './pages/BlogPost';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PostManagement } from './pages/PostManagement';
import { EditPost } from './pages/EditPost';
import { Post, Comment, Author } from './types';
import * as api from './api';
import { Profile } from './pages/Profile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [postsData, authorsData] = await Promise.all([
        api.getPosts(),
        api.getAuthors()
      ]);
      setPosts(postsData);
      setAuthor(authorsData[0] || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchAuthor = async () => {
    try {
      const authorsData = await api.getAuthors();
      setAuthor(authorsData[0] || null);
    } catch (error) {
      console.error('Failed to fetch author:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const authorData = await api.login(email, password);
      setAuthor(authorData);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
  };

  const handleCreatePost = async (title: string, content: string, files: File[]) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    files.forEach(file => formData.append('images', file));

    try {
      await api.createPost(formData);
      await fetchPosts();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      alert(`Error creating post: ${errorMessage}`);
    }
  };

  const handleUpdatePost = async (id: number, title: string, content: string, files: File[]) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    files.forEach(file => formData.append('images', file));

    try {
      await api.updatePost(id, formData);
      await fetchPosts();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await api.deletePost(id);
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleAddComment = async (postId: number, username: string, commentText: string) => {
    try {
      await api.addComment(postId, username, commentText);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddKudo = async (postId: number) => {
    try {
      const { kudosCount } = await api.addKudo(postId);
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, kudosCount }
          : post
      ));
    } catch (error) {
      console.error('Failed to add kudo:', error);
    }
  };

  const handleUpdateAuthor = async (name: string, bio: string, avatar: File | null) => {
    if (!author) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);

    try {
      await api.updateAuthor(author.id, formData);
      await fetchAuthor();
    } catch (error) {
      console.error('Failed to update author:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafafa]">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<BlogList posts={posts} author={author} />} />
          <Route
            path="/post/:id"
            element={
              <BlogPost
                onAddComment={handleAddComment}
                onAddKudo={handleAddKudo}
              />
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />
            }
          />
          
          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route
              path="/admin"
              element={
                <PostManagement
                  isLoggedIn={isLoggedIn}
                  posts={posts}
                  onDelete={handleDeletePost}
                />
              }
            />
            <Route
              path="/admin/new"
              element={
                <Admin
                  isLoggedIn={isLoggedIn}
                  onCreatePost={handleCreatePost}
                />
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <EditPost
                  isLoggedIn={isLoggedIn}
                  onUpdatePost={handleUpdatePost}
                />
              }
            />
            <Route
              path="/admin/profile"
              element={
                <Profile
                  isLoggedIn={isLoggedIn}
                  author={author}
                  onUpdateAuthor={handleUpdateAuthor}
                />
              }
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
