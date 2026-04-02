// Predefined avatar styles using DiceBear API (Adventurer Neutral style)
const AVATAR_STYLES = [
  'adventurer-neutral',
  'bottts',
  'fun-emoji',
  'lorelei',
  'notionists',
  'open-peeps',
  'personas',
  'pixel-art',
] as const;

// 20 predefined seeds for consistent avatar generation
const AVATAR_SEEDS = [
  'Luna', 'Felix', 'Aria', 'Max', 'Nova', 'Leo', 'Sage', 'Kai',
  'Zara', 'Finn', 'Maya', 'Rio', 'Echo', 'Blaze', 'Ivy', 'Storm',
  'Jade', 'Phoenix', 'Ruby', 'Atlas',
] as const;

export interface AvatarOption {
  id: string;
  url: string;
  label: string;
}

export function getAvatarUrl(seed: string, style: string = 'adventurer-neutral'): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50`;
}

export function getRandomAvatar(): string {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  return getAvatarUrl(seed, style);
}

export function getAvatarOptions(): AvatarOption[] {
  const options: AvatarOption[] = [];
  const styles = ['adventurer-neutral', 'bottts', 'fun-emoji', 'lorelei'];
  const seeds = ['Luna', 'Felix', 'Aria', 'Max', 'Nova', 'Leo', 'Sage', 'Kai', 'Zara', 'Finn', 'Maya', 'Rio'];
  
  for (const style of styles) {
    for (const seed of seeds) {
      options.push({
        id: `${style}-${seed}`,
        url: getAvatarUrl(seed, style),
        label: `${seed}`,
      });
    }
  }
  return options;
}
