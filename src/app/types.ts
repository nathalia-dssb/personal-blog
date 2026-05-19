export interface Author {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  date: string;
  kudosCount: number;
  images: { id: number; s3Url: string }[];
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: number;
  postId: number;
  username: string;
  commentText: string;
  date: string;
}
