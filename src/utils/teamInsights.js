// Shared helpers for team composition insights (role counts, synergies, sorting)
const normalizeHero = (entry) => {
  if (!entry) return null;
  return entry.hero || entry; // Handles both TeamMember objects and plain hero data
};

export const sortMembersByPosition = (members = []) =>
  members
    .slice()
    .sort((a, b) => (a?.position || 0) - (b?.position || 0));

export const getRoleCounts = (entries = []) => {
  return entries.reduce((acc, entry) => {
    const hero = normalizeHero(entry);
    if (!hero?.role) {
      return acc;
    }
    acc[hero.role] = (acc[hero.role] || 0) + 1;
    return acc;
  }, {});
};

export const findMutualSynergies = (entries = []) => {
  const heroes = entries.map(normalizeHero).filter(Boolean);
  const synergies = [];
  const seenPairs = new Set();

  for (let i = 0; i < heroes.length; i += 1) {
    for (let j = i + 1; j < heroes.length; j += 1) {
      const hero1 = heroes[i];
      const hero2 = heroes[j];
      if (!hero1?.synergies || !hero2?.synergies) {
        continue;
      }
      const hero1HasHero2 = hero1.synergies.includes(hero2.name);
      const hero2HasHero1 = hero2.synergies.includes(hero1.name);
      if (hero1HasHero2 && hero2HasHero1) {
        const key = [hero1.name, hero2.name].sort().join('::');
        if (!seenPairs.has(key)) {
          synergies.push(`${hero1.name} + ${hero2.name}`);
          seenPairs.add(key);
        }
      }
    }
  }

  return synergies;
};
