import { useNavigate } from 'react-router';
import { Heart } from 'lucide-react';

interface BlogCardProps {
  id: number;
  title: string;
  coverImage: string;
  date: string;
  kudos: number;
  excerpt: string;
}

export function BlogCard({ id, title, coverImage, date, kudos, excerpt }: BlogCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/${id}`)}
      className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{excerpt}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{kudos}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
