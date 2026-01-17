import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import CommentList from '../components/CommentList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar } from 'lucide-react';

const Home = () => {
  const user = useAppSelector(selectUser);

  return (
    <div className="home">
      {/* Welcome Section */}
      <div className="home__header text-center">
        <h1 className="home__title text-4xl">Welcome back, {user?.username}!</h1>
        <p className="text-muted">Share your thoughts and engage with the community</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User style={{ width: '1.25rem', height: '1.25rem' }} />
            Your Profile
          </CardTitle>
          <CardDescription>Your account information and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-center p-2 rounded-full bg-muted">
                <User style={{ width: '1rem', height: '1rem' }} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-center p-2 rounded-full bg-muted">
                <Mail style={{ width: '1rem', height: '1rem' }} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="font-medium text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-center p-2 rounded-full bg-muted">
                <Calendar style={{ width: '1rem', height: '1rem' }} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Member since</p>
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
      <div className="comments-section">
        <div className="comments__header mb-4">
          <h2 className="comments__title text-2xl font-bold">Community Comments</h2>
          <Badge variant="success">Live</Badge>
        </div>
        <CommentList pageId="home-page" />
      </div>
    </div>
  );
};

export default Home;
