import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../api/client';
import { resolveHeroArtwork } from '../utils/media';
import {
  sortMembersByPosition,
  getRoleCounts,
  findMutualSynergies,
} from '../utils/teamInsights';

function HomePage() {
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopTeams() {
      try {
        const response = await teamAPI.getAll({ page_size: 50 });
        const teams = response.data.results || response.data;
        // Get top 5 most viewed teams
        const sorted = teams
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setTopTeams(sorted);
      } catch (error) {
        console.error('Error fetching top teams:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopTeams();
  }, []);

  async function toggleVote(slug) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to vote on teams.');
      return;
    }
    try {
      setVoting(slug);
      const res = await teamAPI.vote(slug);
      setTopTeams(prev => 
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

  return (
    <div className="min-h-screen">
      
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION - Majestic Introduction
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto fade-in-up">
            
            {/* Main Headline - SHINY VERSION */}
            <h1 className="heading-hero font-display mb-8">
              <span 
                className="gold-text-shiny block"
                style={{ 
                  textShadow: '0 0 80px rgba(255, 215, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.7), 0 6px 30px rgba(0, 0, 0, 0.9)' 
                }}
              >
                Marvel Rivals
              </span>
              <span className="text-[#F5F3F0] block mt-2" style={{ textShadow: '0 6px 30px rgba(0, 0, 0, 0.9), 0 0 60px rgba(212, 175, 55, 0.2)' }}>
                Team Builder
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-[#B8AFA3] mb-16 font-light leading-relaxed">
              Forge the perfect team composition.
              <br />
              <span className="text-[#8B8278]">Showcase your strategy. Inspire the community.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Link
                to="/team-builder"
                className="btn-gold-hero shadow-2xl"
              >
                Start Building
              </Link>
              <Link
                to="/teams"
                className="link-premium text-base"
              >
                Browse Teams
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION - Why Use This Builder
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-transparent via-[#12100E]/50 to-transparent">
        <div className="divider-ornamental max-w-4xl mx-auto"></div>
        
        <div className="container mx-auto px-6 mt-16">
          <div className="grid md:grid-cols-3 gap-10">
            
            {/* Feature 1 */}
            <div className="glass p-10 rounded-2xl text-center hover:scale-105 transition-transform duration-300 corner-ornaments">
              <div className="text-6xl mb-6"></div>
              <h3 className="text-2xl font-bold gold-text mb-4 text-shadow-gold">Strategic Planning</h3>
              <p className="text-[#B8AFA3] text-lg leading-relaxed">
                Analyze synergies, counters, and role balance to create championship-worthy teams.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-10 rounded-2xl text-center hover:scale-105 transition-transform duration-300 corner-ornaments">
              <div className="text-6xl mb-6"></div>
              <h3 className="text-2xl font-bold gold-text mb-4 text-shadow-gold">Community Showcase</h3>
              <p className="text-[#B8AFA3] text-lg leading-relaxed">
                Share your compositions, gain recognition, and inspire others with your strategies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-10 rounded-2xl text-center hover:scale-105 transition-transform duration-300 corner-ornaments">
              <div className="text-6xl mb-6"></div>
              <h3 className="text-2xl font-bold gold-text mb-4 text-shadow-gold">Hero Database</h3>
              <p className="text-[#B8AFA3] text-lg leading-relaxed">
                Access comprehensive hero info with abilities, roles, and team chemistry data.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TOP TEAMS SHOWCASE - Award Winners
          ═══════════════════════════════════════════════════════ */}
      <section className="py-28 section-premium">
        <div className="container mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="heading-section gold-text text-shadow-gold mx-auto">
              Top 5 Most Popular Teams
            </h2>
            <p className="text-xl text-[#B8AFA3] mt-6">
              Recognized by the community for excellence
            </p>
          </div>

          {/* Teams Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
              <p className="text-[#B8AFA3] mt-4">Loading top teams...</p>
            </div>
          ) : topTeams.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#B8AFA3] text-lg mb-6">
                No teams yet. Be the first to create a legendary composition!
              </p>
              <Link to="/team-builder" className="btn-gold px-8 py-3 rounded-full inline-block font-semibold">
                Create First Team
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topTeams.map((team, index) => {
                const sortedMembers = sortMembersByPosition(team.members || []);
                const synergies = findMutualSynergies(sortedMembers);
                const roleCounts = getRoleCounts(sortedMembers);
                
                return (
                  <Link 
                    key={team.id}
                    to={`/teams/${team.slug}`}
                    className="card-elegant gold-shine overflow-hidden group block relative"
                  >
                    {/* Rank Badge - Top Left Corner */}
                    <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 transition-all duration-300 ${
                      index === 0 
                        ? 'bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-[#0A0908] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.5)]' 
                        : index === 1
                        ? 'bg-gradient-to-br from-[#C0C0C0] to-[#8B8B8B] text-[#0A0908] border-[#C0C0C0] shadow-[0_0_15px_rgba(192,192,192,0.4)]'
                        : index === 2
                        ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B6914] text-[#0A0908] border-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.4)]'
                        : 'bg-[#252119] text-[#D4AF37] border-[#D4AF37]/30 group-hover:border-[#D4AF37]'
                    }`}>
                      {index === 0 ? '🏆' : index + 1}
                    </div>

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

          {/* View All Button */}
          {topTeams.length > 0 && (
            <div className="text-center mt-16">
              <Link
                to="/teams"
                className="link-premium text-lg"
              >
                View All Teams
                <span>→</span>
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA - Call to Action
          ═══════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="divider-ornamental max-w-4xl mx-auto mb-16"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/8 to-transparent"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="glass p-16 rounded-3xl text-center max-w-4xl mx-auto corner-ornaments">
            <h2 className="text-5xl md:text-6xl font-bold gold-text mb-8 text-shadow-gold">
              Ready to Build Your Team?
            </h2>
            <p className="text-2xl text-[#B8AFA3] mb-12 leading-relaxed">
              Join the community and craft team compositions that will be remembered.
            </p>
            <Link
              to="/team-builder"
              className="px-14 py-6 rounded-full btn-gold text-lg inline-block"
            >
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;