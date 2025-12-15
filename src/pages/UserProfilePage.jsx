import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { accountAPI, teamAPI } from '../api/client';
import { resolveHeroArtwork } from '../utils/media';
import {
  sortMembersByPosition,
  getRoleCounts,
  findMutualSynergies,
} from '../utils/teamInsights';

function UserProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState(null);
  const [teamPage, setTeamPage] = useState(1);
  const [teamTotalPages, setTeamTotalPages] = useState(1);
  const TEAMS_PER_PAGE = 5;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    accountAPI
      .getPublicProfile(username)
      .then((res) => {
        if (!isMounted) return;
        setProfile(res.data);
        setTeamPage(1);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.status === 404 ? 'User not found.' : 'Unable to load profile.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  useEffect(() => {
    if (!profile?.id) {
      setTeams([]);
      setTeamTotalPages(1);
      setTeamsLoading(false);
      return;
    }

    let isMounted = true;
    setTeamsLoading(true);
    setTeamsError(null);

    teamAPI
      .getAll({ user: profile.id, ordering: '-created_at', page: teamPage, page_size: TEAMS_PER_PAGE })
      .then((res) => {
        if (!isMounted) return;
        const raw = res.data;
        const data = Array.isArray(raw?.results) ? raw.results : raw;
        setTeams(data || []);
        if (typeof raw?.count === 'number') {
          setTeamTotalPages(Math.max(1, Math.ceil(raw.count / TEAMS_PER_PAGE)));
        } else {
          setTeamTotalPages(data && data.length > 0 ? 1 : 0);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setTeamsError('Unable to load teams right now.');
      })
      .finally(() => {
        if (isMounted) setTeamsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.id, teamPage]);

  const handleTeamPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > teamTotalPages || nextPage === teamPage) return;
    setTeamPage(nextPage);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
        <p className="text-[#B8AFA3] mt-4">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-[#B8AFA3] mb-6">{error || 'User not found.'}</p>
        <Link to="/teams" className="btn-gold px-8 py-3 rounded-full inline-block text-sm">
          Back to Browse Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mb-10">
        <h1 className="heading-section gold-text text-shadow-gold mb-2">@{profile.username}</h1>
        <p className="text-[#B8AFA3]">Member of the Marvel Rivals Builder community</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="glass rounded-3xl p-8 flex flex-col items-center text-center">
          <div className="avatar-profile mb-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
            )}
          </div>
          <p className="text-sm text-[#B8AFA3] mb-4">Bio</p>
          <p className="text-lg text-[#E8E6E3]">
            {profile.bio?.trim() ? profile.bio : 'This player has not shared a bio yet.'}
          </p>
        </div>

        <div className="space-y-8">
          <div className="card-elegant p-6">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-6">Player Highlights</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-5 text-center">
                <p className="text-sm uppercase tracking-wider text-[#9B8B7E]">Teams Crafted</p>
                <p className="text-4xl font-bold gold-text">{profile.team_count ?? 0}</p>
              </div>
              <div className="glass rounded-2xl p-5 text-center">
                <p className="text-sm uppercase tracking-wider text-[#9B8B7E]">Upvotes Given</p>
                <p className="text-4xl font-bold gold-text">{profile.upvote_count ?? 0}</p>
              </div>
              <div className="glass rounded-2xl p-5 text-center">
                <p className="text-sm uppercase tracking-wider text-[#9B8B7E]">Upvotes Earned</p>
                <p className="text-4xl font-bold gold-text">{profile.upvotes_received ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#D4AF37]">Teams</h2>
              <Link to="/teams" className="link-premium text-sm">Browse Teams</Link>
            </div>
            {teamsLoading ? (
              <div className="flex items-center gap-3 text-[#B8AFA3]">
                <div className="w-5 h-5 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
                Loading teams...
              </div>
            ) : teamsError ? (
              <p className="text-[#C97A7A]">{teamsError}</p>
            ) : teams.length === 0 ? (
              <p className="text-[#B8AFA3]">This creator has not shared any public teams yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {teams.map((team) => {
                  const sortedMembers = sortMembersByPosition(team.members || []);
                  const synergies = findMutualSynergies(sortedMembers);
                  const roleCounts = getRoleCounts(sortedMembers);

                  return (
                    <Link
                      key={team.id}
                      to={`/teams/${team.slug}`}
                      className="card-elegant gold-shine overflow-hidden block relative group hover:-translate-y-1 transition-transform duration-200"
                    >
                      <div className="flex justify-center gap-2 p-4 pb-2">
                        {sortedMembers.slice(0, 6).map((member, idx) => {
                          const heroImage = resolveHeroArtwork(member.hero);
                          return (
                            <div key={idx} className="w-16 h-20 rounded overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity bg-[#1A1612]">
                              {heroImage ? (
                                <img src={heroImage} alt={member.hero?.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🦸</div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-6 pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-2xl font-bold gold-text">{team.name}</p>
                          <span className="text-xs text-[#9B8B7E]">{new Date(team.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#B8AFA3] mb-4">
                          {team.description?.trim() ? team.description : 'No description provided.'}
                        </p>

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

                        <div className="flex items-center justify-between text-xs text-[#9B8B7E] pt-4 border-t border-[#D4AF37]/10">
                          <span>⭐ {team.composition_score ?? 0}</span>
                          <span>⬆ {team.upvote_count ?? team.upvotes ?? 0}</span>
                          <span>👁 {team.views ?? 0}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {teams.length > 0 && teamTotalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => handleTeamPageChange(teamPage - 1)}
                  disabled={teamPage === 1}
                  className="px-4 py-2 rounded-full border border-[#D4AF37]/30 text-sm text-[#B8AFA3] disabled:opacity-40 hover:border-[#D4AF37]/60 transition"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[#D4AF37] font-semibold">
                  Page {teamPage} of {teamTotalPages}
                </span>
                <button
                  onClick={() => handleTeamPageChange(teamPage + 1)}
                  disabled={teamPage === teamTotalPages}
                  className="px-4 py-2 rounded-full border border-[#D4AF37]/30 text-sm text-[#B8AFA3] disabled:opacity-40 hover:border-[#D4AF37]/60 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
