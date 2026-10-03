import { GameStats, LevelReward, PlayerProfile } from '../types/game';

export const LEVEL_MILESTONES: LevelReward[] = [
  {
    level: 1,
    title: 'Rookie Driver',
    coins: 0,
    gems: 0,
    perkDescription: 'Starting Highway Driver License',
    icon: '🔰',
  },
  {
    level: 2,
    title: 'Street Cruiser',
    coins: 500,
    gems: 10,
    perkDescription: '+5% Nitro acceleration boost & 500 bonus coins',
    icon: '⚡',
  },
  {
    level: 3,
    title: 'Highway Runner',
    coins: 1000,
    gems: 15,
    perkDescription: 'Unlock Hayabusa 1300R hyperbike discount & +1000 coins',
    icon: '🏍️',
  },
  {
    level: 4,
    title: 'Speed Demon',
    coins: 1500,
    gems: 25,
    perkDescription: 'Coin Magnet range boosted by +25%',
    icon: '🧲',
  },
  {
    level: 5,
    title: 'Turbo Specialist',
    coins: 2000,
    gems: 35,
    perkDescription: 'Access Bugatti Apex Hypercar & +2000 coins',
    icon: '🚀',
  },
  {
    level: 6,
    title: 'Apex Drifter',
    coins: 2500,
    gems: 40,
    perkDescription: 'Shield protective duration increased by +30%',
    icon: '🛡️',
  },
  {
    level: 7,
    title: 'Nitro Master',
    coins: 3000,
    gems: 50,
    perkDescription: 'Access Interceptor Police Pursuit Cruiser',
    icon: '🚔',
  },
  {
    level: 8,
    title: 'Expressway Elite',
    coins: 4000,
    gems: 60,
    perkDescription: '2X Score Combo Multipliers gain +50% faster',
    icon: '🔥',
  },
  {
    level: 9,
    title: 'Grand Prix Pro',
    coins: 5000,
    gems: 75,
    perkDescription: 'Extended high-speed stability & fuel saving',
    icon: '🏁',
  },
  {
    level: 10,
    title: 'Highway Legend',
    coins: 10000,
    gems: 100,
    perkDescription: 'Golden Legend Badge, Crown Avatar & Max Speed Cap Removed',
    icon: '👑',
  },
  {
    level: 11,
    title: 'Cyber Phantom',
    coins: 12000,
    gems: 120,
    perkDescription: 'Neon Afterburner trail effect & +15% coin magnetic reach',
    icon: '💠',
  },
  {
    level: 12,
    title: 'Vortex Champion',
    coins: 15000,
    gems: 140,
    perkDescription: 'Nitro recharge duration extended by +35%',
    icon: '🌀',
  },
  {
    level: 13,
    title: 'Storm Chaser',
    coins: 18000,
    gems: 160,
    perkDescription: 'Oil slick & rain hazard slip resistance +50%',
    icon: '⛈️',
  },
  {
    level: 14,
    title: 'Hyper Drifter',
    coins: 22000,
    gems: 180,
    perkDescription: 'Near-miss close call score reward multiplied by 3X',
    icon: '✨',
  },
  {
    level: 15,
    title: 'Asphalt Sovereign',
    coins: 26000,
    gems: 200,
    perkDescription: 'Rare diamond spawn rate doubled on all highways',
    icon: '💎',
  },
  {
    level: 16,
    title: 'Sound Barrier Breaker',
    coins: 30000,
    gems: 220,
    perkDescription: 'Vehicle top speed ceiling permanently boosted +25 km/h',
    icon: '🔊',
  },
  {
    level: 17,
    title: 'Night Velocity',
    coins: 35000,
    gems: 250,
    perkDescription: 'Shield power-up duration lasts +50% longer',
    icon: '🌌',
  },
  {
    level: 18,
    title: 'Immortal Racer',
    coins: 40000,
    gems: 300,
    perkDescription: 'Score multiplier combo builds twice as fast',
    icon: '🦅',
  },
  {
    level: 19,
    title: 'Grand Highway Emperor',
    coins: 50000,
    gems: 400,
    perkDescription: 'Super Magnetic Coin pull radius permanently unlocked',
    icon: '🔱',
  },
  {
    level: 20,
    title: 'Cosmic Apex Legend',
    coins: 100000,
    gems: 500,
    perkDescription: 'Celestial Mythic Crown, Mythic Vehicle Glow & Ultimate Mastery',
    icon: '🪐',
  },
];

export function getXpRequiredForLevel(level: number): number {
  return Math.round(level * 750 + (level > 3 ? (level - 3) * 350 : 0));
}

export function getTitleForLevel(level: number): string {
  const milestone = LEVEL_MILESTONES.find((m) => m.level === level);
  if (milestone) return milestone.title;
  if (level > 20) return `Cosmic Apex Tier ${level - 20}`;
  return 'Racer';
}

