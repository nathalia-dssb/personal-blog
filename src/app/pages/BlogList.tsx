import { BlogCard } from "../components/BlogCard";
import { Post, Author } from "../types";

interface BlogListProps {
  posts: Post[];
  author: Author | null;
}

export function BlogList({ posts, author }: BlogListProps) {
  const name = author?.name || "";
  const bio = author?.bio || "";
  const avatarUrl =
    author?.avatarUrl ||
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="relative w-32 h-32 mb-6">
          <img
            src={avatarUrl}
            alt={name}
            className="rounded-full w-full h-full object-cover shadow-lg border-4 border-white"
          />
        </div>
        <h2 className="text-4xl font-serif mb-4">{name}</h2>
        <p className="text-muted-foreground max-w-xl">{bio}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            title={post.title}
            coverImage={
              post.images[0]?.s3Url ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            }
            date={post.date}
            kudos={post.kudosCount}
            excerpt={post.content.substring(0, 120)}
          />
        ))}
      </div>
    </div>
  );
}
