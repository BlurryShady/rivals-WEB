import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../api/client';
import { resolveHeroArtwork } from '../utils/media';
import {
  sortMembersByPosition,
  getRoleCounts,
  findMutualSynergies,
} from '../utils/teamInsights';

function BrowseTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 5;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        const response = await teamAPI.getAll({ page, page_size: PAGE_SIZE });
        const data = response.data;
        const results = data.results || data;
        setTeams(results);
        if (typeof data.count === 'number') {
          setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)));
        } else {
          setTotalPages(results.length ? 1 : 0);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [page]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  async function toggleVote(slug) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to vote on teams.');
      return;
    }
    try {
      setVoting(slug);
      const res = await teamAPI.vote(slug);
      setTeams(prev => 
        prev.map(t => 
          t.slug === slug 
            ? { ...t, upvote_count: res.data.upvotes, user_has_voted: res.data.voted } 
            : t
        )
      );
    } catch (e) {
      console.error('Error voting:', e);
    } finally {
      setVoting(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-[#B8AFA3] text-lg">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      
      {/* Page Header */}
      <div className="mb-16">
        <h1 className="heading-section gold-text text-shadow-gold">
          Browse Teams
        </h1>
        <p className="text-2xl text-[#B8AFA3] mt-6">
          Explore community-crafted compositions and find inspiration
        </p>
      </div>
      
      {teams.length === 0 ? (
        /* Empty State */
        <div className="text-center py-32">
          <div className="glass p-12 rounded-3xl max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-bold gold-text mb-4">
              No Teams Yet
            </h2>
            <p className="text-lg text-[#B8AFA3] mb-8">
              Be the first to create a legendary team composition and inspire the community.
            </p>
            <Link 
              to="/team-builder" 
              className="btn-gold px-10 py-4 rounded-full inline-block text-lg font-bold"
            >
              Create First Team
            </Link>
          </div>
        </div>
      ) : (
        /* Teams Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map(team => {
            const sortedMembers = sortMembersByPosition(team.members || []);
            const synergies = findMutualSynergies(sortedMembers);
            const roleCounts = getRoleCounts(sortedMembers);
            
            return (
              <Link 
                key={team.id}
                to={`/teams/${team.slug}`}
                className="card-elegant gold-shine overflow-hidden group block relative"
              >
                {/* Hero Banners Grid Background */}
                <div className="flex justify-center gap-2 p-4 relative">
                  {sortedMembers.slice(0, 6).map((member, idx) => {
                    const bannerSrc = resolveHeroArtwork(member.hero);
                    
                    return (
                      <div key={idx} className="relative">
                        <div className="w-16 h-20 rounded overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity">
                          {bannerSrc ? (
                            <img 
                              src={bannerSrc} 
                              alt={member.hero.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1A1612] flex items-center justify-center text-xl">
                              🦸
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                  {/* Team Name & Creator */}
                  <h3 className="text-2xl font-bold gold-text mb-2 group-hover:text-shadow-gold transition-all">
                    {team.name}
                  </h3>
                  <div className="text-sm text-[#8B8278] mb-4 flex items-center gap-1">
                    <span>by</span>
                    {team.user?.username ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/users/${team.user.username}`);
                        }}
                        className="user-chip"
                      >
                        {team.user.username}
                      </button>
                    ) : (
                      <span>Unknown</span>
                    )}
                  </div>

                  {/* Synergies Section */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#D4AF37] mb-2 uppercase tracking-wider">Synergies</h4>
                    {synergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {synergies.slice(0, 2).map((syn, i) => (
                          <span key={i} className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded border border-[#D4AF37]/30">
                            {syn}
                          </span>
                        ))}
                        {synergies.length > 2 && (
                          <span className="text-xs text-[#8B8278]">+{synergies.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8B8278]">No mutual synergies</p>
                    )}
                  </div>

                  {/* Team Analysis */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[#D4AF37] mb-2 uppercase tracking-wider">Analysis</h4>
                    <div className="flex gap-3 text-xs text-[#B8AFA3]">
                      <span>{roleCounts.VANGUARD || 0} Vanguard</span>
                      <span>•</span>
                      <span>{roleCounts.DUELIST || 0} Duelist</span>
                      <span>•</span>
                      <span>{roleCounts.STRATEGIST || 0} Strategist</span>
                    </div>
                  </div>

                  {/* Footer: Upvote & Views */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10">
                    <button
                      disabled={voting === team.slug}
                      onClick={(e) => { e.preventDefault(); toggleVote(team.slug); }}
                      aria-label={`${team.user_has_voted ? 'Remove upvote from' : 'Upvote'} ${team.name}`}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition border ${
                        team.user_has_voted 
                          ? 'bg-[#1A1612] border-[#D4AF37]/60 text-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]' 
                          : 'bg-[#0F0D0A] border-[#2E261D] text-[#C1B6A5] hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path d="M12 4l7 8h-5v8H10v-8H5l7-8z" />
                      </svg>
                      <span className="font-semibold">{team.upvote_count || 0}</span>
                    </button>
                    
                    <span className="text-xs text-[#8B8278]">{team.views || 0} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {teams.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-full border border-[#D4AF37]/30 text-sm text-[#B8AFA3] disabled:opacity-40 hover:border-[#D4AF37]/60 transition"
          >
            ← Previous
          </button>
          <span className="text-sm text-[#D4AF37] font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-full border border-[#D4AF37]/30 text-sm text-[#B8AFA3] disabled:opacity-40 hover:border-[#D4AF37]/60 transition"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}

export default BrowseTeamsPage;