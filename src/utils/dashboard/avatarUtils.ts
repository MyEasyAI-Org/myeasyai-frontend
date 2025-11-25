/**
 * Generates initials from a full name
 * Takes first letter of first name and last name
 */
export function getInitials(name: string): string {
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
