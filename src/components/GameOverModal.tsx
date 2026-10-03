import React from 'react';
import { GameStats, PlayerProfile, VehicleConfig } from '../types/game';
import { RotateCcw, Home, Trophy, Coins, Compass, Sparkles, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  stats: GameStats;
  vehicle: VehicleConfig;
  playerProfile?: PlayerProfile;
  earnedXp?: number;
  didLevelUp?: boolean;
  onPlayAgain: () => void;
  onGoToGarage: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  vehicle,
  playerProfile,
  earnedXp = 0,
  didLevelUp = false,
  onPlayAgain,
  onGoToGarage,
}) => {
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="text-xs uppercase font-bold tracking-widest text-rose-500 mb-0.5">
            CRASHED · ACCIDENT
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isNewHighScore ? 'NEW RECORD!' : 'GAME OVER'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isNewHighScore
              ? 'Shabash! You achieved the highest score!'
              : 'Agli baar car ko bachate hue aur zyada distance cover karo!'}
          </p>
        </div>

        {/* Level Up Celebratory Banner */}
        {didLevelUp && playerProfile && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-2.5 rounded-xl font-black text-center shadow-lg animate-bounce flex items-center justify-center gap-2 border border-yellow-200">
            <span className="text-xl">🎉</span>
            <div className="text-xs uppercase tracking-wide">
              LEVEL UP! REACHED LEVEL {playerProfile.level} ({playerProfile.title})
            </div>
            <span className="text-xl">🏆</span>
          </div>
        )}

        {/* Big Score Display */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs uppercase font-medium text-slate-400">Total Score</div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tabular-nums my-0.5">
            {stats.score.toLocaleString()}
          </div>
          {stats.highScore > 0 && (
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Best:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {stats.highScore.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Player Level & XP Gain Bar */}
        {playerProfile && (
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="font-black text-white">Player Level {playerProfile.level}</span>
                <span className="text-[10px] text-cyan-300">({playerProfile.title})</span>
              </div>
              <span className="text-emerald-400 font-black text-xs">
                +{earnedXp.toLocaleString()} EXP
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((playerProfile.xp / playerProfile.xpRequired) * 100))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{playerProfile.xp} / {playerProfile.xpRequired} XP</span>
              <span>Next Lvl: Level {playerProfile.level + 1}</span>
            </div>
          </div>
        )}

        {/* Detailed Run Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
            <div className="text-slate-400 text-[10px]">Coins</div>
            <div className="font-mono font-bold text-sm sm:text-base text-amber-300 tabular-nums mt-0.5">
              {stats.coins}
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
            <div className="text-slate-400 text-[10px]">Distance</div>
            <div className="font-mono font-bold text-sm sm:text-base text-sky-300 tabular-nums mt-0.5">
              {stats.distance} m
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-2 rounded-lg">
            <div className="text-slate-400 text-[10px]">Close Calls</div>
            <div className="font-mono font-bold text-sm sm:text-base text-emerald-300 tabular-nums mt-0.5">
              {stats.nearMisses}
            </div>
          </div>
        </div>

        {/* Vehicle Used */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-t border-slate-800/80 pt-2.5">
          <span>Vehicle Driven</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <span>{vehicle.icon}</span>
            <span>{vehicle.name}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onGoToGarage();
            }}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>GARAGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
