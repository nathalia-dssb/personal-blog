import axios from 'axios';
import { Post, Comment, Author } from './types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getPosts = async () => {
  const response = await api.get<Post[]>('/posts');
  return response.data;
};

export const getPost = async (id: number) => {
  const response = await api.get<Post & { comments: Comment[] }>(`/posts/${id}`);
  return response.data;
};

export const createPost = async (formData: FormData) => {
  const response = await api.post<Post>('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePost = async (id: number, formData: FormData) => {
  const response = await api.put<Post>(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePost = async (id: number) => {
  await api.delete(`/posts/${id}`);
};

export const addComment = async (postId: number, username: string, commentText: string) => {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, {
    username,
    commentText,
  });
  return response.data;
};

export const addKudo = async (postId: number) => {
  const response = await api.post<{ kudosCount: number }>(`/posts/${postId}/kudo`);
  return response.data;
};

export const getAuthor = async (id: number) => {
  const response = await api.get<Author>(`/authors/${id}`);
  return response.data;
};

export const getAuthors = async () => {
  const response = await api.get<Author[]>('/authors');
  return response.data;
};

export const updateAuthor = async (id: number, formData: FormData) => {
  const response = await api.put<Author>(`/authors/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post<{ author: Author; token: string }>('/login', { email, password });
  const { author, token } = response.data;
  localStorage.setItem('token', token);
  return author;
};

export const register = async (email: string, password: string, name: string, bio: string) => {
  const response = await api.post<{ author: Author; token: string }>('/register', { email, password, name, bio });
  const { author, token } = response.data;
  localStorage.setItem('token', token);
  return author;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;
