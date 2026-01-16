import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome, {user?.username}!</h1>
        <p>You are now logged in to the Comment System.</p>
      </div>

      <div className="home-content">
        <div className="info-card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="info-card">
          <h2>Comments Section</h2>
          <p>The comments feature will be available soon!</p>
          <p className="text-muted">Phase 4: Comments Backend & Frontend</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
