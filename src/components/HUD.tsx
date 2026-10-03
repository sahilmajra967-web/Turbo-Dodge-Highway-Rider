import React from 'react';
import { ActivePowerUps, GameLevel, GameStats, SpeedMode, TrackTheme, VehicleConfig } from '../types/game';
import { Volume2, VolumeX, Pause, Shield, Zap, Compass, Flame, Smartphone, Disc3, RotateCcw, MapPin } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HUDProps {
  stats: GameStats;
  powerUps: ActivePowerUps;
  vehicle: VehicleConfig;
  theme?: TrackTheme;
  speedMode?: SpeedMode;
  playerLevel?: number;
  isMuted: boolean;
  isBraking?: boolean;
  isRacing?: boolean;
  isRotatedLandscape?: boolean;
  onToggleRotateScreen?: () => void;
  tiltSteeringEnabled?: boolean;
  tiltAngle?: number;
  onToggleTiltSteering?: () => void;
  onSelectSpeedMode?: (mode: SpeedMode) => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  powerUps,
  vehicle,
  theme,
  speedMode = 'fast',
  playerLevel,
  isMuted,
  isBraking = false,
  isRacing = false,
  isRotatedLandscape = false,
  onToggleRotateScreen,
  tiltSteeringEnabled = false,
  tiltAngle = 0,
  onToggleTiltSteering,
  onSelectSpeedMode,
  onToggleMute,
  onPause,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 select-none z-10">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 max-w-[540px] mx-auto w-full">
        {/* Score & Multiplier & Player Level */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-lg shadow-lg">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Score</span>
              {playerLevel && (
                <span className="text-[9px] bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold px-1 rounded">
                  LVL {playerLevel}
                </span>
              )}
            </div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400 tabular-nums leading-none">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {stats.multiplier > 1 && (
            <div className="flex items-center text-xs font-bold text-sky-400 font-mono tracking-tight animate-pulse">
              {stats.multiplier}x
            </div>
          )}
        </div>

        {/* Distance & Coins */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-amber-400 text-sm">🪙</span>
            <span className="font-mono text-sm sm:text-base font-bold text-slate-100 tabular-nums">
              {stats.coins}
            </span>
          </div>

          <div className="hidden sm:flex bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums">
              {stats.distance} m
            </span>
          </div>

          {/* Controls: Rotate Screen, Gyro Steer, Audio & Pause */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Screen Rotate Mode Button */}
            {onToggleRotateScreen && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleRotateScreen();
                }}
                className={`p-2 rounded-lg border transition-all shadow-lg active:scale-95 flex items-center gap-1 ${
                  isRotatedLandscape
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                    : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                }`}
                title="Rotate Screen (Landscape / Portrait)"
                aria-label="Rotate Screen"
              >
                <Smartphone className={`w-4 h-4 ${isRotatedLandscape ? 'rotate-90 text-slate-950' : ''}`} />
                <span className="hidden sm:inline text-[10px] font-black uppercase">
                  {isRotatedLandscape ? 'LANDSCAPE' : 'ROTATE'}
                </span>
              </button>
            )}

            {/* Tilt / Gyro Rotate Steering Toggle */}
            {onToggleTiltSteering && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onToggleTiltSteering();
                }}
                className={`p-2 rounded-lg border transition-all shadow-lg active:scale-95 flex items-center gap-1 ${
                  tiltSteeringEnabled
                    ? 'bg-sky-500 text-slate-950 border-sky-300 font-bold'
                    : 'bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                }`}
                title="Rotate Phone to Steer (Gyro Tilt)"
                aria-label="Toggle Gyro Tilt Steering"
              >
                <Disc3 className={`w-4 h-4 ${tiltSteeringEnabled ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-[10px] font-black uppercase">
                  {tiltSteeringEnabled ? 'GYRO ON' : 'TILT'}
                </span>
              </button>
            )}

            <button
              onClick={onToggleMute}
              className="p-2 bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg transition-colors shadow-lg active:scale-95"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              className="p-2 bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg transition-colors shadow-lg active:scale-95"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Map Badge (Center-Top) */}
      {theme && (
        <div className="flex items-center justify-center my-0.5 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-amber-500/30 px-3 py-0.5 rounded-full shadow-md text-[11px] text-amber-300 font-bold">
            <span>🗺️</span>
            <span>{theme.name}</span>
          </div>
        </div>
      )}

      {/* Active Power-Up Badges (Center-Top) */}
      <div className="flex flex-col items-center gap-1.5 pointer-events-none">
        {powerUps.shield && (
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-md text-xs font-semibold shadow-lg animate-pulse">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHIELD ACTIVE</span>
          </div>
        )}

        {powerUps.nitro > 0 && (
          <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/50 text-sky-300 px-3 py-1 rounded-md text-xs font-semibold shadow-lg">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>NITRO {(powerUps.nitro / 1000).toFixed(1)}s</span>
          </div>
        )}

        {powerUps.magnet > 0 && (
          <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/50 text-purple-300 px-3 py-1 rounded-md text-xs font-semibold shadow-lg">
            <span className="text-purple-400 text-xs">🧲</span>
            <span>COIN MAGNET {(powerUps.magnet / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Bottom Telemetry: Speedometer & Vehicle Name */}
      <div className="flex items-end justify-between max-w-[540px] mx-auto w-full">
        {/* Speedometer & Active Status & In-Game Speed Selector */}
        <div className="flex flex-col gap-1.5 items-start">
          {/* Active Pedal & Gyro Indicators */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tiltSteeringEnabled && (
              <div className="bg-sky-950/90 border border-sky-400 text-sky-300 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider shadow-lg flex items-center gap-1.5">
                <Disc3 className="w-3 h-3 text-sky-400" />
                <span>ROTATE: {tiltAngle > 0 ? `+${tiltAngle}°` : `${tiltAngle}°`}</span>
              </div>
            )}

            {isRacing && (
              <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-300 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                <span>⚡</span>
                <span>RACING (ACCEL)</span>
              </div>
            )}

            {isBraking && (
              <div className="bg-rose-950/90 border border-rose-500 text-rose-300 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                <span>🛑</span>
                <span>BRAKING</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl shadow-xl flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-1">
                <span className={`font-mono text-2xl sm:text-3xl font-black tabular-nums leading-none ${
                  powerUps.nitro > 0
                    ? 'text-sky-400 animate-pulse'
                    : isRacing
                    ? 'text-emerald-400'
                    : stats.speedKmh > 260
                    ? 'text-rose-400'
                    : stats.speedKmh > 200
                    ? 'text-amber-400'
                    : 'text-slate-100'
                }`}>
                  {stats.speedKmh}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">km/h</span>
              </div>

              {/* In-Game Speed Mode Switcher (1X / 1.5X / 2X) */}
              {onSelectSpeedMode && (
                <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSelectSpeedMode('normal');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                      speedMode === 'normal'
                        ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Normal Speed (1X)"
                  >
                    1X
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSelectSpeedMode('fast');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                      speedMode === 'fast'
                        ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Fast Speed (1.5X)"
                  >
                    ⚡1.5X
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onSelectSpeedMode('extreme');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                      speedMode === 'extreme'
                        ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-300 animate-pulse'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Extreme Speed (2X)"
                  >
                    🔥2X
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-800/80 pt-1">
              <span className="truncate max-w-[110px]">{vehicle.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500">Speed Gear</span>
            </div>
          </div>
        </div>

        {/* Near Miss streak */}
        {stats.nearMisses > 0 && (
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">Dodges</span>
            <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
              {stats.nearMisses}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
