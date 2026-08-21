import { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { QrCode } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QrCodeImageProps {
  url: string;
  /** Pixel size of the generated image. */
  size?: number;
  dark?: string;
  light?: string;
  /** Change to force regeneration (recreates the code). */
  nonce?: number;
  className?: string;
  onLoaded?: () => void;
  onError?: () => void;
}

/**
 * Renders a locally generated QR code (no external services).
 * Shows a shimmering skeleton while the code is being created.
 */
export function QrCodeImage({
  url,
  size = 320,
  dark = '#221913',
  light = '#FBF8F3',
  nonce = 0,
  className,
  onLoaded,
  onError,
}: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);

    toDataURL(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark, light },
    })
      .then((generated) => {
        if (cancelled) return;
        setDataUrl(generated);
        onLoaded?.();
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        onError?.();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, size, dark, light, nonce]);

  if (failed) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl bg-sand text-muted',
          className,
        )}
      >
        <QrCode size={30} strokeWidth={1.4} />
        <p className="px-4 text-center text-xs font-medium">QR error</p>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className={cn(
          'aspect-square w-full animate-pulse rounded-2xl bg-gradient-to-r from-sand via-border/60 to-sand bg-[length:400px_100%]',
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR ${url}`}
      className={cn('animate-fade-in rounded-2xl', className)}
    />
  );
}

/** Generates a high-resolution PNG data URL for downloads / printing. */
export async function generateQrDataUrl(
  url: string,
  size = 1024,
): Promise<string> {
  return toDataURL(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#221913', light: '#FFFFFF' },
  });
}
