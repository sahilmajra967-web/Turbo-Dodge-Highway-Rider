import React, { useState } from 'react';
import { VehicleConfig, SpeedMode, PlayerProfile, TrackTheme } from '../types/game';
import { VEHICLES, TRACK_THEMES, HIGHWAY_MAPS } from '../utils/vehicles';
import { PlayerProfileModal } from './PlayerProfileModal';
import { 
  Trophy, 
  Settings, 
  Gift, 
  Calendar, 
  Star, 
  Volume2, 
  VolumeX, 
  Play, 
  Plus, 
  Check, 
  X, 
  Flame, 
  Gauge, 
  ChevronRight,
  Disc3,
  Award,
  Smartphone,
  MapPin,
  Lock,
  Zap,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/audio';

import sunsetBg from '../assets/images/sunset_highway_bg_1790481819472.jpg';
import playerAvatar from '../assets/images/player_avatar_helmet_1790481830345.jpg';

interface GarageMenuProps {
  selectedVehicle: VehicleConfig;
  onSelectVehicle: (v: VehicleConfig) => void;
  speedMode: SpeedMode;
  onSelectSpeedMode: (s: SpeedMode) => void;
  selectedTheme: TrackTheme;
  onSelectTheme: (theme: TrackTheme) => void;
  playerProfile: PlayerProfile;
  onUpdatePlayerProfile: (profile: PlayerProfile) => void;
  isRotatedLandscape?: boolean;
  onToggleRotateScreen?: () => void;
  tiltSteeringEnabled?: boolean;
  onToggleTiltSteering?: () => void;
  onStartGame: () => void;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GarageMenu: React.FC<GarageMenuProps> = ({
  selectedVehicle,
  onSelectVehicle,
  speedMode = 'fast',
  onSelectSpeedMode,
  selectedTheme,
  onSelectTheme,
  playerProfile,
  onUpdatePlayerProfile,
  isRotatedLandscape = false,
  onToggleRotateScreen,
  tiltSteeringEnabled = false,
  onToggleTiltSteering,
  onStartGame,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  const [coins, setCoins] = useState<number>(12450);
  const [gems, setGems] = useState<number>(230);
  const [activeTab, setActiveTab] = useState<'Bike' | 'Car'>('Bike');
  const [activeModal, setActiveModal] = useState<'rank' | 'reward' | 'daily' | 'rate' | 'settings' | 'profile' | 'maps' | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  const bikes = VEHICLES.filter((v) => v.category === 'Bike');
  const cars = VEHICLES.filter((v) => v.category === 'Car');

  const displayedVehicles = activeTab === 'Bike' ? bikes : cars;

  const handleClaimReward = () => {
    sounds.playCoin();
    setCoins((c) => c + 500);
    setRewardClaimed(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none text-white font-sans flex flex-col justify-between">
      {/* 1. Cinematic Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={sunsetBg}
          alt="Turbo Race Sunset Highway"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />
      </div>

      {/* 2. Top Header Bar */}
      <div className="relative z-10 w-full px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Player Profile (Top Left - Interactive Button) */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveModal('profile');
          }}
          className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md border border-cyan-500/50 hover:border-cyan-300 px-3 py-1.5 rounded-xl shadow-lg shadow-cyan-950/40 cursor-pointer active:scale-95 transition-all text-left group"
          title="Click to view Player Profile & Level Perks"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-cyan-400 group-hover:border-cyan-300 shrink-0 shadow-sm">
            <img
              src={playerAvatar}
              alt="Player Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base leading-tight text-white tracking-wide group-hover:text-cyan-200 transition-colors">
                {playerProfile.name}
              </span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30">
                INFO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-cyan-300">
                Level {playerProfile.level}
              </span>
              <div className="w-14 sm:w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((playerProfile.xp / playerProfile.xpRequired) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </button>

        {/* Currency & Settings (Top Right) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Gold Coins */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-amber-500/50 rounded-xl pl-2 pr-1 py-1 text-xs sm:text-sm font-bold shadow-md">
            <span className="text-amber-400 text-sm sm:text-base mr-1.5">🟡</span>
            <span className="font-mono text-amber-200 tracking-wider tabular-nums">
              {coins.toLocaleString()}
            </span>
            <button
              onClick={() => {
                sounds.playCoin();
                setCoins((c) => c + 100);
              }}
              className="ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-90 text-slate-950 flex items-center justify-center font-black transition-all cursor-pointer"
              title="Add Coins"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Diamonds / Gems */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-xl pl-2 pr-1 py-1 text-xs sm:text-sm font-bold shadow-md">
            <span className="text-cyan-400 text-sm sm:text-base mr-1.5">💎</span>
            <span className="font-mono text-cyan-200 tracking-wider tabular-nums">
              {gems.toLocaleString()}
            </span>
            <button
              onClick={() => {
                sounds.playCoin();
                setGems((g) => g + 20);
              }}
              className="ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-90 text-slate-950 flex items-center justify-center font-black transition-all cursor-pointer"
              title="Add Diamonds"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Screen Rotate Mode Button */}
          {onToggleRotateScreen && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleRotateScreen();
              }}
              className={`h-8 sm:h-10 px-2 sm:px-3 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-lg cursor-pointer ${
                isRotatedLandscape
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-amber-500/20'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Rotate Screen (Landscape / Portrait)"
              aria-label="Rotate Screen Mode"
            >
              <Smartphone className={`w-4 h-4 ${isRotatedLandscape ? 'rotate-90 text-slate-950' : ''}`} />
              <span className="text-[11px] font-black uppercase hidden sm:inline">
                {isRotatedLandscape ? 'LANDSCAPE' : 'ROTATE'}
              </span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('settings');
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 3. Center Hero Stage (Logo, Taglines & Action Badges) */}
      <div className="relative z-10 w-full px-4 sm:px-6 flex-1 flex flex-col justify-between py-1.5 sm:py-3 max-w-7xl mx-auto">
        {/* Top Header Graphics: Logo on Left, Highway Sign on Right */}
        <div className="flex items-start justify-between w-full mt-1">
          {/* Dynamic Stylized Game Logo */}
          <div className="flex flex-col items-start drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
            <div className="relative">
              <div className="absolute -top-3 left-10 w-44 h-12 border-t-4 border-amber-400 rounded-t-full opacity-80 pointer-events-none filter blur-[1px]" />
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] flex items-center leading-none">
                TURBO
              </h1>
              <div className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 -mt-2 leading-none">
                RACE
              </div>
            </div>

            {/* Subtitle Badge */}
            <div className="mt-1 flex items-center gap-2 text-[10px] sm:text-xs font-black tracking-widest uppercase bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-full shadow-md text-amber-300">
              <span>RIDE</span>
              <span className="text-rose-500">•</span>
              <span>DODGE</span>
              <span className="text-rose-500">•</span>
              <span>WIN</span>
            </div>
          </div>

          {/* Right: Active Map & Best Record */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {/* Active Map Selector Badge */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveModal('maps');
              }}
              className="bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/80 hover:border-amber-300 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
              title="Select Highway Map (Track)"
            >
              <span className="text-xl">
                {HIGHWAY_MAPS.find((m) => m.id === selectedTheme.id)?.icon || '🗺️'}
              </span>
              <div className="flex flex-col items-start text-left">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">MAP (TRACK)</span>
                <span className="text-xs font-bold text-white group-hover:text-amber-200 truncate max-w-[130px]">
                  {selectedTheme.name}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Record Badge */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/50 px-3.5 py-1.5 rounded-xl shadow-lg">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">RECORD</span>
                <span className="font-mono text-xs sm:text-sm font-black text-amber-300 tabular-nums">
                  {highScore.toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Vertical Action Column */}
        <div className="absolute left-3 sm:left-6 top-28 sm:top-32 flex flex-col gap-2 z-20">
          {/* MAP */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('maps');
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 hover:bg-amber-950 border border-amber-500/80 hover:border-amber-400 flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all active:scale-95 text-amber-300 hover:text-white group cursor-pointer ring-1 ring-amber-400/40"
            title="Choose Highway Map"
          >
            <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-400" />
            <span className="text-[9px] font-black tracking-wider">MAP</span>
          </button>

          {/* RANK */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('rank');
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 hover:bg-sky-950 border border-sky-500/50 hover:border-sky-400 flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all active:scale-95 text-sky-300 hover:text-white group cursor-pointer"
          >
            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black tracking-wider">RANK</span>
          </button>

          {/* REWARD */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('reward');
            }}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 hover:bg-rose-950 border border-rose-500/50 hover:border-rose-400 flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all active:scale-95 text-rose-300 hover:text-white group cursor-pointer"
          >
            {!rewardClaimed && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
                1
              </span>
            )}
            <Gift className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black tracking-wider">REWARD</span>
          </button>

          {/* DAILY */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('daily');
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 hover:bg-indigo-950 border border-indigo-500/50 hover:border-indigo-400 flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all active:scale-95 text-indigo-300 hover:text-white group cursor-pointer"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black tracking-wider">DAILY</span>
          </button>

          {/* RATE US */}
          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('rate');
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center gap-0.5 shadow-xl transition-all active:scale-95 text-slate-300 hover:text-white group cursor-pointer"
          >
            <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black tracking-wider">RATE</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Cockpit Deck: Vehicle Selection Tabs, Speed Modes & Start Game */}
      <div className="relative z-10 w-full px-3 sm:px-6 pb-2.5 sm:pb-3 max-w-7xl mx-auto flex flex-col gap-2">
        {/* Category Switcher Tabs: 🏍️ BIKES vs 🏎️ CARS */}
        <div className="flex items-center justify-between gap-2 max-w-lg">
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('Bike');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Bike'
                  ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏍️ BIKES</span>
              <span className="text-[10px] opacity-80">({bikes.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('Car');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Car'
                  ? 'bg-rose-500 text-white shadow-md ring-1 ring-rose-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏎️ CARS</span>
              <span className="text-[10px] opacity-80">({cars.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveModal('maps');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
            title="Change Map / Highway Track"
          >
            <span>🗺️ MAP:</span>
            <span className="font-extrabold text-amber-400 truncate max-w-[90px] sm:max-w-none">{selectedTheme.name}</span>
          </button>
        </div>

        {/* Main Deck Container */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-2.5">
          {/* A. Vehicles Carousel / Grid (Shows 3 Bikes or 4 Cars) */}
          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-2.5">
            {displayedVehicles.slice(0, 3).map((v) => {
              const isSelected = selectedVehicle.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectVehicle(v);
                  }}
                  className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-md text-left ${
                    isSelected
                      ? 'bg-slate-950/95 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
                      SELECTED
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="w-full h-14 sm:h-16 flex items-center justify-center overflow-hidden rounded-lg mt-1">
                    {v.image ? (
                      <img
                        src={v.image}
                        alt={v.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                      />
                    ) : (
                      <span className="text-4xl">{v.icon}</span>
                    )}
                  </div>

                  <div className="w-full mt-1">
                    <div className="font-extrabold text-[11px] sm:text-xs text-white truncate">
                      {v.name}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                      <span className="font-mono text-amber-400 font-bold">{v.topSpeed} km/h</span>
                      <span className="text-slate-500">Agil {v.handling}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* B. Race Ki Speed (Gati) Selector Box */}
          <div className="lg:w-80 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="font-black text-xs uppercase tracking-wider text-slate-200">
                RACE SPEED (GATI)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Normal */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectSpeedMode('normal');
                }}
                className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  speedMode === 'normal'
                    ? 'bg-slate-800 border-sky-400 shadow-md ring-1 ring-sky-400 text-sky-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] font-bold">1X</span>
                <span className="text-[9px] font-mono opacity-80">Normal</span>
              </button>

              {/* Fast */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectSpeedMode('fast');
                }}
                className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  speedMode === 'fast'
                    ? 'bg-amber-950/80 border-amber-400 shadow-md ring-1 ring-amber-400 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] font-black text-amber-400">⚡1.5X</span>
                <span className="text-[9px] font-mono opacity-80">Fast</span>
              </button>

              {/* Extreme */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectSpeedMode('extreme');
                }}
                className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  speedMode === 'extreme'
                    ? 'bg-rose-950/80 border-rose-500 shadow-md ring-1 ring-rose-500 text-rose-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] font-black text-rose-400">🔥2X</span>
                <span className="text-[9px] font-mono opacity-80">Turbo</span>
              </button>
            </div>
          </div>

          {/* C. Giant START GAME Button */}
          <div className="lg:w-64 flex items-stretch">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onStartGame();
              }}
              className="relative w-full py-3.5 sm:py-0 min-h-[54px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl transition-all shadow-2xl shadow-amber-500/40 active:scale-95 flex items-center justify-center gap-2.5 overflow-hidden cursor-pointer group border-2 border-amber-200"
            >
              <div className="absolute right-0 top-0 bottom-0 w-8 opacity-30 bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:10px_10px] pointer-events-none" />

              <Play className="w-6 h-6 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
              <span className="tracking-tighter italic uppercase drop-shadow-sm">
                START GAME
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MODALS */}

      {/* MAP SELECTION MODAL */}
      {activeModal === 'maps' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/70 rounded-3xl p-5 max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-xl text-white">Select Highway Map (Track)</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Apna manpasand highway track aur mausam chunein. Har map ka road aur sky visual alag hota hai:
            </p>

            {/* Maps List */}
            <div className="my-3 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {HIGHWAY_MAPS.map((map) => {
                const isSelected = selectedTheme.id === map.id;
                const theme = TRACK_THEMES[map.id];
                return (
                  <div
                    key={map.id}
                    onClick={() => {
                      sounds.playClick();
                      if (theme) {
                        onSelectTheme(theme);
                      }
                      setActiveModal(null);
                    }}
                    className={`relative p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/60 border-slate-700 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{map.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{map.name}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                            {map.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{map.subtitle}</p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                            <span>🌤️</span> {map.weather}
                          </span>

                          {/* Mini Road Color Swatches */}
                          {theme && (
                            <div className="flex items-center gap-1 ml-1">
                              <span
                                className="w-3 h-3 rounded-full border border-white/30"
                                style={{ backgroundColor: theme.skyColor }}
                                title="Sky Color"
                              />
                              <span
                                className="w-3 h-3 rounded-full border border-white/30"
                                style={{ backgroundColor: theme.roadColor }}
                                title="Road Color"
                              />
                              <span
                                className="w-3 h-3 rounded-full border border-white/30"
                                style={{ backgroundColor: theme.stripeColor }}
                                title="Neon Stripes"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isSelected ? (
                        <div className="flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>ACTIVE</span>
                        </div>
                      ) : (
                        <button className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black px-3.5 py-1 rounded-xl transition-colors">
                          CHUNEIN
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl mt-1 cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* A. RANK / LEADERBOARD MODAL */}
      {activeModal === 'rank' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-lg text-white">Leaderboard & Rank</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">#1</span>
                  <span className="font-bold text-white">You (High Score)</span>
                </div>
                <span className="font-mono font-bold text-amber-300">{highScore.toLocaleString()} PTS</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#2</span>
                  <span>Racer_X</span>
                </div>
                <span className="font-mono font-semibold">18,420 PTS</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#3</span>
                  <span>SpeedDemon</span>
                </div>
                <span className="font-mono font-semibold">14,900 PTS</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-sky-500 text-slate-950 font-black rounded-xl hover:bg-sky-400 cursor-pointer"
            >
              CHALO RACE KAREIN!
            </button>
          </div>
        </div>
      )}

      {/* C. REWARD MODAL */}
      {activeModal === 'reward' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <Gift className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="font-black text-xl text-white">Daily Mystery Gift!</h3>
            <p className="text-slate-300 text-xs mt-1">Aaj ka free bonus prize claim karein:</p>
            <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-amber-300 font-bold text-lg">
              <span>🟡 +500 Coins</span>
            </div>

            <button
              onClick={() => {
                handleClaimReward();
                setActiveModal(null);
              }}
              disabled={rewardClaimed}
              className={`w-full py-3 rounded-xl font-black transition-all cursor-pointer ${
                rewardClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {rewardClaimed ? 'CLAIM HO GAYA' : 'CLAIM KAREIN'}
            </button>
          </div>
        </div>
      )}

      {/* D. DAILY MODAL */}
      {activeModal === 'daily' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-lg text-white">Daily Missions</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex flex-col gap-2.5">
              <div className="p-3 bg-slate-800/60 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Dodge 10 Cars</div>
                  <div className="text-slate-400 text-[10px]">Reward: 200 Coins</div>
                </div>
                <span className="text-emerald-400 font-black">ACTIVE</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Reach 2,000m Distance</div>
                  <div className="text-slate-400 text-[10px]">Reward: 5 Gems</div>
                </div>
                <span className="text-emerald-400 font-black">ACTIVE</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-400 cursor-pointer"
            >
              THEEK HAI
            </button>
          </div>
        </div>
      )}

      {/* E. RATE US MODAL */}
      {activeModal === 'rate' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex justify-center gap-1.5 text-amber-400 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-7 h-7 fill-amber-400" />
              ))}
            </div>
            <h3 className="font-black text-xl text-white mt-2">Rate Turbo Race!</h3>
            <p className="text-slate-300 text-xs mt-1">Khel pasand aaya? 5 star rating dein!</p>

            <button
              onClick={() => {
                sounds.playCoin();
                setActiveModal(null);
              }}
              className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
            >
              ⭐⭐⭐⭐⭐ RATE 5 STARS
            </button>
          </div>
        </div>
      )}

      {/* F. SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-300" />
                <h3 className="font-black text-lg text-white">Game Settings</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 flex flex-col gap-3">
              {/* Audio */}
              <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                  <span className="font-bold text-sm">Audio & Sound FX</span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onToggleMute();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {isMuted ? 'MUTED' : 'ON'}
                </button>
              </div>

              {/* Screen Rotate Mode */}
              {onToggleRotateScreen && (
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className={`w-5 h-5 ${isRotatedLandscape ? 'rotate-90 text-amber-400' : 'text-slate-300'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Rotate Screen Mode</span>
                      <span className="text-[10px] text-slate-400">Landscape widescreen racing</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onToggleRotateScreen();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      isRotatedLandscape ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isRotatedLandscape ? 'LANDSCAPE' : 'PORTRAIT'}
                  </button>
                </div>
              )}

              {/* Rotate to Steer */}
              {onToggleTiltSteering && (
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Disc3 className={`w-5 h-5 ${tiltSteeringEnabled ? 'text-sky-400 animate-spin' : 'text-slate-300'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Rotate Phone to Steer</span>
                      <span className="text-[10px] text-slate-400">Tilt phone left/right to steer</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onToggleTiltSteering();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                      tiltSteeringEnabled ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tiltSteeringEnabled ? 'ENABLED' : 'OFF'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* G. PLAYER PROFILE & LEVEL MODAL */}
      {activeModal === 'profile' && (
        <PlayerProfileModal
          profile={playerProfile}
          highScore={highScore}
          onClose={() => setActiveModal(null)}
          onUpdateProfile={onUpdatePlayerProfile}
        />
      )}
    </div>
  );
};
