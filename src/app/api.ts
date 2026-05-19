import axios from 'axios';
import { Post, Comment, Author } from './types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001');

const api = axios.create({
  baseURL: API_URL,
});

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

export const updateAuthor = async (id: number, formData: FormData) => {
  const response = await api.put<Author>(`/authors/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
