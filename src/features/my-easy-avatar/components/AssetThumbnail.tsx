import { memo, useState } from 'react';
import type { Asset } from '../store';
import { getAssetThumbnailURL } from '../store';

type NameFallbackProps = {
  asset: Asset;
};

// Fallback with name (no image)
const NameFallback = memo(({ asset }: NameFallbackProps) => {
  const getColorFromName = (name: string): string => {
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e', '#ef4444', '#f97316',
      '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const color = getColorFromName(asset.name);
  const displayName = asset.name.split('.')[0];

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${color}60 0%, ${color}30 100%)`,
      }}
    >
      <span className="text-white text-[10px] font-medium text-center px-1 drop-shadow-md leading-tight">
        {displayName}
      </span>
    </div>
  );
});

NameFallback.displayName = 'NameFallback';

type AssetThumbnailProps = {
  asset: Asset;
};

// Use PNG thumbnails from local files
export const AssetThumbnail = memo(({ asset }: AssetThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  const thumbnailUrl = getAssetThumbnailURL(asset);


  // If asset has thumbnail field, use it
  if (thumbnailUrl && !hasError) {
    return (
      <img
        src={thumbnailUrl}
        alt={asset.name}
        className="w-full h-full object-contain bg-gradient-to-br from-slate-800 to-slate-900"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback to name display
  return <NameFallback asset={asset} />;
});

AssetThumbnail.displayName = 'AssetThumbnail';
