import React, { useState } from 'react';
import { PlayerProfile } from '../types/game';
import { LEVEL_MILESTONES, savePlayerProfile } from '../utils/playerLevel';
import { X, Trophy, Compass, Award, Star, Check, Lock, Edit3, Shield, Zap, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

import playerAvatar from '../assets/images/player_avatar_helmet_1790481830345.jpg';

interface PlayerProfileModalProps {
  profile: PlayerProfile;
  highScore: number;
  onClose: () => void;
  onUpdateProfile: (updated: PlayerProfile) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  profile,
  highScore,
  onClose,
  onUpdateProfile,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const handleSaveName = () => {
    sounds.playClick();
    const trimmed = nameInput.trim() || 'Player';
    const updated = { ...profile, name: trimmed };
    savePlayerProfile({ name: trimmed });
    onUpdateProfile(updated);
    setIsEditingName(false);
  };

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpRequired) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border border-cyan-500/60 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[92vh] text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="font-black text-lg sm:text-xl text-white">Player License & Level</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 my-3 flex flex-col gap-4">
          {/* 1. Profile Avatar & Name Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-cyan-950/40">
            {/* Avatar with Level Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-md">
                <img
                  src={playerAvatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md border border-slate-900">
                LVL {profile.level}
              </div>
            </div>

            {/* Name, Title & Rename Option */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    maxLength={15}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-800 border border-cyan-400 rounded-lg px-2 py-1 text-sm font-bold text-white w-full outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-cyan-500 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-lg sm:text-xl text-white truncate">
                    {profile.name}
                  </h4>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-cyan-300 p-1 cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-cyan-300">{profile.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] font-semibold text-slate-400">Pro Driver</span>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>EXP Progress</span>
                  <span className="font-mono text-cyan-300">
                    {profile.xp.toLocaleString()} / {profile.xpRequired.toLocaleString()} XP ({xpPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Career Statistics Grid */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Career Statistics
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-semibold">Total Distance</div>
                <div className="font-mono font-bold text-sm text-sky-400 mt-0.5">
                  {profile.totalDistance.toLocaleString()} m
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-semibold">Best Record</div>
                <div className="font-mono font-bold text-sm text-amber-400 mt-0.5">
                  {highScore.toLocaleString()} pts
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-semibold">Races Driven</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
                  {profile.totalRaces}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-semibold">Total Coins</div>
                <div className="font-mono font-bold text-sm text-yellow-400 mt-0.5">
                  {profile.totalCoinsEarned.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Level Perks & Milestones Progression */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Level Unlocks & Perks
              </h5>
              <span className="text-[10px] text-cyan-400 font-bold">
                Level up by driving & dodging
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {LEVEL_MILESTONES.map((m) => {
                const isUnlocked = profile.level >= m.level;
                const isCurrent = profile.level === m.level;

                return (
                  <div
                    key={m.level}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{m.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-white">
                            Level {m.level}: {m.title}
                          </span>
                          {isCurrent && (
                            <span className="bg-cyan-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.perkDescription}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isUnlocked ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
