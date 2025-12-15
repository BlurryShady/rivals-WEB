import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildMediaUrl } from '../utils/media';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  // Generate initials for avatar fallback
  const getInitials = (username) => {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  };

  // Profile picture URL (update this path based on your backend)
  const getProfilePicture = (user) => {
    const rawUrl = user?.avatar_url || user?.profile_picture;
    return buildMediaUrl(rawUrl);
  };

  const profilePic = user ? getProfilePicture(user) : null;

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-[#D4AF37]/20 bg-[#0A0908]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.1)]">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          
          {/* Logo - SHINY and Classy */}
          <Link 
            to="/" 
            className="text-3xl font-bold gold-text-shiny font-display tracking-tight hover:scale-105 transition-transform duration-300 relative"
            style={{ textShadow: '0 0 50px rgba(212, 175, 55, 0.9), 0 0 25px rgba(255, 215, 0, 0.6), 0 4px 20px rgba(0, 0, 0, 0.8)' }}
          >
            Marvel Rivals Builder
          </Link>

          {/* Navigation Links + Auth */}
          <div className="flex-1 flex items-center justify-end gap-6 flex-wrap pl-6">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link
                to="/team-builder"
                className="nav-pill"
              >
                Team Builder
              </Link>
              
              <Link
                to="/teams"
                className="nav-pill"
              >
                Browse Teams
              </Link>
              
              <Link
                to="/my-teams"
                className="nav-pill"
              >
                My Teams
              </Link>
            </div>
            
            {/* Auth Section - Profile or Login */}
            {user ? (
              <div className="flex items-center gap-5">
                {/* Profile Button with Picture */}
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#1A1612]/70 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:bg-[#1A1612] transition-all duration-300 group"
                >
                  {/* Profile Picture */}
                  <div className="avatar-nav border-[#D4AF37]/50 group-hover:border-[#FFD700] transition-all duration-300">
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-[#0A0908] font-bold text-sm">
                        {getInitials(user.username)}
                      </div>
                    )}
                  </div>
                  
                  {/* Username */}
                  <span className="text-sm font-semibold text-[#D4AF37] group-hover:text-[#FFD700] transition-colors duration-200">
                    {user.username}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-full bg-[#252119] border-2 border-[#8B7355]/40 text-[#B8AFA3] hover:text-[#D4AF37] hover:border-[#D4AF37]/60 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login"
                  className="nav-pill"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="btn-gold px-6 py-2.5 rounded-full text-base font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;