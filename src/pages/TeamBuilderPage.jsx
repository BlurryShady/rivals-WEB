import { useState, useEffect } from 'react';
import { heroAPI, teamAPI } from '../api/client';
import TeamAnalysis from '../components/TeamAnalysis';
import SaveTeamModal from '../components/SaveTeamModal';
import { buildMediaUrl } from '../utils/media';

function TeamBuilderPage() {
  const [heroes, setHeroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('Modal state changed to:', showModal);
  }, [showModal]);

  useEffect(() => {
    async function fetchHeroes() {
      try {
        const response = await heroAPI.getAll();
        setHeroes(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching heroes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHeroes();
  }, []);

  const filteredHeroes =
    roleFilter === 'ALL' ? heroes : heroes.filter((hero) => hero.role === roleFilter);

  const handleSelectHero = (hero) => {
    if (selectedHeroes.find((h) => h.id === hero.id)) {
      setSelectedHeroes(selectedHeroes.filter((h) => h.id !== hero.id));
    } else if (selectedHeroes.length < 6) {
      setSelectedHeroes([...selectedHeroes, hero]);
    }
  };

  const handleSaveTeam = async (teamData) => {
    try {
      const payload = {
        name: teamData.name,
        description: teamData.description,
        members: selectedHeroes.map((hero, index) => ({
          hero_id: hero.id,
          position: index + 1,
        })),
      };

      console.log('Sending to API:', payload);
      const response = await teamAPI.create(payload);

      alert(`✅ Team "${teamData.name}" saved successfully!`);
      console.log('Saved team:', response.data);

      setSelectedHeroes([]);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('❌ Failed to save team. ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1
          className="text-5xl font-bold gold-text-shiny font-display mb-3"
          style={{
            textShadow: '0 0 40px rgba(212, 175, 55, 0.7), 0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          Team Builder
        </h1>
        <p className="text-lg text-[#B8AFA3]">
          Select 6 heroes to forge your ultimate team composition
          <span className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#C5A028]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold">
            {selectedHeroes.length}/6
          </span>
        </p>
      </div>

      <div className="flex flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex gap-4 mb-8 flex-wrap">
            {['ALL', 'VANGUARD', 'DUELIST', 'STRATEGIST'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`role-filter-btn ${roleFilter === role ? 'active' : ''}`}
              >
                {role === 'ALL'
                  ? ' All Heroes'
                  : role === 'VANGUARD'
                    ? ' Vanguard'
                    : role === 'DUELIST'
                      ? ' Duelist'
                      : ' Strategist'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
              <p className="text-[#B8AFA3] text-lg">Loading heroes...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHeroes.map((hero) => {
                const isSelected = selectedHeroes.some((h) => h.id === hero.id);

                // ✅ Always normalize to a usable URL (handles relative paths)
                const imageSrc = buildMediaUrl(hero.image_url ?? hero.image ?? hero.banner);

                return (
                  <div
                    key={hero.id}
                    onClick={() => handleSelectHero(hero)}
                    className={`
                      glass rounded-2xl cursor-pointer transition-all duration-300 relative
                      ${
                        isSelected
                          ? 'border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.5)] scale-[1.02]'
                          : 'border-2 border-[#D4AF37]/15 hover:border-[#D4AF37]/50 hover:scale-[1.01]'
                      }
                    `}
                  >
                    <div className="flex gap-5 p-5">
                      <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#1A1612] to-[#252119] border-2 border-[#D4AF37]/20 flex items-center justify-center">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={hero.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              // If a single image breaks, show placeholder
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '';
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}

                        {!imageSrc && (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🦸</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <h3
                            className="text-2xl font-bold text-[#F5F3F0] font-elegant"
                            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                          >
                            {hero.name}
                          </h3>
                          <span className="badge-role flex items-center gap-1.5 whitespace-nowrap">
                            <img
                              src={`/${hero.role.toLowerCase()}-icon.ico`}
                              alt={hero.role}
                              className="w-4 h-4"
                            />
                            {hero.role}
                          </span>
                        </div>

                        {hero.difficulty && (
                          <div className="flex items-center gap-3 mb-4">
                            <span className="category-label">DIFFICULTY</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                      i < hero.difficulty
                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                                        : 'bg-[#252119] border border-[#D4AF37]/20'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-[#D4AF37]">
                                ({hero.difficulty}/3)
                              </span>
                            </div>
                          </div>
                        )}

                        {hero.playstyle_tags && hero.playstyle_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hero.playstyle_tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1A1612]/80 text-[#B8AFA3] border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {hero.description && (
                          <p className="text-sm text-[#B8AFA3] leading-relaxed mb-4 italic">
                            {hero.description}
                          </p>
                        )}

                        {hero.counters && hero.counters.length > 0 && (
                          <div className="mb-4">
                            <p className="category-label mb-2 flex items-center gap-2">
                              <span></span>
                              COUNTERS (GOOD AGAINST)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {hero.counters.map((counter, idx) => (
                                <span key={idx} className="badge-counter">
                                  {counter}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {hero.synergies && hero.synergies.length > 0 && (
                          <div className="mb-2">
                            <p className="category-label mb-2 flex items-center gap-2">
                              <span></span>
                              SYNERGIES (WORKS WELL WITH)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {hero.synergies.map((synergy, idx) => (
                                <span key={idx} className="badge-synergy">
                                  {synergy}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside
          className="w-[420px] flex-shrink-0"
          style={{ position: 'sticky', top: '1.5rem', alignSelf: 'flex-start' }}
        >
          <div
            className="glass p-8 rounded-3xl border-2 border-[#D4AF37]/20"
            style={{ maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}
          >
            <h2 className="text-3xl font-bold gold-text mb-6 font-display">Your Team</h2>

            <div className="space-y-3 mb-8">
              {[...Array(6)].map((_, index) => {
                const hero = selectedHeroes[index];

                // ✅ Normalize image url for sidebar too
                const slotImg = hero ? buildMediaUrl(hero.image_url ?? hero.image ?? hero.banner) : null;

                return (
                  <div
                    key={index}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                      ${
                        hero
                          ? 'bg-gradient-to-r from-[#1A1612] to-[#252119] border-2 border-[#D4AF37]/30'
                          : 'bg-[#1A1612]/40 border-2 border-[#D4AF37]/10 border-dashed'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${
                          hero
                            ? 'bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-[#0A0908] shadow-lg'
                            : 'bg-[#252119] text-[#8B8278] border border-[#D4AF37]/20'
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    {hero ? (
                      <>
                        <div className="w-14 h-14 rounded-lg bg-[#252119] flex-shrink-0 overflow-hidden border-2 border-[#D4AF37]/30 flex items-center justify-center">
                          {slotImg ? (
                            <img
                              src={slotImg}
                              alt={hero.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '';
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🦸</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base text-[#F5F3F0] truncate">{hero.name}</p>
                          <p className="text-xs text-[#D4AF37] font-semibold">{hero.role}</p>
                        </div>
                        <button
                          onClick={() => handleSelectHero(hero)}
                          className="w-8 h-8 rounded-full bg-[#252119] text-[#9B8B7E] hover:bg-[#8B7355]/30 hover:text-[#D4AF37] transition-all flex items-center justify-center font-bold border border-[#D4AF37]/20"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 text-center py-2">
                        <p className="text-sm text-[#8B8278] font-semibold">Empty Slot</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => {
                  console.log('Save Team clicked, current heroes:', selectedHeroes.length);
                  setShowModal(true);
                }}
                disabled={selectedHeroes.length !== 6}
                className={`
                  w-full py-4 rounded-xl text-base font-bold transition-all duration-300
                  ${
                    selectedHeroes.length === 6
                      ? 'btn-gold shadow-2xl hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]'
                      : 'bg-[#252119] text-[#8B8278] border-2 border-[#D4AF37]/10 cursor-not-allowed'
                  }
                `}
              >
                {selectedHeroes.length === 6
                  ? '💾 Save Team'
                  : `🔒 Select ${6 - selectedHeroes.length} More Heroes`}
              </button>

              <button
                onClick={() => setSelectedHeroes([])}
                className="btn-premium w-full py-3 hover:bg-[#8B7355]/20 hover:text-[#D4AF37]"
              >
                🗑️ Clear Team
              </button>
            </div>

            <TeamAnalysis selectedHeroes={selectedHeroes} />
          </div>
        </aside>
      </div>

      {showModal && (
        <SaveTeamModal
          selectedHeroes={selectedHeroes}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
}

export default TeamBuilderPage;
