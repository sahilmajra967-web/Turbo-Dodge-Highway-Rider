export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type VehicleType = 'bike' | 'car' | 'muscle' | 'caferacer' | 'hypercar' | 'harley' | 'police';

export interface VehicleConfig {
  id: VehicleType;
  name: string;
  category: 'Bike' | 'Car';
  tagline: string;
  description: string;
  width: number;
  height: number;
  color: string;
  accentColor: string;
  topSpeed: number; // Base max speed in game units
  acceleration: number;
  handling: number; // Left/right agility
  hitboxScale: number; // 0.8 for bikes (easier to dodge), 0.9 for cars
  icon: string;
  image?: string;
  price?: number;
  unlocked?: boolean;
}

export type TrackThemeId = 'cyber' | 'desert' | 'storm' | 'sunset' | 'tokyo' | 'snow' | 'volcano' | 'coastal' | 'neon_valley' | 'hyperway';

export interface TrackTheme {
  id: TrackThemeId;
  name: string;
  skyColor: string;
  roadColor: string;
  stripeColor: string;
  shoulderColor: string;
  ambientColor: string;
  hazardColor: string;
}

export interface HighwayMap {
  id: TrackThemeId;
  name: string;
  subtitle: string;
  icon: string;
  badge: string;
  weather: string;
}

export interface GameLevel {
  id: number;
  name: string;
  subtitle: string;
  themeId: TrackThemeId;
  targetDistance: number; // in meters to complete level
  targetScore: number;
  rewardCoins: number;
  rewardDiamonds: number;
  unlocked: boolean;
  stars: number; // 0 to 3
  icon: string;
  badge: string;
}

export type CollectibleType = 'coin' | 'diamond' | 'nitro' | 'magnet' | 'shield';

export interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  value: number;
  rotation: number;
  pulse: number;
}

export type ObstacleType = 'truck' | 'sedan' | 'police' | 'barricade' | 'oil' | 'cone';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // Speed relative to road
  lane: number;
  color: string;
  accentColor?: string;
  hasLights?: boolean;
  passedPlayer?: boolean; // For near-miss scoring
  nearMissAwarded?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  type?: 'smoke' | 'spark' | 'flame' | 'star' | 'debris' | 'rain';
}

export type SpeedMode = 'normal' | 'fast' | 'extreme';
export type ScreenOrientationMode = 'portrait' | 'landscape';
export type SteeringMode = 'touch' | 'tilt';

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  xpRequired: number;
  title: string;
  totalDistance: number;
  totalRaces: number;
  totalCoinsEarned: number;
  unlockedPerks: string[];
}

export interface LevelReward {
  level: number;
  title: string;
  coins: number;
  gems: number;
  perkDescription: string;
  icon: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface ActivePowerUps {
  nitro: number; // Remaining time in ms
  magnet: number;
  shield: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  coins: number;
  distance: number; // In meters
  nearMisses: number;
  speedKmh: number;
  multiplier: number;
  combo: number;
  speedMode?: SpeedMode;
}
