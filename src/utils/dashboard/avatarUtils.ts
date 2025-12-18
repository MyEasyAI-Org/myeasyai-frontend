/**
 * Generates initials from a name
 * - Single word (ex: "Jonny") → "J"
 * - Multiple words (ex: "Jonny Zin") → "JZ"
 */
export function getInitials(name: string): string {
  const names = name.trim().split(' ').filter(Boolean);
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return names[0]?.[0]?.toUpperCase() || '';
}
