import React, { useEffect, useRef, useCallback } from 'react';
import { ActivePowerUps, Collectible, FloatingText, GameStats, Obstacle, Particle, SpeedMode, TrackTheme, VehicleConfig } from '../types/game';
import { sounds } from '../utils/audio';

interface GameCanvasProps {
  vehicle: VehicleConfig;
  theme: TrackTheme;
  speedMode?: SpeedMode;
  tiltSteerValue?: number;
  isPaused: boolean;
  onGameOver: (finalStats: GameStats) => void;
  onStatsUpdate: (stats: GameStats, powerUps: ActivePowerUps) => void;
  controlIntent: { left: boolean; right: boolean; boost: boolean; brake: boolean };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  vehicle,
  theme,
  speedMode = 'fast',
  tiltSteerValue = 0,
  isPaused,
  onGameOver,
  onStatsUpdate,
  controlIntent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tiltRef = useRef<number>(tiltSteerValue);

  useEffect(() => {
    tiltRef.current = tiltSteerValue;
  }, [tiltSteerValue]);

  // Game internal mutable state stored in ref for optimal 60fps performance
  const stateRef = useRef({
    // Virtual resolution
    vWidth: 480,
    vHeight: 800,
    roadLeft: 60,
    roadRight: 420,
    laneWidth: 90,

    // Player state
    player: {
      x: 240,
      y: 650,
      vx: 0,
      targetX: 240,
      tilt: 0,
      spin: 0, // Oil slick effect
    },

    // Road scroll
    roadOffset: 0,
    speed: 12, // Base speed
    targetSpeed: 12,
    distance: 0,
    score: 0,
    coins: 0,
    nearMisses: 0,
    multiplier: 1,
    combo: 0,

    // Power-ups
    powerUps: {
      nitro: 0,
      magnet: 0,
      shield: false,
    } as ActivePowerUps,

    // Entities
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    sceneryItems: [] as { y: number; side: 'left' | 'right'; type: 'lamp' | 'tree' | 'sign' }[],

    // Timing & spawns (smooth starting runway)
    lastObstacleSpawn: performance.now() + 1500,
    lastCoinSpawn: performance.now() + 600,
    lastPowerUpSpawn: performance.now() + 2500,
    cameraShake: 0,
    isDead: false,
    isBraking: false,
    nextId: 1,
  });

  // Touch / mouse drag controls directly on canvas
  const isPointerDownRef = useRef(false);

  // Sync engine sound on mount / unmount
  useEffect(() => {
    sounds.startEngine();
    return () => {
      sounds.stopEngine();
    };
  }, []);

  // Update engine sound pitch based on speed
  useEffect(() => {
    if (isPaused) {
      sounds.stopEngine();
    } else {
      sounds.startEngine();
    }
  }, [isPaused]);

  // Main Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to add particles
    const addExplosion = (x: number, y: number, color: string, count: number = 24) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: i % 2 === 0 ? color : '#f59e0b',
          alpha: 1,
          size: Math.random() * 4 + 2,
          life: 0,
          maxLife: 35 + Math.random() * 20,
          type: 'debris',
        });
      }
    };

    const addFloatingText = (text: string, x: number, y: number, color: string = '#fbbf24') => {
      stateRef.current.floatingTexts.push({
        id: stateRef.current.nextId++,
        text,
        x,
        y,
        color,
        alpha: 1,
        scale: 1,
        life: 0,
      });
    };

    // Pre-populate roadside scenery
    if (stateRef.current.sceneryItems.length === 0) {
      for (let y = -200; y < 1000; y += 120) {
        stateRef.current.sceneryItems.push({
          y,
          side: Math.random() > 0.5 ? 'left' : 'right',
          type: theme.id === 'cyber' ? 'lamp' : theme.id === 'desert' ? 'sign' : 'tree',
        });
      }
    }

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!isPaused && !s.isDead) {
        // --- 1. POWER-UP TIMERS ---
        if (s.powerUps.nitro > 0) {
          s.powerUps.nitro = Math.max(0, s.powerUps.nitro - dt * 1000);
        }
        if (s.powerUps.magnet > 0) {
          s.powerUps.magnet = Math.max(0, s.powerUps.magnet - dt * 1000);
        }

        // --- 2. SPEED & BRAKING CALCULATION ---
        const isBoosting = controlIntent.boost || s.powerUps.nitro > 0;
        const isBraking = controlIntent.brake && s.powerUps.nitro <= 0;
        s.isBraking = isBraking;

        // Speed Mode Multiplier:
        // 'normal' = 1.0x (Classic arcade speed ~180-210 km/h)
        // 'fast' = 1.35x (Fast high-speed highway ~240-280 km/h)
        // 'extreme' = 1.70x (Insane adrenaline blitz ~300-360 km/h)
        const modeMultiplier = speedMode === 'extreme' ? 1.7 : speedMode === 'fast' ? 1.35 : 1.0;

        const baseTopSpeed = (vehicle.topSpeed / 17) * modeMultiplier;
        const distanceBonus = Math.min(s.distance / 1000, 4.0) * modeMultiplier;

        if (s.powerUps.nitro > 0) {
          s.targetSpeed = (baseTopSpeed + distanceBonus) * 1.75; // Nitro super-speed
        } else if (isBoosting) {
          s.targetSpeed = (baseTopSpeed + distanceBonus) * 1.5; // High-throttle Race
        } else if (isBraking) {
          // POWERFUL HARD BRAKE:
          // Immediately target low crawl speed (2.2) so obstacles ahead can pull away!
          s.targetSpeed = 2.2;
        } else {
          s.targetSpeed = baseTopSpeed + distanceBonus;
        }

        // Fast acceleration and instant brake response!
        const speedRate = isBraking ? 0.32 : (isBoosting ? 0.22 : 0.09);
        s.speed += (s.targetSpeed - s.speed) * speedRate;

        // Physical vehicle weight transfer (slides back slightly under heavy braking)
        const targetPlayerY = isBraking ? 666 : (isBoosting ? 635 : 650);
        s.player.y += (targetPlayerY - s.player.y) * 0.15;

        // Tire skid smoke & brake screech sound when braking hard
        if (isBraking && s.speed > 3.0) {
          if (Math.random() < 0.22) {
            sounds.playBrake();
          }
          // Emit dual tire smoke puffs
          for (let k = 0; k < 2; k++) {
            s.particles.push({
              x: s.player.x + (k === 0 ? -vehicle.width * 0.35 : vehicle.width * 0.35),
              y: s.player.y + vehicle.height * 0.42,
              vx: (Math.random() - 0.5) * 1.6,
              vy: Math.random() * 2 + 1,
              color: '#94a3b8',
              alpha: 0.65,
              size: Math.random() * 3 + 2.5,
              life: 0,
              maxLife: 14,
              type: 'smoke',
            });
          }
        }

        const speedKmh = Math.round(s.speed * 16.5);

        // Update engine sound
        sounds.updateEnginePitch(s.speed / 20, s.powerUps.nitro > 0);

        // --- 3. PLAYER STEERING & DRIFT ---
        let steerInput = 0;
        if (controlIntent.left) steerInput -= 1;
        if (controlIntent.right) steerInput += 1;
        if (Math.abs(tiltRef.current) > 0.05) {
          steerInput += tiltRef.current;
        }
        steerInput = Math.max(-1, Math.min(1, steerInput));

        const handlingSpeed = (vehicle.handling * 0.95);
        if (s.player.spin > 0) {
          // Oil slick spin
          s.player.spin = Math.max(0, s.player.spin - dt);
          s.player.vx += (Math.random() - 0.5) * 4;
        } else {
          s.player.vx += steerInput * handlingSpeed * 0.4;
        }

        // Damping
        s.player.vx *= 0.82;
        s.player.x += s.player.vx;

        // Soft road boundaries with shoulder bounce
        const minX = s.roadLeft + vehicle.width / 2 + 6;
        const maxX = s.roadRight - vehicle.width / 2 - 6;

        if (s.player.x < minX) {
          s.player.x = minX;
          s.player.vx = 0;
        } else if (s.player.x > maxX) {
          s.player.x = maxX;
          s.player.vx = 0;
        }

        // Tilt calculation
        const targetTilt = (s.player.vx / handlingSpeed) * (vehicle.category === 'Bike' ? 0.38 : 0.12);
        s.player.tilt += (targetTilt - s.player.tilt) * 0.2;

        // Distance & passive score
        s.distance += s.speed * dt * 5;
        s.score += Math.round(s.speed * dt * s.multiplier * 2);

        // Road offset scroll
        s.roadOffset = (s.roadOffset + s.speed) % 80;

        // Camera shake decay
        if (s.cameraShake > 0) {
          s.cameraShake = Math.max(0, s.cameraShake - dt * 15);
        }

        // --- 4. SCENERY UPDATES ---
        s.sceneryItems.forEach((item) => {
          item.y += s.speed * 0.9;
          if (item.y > s.vHeight + 100) {
            item.y = -80;
            item.side = Math.random() > 0.5 ? 'left' : 'right';
          }
        });

        // --- 5. EXHAUST & SPEED PARTICLES ---
        if (Math.random() < (isBoosting ? 0.9 : 0.3)) {
          const isNitro = s.powerUps.nitro > 0;
          s.particles.push({
            x: s.player.x + (Math.random() - 0.5) * (vehicle.width * 0.5),
            y: s.player.y + vehicle.height / 2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 3 + s.speed * 0.4,
            color: isNitro ? '#38bdf8' : isBoosting ? '#f97316' : '#64748b',
            alpha: 0.8,
            size: isNitro ? 5 : isBoosting ? 4 : 3,
            life: 0,
            maxLife: 18,
            type: isNitro || isBoosting ? 'flame' : 'smoke',
          });
        }

        // --- 6. OBSTACLE SPAWNING & UPDATE ---
        const obstacleInterval = Math.max(1200 - Math.min(s.distance * 0.4, 600), 550);
        if (currentTime - s.lastObstacleSpawn > obstacleInterval) {
          s.lastObstacleSpawn = currentTime;

          // Pick random lane (0, 1, 2, 3)
          const lane = Math.floor(Math.random() * 4);
          const laneCenterX = s.roadLeft + lane * s.laneWidth + s.laneWidth / 2;

          // Decide obstacle type
          const rand = Math.random();
          let type: Obstacle['type'] = 'sedan';
          let obsW = 38;
          let obsH = 70;
          let obsSpeed = 4 + Math.random() * 3;
          let obsColor = '#f43f5e';
          let accent = '#9f1239';

          if (rand < 0.28) {
            // Heavy 18-wheeler truck
            type = 'truck';
            obsW = 48;
            obsH = 115;
            obsSpeed = 2 + Math.random() * 2;
            obsColor = '#334155';
            accent = '#e2e8f0';
          } else if (rand < 0.55) {
            // Yellow City Taxi
            type = 'sedan';
            obsW = 36;
            obsH = 68;
            obsSpeed = 4.5 + Math.random() * 3;
            obsColor = '#eab308';
            accent = '#ca8a04';
          } else if (rand < 0.72) {
            // Police cruiser
            type = 'police';
            obsW = 38;
            obsH = 72;
            obsSpeed = 6 + Math.random() * 2.5;
            obsColor = '#1e293b';
            accent = '#3b82f6';
          } else if (rand < 0.86) {
            // Road barricade
            type = 'barricade';
            obsW = 54;
            obsH = 26;
            obsSpeed = 0; // Stationary
            obsColor = '#ea580c';
            accent = '#ffffff';
          } else {
            // Oil slick
            type = 'oil';
            obsW = 44;
            obsH = 34;
            obsSpeed = 0;
            obsColor = '#172554';
            accent = '#0f172a';
          }

          s.obstacles.push({
            id: s.nextId++,
            type,
            x: laneCenterX,
            y: -120,
            width: obsW,
            height: obsH,
            speed: obsSpeed,
            lane,
            color: obsColor,
            accentColor: accent,
            hasLights: type === 'police',
          });
        }

        // Update obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          // Downward movement = player speed - obstacle relative speed
          obs.y += (s.speed - obs.speed);

          // Near Miss Detection
          if (!obs.nearMissAwarded && obs.y > s.player.y - 10 && obs.y < s.player.y + 40) {
            const dx = Math.abs(s.player.x - obs.x);
            const combinedHalfW = (vehicle.width + obs.width) / 2;
            // Passed very close (within 24px) but didn't crash
            if (dx > combinedHalfW && dx < combinedHalfW + 26) {
              obs.nearMissAwarded = true;
              s.nearMisses++;
              s.combo++;
              s.multiplier = Math.min(4, 1 + Math.floor(s.combo / 4));
              const pts = 50 * s.multiplier;
              s.score += pts;
              s.cameraShake = 4;
              sounds.playNearMiss();
              addFloatingText(`CLOSE CALL! +${pts}`, s.player.x, s.player.y - 40, '#38bdf8');
            }
          }

          // Check Player Collision
          const pBox = {
            left: s.player.x - (vehicle.width * vehicle.hitboxScale) / 2,
            right: s.player.x + (vehicle.width * vehicle.hitboxScale) / 2,
            top: s.player.y - (vehicle.height * vehicle.hitboxScale) / 2,
            bottom: s.player.y + (vehicle.height * vehicle.hitboxScale) / 2,
          };

          const oBox = {
            left: obs.x - (obs.width * 0.85) / 2,
            right: obs.x + (obs.width * 0.85) / 2,
            top: obs.y - (obs.height * 0.85) / 2,
            bottom: obs.y + (obs.height * 0.85) / 2,
          };

          const isColliding =
            pBox.left < oBox.right &&
            pBox.right > oBox.left &&
            pBox.top < oBox.bottom &&
            pBox.bottom > oBox.top;

          if (isColliding) {
            if (obs.type === 'oil') {
              // Spin out, don't crash
              s.player.spin = 0.8;
              s.cameraShake = 6;
              addFloatingText('OIL SLICK!', s.player.x, s.player.y - 30, '#94a3b8');
              s.obstacles.splice(i, 1);
              continue;
            }

            if (s.powerUps.nitro > 0) {
              // Nitro smash! Blasts obstacle to smithereens
              s.obstacles.splice(i, 1);
              addExplosion(obs.x, obs.y, obs.color, 28);
              s.cameraShake = 12;
              s.score += 200;
              sounds.playCrash();
              addFloatingText('BLAST! +200', obs.x, obs.y, '#38bdf8');
              continue;
            }

            if (s.powerUps.shield) {
              // Shield absorbs the blow
              s.powerUps.shield = false;
              s.obstacles.splice(i, 1);
              addExplosion(obs.x, obs.y, '#38bdf8', 18);
              s.cameraShake = 8;
              sounds.playShield(true);
              addFloatingText('SHIELD SAVED!', s.player.x, s.player.y - 35, '#38bdf8');
              continue;
            }

            // CRASH & GAME OVER
            s.isDead = true;
            s.cameraShake = 22;
            addExplosion(s.player.x, s.player.y, vehicle.color, 45);
            sounds.playCrash();

            // Save high score
            let curHigh = 0;
            try {
              curHigh = Number(localStorage.getItem('turbo_dodge_highscore') || '0');
              if (s.score > curHigh) {
                localStorage.setItem('turbo_dodge_highscore', String(s.score));
                curHigh = s.score;
              }
            } catch {
              curHigh = Math.max(curHigh, s.score);
            }

            const finalStats: GameStats = {
              score: s.score,
              highScore: Math.max(curHigh, s.score),
              coins: s.coins,
              distance: Math.round(s.distance),
              nearMisses: s.nearMisses,
              speedKmh,
              multiplier: s.multiplier,
              combo: s.combo,
            };

            setTimeout(() => {
              onGameOver(finalStats);
            }, 650);
            break;
          }

          // Remove off-screen obstacles
          if (obs.y > s.vHeight + 150) {
            s.obstacles.splice(i, 1);
          }
        }

        // --- 7. COLLECTIBLE SPAWNING & UPDATE ---
        const coinInterval = 850;
        if (currentTime - s.lastCoinSpawn > coinInterval) {
          s.lastCoinSpawn = currentTime;
          const lane = Math.floor(Math.random() * 4);
          const laneCenterX = s.roadLeft + lane * s.laneWidth + s.laneWidth / 2;

          // Spawn a chain of 3 to 4 coins in the lane
          const isDiamond = Math.random() < 0.18;
          const count = isDiamond ? 1 : 3;

          for (let c = 0; c < count; c++) {
            s.collectibles.push({
              id: s.nextId++,
              type: isDiamond ? 'diamond' : 'coin',
              x: laneCenterX,
              y: -80 - c * 48,
              width: isDiamond ? 24 : 22,
              height: isDiamond ? 24 : 22,
              collected: false,
              value: isDiamond ? 50 : 10,
              rotation: 0,
              pulse: 0,
            });
          }
        }

        // Rare Power-Up Spawning (Nitro, Magnet, Shield)
        const powerUpInterval = 7500;
        if (currentTime - s.lastPowerUpSpawn > powerUpInterval) {
          s.lastPowerUpSpawn = currentTime;
          const lane = Math.floor(Math.random() * 4);
          const laneCenterX = s.roadLeft + lane * s.laneWidth + s.laneWidth / 2;

          const pRand = Math.random();
          const pType: Collectible['type'] = pRand < 0.4 ? 'nitro' : pRand < 0.72 ? 'magnet' : 'shield';

          s.collectibles.push({
            id: s.nextId++,
            type: pType,
            x: laneCenterX,
            y: -100,
            width: 28,
            height: 28,
            collected: false,
            value: 0,
            rotation: 0,
            pulse: 0,
          });
        }

        // Update Collectibles
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const item = s.collectibles[i];
          item.y += s.speed;
          item.rotation += 0.05;
          item.pulse = (item.pulse + 0.1) % (Math.PI * 2);

          // Magnet Attraction
          if (s.powerUps.magnet > 0 && (item.type === 'coin' || item.type === 'diamond')) {
            const mdx = s.player.x - item.x;
            const mdy = s.player.y - item.y;
            const dist = Math.hypot(mdx, mdy);
            if (dist < 220) {
              const pullStrength = (1 - dist / 220) * 16;
              item.x += (mdx / dist) * pullStrength;
              item.y += (mdy / dist) * pullStrength;
            }
          }

          // Pickup check
          const distToPlayer = Math.hypot(s.player.x - item.x, s.player.y - item.y);
          if (distToPlayer < (vehicle.width / 2 + item.width / 2 + 10)) {
            item.collected = true;

            if (item.type === 'coin') {
              s.coins++;
              const pts = item.value * s.multiplier;
              s.score += pts;
              sounds.playCoin();
              addFloatingText(`+${pts}`, item.x, item.y, '#eab308');
            } else if (item.type === 'diamond') {
              s.coins += 5;
              const pts = item.value * s.multiplier;
              s.score += pts;
              sounds.playDiamond();
              addFloatingText(`DIAMOND +${pts}`, item.x, item.y, '#38bdf8');
            } else if (item.type === 'nitro') {
              s.powerUps.nitro = 4500; // 4.5 seconds
              s.cameraShake = 8;
              sounds.playNitro();
              addFloatingText('NITRO BOOST!', s.player.x, s.player.y - 45, '#38bdf8');
            } else if (item.type === 'magnet') {
              s.powerUps.magnet = 6000; // 6 seconds
              sounds.playDiamond();
              addFloatingText('MAGNET ON!', s.player.x, s.player.y - 45, '#a855f7');
            } else if (item.type === 'shield') {
              s.powerUps.shield = true;
              sounds.playShield(false);
              addFloatingText('SHIELD UP!', s.player.x, s.player.y - 45, '#10b981');
            }

            // Collect sparkles
            for (let k = 0; k < 8; k++) {
              const ang = Math.random() * Math.PI * 2;
              s.particles.push({
                x: item.x,
                y: item.y,
                vx: Math.cos(ang) * 3,
                vy: Math.sin(ang) * 3,
                color: item.type === 'diamond' ? '#38bdf8' : '#fbbf24',
                alpha: 1,
                size: 3,
                life: 0,
                maxLife: 20,
                type: 'star',
              });
            }

            s.collectibles.splice(i, 1);
            continue;
          }

          // Offscreen
          if (item.y > s.vHeight + 60) {
            s.collectibles.splice(i, 1);
          }
        }

        // --- 8. PARTICLES UPDATE ---
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // --- 9. FLOATING TEXTS UPDATE ---
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 1.4;
          ft.life += dt * 1000;
          ft.alpha = Math.max(0, 1 - ft.life / 1000);
          if (ft.life >= 1000) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Notify parent with stats periodically
        onStatsUpdate(
          {
            score: s.score,
            highScore: Number(localStorage.getItem('turbo_dodge_highscore') || '0'),
            coins: s.coins,
            distance: Math.round(s.distance),
            nearMisses: s.nearMisses,
            speedKmh,
            multiplier: s.multiplier,
            combo: s.combo,
          },
          s.powerUps
        );
      }

      // --- 10. CANVAS RENDERING (60 FPS) ---
      renderCanvas(ctx, s);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [vehicle, theme, isPaused, controlIntent, onGameOver, onStatsUpdate]);

  // Canvas drawing routines
  const renderCanvas = (
    ctx: CanvasRenderingContext2D,
    s: typeof stateRef.current
  ) => {
    const { vWidth, vHeight, roadLeft, roadRight, laneWidth, roadOffset } = s;

    // Responsive Canvas Resizing for Crisp DPI
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && canvasRef.current) {
      const dpr = window.devicePixelRatio || 1;
      const expectedW = Math.round(rect.width * dpr);
      const expectedH = Math.round(rect.height * dpr);
      if (canvasRef.current.width !== expectedW || canvasRef.current.height !== expectedH) {
        canvasRef.current.width = expectedW;
        canvasRef.current.height = expectedH;
      }
    }

    ctx.save();

    // Scale canvas to match virtual coordinates (480 x 800)
    const scaleX = ctx.canvas.width / vWidth;
    const scaleY = ctx.canvas.height / vHeight;
    ctx.scale(scaleX, scaleY);

    // Apply camera shake if any
    if (s.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.cameraShake;
      const shakeY = (Math.random() - 0.5) * s.cameraShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Off-Road Background / Verges
    ctx.fillStyle = theme.shoulderColor;
    ctx.fillRect(0, 0, vWidth, vHeight);

    // 2. Road Surface
    ctx.fillStyle = theme.roadColor;
    ctx.fillRect(roadLeft, 0, roadRight - roadLeft, vHeight);

    // Road Shoulder Curb Stripes (Red/White or Yellow/Black)
    const curbW = 10;
    const curbSegmentH = 40;
    const curbScroll = roadOffset % (curbSegmentH * 2);

    for (let y = -curbSegmentH * 2; y < vHeight + curbSegmentH * 2; y += curbSegmentH) {
      const isRed = Math.floor((y - curbScroll) / curbSegmentH) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
      // Left Curb
      ctx.fillRect(roadLeft - curbW, y + curbScroll, curbW, curbSegmentH);
      // Right Curb
      ctx.fillRect(roadRight, y + curbScroll, curbW, curbSegmentH);
    }

    // 3. Lane Dash Lines
    ctx.strokeStyle = theme.stripeColor;
    ctx.lineWidth = 4;
    ctx.setLineDash([32, 28]);
    ctx.lineDashOffset = -roadOffset;

    for (let lane = 1; lane < 4; lane++) {
      const lx = roadLeft + lane * laneWidth;
      ctx.beginPath();
      ctx.moveTo(lx, -40);
      ctx.lineTo(lx, vHeight + 40);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset line dash

    // 4. Scenery (Lamps / Signs / Palms on sides)
    s.sceneryItems.forEach((item) => {
      const sx = item.side === 'left' ? roadLeft - 32 : roadRight + 32;
      ctx.save();
      ctx.translate(sx, item.y);

      if (theme.id === 'cyber') {
        // Neon Streetlight
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -12, 6, 24);
        ctx.beginPath();
        ctx.arc(0, -12, 8, 0, Math.PI * 2);
        ctx.fillStyle = item.side === 'left' ? '#38bdf8' : '#ec4899';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fill();
      } else if (theme.id === 'desert') {
        // Desert Cactus
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-4, -18, 8, 36);
        ctx.fillRect(-12, -8, 8, 6);
        ctx.fillRect(-12, -14, 6, 8);
        ctx.fillRect(4, 0, 8, 6);
        ctx.fillRect(6, -6, 6, 8);
      } else {
        // Night Tree
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(2, -2, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 5. Headlight Glow on Road Ahead of Player
    if (!s.isDead) {
      ctx.save();
      const lightGrad = ctx.createRadialGradient(
        s.player.x,
        s.player.y - 80,
        15,
        s.player.x,
        s.player.y - 100,
        220
      );
      lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      lightGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
      lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.moveTo(s.player.x - 20, s.player.y - 20);
      ctx.lineTo(s.player.x - 110, s.player.y - 250);
      ctx.lineTo(s.player.x + 110, s.player.y - 250);
      ctx.lineTo(s.player.x + 20, s.player.y - 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw Collectibles
    s.collectibles.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);

      if (c.type === 'coin') {
        // 3D Spinning Gold Coin
        const squish = Math.cos(c.rotation);
        ctx.scale(Math.abs(squish) * 0.9 + 0.1, 1);

        // Gold outer ring
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Inner coin core
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        // Embossed dollar/star symbol
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-1.5, -5, 3, 10);
      } else if (c.type === 'diamond') {
        // Blue Crystalline Gem
        ctx.rotate(c.rotation * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, 0);
        ctx.closePath();

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (c.type === 'nitro') {
        // Nitrous Oxide Bottle
        ctx.beginPath();
        ctx.roundRect(-8, -14, 16, 28, 4);
        ctx.fillStyle = '#0284c7';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fill();

        // Silver nozzle
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-4, -18, 8, 4);

        // "N2O" label line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-5, -2, 10, 4);
      } else if (c.type === 'magnet') {
        // U-Magnet Power-Up
        ctx.beginPath();
        ctx.arc(0, -2, 12, Math.PI, 0, false);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#a855f7';
        ctx.shadowColor = '#d8b4fe';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Silver tips
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-15, -4, 6, 8);
        ctx.fillRect(9, -4, 6, 8);
      } else if (c.type === 'shield') {
        // Hexagonal Energy Shield Orb
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const px = Math.cos(a) * 14;
          const py = Math.sin(a) * 14;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });

    // 7. Draw Obstacles (Traffic & Roadblocks)
    s.obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'truck') {
        // 18-Wheeler Cargo Truck
        // Cab
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, 36, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 10, obs.width - 8, 12);

        // Long Cargo Trailer
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.roundRect(-obs.width / 2 + 2, -obs.height / 2 + 38, obs.width - 4, obs.height - 40, 3);
        ctx.fill();

        // Warning Hazard Stripes on Truck Tail
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 8, obs.width - 6, 6);
        ctx.fillStyle = '#000000';
        for (let i = -obs.width / 2 + 6; i < obs.width / 2 - 6; i += 8) {
          ctx.fillRect(i, obs.height / 2 - 8, 4, 6);
        }

        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 4, 6, 3);
        ctx.fillRect(obs.width / 2 - 9, obs.height / 2 - 4, 6, 3);
      } else if (obs.type === 'sedan' || obs.type === 'police') {
        // Car Body
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 8);
        ctx.fill();

        // Roof / Cabin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-obs.width / 2 + 4, -obs.height / 2 + 16, obs.width - 8, obs.height - 32, 4);
        ctx.fill();

        // Front Windshield
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-obs.width / 2 + 5, -obs.height / 2 + 18, obs.width - 10, 8);

        // Rear Windshield
        ctx.fillRect(-obs.width / 2 + 5, obs.height / 2 - 26, obs.width - 10, 7);

        // Taillights
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 4, 7, 3);
        ctx.fillRect(obs.width / 2 - 10, obs.height / 2 - 4, 7, 3);

        // Police emergency siren bar
        if (obs.hasLights) {
          const isRedFlash = Math.floor(Date.now() / 120) % 2 === 0;
          ctx.fillStyle = isRedFlash ? '#ef4444' : '#3b82f6';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 10;
          ctx.fillRect(-8, -4, 16, 7);
        }
      } else if (obs.type === 'barricade') {
        // Striped Construction Barricade
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        // Diagonal white stripes
        ctx.fillStyle = '#ffffff';
        for (let i = -obs.width / 2; i < obs.width / 2; i += 12) {
          ctx.beginPath();
          ctx.moveTo(i, -obs.height / 2);
          ctx.lineTo(i + 6, -obs.height / 2);
          ctx.lineTo(i - 2, obs.height / 2);
          ctx.lineTo(i - 8, obs.height / 2);
          ctx.fill();
        }

        // Warning lamps at ends
        const blink = Math.floor(Date.now() / 250) % 2 === 0;
        ctx.fillStyle = blink ? '#fbbf24' : '#78350f';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = blink ? 8 : 0;
        ctx.beginPath();
        ctx.arc(-obs.width / 2 + 4, 0, 5, 0, Math.PI * 2);
        ctx.arc(obs.width / 2 - 4, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'oil') {
        // Oil Slick
        ctx.beginPath();
        ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();

        // Rainbow oil sheen
        ctx.beginPath();
        ctx.ellipse(2, -1, obs.width / 3, obs.height / 3, -0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
      }

      ctx.restore();
    });

    // 8. Draw Player Vehicle
    if (!s.isDead) {
      ctx.save();
      ctx.translate(s.player.x, s.player.y);
      ctx.rotate(s.player.tilt);

      // Nitro Aura / Thruster Flames
      if (s.powerUps.nitro > 0) {
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-vehicle.width / 2 - 4, -vehicle.height / 2 - 4);
        ctx.lineTo(vehicle.width / 2 + 4, -vehicle.height / 2 - 4);
        ctx.lineTo(vehicle.width / 2 + 6, vehicle.height / 2 + 6);
        ctx.lineTo(-vehicle.width / 2 - 6, vehicle.height / 2 + 6);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      if (vehicle.category === 'Bike') {
        // --- 🏍️ BIKE RENDERING ---
        // Bike chassis body
        ctx.fillStyle = vehicle.color;
        ctx.beginPath();
        ctx.roundRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height, 7);
        ctx.fill();

        // Front tire
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, -vehicle.height / 2 - 4, 8, 12);

        // Rear tire
        ctx.fillRect(-5, vehicle.height / 2 - 10, 10, 14);

        // Windscreen
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-vehicle.width / 2 + 4, -vehicle.height / 2 + 8);
        ctx.lineTo(vehicle.width / 2 - 4, -vehicle.height / 2 + 8);
        ctx.lineTo(vehicle.width / 2 - 6, -vehicle.height / 2 + 20);
        ctx.lineTo(-vehicle.width / 2 + 6, -vehicle.height / 2 + 20);
        ctx.closePath();
        ctx.fill();

        // Rider (Helmet & Shoulders)
        // Helmet
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -4, 9, 0, Math.PI * 2);
        ctx.fill();

        // Helmet visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, -10, 12, 4);

        // Rider Jacket Shoulders
        ctx.fillStyle = vehicle.accentColor;
        ctx.beginPath();
        ctx.roundRect(-10, 6, 20, 14, 4);
        ctx.fill();

        // Taillight / Brake light
        if (s.isBraking) {
          ctx.fillStyle = '#ff0033';
          ctx.shadowColor = '#ff0033';
          ctx.shadowBlur = 24;
          ctx.fillRect(-6, vehicle.height / 2 - 4, 12, 6);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillRect(-4, vehicle.height / 2 - 3, 8, 4);
        }
      } else {
        // --- 🏎️ CAR / SUPERCAR RENDERING ---
        // Shadow underneath
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(-vehicle.width / 2 - 2, -vehicle.height / 2 + 3, vehicle.width + 4, vehicle.height, 6);
        ctx.fill();

        // Car Main Body
        ctx.fillStyle = vehicle.color;
        ctx.beginPath();
        ctx.roundRect(-vehicle.width / 2, -vehicle.height / 2, vehicle.width, vehicle.height, 8);
        ctx.fill();

        // Racing Stripes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -vehicle.height / 2, 3, vehicle.height);
        ctx.fillRect(1, -vehicle.height / 2, 3, vehicle.height);

        // Cabin Glass
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-vehicle.width / 2 + 4, -vehicle.height / 2 + 18, vehicle.width - 8, vehicle.height - 36, 4);
        ctx.fill();

        // Front Windshield Glass
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-vehicle.width / 2 + 6, -vehicle.height / 2 + 20, vehicle.width - 12, 10);

        // Rear Windshield Glass
        ctx.fillRect(-vehicle.width / 2 + 6, vehicle.height / 2 - 28, vehicle.width - 12, 8);

        // Side Mirrors
        ctx.fillStyle = vehicle.accentColor;
        ctx.fillRect(-vehicle.width / 2 - 3, -vehicle.height / 2 + 20, 3, 8);
        ctx.fillRect(vehicle.width / 2, -vehicle.height / 2 + 20, 3, 8);

        // Rear Spoiler Wing
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-vehicle.width / 2 + 2, vehicle.height / 2 - 4, vehicle.width - 4, 5);

        // Glowing Taillights / High Intensity Brake Lights
        if (s.isBraking) {
          ctx.fillStyle = '#ff0033';
          ctx.shadowColor = '#ff0033';
          ctx.shadowBlur = 24;
          ctx.fillRect(-vehicle.width / 2 + 2, vehicle.height / 2 - 4, 11, 6);
          ctx.fillRect(vehicle.width / 2 - 13, vehicle.height / 2 - 4, 11, 6);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillRect(-vehicle.width / 2 + 4, vehicle.height / 2 - 2, 8, 3);
          ctx.fillRect(vehicle.width / 2 - 12, vehicle.height / 2 - 2, 8, 3);
        }
      }

      // Energy Shield Bubble (Active Power-Up)
      if (s.powerUps.shield) {
        ctx.save();
        ctx.rotate((Date.now() / 400) % (Math.PI * 2));
        ctx.beginPath();
        const shieldR = Math.max(vehicle.width, vehicle.height) * 0.72;
        ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Magnet Aura
      if (s.powerUps.magnet > 0) {
        ctx.save();
        ctx.beginPath();
        const magR = Math.max(vehicle.width, vehicle.height) * 0.8;
        ctx.arc(0, 0, magR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // 9. Particles (Flame, Smoke, Debris, Stars)
    s.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'flame' || p.type === 'debris') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 10. Floating Text Notifications (+10, +50, CLOSE CALL!)
    s.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 11. High Speed Motion Blur & Speed Lines (when speeding fast or boosting)
    if (s.speed > 16 || s.powerUps.nitro > 0) {
      ctx.save();
      const lineCount = s.powerUps.nitro > 0 ? 14 : 7;
      ctx.strokeStyle = s.powerUps.nitro > 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < lineCount; i++) {
        const lx = roadLeft + Math.random() * (roadRight - roadLeft);
        const ly = Math.random() * vHeight;
        const len = 35 + Math.random() * 55;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + len);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  };

  // Direct touch/drag input on canvas for mobile convenience
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    updatePointerPosition(e);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    updatePointerPosition(e);
  }, []);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
  }, []);

  const updatePointerPosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const virtualX = (clientX / rect.width) * stateRef.current.vWidth;

    // Smoothly set player steering towards pointer
    const diff = virtualX - stateRef.current.player.x;
    stateRef.current.player.vx = Math.max(-12, Math.min(12, diff * 0.35));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full max-w-[520px] object-contain touch-none cursor-grab active:cursor-grabbing shadow-2xl"
        style={{ aspectRatio: '480 / 800' }}
      />
    </div>
  );
};
