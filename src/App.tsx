import React, { useState, useEffect, useCallback } from 'react';
import { ActivePowerUps, GameStats, GameStatus, PlayerProfile, SpeedMode, TrackTheme, VehicleConfig } from './types/game';
import { TRACK_THEMES, VEHICLES } from './utils/vehicles';
import { loadPlayerProfile, addXpToPlayer, calculateRaceXp } from './utils/playerLevel';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { GarageMenu } from './components/GarageMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { MobileControls } from './components/MobileControls';
import { sounds } from './utils/audio';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleConfig>(VEHICLES[0]); // Default: Ninja 900 ZX Bike
  const [selectedTheme, setSelectedTheme] = useState<TrackTheme>(TRACK_THEMES.sunset);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('fast'); // Default: Fast 1.5x speed
  const [gameKey, setGameKey] = useState<number>(0);

  // Player Profile & Level Progression
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadPlayerProfile);
  const [lastEarnedXp, setLastEarnedXp] = useState<number>(0);
  const [didLevelUp, setDidLevelUp] = useState<boolean>(false);

  // Rotate Mode & Orientation States
  const [isRotatedLandscape, setIsRotatedLandscape] = useState<boolean>(false);
  const [tiltSteeringEnabled, setTiltSteeringEnabled] = useState<boolean>(false);
  const [tiltSteerValue, setTiltSteerValue] = useState<number>(0);
  const [tiltAngle, setTiltAngle] = useState<number>(0);

  const [isDevicePortrait, setIsDevicePortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return true;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('turbo_dodge_highscore') || '0');
    } catch {
      return 0;
    }
  });

  const [currentStats, setCurrentStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    coins: 0,
    distance: 0,
    nearMisses: 0,
    speedKmh: 0,
    multiplier: 1,
    combo: 0,
  });

  const [finalGameOverStats, setFinalGameOverStats] = useState<GameStats | null>(null);

  const [powerUps, setPowerUps] = useState<ActivePowerUps>({
    nitro: 0,
    magnet: 0,
    shield: false,
  });

  // User input control intent
  const [controlIntent, setControlIntent] = useState({
    left: false,
    right: false,
    boost: false,
    brake: false,
  });

  // Listen to viewport resize / physical device rotation
  useEffect(() => {
    const checkOrientation = () => {
      setIsDevicePortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Gyroscope / Tilt Steering Listener
  useEffect(() => {
    if (!tiltSteeringEnabled) {
      setTiltSteerValue(0);
      setTiltAngle(0);
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let raw = 0;
      if (isRotatedLandscape && isDevicePortrait) {
        raw = e.beta || 0;
      } else if (!isDevicePortrait) {
        raw = -(e.beta || 0);
      } else {
        raw = e.gamma || 0;
      }

      const clamped = Math.max(-30, Math.min(30, raw));
      if (Math.abs(clamped) < 3.0) {
        setTiltSteerValue(0);
        setTiltAngle(0);
      } else {
        const val = (clamped - Math.sign(clamped) * 3) / 27;
        setTiltSteerValue(val);
        setTiltAngle(Math.round(clamped));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [tiltSteeringEnabled, isRotatedLandscape, isDevicePortrait]);

  // Toggle Screen Rotate Mode (Landscape ↔ Portrait)
  const handleToggleRotateScreen = async () => {
    const nextState = !isRotatedLandscape;
    setIsRotatedLandscape(nextState);
    sounds.playClick();

    try {
      if (nextState) {
        if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          (screen.orientation as any).unlock();
        }
      }
    } catch {
      // Ignore orientation lock restrictions
    }
  };

  // Toggle Tilt Steering (Gyro)
  const handleToggleTiltSteering = async () => {
    sounds.playClick();
    if (!tiltSteeringEnabled) {
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        try {
          const res = await (DeviceOrientationEvent as any).requestPermission();
          if (res === 'granted') {
            setTiltSteeringEnabled(true);
          }
        } catch {
          setTiltSteeringEnabled(true);
        }
      } else {
        setTiltSteeringEnabled(true);
      }
    } else {
      setTiltSteeringEnabled(false);
      setTiltSteerValue(0);
      setTiltAngle(0);
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (status === 'PLAYING') {
          setStatus('PAUSED');
        } else if (status === 'PAUSED') {
          setStatus('PLAYING');
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        handleToggleRotateScreen();
        return;
      }

      if (status !== 'PLAYING') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setControlIntent((prev) => ({ ...prev, left: true }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setControlIntent((prev) => ({ ...prev, right: true }));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setControlIntent((prev) => ({ ...prev, boost: true }));
      } else if (
        e.key === 'ArrowDown' ||
        e.key === 's' ||
        e.key === 'S' ||
        e.key === ' ' ||
        e.key === 'Shift'
      ) {
        setControlIntent((prev) => ({ ...prev, brake: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setControlIntent((prev) => ({ ...prev, left: false }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setControlIntent((prev) => ({ ...prev, right: false }));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setControlIntent((prev) => ({ ...prev, boost: false }));
      } else if (
        e.key === 'ArrowDown' ||
        e.key === 's' ||
        e.key === 'S' ||
        e.key === ' ' ||
        e.key === 'Shift'
      ) {
        setControlIntent((prev) => ({ ...prev, brake: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, isRotatedLandscape]);

  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleStartGame = () => {
    setControlIntent({ left: false, right: false, boost: false, brake: false });
    setGameKey((k) => k + 1);
    setStatus('PLAYING');
  };

  const handleGameOver = (finalStats: GameStats) => {
    setFinalGameOverStats(finalStats);
    setHighScore((prev) => Math.max(prev, finalStats.score));

    // Calculate and add Player XP & Level
    const earned = calculateRaceXp(finalStats);
    const res = addXpToPlayer(earned, finalStats);
    setPlayerProfile(res.profile);
    setLastEarnedXp(earned);
    setDidLevelUp(res.didLevelUp);
    if (res.didLevelUp) {
      sounds.playPowerUp();
    }

    setStatus('GAME_OVER');
  };

  const handleStatsUpdate = (stats: GameStats, activePowerUps: ActivePowerUps) => {
    setCurrentStats(stats);
    setPowerUps(activePowerUps);
  };

  const handleMobileControl = (
    action: 'left' | 'right' | 'boost' | 'brake',
    active: boolean
  ) => {
    setControlIntent((prev) => ({ ...prev, [action]: active }));
  };

  const shouldApplyCssRotation = isRotatedLandscape && isDevicePortrait;

  const rotateStyles: React.CSSProperties = shouldApplyCssRotation
    ? {
        transform: 'rotate(90deg)',
        transformOrigin: 'center center',
        width: '100vh',
        height: '100vw',
        maxWidth: '100vh',
        maxHeight: '100vw',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-50vw',
        marginLeft: '-50vh',
        overflow: 'hidden',
      }
    : {
        width: '100%',
        height: '100%',
      };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center font-sans">
      <div
        style={rotateStyles}
        className="relative transition-all duration-300 flex flex-col items-center justify-center"
      >
        {status === 'MENU' && (
          <GarageMenu
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            speedMode={speedMode}
            onSelectSpeedMode={setSpeedMode}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            playerProfile={playerProfile}
            onUpdatePlayerProfile={setPlayerProfile}
            isRotatedLandscape={isRotatedLandscape}
            onToggleRotateScreen={handleToggleRotateScreen}
            tiltSteeringEnabled={tiltSteeringEnabled}
            onToggleTiltSteering={handleToggleTiltSteering}
            onStartGame={handleStartGame}
            highScore={highScore}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {status !== 'MENU' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Active Canvas Game View */}
            <GameCanvas
              key={gameKey}
              vehicle={selectedVehicle}
              theme={selectedTheme}
              speedMode={speedMode}
              tiltSteerValue={tiltSteerValue}
              isPaused={status !== 'PLAYING'}
              onGameOver={handleGameOver}
              onStatsUpdate={handleStatsUpdate}
              controlIntent={controlIntent}
            />

            {/* HUD Overlay */}
            <HUD
              stats={currentStats}
              powerUps={powerUps}
              vehicle={selectedVehicle}
              theme={selectedTheme}
              speedMode={speedMode}
              playerLevel={playerProfile.level}
              onSelectSpeedMode={setSpeedMode}
              isRotatedLandscape={isRotatedLandscape}
              onToggleRotateScreen={handleToggleRotateScreen}
              tiltSteeringEnabled={tiltSteeringEnabled}
              tiltAngle={tiltAngle}
              onToggleTiltSteering={handleToggleTiltSteering}
              isMuted={isMuted}
              isBraking={controlIntent.brake}
              isRacing={controlIntent.boost || powerUps.nitro > 0}
              onToggleMute={handleToggleMute}
              onPause={() => setStatus('PAUSED')}
            />

            {/* On-Screen Mobile Steering Controls */}
            {status === 'PLAYING' && (
              <MobileControls
                onControlChange={handleMobileControl}
                isNitroActive={powerUps.nitro > 0}
                isRacingActive={controlIntent.boost}
                isBrakingActive={controlIntent.brake}
              />
            )}

            {/* Pause Modal Overlay */}
            {status === 'PAUSED' && (
              <PauseModal
                onResume={() => setStatus('PLAYING')}
                onRestart={handleStartGame}
                onGoToGarage={() => setStatus('MENU')}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />
            )}

            {/* Game Over Modal Overlay */}
            {status === 'GAME_OVER' && finalGameOverStats && (
              <GameOverModal
                stats={finalGameOverStats}
                vehicle={selectedVehicle}
                playerProfile={playerProfile}
                earnedXp={lastEarnedXp}
                didLevelUp={didLevelUp}
                onPlayAgain={handleStartGame}
                onGoToGarage={() => setStatus('MENU')}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