const STORAGE_KEY_LEVEL = 'turbo_player_level';
const STORAGE_KEY_XP = 'turbo_player_xp';
const STORAGE_KEY_NAME = 'turbo_player_name';
const STORAGE_KEY_DISTANCE = 'turbo_player_total_distance';
const STORAGE_KEY_RACES = 'turbo_player_total_races';
const STORAGE_KEY_COINS_EARNED = 'turbo_player_total_coins';

export function loadPlayerProfile(): PlayerProfile {
  try {
    const level = Math.max(1, Number(localStorage.getItem(STORAGE_KEY_LEVEL) || '3'));
    const xp = Math.max(0, Number(localStorage.getItem(STORAGE_KEY_XP) || '650'));
    const name = localStorage.getItem(STORAGE_KEY_NAME) || 'Player';
    const totalDistance = Number(localStorage.getItem(STORAGE_KEY_DISTANCE) || '14500');
    const totalRaces = Number(localStorage.getItem(STORAGE_KEY_RACES) || '12');
    const totalCoinsEarned = Number(localStorage.getItem(STORAGE_KEY_COINS_EARNED) || '12450');

    const xpRequired = getXpRequiredForLevel(level);

    return {
      name,
      level,
      xp,
      xpRequired,
      title: getTitleForLevel(level),
      totalDistance,
      totalRaces,
      totalCoinsEarned,
      unlockedPerks: LEVEL_MILESTONES.filter((m) => m.level <= level).map((m) => m.perkDescription),
    };
  } catch {
    return {
      name: 'Player',
      level: 3,
      xp: 650,
      xpRequired: 2250,
      title: 'Highway Runner',
      totalDistance: 14500,
      totalRaces: 12,
      totalCoinsEarned: 12450,
      unlockedPerks: [],
    };
  }
}

export function savePlayerProfile(profile: Partial<PlayerProfile>) {
  try {
    if (profile.level !== undefined) localStorage.setItem(STORAGE_KEY_LEVEL, String(profile.level));
    if (profile.xp !== undefined) localStorage.setItem(STORAGE_KEY_XP, String(profile.xp));
    if (profile.name !== undefined) localStorage.setItem(STORAGE_KEY_NAME, profile.name);
    if (profile.totalDistance !== undefined) localStorage.setItem(STORAGE_KEY_DISTANCE, String(profile.totalDistance));
    if (profile.totalRaces !== undefined) localStorage.setItem(STORAGE_KEY_RACES, String(profile.totalRaces));
    if (profile.totalCoinsEarned !== undefined) localStorage.setItem(STORAGE_KEY_COINS_EARNED, String(profile.totalCoinsEarned));
  } catch (err) {
    console.warn('Failed to save player profile to localStorage', err);
  }
}

export function calculateRaceXp(stats: GameStats): number {
  // Distance XP: 1 XP per 5m
  const distanceXp = Math.round(stats.distance * 0.2);
  // Near Miss XP: 50 XP per close call
  const nearMissXp = (stats.nearMisses || 0) * 50;
  // Coin XP: 5 XP per coin
  const coinXp = (stats.coins || 0) * 5;
  // Score bonus
  const scoreBonus = Math.min(200, Math.round(stats.score / 80));

  return Math.max(50, distanceXp + nearMissXp + coinXp + scoreBonus);
}

export function addXpToPlayer(earnedXp: number, stats?: GameStats): {
  profile: PlayerProfile;
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  reward?: LevelReward;
} {
  const current = loadPlayerProfile();
  const oldLevel = current.level;
  let newLevel = oldLevel;
  let newXp = current.xp + earnedXp;
  let xpReq = current.xpRequired;
  let didLevelUp = false;

  while (newXp >= xpReq) {
    newXp -= xpReq;
    newLevel += 1;
    xpReq = getXpRequiredForLevel(newLevel);
    didLevelUp = true;
  }

  const updatedProfile: PlayerProfile = {
    ...current,
    level: newLevel,
    xp: newXp,
    xpRequired: xpReq,
    title: getTitleForLevel(newLevel),
    totalDistance: current.totalDistance + (stats?.distance || 0),
    totalRaces: current.totalRaces + 1,
    totalCoinsEarned: current.totalCoinsEarned + (stats?.coins || 0),
    unlockedPerks: LEVEL_MILESTONES.filter((m) => m.level <= newLevel).map((m) => m.perkDescription),
  };

  savePlayerProfile(updatedProfile);

  const reward = didLevelUp ? LEVEL_MILESTONES.find((m) => m.level === newLevel) : undefined;

  return {
    profile: updatedProfile,
    didLevelUp,
    oldLevel,
    newLevel,
    reward,
  };
}
