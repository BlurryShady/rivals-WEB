import { getRoleCounts, findMutualSynergies } from '../utils/teamInsights';

function TeamAnalysis({ selectedHeroes = [] }) {
  if (!selectedHeroes || selectedHeroes.length === 0) {
    return null;
  }

  const roleCounts = getRoleCounts(selectedHeroes);

  const vanguards = roleCounts.VANGUARD || 0;
  const duelists = roleCounts.DUELIST || 0;
  const strategists = roleCounts.STRATEGIST || 0;

  // Team composition analysis
  let compositionStatus = 'bad';
  let compositionMessage = '';

  if (vanguards === 0) {
    compositionStatus = 'bad';
    compositionMessage = 'No Vanguard! Team needs a tank.';
  } else if (strategists === 0) {
    compositionStatus = 'bad';
    compositionMessage = 'No Strategist! Team needs a healer.';
  } else if (vanguards >= 2 && duelists >= 2 && strategists >= 1) {
    compositionStatus = 'great';
    compositionMessage = 'Balanced 2-2-2 composition!';
  } else {
    compositionStatus = 'okay';
    compositionMessage = 'Workable composition.';
  }

  // Find synergies (heroes that work well together based on backend data)
  const synergies = findMutualSynergies(selectedHeroes);

  // Status colors
  const statusColors = {
    great: 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]',
    okay: 'bg-[#C19A3F]/20 border-[#C19A3F] text-[#C19A3F]',
    bad: 'bg-[#8B7355]/20 border-[#8B7355] text-[#8B7355]',
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-bold gold-text">Team Analysis</h3>

      {/* Composition Status */}
      <div className={`p-3 rounded-lg border ${statusColors[compositionStatus]}`}>
        <p className="text-xs font-medium">{compositionMessage}</p>
      </div>

      {/* Role Breakdown */}
      <div className="glass p-3 rounded-lg">
        <p className="text-xs font-medium text-[#9B8B7E] mb-2">Team Composition</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#E8E6E3]">Vanguards</span>
            <span className="text-[#D4AF37]">{vanguards}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#E8E6E3]">Duelists</span>
            <span className="text-[#D4AF37]">{duelists}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#E8E6E3]">Strategists</span>
            <span className="text-[#D4AF37]">{strategists}</span>
          </div>
        </div>
      </div>

      {/* Synergies */}
      {synergies.length > 0 && (
        <div className="glass p-3 rounded-lg">
          <p className="text-xs font-medium text-[#9B8B7E] mb-2">⚡ Synergies</p>
          <div className="space-y-1">
            {synergies.slice(0, 3).map((synergy, i) => (
              <p key={i} className="text-xs text-[#E8E6E3]">• {synergy}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamAnalysis;