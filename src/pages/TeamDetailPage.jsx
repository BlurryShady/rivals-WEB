import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamAPI } from '../api/client';
import { buildMediaUrl } from '../utils/media';
import {
  sortMembersByPosition,
  getRoleCounts,
  findMutualSynergies,
} from '../utils/teamInsights';
import creatorIcon from '../assets/creator-icon.png';
import dateIcon from '../assets/date-icon.png';
import viewIcon from '../assets/view-icon.png';
import { useAuth } from '../context/AuthContext';

function TeamDetailPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const { user } = useAuth();

  const currentUserAvatar = user?.avatar_url ? buildMediaUrl(user.avatar_url) : null;
  const currentUserInitials = (user?.username || '?').slice(0, 2).toUpperCase();

  const requireAuth = useCallback(
    (message) => {
      if (!user) {
        setAuthMessage(message);
        return false;
      }
      return true;
    },
    [user]
  );

  useEffect(() => {
    if (user) setAuthMessage('');
  }, [user]);

  const upsertComment = useCallback((incoming) => {
    setComments((prev) => {
      if (!incoming?.id) return prev;

      const idx = prev.findIndex((existing) => existing.id === incoming.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = incoming;
        return updated;
      }

      // append instead of prepend (oldest → newest ordering)
      return [...prev, incoming];
    });
  }, []);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await teamAPI.getBySlug(slug);
        setTeam(response.data);
        setUpvotes(response.data.upvote_count || response.data.upvotes || 0);
        setVoted(!!response.data.user_has_voted);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [slug]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await teamAPI.getComments(slug);

        // Ensure oldest → newest
        const sorted = [...res.data].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setComments(sorted);
      } catch (e) {
        console.error('Error loading comments:', e);
      }
    }

    fetchComments();
  }, [slug]);


  async function toggleVote() {
    if (!requireAuth('Please log in to vote on teams.')) return;
    try {
      const res = await teamAPI.vote(slug);
      setVoted(res.data.voted);
      setUpvotes(res.data.upvotes);
    } catch (e) {
      console.error('Error voting:', e);
    }
  }

  async function processCommentSubmission() {
    if (!requireAuth('Please log in to leave a comment.')) return;
    if (!commentText.trim() || commentSubmitting) return;

    try {
      setCommentSubmitting(true);
      const res = await teamAPI.addComment(slug, commentText.trim());
      upsertComment(res.data);
      setCommentText('');
    } catch (e) {
      console.error('Error adding comment:', e);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    await processCommentSubmission();
  }

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processCommentSubmission();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-[#B8AFA3] text-lg">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-32">
        <div className="glass p-12 rounded-3xl max-w-2xl mx-auto">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-3xl font-bold gold-text mb-4">Team Not Found</h2>
          <p className="text-lg text-[#B8AFA3] mb-8">This team doesn't exist or has been removed.</p>
          <Link to="/teams" className="text-[#D4AF37] hover:text-[#C5A028] font-semibold text-lg">
            ← Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const creatorUsername = team.user?.username;
  const sortedMembers = sortMembersByPosition(team.members);
  const roleCounts = getRoleCounts(sortedMembers);
  const synergies = findMutualSynergies(sortedMembers);

  const downsides = [];
  const vanguards = roleCounts.VANGUARD || 0;
  const duelists = roleCounts.DUELIST || 0;
  const strategists = roleCounts.STRATEGIST || 0;

  if (vanguards === 0) downsides.push('No Vanguard - Team lacks a frontline tank');
  else if (vanguards === 1) downsides.push('Only 1 Vanguard - Consider adding another tank');

  if (strategists === 0) downsides.push('No Strategist - Team lacks healing and support');
  else if (strategists === 1) downsides.push('Only 1 Strategist - May struggle with sustained healing');

  if (duelists === 0) downsides.push('No Duelist - Team lacks damage output');
  else if (duelists === 1) downsides.push('Only 1 Duelist - Poor damage output');
  else if (duelists >= 4) downsides.push('Too many Duelists - May lack survivability');

  return (
    <div className="py-8">
      <Link to="/teams" className="inline-flex items-center gap-2 text-[#B8AFA3] hover:text-[#D4AF37] mb-8 group transition-colors duration-200">
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        Back to Teams
      </Link>

      <div className="glass p-10 rounded-3xl mb-12 gold-shine">
        <h1 className="text-5xl font-bold gold-text mb-4 text-shadow-gold">{team.name}</h1>
        <p className="text-xl text-[#B8AFA3] mb-6 leading-relaxed">{team.description || 'No description provided'}</p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B8278]">
          <span className="flex items-center gap-2">
            <img src={creatorIcon} alt="Creator icon" className="w-4 h-4 object-contain" />
            Created by
            {creatorUsername ? (
              <Link to={`/users/${creatorUsername}`} className="text-[#D4AF37] font-semibold hover:text-[#F8E6A0] transition-colors">
                {creatorUsername}
              </Link>
            ) : (
              <span className="text-[#D4AF37] font-semibold">Unknown</span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <img src={dateIcon} alt="Date icon" className="w-4 h-4 object-contain" />
            {new Date(team.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <img src={viewIcon} alt="View icon" className="w-4 h-4 object-contain" />
            {team.views} views
          </span>
          {team.composition_score > 0 && (
            <span className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#C5A028]/20 border border-[#D4AF37]/40">
              <span className="text-[#D4AF37]">⭐</span>
              <span className="text-[#D4AF37] font-bold text-base">Score: {team.composition_score}/100</span>
            </span>
          )}
        </div>
      </div>

      <h2 className="text-3xl font-bold gold-text mb-6">Team Composition</h2>
      <div className="flex justify-center gap-4 mb-12">
        {sortedMembers.map((member) => {
          const hero = member.hero || {};
          const bannerSrc = hero.banner_url || hero.image_url || null;

          return (
            <div key={member.id} className="relative group">
              <div className="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-[#D4AF37] text-[#0A0908] flex items-center justify-center text-xs font-bold">
                {member.position}
              </div>

              <div className="w-32 h-40 rounded-lg overflow-hidden border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/70 transition-all">
                {bannerSrc ? (
                  <img src={bannerSrc} alt={hero.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-[#1A1612]">🦸</div>
                )}
              </div>

              <p className="text-center text-sm font-semibold text-[#F5F3F0] mt-2">{hero.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <img src={`/${hero.role?.toLowerCase?.() || 'vanguard'}-icon.ico`} alt={hero.role} className="w-4 h-4" />
                <span className="text-xs text-[#B8AFA3]">{hero.role}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass p-10 rounded-3xl mb-12 space-y-10">
        <div>
          <h3 className="text-2xl font-bold gold-text mb-4 flex items-center gap-3">
            <span></span>
            Team Design
          </h3>
          <div className="flex items-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <img src="/vanguard-icon.ico" alt="Vanguard" className="w-6 h-6" />
              <span className="text-[#B8AFA3]">{roleCounts.VANGUARD || 0} Vanguard</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/duelist-icon.ico" alt="Duelist" className="w-6 h-6" />
              <span className="text-[#B8AFA3]">{roleCounts.DUELIST || 0} Duelist</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/strategist-icon.ico" alt="Strategist" className="w-6 h-6" />
              <span className="text-[#B8AFA3]">{roleCounts.STRATEGIST || 0} Strategist</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold gold-text mb-4 flex items-center gap-3">
            <span>⚡</span>
            Synergies
          </h3>
          {synergies.length > 0 ? (
            <ul className="space-y-3">
              {synergies.map((synergy, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-lg text-[#B8AFA3] p-3 rounded-lg bg-[#1A1612]/40 border border-[#D4AF37]/10"
                >
                  <span className="text-2xl">✨</span>
                  <span>{synergy}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-[#8B8278] italic">
              No mutual synergies detected between team members
            </p>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold gold-text mb-4 flex items-center gap-3">
            <span>⚠️</span>
            Composition Analysis
          </h3>
          {downsides.length > 0 ? (
            <ul className="space-y-3">
              {downsides.map((downside, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-lg text-[#B8AFA3] p-3 rounded-lg bg-[#8B7355]/10 border border-[#8B7355]/30"
                >
                  <span className="text-2xl text-[#C19A3F]">⚠</span>
                  <span>{downside}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 text-lg p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/10 to-[#C5A028]/10 border border-[#D4AF37]/30">
              <span className="text-2xl">✓</span>
              <span className="text-[#D4AF37] font-semibold">
                Well-balanced team composition!
              </span>
            </div>
          )}
        </div>

        <div className="pt-6 border-t-2 border-[#D4AF37]/20">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleVote}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 border-2 shadow-lg ${
                voted
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] border-[#D4AF37] text-[#0A0908] shadow-[0_0_30px_rgba(212,175,55,0.5)]'
                  : 'bg-[#1A1612] border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
              }`}
              aria-label={voted ? 'Remove upvote' : 'Upvote'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 4l7 8h-5v8H10v-8H5l7-8z" />
              </svg>
              <span>{voted ? 'Upvoted' : 'Upvote'}</span>
              <span
                className={`px-3 py-1 rounded-full text-base font-bold ${
                  voted
                    ? 'bg-[#0A0908]/30 text-[#0A0908]'
                    : 'bg-[#0F0D0A] border border-[#D4AF37]/20 text-[#D4AF37]'
                }`}
              >
                {upvotes}
              </span>
            </button>
            <span className="text-sm text-[#8B8278]">
              {voted ? 'Click again to remove your vote' : 'Show your support for this team'}
            </span>
          </div>

          {!user && (
            <div className="mt-4 text-sm text-[#D4AF37]">
              Please <Link className="underline" to="/login">log in</Link> to vote or comment.
            </div>
          )}
          {authMessage && (
            <div className="mt-4 text-sm text-[#C97A7A]">
              {authMessage}
            </div>
          )}
        </div>
      </div>

      <div className="glass p-10 rounded-3xl mb-12">
        <h3 className="text-3xl font-bold gold-text mb-8 flex items-center gap-3">
          <span>💬</span>
          Comments
        </h3>

        {comments.length > 0 ? (
          <div className="space-y-4 mb-8">
            {comments.map((c) => {
              const avatar = buildMediaUrl(c.user?.avatar_url);
              const initials = (c.user?.username || '?').slice(0, 2).toUpperCase();
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-xl bg-[#1A1612]/60 border border-[#D4AF37]/10 hover:border-[#D4AF37]/20 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden flex-shrink-0 bg-[#0F0D0A] flex items-center justify-center text-sm font-semibold text-[#D4AF37]">
                      {avatar ? (
                        <img src={avatar} alt={c.user?.username} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm text-[#8B8278] mb-2">
                        <span className="font-semibold text-[#D4AF37]">
                          {c.user?.username || 'Anonymous'}
                        </span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-base text-[#E8E6E3] leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-lg text-[#8B8278] mb-8 italic">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}

        <form
          onSubmit={submitComment}
          className="flex items-start gap-4 p-5 rounded-2xl bg-[#0F0D0A]/60 border border-[#D4AF37]/10"
        >
          <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden flex-shrink-0 bg-[#1A1612] flex items-center justify-center text-sm font-semibold text-[#D4AF37]">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt={user?.username || 'You'} className="w-full h-full object-cover" />
            ) : (
              currentUserInitials
            )}
          </div>

          <div className="flex-1 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              rows={3}
              placeholder={user ? 'Write a comment...' : 'Log in to comment'}
              disabled={!user}
              className={`w-full min-h-[120px] resize-none rounded-xl px-5 py-4 text-base text-[#F5F3F0] placeholder-[#8B8278] focus:outline-none transition-all duration-200 ${
                user
                  ? 'bg-[#1A1612] border-2 border-[#D4AF37]/20 focus:border-[#D4AF37] focus:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'bg-[#1A1612]/50 border-2 border-[#D4AF37]/10 cursor-not-allowed'
              }`}
            />
            <div className="flex items-center justify-between text-sm text-[#8B8278]">
              <span>Press Shift + Enter for a new line</span>
              <button
                disabled={commentSubmitting || !user}
                type="submit"
                className="px-8 py-3 rounded-xl btn-gold text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>

        {!user && (
          <div className="mt-4 text-sm text-[#D4AF37]">
            Have thoughts to share? <Link className="underline" to="/login">Log in</Link> to join the discussion.
          </div>
        )}
      </div>

      <div className="text-center">
        <Link
          to="/team-builder"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-full btn-gold text-xl font-bold shadow-2xl hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-all duration-300"
        >
          <span></span>
          Create Your Own Team
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export default TeamDetailPage;
