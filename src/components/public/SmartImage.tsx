import { useState } from 'react';

interface SmartImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

const FALLBACK_GRADIENT =
  'linear-gradient(135deg, #3B2D23 0%, #221913 55%, #B08A44 160%)';

export function SmartImage({ src, alt, className }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{ background: FALLBACK_GRADIENT }}
      >
        <span className="flex h-full w-full items-center justify-center font-display text-2xl text-gold-light/70">
          HOFÉ
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
