import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamAPI } from '../api/client';
import { resolveHeroArtwork } from '../utils/media';
import {
  sortMembersByPosition,
  getRoleCounts,
  findMutualSynergies,
} from '../utils/teamInsights';

function MyTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTeams() {
      try {
        const response = await teamAPI.getMyTeams();
        setTeams(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTeams();
  }, []);

  const handleDelete = async (slug) => {
    if (!confirm('Delete this team?')) return;
    
    try {
      await teamAPI.delete(slug);
      setTeams(teams.filter(t => t.slug !== slug));
      alert('Team deleted!');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-[#9B8B7E]">Loading your teams...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold gold-text">My Teams</h1>
        <Link
          to="/team-builder"
          className="btn-gold-hero"
        >
          + Create New Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#9B8B7E] mb-4">You haven't created any teams yet</p>
          <Link to="/team-builder" className="btn-gold px-6 py-3 rounded-full inline-block">
            Create Your First Team
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map(team => {
            const sortedMembers = sortMembersByPosition(team.members || []);
            const synergies = findMutualSynergies(sortedMembers);
            const roleCounts = getRoleCounts(sortedMembers);

            return (
              <div key={team.id} className="card-elegant gold-shine overflow-hidden flex flex-col">
                <div className="flex justify-center gap-2 p-4 relative">
                  {sortedMembers.slice(0, 6).map((member, idx) => {
                    const bannerSrc = resolveHeroArtwork(member.hero);

                    return (
                      <div key={idx} className="relative">
                        <div className="w-16 h-20 rounded overflow-hidden opacity-40">
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

                <div className="p-6 pt-2 flex-1 flex flex-col">
                  <Link to={`/teams/${team.slug}`} className="text-2xl font-bold gold-text mb-2 hover:text-shadow-gold transition-all">
                    {team.name}
                  </Link>
                  <p className="text-sm text-[#B8AFA3] mb-4 line-clamp-2">
                    {team.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#8B8278] mb-4">
                    <span>{new Date(team.created_at).toLocaleDateString()}</span>
                    <span>{team.views || 0} views</span>
                  </div>

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

                  <div className="mt-auto pt-4 border-t border-[#D4AF37]/10 flex gap-3">
                    <Link
                      to={`/teams/${team.slug}`}
                      className="btn-premium w-full flex items-center justify-center text-sm"
                    >
                      View Team
                    </Link>
                    <button
                      onClick={() => handleDelete(team.slug)}
                      className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3E1C1C] to-[#6B2A2A] border border-[#A34242]/40 text-[#F6E0E0] font-semibold text-sm py-3 transition hover:from-[#5A2424] hover:to-[#8C3030]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyTeamsPage;