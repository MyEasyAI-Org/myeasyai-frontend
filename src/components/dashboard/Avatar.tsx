import { getInitials } from '../../utils/dashboard/avatarUtils';

type AvatarProps = {
  name: string;
  displayName?: string | null; // preferred_name or nickname to use for initials
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

// Check if avatar URL is a real photo or just a Google default placeholder
const isRealAvatar = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // Google default avatars contain these patterns
  if (url.includes('default-user') || url.includes('=s96-c')) return false;
  // UI Avatars or similar placeholder services
  if (url.includes('ui-avatars.com')) return false;
  // DiceBear or similar placeholder services
  if (url.includes('dicebear') || url.includes('avatars.dicebear')) return false;
  return true;
};

export function Avatar({ name, displayName, avatarUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-3xl',
  };

  // If has real avatar_url (not a placeholder), display image
  if (isRealAvatar(avatarUrl)) {
    return (
      <img
        src={avatarUrl!}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  // Otherwise, display initials (use displayName if available, otherwise name)
  const initialsName = displayName ?? name;
  return (
    <div
      className={`${sizeClasses[size]} ${textSizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-bold`}
    >
      {getInitials(initialsName)}
    </div>
  );
}
