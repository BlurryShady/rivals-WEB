import { useMemo, useState } from "react";
import { buildMediaUrl } from "../utils/media";

function HeroCard({ hero, onSelect, isSelected }) {
  const roleColors = {
    VANGUARD: "border-[#8B7355] bg-[#8B7355]/10",
    DUELIST: "border-[#C19A3F] bg-[#C19A3F]/10",
    STRATEGIST: "border-[#D4AF37] bg-[#D4AF37]/10",
  };

  const roleColor = roleColors[hero.role] || "border-[#9B8B7E]";

  // Use new field first, but keep compatibility with old "image"
  const imageSrc = useMemo(
    () => buildMediaUrl(hero.image_url ?? hero.image),
    [hero]
  );

  // If image fails to load, show emoji fallback
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      onClick={() => onSelect(hero)}
      className={`
        card-elegant cursor-pointer transition-all duration-300 p-3 max-w-[280px] mx-auto
        ${isSelected ? "ring-2 ring-[#D4AF37] border-[#D4AF37]" : ""}
        ${isSelected ? "scale-95" : "hover:scale-105"}
      `}
    >
      {/* Hero Image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#1A1612]">
        {imageSrc && !imgFailed ? (
          <img
            src={imageSrc}
            alt={hero.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🦸
          </div>
        )}

        {/* Role badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold ${roleColor}`}
        >
          {hero.role}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-[#D4AF37]/20 flex items-center justify-center">
            <div className="text-[#D4AF37] text-4xl">✓</div>
          </div>
        )}
      </div>

      {/* Hero Info */}
      <div>
        <h3 className="font-semibold text-sm text-[#E8E6E3] mb-1">
          {hero.name}
        </h3>

        {/* Difficulty */}
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-1 w-4 rounded ${
                i < hero.difficulty ? "bg-[#D4AF37]" : "bg-[#9B8B7E]/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroCard;
