import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import CommentList from '../components/CommentList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar } from 'lucide-react';

const Home = () => {
  const user = useAppSelector(selectUser);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">Share your thoughts and engage with the community</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
          <CardDescription>Your account information and activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 sm:col-span-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Community Comments</h2>
          <Badge variant="secondary">Live</Badge>
        </div>
        <CommentList pageId="home-page" />
      </div>
    </div>
  );
};

export default Home;
