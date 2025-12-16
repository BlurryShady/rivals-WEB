import { useMemo, useState } from "react";
import { buildMediaUrl } from "../utils/media";
import { getRoleCounts, findMutualSynergies } from "../utils/teamInsights";

function SaveTeamModal({ selectedHeroes = [], onClose, onSave }) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  // track broken images by hero id
  const [broken, setBroken] = useState(() => new Set());

  const roleCounts = getRoleCounts(selectedHeroes);
  const vanguards = roleCounts.VANGUARD || 0;
  const duelists = roleCounts.DUELIST || 0;
  const strategists = roleCounts.STRATEGIST || 0;

  let compositionStatus = "bad";
  let compositionMessage = "";
  const strengths = [];
  const weaknesses = [];

  if (vanguards === 0) {
    compositionStatus = "bad";
    compositionMessage = "No Vanguard! Team needs a tank.";
    weaknesses.push("No frontline protection");
  } else if (strategists === 0) {
    compositionStatus = "bad";
    compositionMessage = "No Strategist! Team needs a healer.";
    weaknesses.push("No healing or support");
  } else if (vanguards >= 2 && duelists >= 2 && strategists >= 1) {
    compositionStatus = "great";
    compositionMessage = "Balanced 2-2-2 composition!";
    strengths.push("Well-balanced team composition");
    strengths.push("Good mix of offense and defense");
  } else {
    compositionStatus = "okay";
    compositionMessage = "Workable composition.";
    strengths.push("Has essential roles covered");
  }

  if (duelists === 0) weaknesses.push("No Duelist - Lacks damage output");
  else if (duelists === 1) weaknesses.push("Only 1 Duelist - Poor damage output");

  const synergies = useMemo(() => findMutualSynergies(selectedHeroes), [selectedHeroes]);

  const getRoleIcon = (role) => {
    const icons = { VANGUARD: "🛡️", DUELIST: "⚔️", STRATEGIST: "✨" };
    return icons[role] || "❓";
  };

  const handleAccept = () => {
    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }
    onSave({ name: teamName, description });
  };

  const markBroken = (heroKey) => {
    setBroken((prev) => {
      const next = new Set(prev);
      next.add(heroKey);
      return next;
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: "48rem",
          width: "100%",
          borderRadius: "1rem",
          padding: "2rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold gold-text mb-2">Review Your Team</h2>
          <p className="text-sm text-[#9B8B7E]">Check team composition and confirm</p>
        </div>

        {/* Hero Row */}
        <div className="mb-8">
          <div className="flex justify-center gap-3">
            {selectedHeroes.map((hero, index) => {
              const key = hero.id ?? `${hero.name}-${index}`;
              const src = buildMediaUrl(hero.image_url ?? hero.image);
              const isBroken = broken.has(key);

              return (
                <div key={key} className="relative group">
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-[#1A1612] border border-[#D4AF37]/30 relative">
                    {src && !isBroken ? (
                      <img
                        src={src}
                        alt={hero.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => markBroken(key)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🦸
                      </div>
                    )}

                    <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#0A0A0A]/80 flex items-center justify-center text-sm">
                      {getRoleIcon(hero.role)}
                    </div>

                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0A0A0A] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                    {hero.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Analysis */}
        <div className="glass p-6 rounded-lg mb-6">
          <h3 className="text-lg font-bold gold-text mb-4">Team Analysis</h3>

          <div
            className={`p-3 rounded-lg mb-4 ${
              compositionStatus === "great"
                ? "bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]"
                : compositionStatus === "okay"
                ? "bg-[#C19A3F]/20 border border-[#C19A3F] text-[#C19A3F]"
                : "bg-[#8B7355]/20 border border-[#8B7355] text-[#8B7355]"
            }`}
          >
            <p className="text-sm font-medium">{compositionMessage}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm">
            {synergies.length > 0 && (
              <div>
                <p className="font-bold text-[#D4AF37] mb-2">⚡ Synergies:</p>
                <ul className="space-y-1 text-[#E8E6E3]">
                  {synergies.slice(0, 3).map((synergy, i) => (
                    <li key={i}>• {synergy}</li>
                  ))}
                </ul>
              </div>
            )}

            {strengths.length > 0 && (
              <div>
                <p className="font-bold text-[#D4AF37] mb-2">✓ Strengths:</p>
                <ul className="space-y-1 text-[#E8E6E3]">
                  {strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div>
                <p className="font-bold text-[#8B7355] mb-2">⚠ Weaknesses:</p>
                <ul className="space-y-1 text-[#9B8B7E]">
                  {weaknesses.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Team Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#E8E6E3] mb-2">
            Team Name *
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g., Dive Comp, Meta Team, My Dream Team"
            className="w-full px-4 py-3 rounded-lg bg-[#1A1612] border border-[#D4AF37]/20 text-[#E8E6E3] placeholder-[#9B8B7E] focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#E8E6E3] mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your team strategy..."
            rows={2}
            className="w-full px-4 py-3 rounded-lg bg-[#1A1612] border border-[#D4AF37]/20 text-[#E8E6E3] placeholder-[#9B8B7E] focus:outline-none focus:border-[#D4AF37] transition resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 py-3 rounded-full btn-gold font-medium text-lg gold-shine"
          >
            Accept & Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-[#252119] text-[#9B8B7E] hover:text-[#D4AF37] font-medium text-lg transition"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveTeamModal;
