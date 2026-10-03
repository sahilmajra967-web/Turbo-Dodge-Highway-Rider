import React from 'react';
import { ArrowLeft, ArrowRight, Flame, ShieldAlert } from 'lucide-react';

interface MobileControlsProps {
  onControlChange: (action: 'left' | 'right' | 'boost' | 'brake', active: boolean) => void;
  isNitroActive: boolean;
  isRacingActive?: boolean;
  isBrakingActive?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onControlChange,
  isNitroActive,
  isRacingActive = false,
  isBrakingActive = false,
}) => {
  return (
    <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-3 sm:px-4 max-w-[520px] mx-auto pointer-events-none select-none z-20">
      {/* Steering Buttons (Left / Right) */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onControlChange('left', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onControlChange('left', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onControlChange('left', false);
          }}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 active:bg-sky-600/60 border border-slate-700/80 active:border-sky-400 text-slate-100 flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onControlChange('right', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onControlChange('right', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onControlChange('right', false);
          }}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/90 active:bg-sky-600/60 border border-slate-700/80 active:border-sky-400 text-slate-100 flex items-center justify-center shadow-xl backdrop-blur-md active:scale-95 transition-transform"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Pedals: BRAKE (Left) & RACE (Right) */}
      <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
        {/* Dedicated BRAKE Pedal */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onControlChange('brake', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onControlChange('brake', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onControlChange('brake', false);
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onControlChange('brake', false);
          }}
          className={`px-3 sm:px-4 h-13 sm:h-14 rounded-2xl border-2 flex items-center justify-center gap-1.5 shadow-xl backdrop-blur-md active:scale-95 transition-all select-none ${
            isBrakingActive
              ? 'bg-rose-600 border-rose-300 text-white scale-95 shadow-rose-500/40'
              : 'bg-rose-950/85 hover:bg-rose-900/80 border-rose-500/80 text-rose-200'
          }`}
          aria-label="Brake Pedal"
        >
          <span className="text-sm sm:text-base">🛑</span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">BRAKE</span>
        </button>

        {/* Dedicated RACE / ACCELERATOR Pedal */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onControlChange('boost', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onControlChange('boost', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onControlChange('boost', false);
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            onControlChange('boost', false);
          }}
          className={`px-3.5 sm:px-5 h-13 sm:h-14 rounded-2xl border-2 flex items-center justify-center gap-1.5 shadow-xl backdrop-blur-md active:scale-95 transition-all select-none ${
            isNitroActive
              ? 'bg-sky-500 border-sky-200 text-slate-950 font-black animate-pulse shadow-sky-500/50'
              : isRacingActive
              ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-black scale-95 shadow-emerald-500/50'
              : 'bg-emerald-950/85 hover:bg-emerald-900/80 border-emerald-500/80 text-emerald-200'
          }`}
          aria-label="Race Accelerator Pedal"
        >
          <span className="text-sm sm:text-base">{isNitroActive ? '⚡' : '🚀'}</span>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
              {isNitroActive ? 'NITRO' : 'RACE'}
            </span>
            <span className="text-[8px] sm:text-[9px] opacity-80 font-bold uppercase">
              {isNitroActive ? 'MAX' : 'SPEED'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
