import { getInitials } from '../../utils/dashboard/avatarUtils';

type AvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

export function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
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

  // If has avatar_url, display image
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  // Otherwise, display initials
  return (
    <div
      className={`${sizeClasses[size]} ${textSizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold`}
    >
      {getInitials(name)}
    </div>
  );
}
