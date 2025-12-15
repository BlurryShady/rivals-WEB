import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TeamBuilderPage from './pages/TeamBuilderPage';
import TeamDetailPage from './pages/TeamDetailPage';
import MyTeamsPage from './pages/MyTeamsPage';
import BrowseTeamsPage from './pages/BrowseTeamsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <Router>
      {/* Remove conflicting background color - now handled by body in index.css */}
      <div className="min-h-screen text-[#E8E6E3]">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/team-builder"
              element={(
                <ProtectedRoute>
                  <TeamBuilderPage />
                </ProtectedRoute>
              )}
            />
            <Route path="/teams" element={<BrowseTeamsPage />} />
            <Route path="/teams/:slug" element={<TeamDetailPage />} />
            <Route
              path="/my-teams"
              element={(
                <ProtectedRoute>
                  <MyTeamsPage />
                </ProtectedRoute>
              )}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              )}
            />
            <Route path="/users/:username" element={<UserProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;