/**
 * Powerups Vs Minions - Core Game Engine
 * Plants vs. Zombies mechanics with Super Mario characters.
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Dimensions & Grid
        this.width = 960;
        this.height = 560;
        this.isPoolLevel = false;
        this.rows = 5;
        this.cols = 9;
        this.gridStartX = 90;
        this.gridStartY = 65;
        this.cellWidth = 84;
        this.cellHeight = 94;

        // Game State
        this.coins = 150;
        this.level = 1;          // Internal level index 1–10
        this.worldNum = 1;       // Always "1" for now (World 1)
        this.gameMode = 'story'; // 'story' or 'boss'
        this.isPaused = false;
        this.isGameOver = false;
        this.isVictory = false;
        this.gameSpeed = 1.0;
        this.gameTime = 0;
        this.lastTime = performance.now();

        // Selected Tool / Power-up
        this.selectedPowerUp = null;
        this.isShovelActive = false;
        this.mousePos = { x: 0, y: 0 };
        this.hoveredCell = { row: -1, col: -1 };

        // Collections (Dual-Layer: grid for power-ups, cloudGrid for Lakitu Clouds)
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.cloudGrid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.minions = [];
        this.paragoombas = [];
        this.projectiles = [];
        this.fallingCoins = [];
        this.particles = [];
        this.floatingTexts = [];
        this.lawnCleaners = [];
        this.hazardLanes = []; // Lane hazard telegraphs (e.g. Bowser fire breath)

        // Bowser Boss Reference
        this.bowser = null;

        // Wave Management
        this.waveTimer = 0;
        this.currentWave = 0;
        this.totalWaves = 5;
        this.waveInProgress = false;
        this.waveEnemiesToSpawn = [];
        this.waveSpawnTimer = 0;
        this.hugeWaveAnnounced = false;
        this.bannerText = '';
        this.bannerTimer = 0;

        // Natural Sky Coin Spawner
        this.skyCoinTimer = 5.0;

        // Power-ups Configuration
        this.powerUpConfigs = {
            fire_flower: {
                id: 'fire_flower',
                name: 'Fire Flower',
                cost: 100,
                cooldown: 7.5,
                hp: 300,
                description: 'Shoots fireballs at oncoming minions.'
            },
            superstar: {
                id: 'superstar',
                name: 'Superstar',
                cost: 50,
                cooldown: 7.5,
                hp: 300,
                description: 'Generates extra coins over time.'
            },
            super_mushroom: {
                id: 'super_mushroom',
                name: 'Super Mushroom',
                cost: 50,
                cooldown: 20.0,
                hp: 4000,
                description: 'Tough wall defense that shields other power-ups.'
            },
            bob_omb: {
                id: 'bob_omb',
                name: 'Bob-omb',
                cost: 150,
                cooldown: 35.0,
                hp: 300,
                description: 'Explodes after ~1 second, destroying minions in a 3x3 area.'
            },
            bullet_blaster: {
                id: 'bullet_blaster',
                name: 'Bullet Blaster',
                cost: 200,
                cooldown: 7.5,
                hp: 450,
                description: 'Fires 2 Bullet Bills at a time in rapid succession.'
            },
            ice_flower: {
                id: 'ice_flower',
                name: 'Ice Flower',
                cost: 175,
                cooldown: 7.5,
                hp: 300,
                description: 'Shoots iceballs that slow and damage minions.'
            },
            yoshi_egg: {
                id: 'yoshi_egg',
                name: 'Yoshi Egg',
                cost: 25,
                cooldown: 20.0,
                hp: 300,
                description: 'Takes ~14s to hatch into Baby Yoshi, then eats the first minion that steps on it!'
            },
            tanooki_leaf: {
                id: 'tanooki_leaf',
                name: 'Tanooki Leaf',
                cost: 100,
                cooldown: 7.5,
                hp: 300,
                description: 'Protects a 3x3 surrounding area from Paragoombas with a tail spin!'
            },
            lakitu_cloud: {
                id: 'lakitu_cloud',
                name: "Lakitu's Cloud",
                cost: 25,
                cooldown: 5.0,
                hp: 300,
                isAquaticCarrier: true,
                description: 'Plant on water tiles to allow other power-ups to be planted on top!'
            },
            frog_suit: {
                id: 'frog_suit',
                name: 'Frog Suit',
                cost: 25,
                cooldown: 20.0,
                hp: 300,
                isWaterOnly: true,
                description: 'Planted on water. Grabs an oncoming minion with its tongue and drags it under!'
            }
        };

        // Cooldown Trackers
        this.cooldowns = {};
        for (const key in this.powerUpConfigs) {
            this.cooldowns[key] = 0;
        }

        // Init
        this.initEvents();
        this.startLevel(1);

        // Start Loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    isWaterLane(row) {
        return this.isPoolLevel && (row === 2 || row === 3);
    }

    initLawnCleaners() {
        this.lawnCleaners = [];
        for (let r = 0; r < this.rows; r++) {
            const isWater = this.isWaterLane(r);
            this.lawnCleaners.push({
                row: r,
                x: 25,
                y: this.gridStartY + r * this.cellHeight + (this.cellHeight - 44) / 2,
                width: 44,
                height: 44,
                active: false,
                used: false,
                speed: 650,
                isPoolCleaner: isWater
            });
        }
    }

    // ---------------------------------------------------------------
    //  ADVENTURE LEVEL DEFINITIONS  (World 1, Levels 1-1 … 1-10)
    // ---------------------------------------------------------------
    static get LEVEL_DATA() {
        return [
            // idx 0 = unused
            null,
            // 1-1: Tutorial Plains — single lane intro
            { name: 'WORLD 1-1: TOADSTOOL PLAINS',   pool: false, rows: 1, waves: 3, startCoins: 150, music: 'normal',
              composition: (r) => {
                  if (r < 0.7) return 'goomba';
                  return 'koopa';
              }
            },
            // 1-2: Koopa Troop — 3 lanes
            { name: 'WORLD 1-2: KOOPA TROOP TRAIL',  pool: false, rows: 3, waves: 4, startCoins: 150, music: 'normal',
              composition: (r) => {
                  if (r < 0.45) return 'goomba';
                  if (r < 0.75) return 'koopa';
                  return 'koopa_armored';
              }
            },
            // 1-3: Paratroopa Flyby — full 5 lanes
            { name: 'WORLD 1-3: PARATROOPA SKIES',   pool: false, rows: 5, waves: 4, startCoins: 175, music: 'normal',
              composition: (r) => {
                  if (r < 0.30) return 'goomba';
                  if (r < 0.55) return 'koopa';
                  if (r < 0.75) return 'koopa_armored';
                  return 'paratroopa';
              }
            },
            // 1-4: Hammer Bros Advance
            { name: 'WORLD 1-4: HAMMER BROS ADVANCE', pool: false, rows: 5, waves: 5, startCoins: 175, music: 'normal',
              composition: (r) => {
                  if (r < 0.25) return 'goomba';
                  if (r < 0.45) return 'koopa';
                  if (r < 0.65) return 'koopa_armored';
                  if (r < 0.80) return 'paratroopa';
                  return 'hammer_bro';
              }
            },
            // 1-5: First Pool Level
            { name: 'WORLD 1-5: CHEEP CHEEP POOL',   pool: true, rows: 6, waves: 4, startCoins: 200, music: 'normal',
              composition: (r) => {
                  if (r < 0.35) return 'goomba';
                  if (r < 0.55) return 'koopa';
                  if (r < 0.72) return 'boo';
                  if (r < 0.88) return 'spiny';
                  return 'koopa_armored';
              }
            },
            // 1-6: Boo's Pool
            { name: "WORLD 1-6: BOO'S HAUNTED POOL",  pool: true, rows: 6, waves: 5, startCoins: 200, music: 'normal',
              composition: (r) => {
                  if (r < 0.25) return 'goomba';
                  if (r < 0.45) return 'koopa';
                  if (r < 0.65) return 'boo';
                  if (r < 0.82) return 'spiny';
                  return 'boom_boom';
              }
            },
            // 1-7: Shy Guy Lagoon
            { name: 'WORLD 1-7: SHY GUY SUNKEN LAGOON', pool: true, rows: 6, waves: 5, startCoins: 225, music: 'normal',
              composition: (r) => {
                  if (r < 0.25) return 'shy_guy';
                  if (r < 0.45) return 'boo';
                  if (r < 0.62) return 'hammer_bro';
                  if (r < 0.80) return 'boom_boom';
                  return 'koopa_armored';
              }
            },
            // 1-8: Paragoomba Raid
            { name: 'WORLD 1-8: PARAGOOMBA RAID',    pool: true, rows: 6, waves: 6, startCoins: 225, music: 'normal',
              composition: (r) => {
                  if (r < 0.20) return 'shy_guy';
                  if (r < 0.40) return 'boo';
                  if (r < 0.57) return 'hammer_bro';
                  if (r < 0.72) return 'boom_boom';
                  if (r < 0.87) return 'spiny';
                  return 'koopa_armored';
              }
            },
            // 1-9: Boom Boom's Pool Fortress
            { name: "WORLD 1-9: BOOM BOOM'S FORTRESS", pool: true, rows: 6, waves: 6, startCoins: 250, music: 'normal',
              composition: (r) => {
                  if (r < 0.18) return 'shy_guy';
                  if (r < 0.35) return 'boo';
                  if (r < 0.52) return 'hammer_bro';
                  if (r < 0.68) return 'boom_boom';
                  if (r < 0.82) return 'paratroopa';
                  return 'spiny';
              }
            },
            // 1-10: Bowser's Castle — FINAL BOSS
            { name: "WORLD 1-10: BOWSER'S CASTLE!", pool: false, rows: 5, waves: 1, startCoins: 350, music: 'boss',
              boss: true,
              composition: (r) => {
                  if (r < 0.20) return 'goomba';
                  if (r < 0.40) return 'shy_guy';
                  if (r < 0.60) return 'boo';
                  if (r < 0.80) return 'hammer_bro';
                  return 'boom_boom';
              }
            },
        ];
    }

    startLevel(levelNum) {
        this.level = levelNum;
        this.isGameOver = false;
        this.isVictory = false;

        const lvl = Game.LEVEL_DATA[levelNum] || Game.LEVEL_DATA[1];

        this.coins = lvl.startCoins;

        // --- Grid layout ---
        // Pool levels always use 6 rows with compressed cell height.
        // Grass levels use the row count from LEVEL_DATA (1, 3, or 5).
        // The grid is vertically centred within the full 5-lane play area
        // (gridStartY=65, cellHeight=94) so the lawn always looks balanced.
        const FULL_ROWS       = 5;    // Reference row count for centering
        const GRASS_CELL_H    = 94;
        const POOL_CELL_H     = 78;
        const GRASS_START_Y   = 65;
        const POOL_START_Y    = 64;

        if (lvl.pool) {
            this.isPoolLevel = true;
            this.rows        = 6;
            this.cellHeight  = POOL_CELL_H;
            this.gridStartY  = POOL_START_Y;
        } else {
            this.isPoolLevel = false;
            this.rows        = lvl.rows || FULL_ROWS;
            this.cellHeight  = GRASS_CELL_H;
            // Centre fewer lanes vertically inside the full 5-lane play area
            const laneOffset = Math.floor((FULL_ROWS - this.rows) / 2);
            this.gridStartY  = GRASS_START_Y + laneOffset * GRASS_CELL_H;
        }

        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.cloudGrid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.minions = [];
        this.paragoombas = [];
        this.projectiles = [];
        this.fallingCoins = [];
        this.particles = [];
        this.floatingTexts = [];
        this.hazardLanes = [];
        this.selectedPowerUp = null;
        this.isShovelActive = false;
        this.bowser = null;

        // Reset cooldowns
        for (const key in this.powerUpConfigs) {
            this.cooldowns[key] = 0;
        }
        this.initLawnCleaners();

        if (lvl.boss) {
            // Boss battle: spawn Bowser immediately, trickle minions
            this.totalWaves = 1;
            this.currentWave = 1;
            this.waveTimer = 3.0;
            this.gameMode = 'boss';
            this.spawnBowser();
        } else {
            this.totalWaves = lvl.waves;
            this.currentWave = 0;
            this.waveTimer = 8.0;
            this.gameMode = 'story';
        }
        this.waveInProgress = false;
        this.waveEnemiesToSpawn = [];
        this.waveSpawnTimer = 1.0;

        this.showBanner(lvl.name, 3.5);
        window.soundSystem.startMusic(lvl.music || 'normal');

        // Notify world map of current level
        if (typeof window.setWorldMapLevel === 'function') {
            window.setWorldMapLevel(levelNum);
        }

        this.updateHUD();
    }

    spawnBowser() {
        this.bowser = {
            x: this.width - 165,
            y: this.gridStartY + 110,
            width: 140,
            height: 200,
            maxHp: 6500,
            hp: 6500,
            actionTimer: 4.0,
            state: 'idle', // 'idle', 'charging_fire', 'firing', 'shell_spin', 'summoning'
            subTimer: 0,
            targetLane: 2,
            attackCharge: 0,
            shellSpinX: 0,
            shellSpinDir: 1,
            time: 0
        };
        window.soundSystem.playBowserRoar();
    }

    showBanner(text, duration = 2.5) {
        this.bannerText = text;
        this.bannerTimer = duration;
    }

    initEvents() {
        // Canvas Mouse Events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mousePos.x = (e.clientX - rect.left) * scaleX;
            this.mousePos.y = (e.clientY - rect.top) * scaleY;

            // Update hovered cell
            const col = Math.floor((this.mousePos.x - this.gridStartX) / this.cellWidth);
            const row = Math.floor((this.mousePos.y - this.gridStartY) / this.cellHeight);

            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                this.hoveredCell = { row, col };
            } else {
                this.hoveredCell = { row: -1, col: -1 };
            }

            // Auto-collect coins on hover for smooth responsiveness
            this.checkCoinCollection(this.mousePos.x, this.mousePos.y, 28);
        });

        this.canvas.addEventListener('click', (e) => {
            window.soundSystem.ensureContext();
            const { row, col } = this.hoveredCell;

            // 1. Check if clicking on falling coins first
            if (this.checkCoinCollection(this.mousePos.x, this.mousePos.y, 40)) {
                return;
            }

            // 2. Handle Shovel Action
            if (this.isShovelActive) {
                if (row >= 0 && col >= 0) {
                    if (this.grid[row] && this.grid[row][col]) {
                        // Dig up top power-up
                        this.grid[row][col] = null;
                        window.soundSystem.playShovel();
                        this.createSparks(this.gridStartX + col * this.cellWidth + 40, this.gridStartY + row * this.cellHeight + this.cellHeight / 2, '#8b5a2b', 12);
                        this.isShovelActive = false;
                        this.updateSeedCardSelection();
                    } else if (this.cloudGrid[row] && this.cloudGrid[row][col]) {
                        // Dig up Lakitu Cloud
                        this.cloudGrid[row][col] = null;
                        window.soundSystem.playShovel();
                        this.createSparks(this.gridStartX + col * this.cellWidth + 40, this.gridStartY + row * this.cellHeight + this.cellHeight / 2, '#b0c4de', 12);
                        this.isShovelActive = false;
                        this.updateSeedCardSelection();
                    }
                }
                return;
            }

            // 3. Handle Power-up Placement
            if (this.selectedPowerUp && row >= 0 && col >= 0) {
                const config = this.powerUpConfigs[this.selectedPowerUp];
                if (this.coins >= config.cost && this.cooldowns[this.selectedPowerUp] <= 0) {
                    const isWater = this.isWaterLane(row);
                    let canPlant = false;
                    let targetLayer = 'grid'; // 'grid' or 'cloud'

                    if (this.selectedPowerUp === 'lakitu_cloud') {
                        // Lakitu cloud must be planted on water, where no cloud exists yet
                        if (isWater && this.cloudGrid[row][col] === null) {
                            canPlant = true;
                            targetLayer = 'cloud';
                        }
                    } else if (this.selectedPowerUp === 'frog_suit') {
                        // Frog suit can only be planted directly in water (no plant or cloud on tile)
                        if (isWater && this.grid[row][col] === null && this.cloudGrid[row][col] === null) {
                            canPlant = true;
                            targetLayer = 'grid';
                        }
                    } else {
                        // Standard non-aquatic power-up
                        if (!isWater) {
                            // On grass: tile must be empty
                            if (this.grid[row][col] === null) canPlant = true;
                        } else {
                            // On water: MUST have a Lakitu Cloud and no plant on top!
                            if (this.cloudGrid[row][col] !== null && this.grid[row][col] === null) {
                                canPlant = true;
                                targetLayer = 'grid';
                            }
                        }
                    }

                    if (canPlant) {
                        this.plantPowerUp(this.selectedPowerUp, row, col, targetLayer);
                        this.coins -= config.cost;
                        this.cooldowns[this.selectedPowerUp] = config.cooldown;
                        this.selectedPowerUp = null;
                        this.updateSeedCardSelection();
                        this.updateHUD();
                    }
                }
            }
        });

        // Seed Packet Card Clicks
        document.querySelectorAll('.seed-card').forEach(card => {
            card.addEventListener('click', () => {
                window.soundSystem.ensureContext();
                const type = card.dataset.type;
                const config = this.powerUpConfigs[type];

                if (this.coins >= config.cost && this.cooldowns[type] <= 0) {
                    this.isShovelActive = false;
                    this.selectedPowerUp = (this.selectedPowerUp === type) ? null : type;
                    this.updateSeedCardSelection();
                }
            });
        });

        // Shovel Tool Click
        const shovelBtn = document.getElementById('shovel-btn');
        if (shovelBtn) {
            shovelBtn.addEventListener('click', () => {
                window.soundSystem.ensureContext();
                this.selectedPowerUp = null;
                this.isShovelActive = !this.isShovelActive;
                this.updateSeedCardSelection();
            });
        }

        // Speed Toggle
        const speedBtn = document.getElementById('speed-btn');
        if (speedBtn) {
            speedBtn.addEventListener('click', () => {
                this.gameSpeed = (this.gameSpeed === 1.0) ? 2.0 : 1.0;
                speedBtn.innerText = this.gameSpeed + 'x Speed';
                speedBtn.classList.toggle('active', this.gameSpeed === 2.0);
            });
        }

        // Pause Toggle
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Audio Toggles
        const sfxBtn = document.getElementById('sfx-btn');
        if (sfxBtn) {
            sfxBtn.addEventListener('click', () => {
                const active = window.soundSystem.toggleMuteSFX();
                sfxBtn.classList.toggle('muted', !active);
                sfxBtn.innerText = active ? '🔊 SFX: ON' : '🔇 SFX: OFF';
            });
        }

        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                const active = window.soundSystem.toggleMuteMusic();
                musicBtn.classList.toggle('muted', !active);
                musicBtn.innerText = active ? '🎵 Music: ON' : '🔇 Music: OFF';
            });
        }

        // Keyboard Shortcuts (1-9 and 0 for 10 power-ups, S for shovel, Space for pause, F for fullscreen)
        window.addEventListener('keydown', (e) => {
            if ((e.key >= '1' && e.key <= '9') || e.key === '0') {
                const types = [
                    'fire_flower', 'superstar', 'super_mushroom', 'bob_omb', 'bullet_blaster',
                    'ice_flower', 'yoshi_egg', 'tanooki_leaf', 'lakitu_cloud', 'frog_suit'
                ];
                const idx = (e.key === '0') ? 9 : parseInt(e.key) - 1;
                const type = types[idx];
                if (type && this.powerUpConfigs[type]) {
                    const config = this.powerUpConfigs[type];
                    if (this.coins >= config.cost && this.cooldowns[type] <= 0) {
                        this.isShovelActive = false;
                        this.selectedPowerUp = (this.selectedPowerUp === type) ? null : type;
                        this.updateSeedCardSelection();
                    }
                }
            } else if (e.key === 's' || e.key === 'S') {
                this.selectedPowerUp = null;
                this.isShovelActive = !this.isShovelActive;
                this.updateSeedCardSelection();
            } else if (e.key === ' ') {
                this.togglePause();
            } else if (e.key === 'f' || e.key === 'F') {
                if (typeof toggleFullscreen === 'function') {
                    toggleFullscreen();
                }
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.innerText = this.isPaused ? '▶ Resume' : '⏸ Pause';
            pauseBtn.classList.toggle('active', this.isPaused);
        }
    }

    checkCoinCollection(x, y, radius = 35) {
        for (let i = this.fallingCoins.length - 1; i >= 0; i--) {
            const coin = this.fallingCoins[i];
            const dist = Math.hypot(coin.x - x, coin.y - y);
            if (dist < radius) {
                this.coins += coin.value;
                window.soundSystem.playCoin();
                this.createSparks(coin.x, coin.y, '#ffd700', 10);
                this.addFloatingText(`+${coin.value}`, coin.x, coin.y - 10, '#ffe600');
                this.fallingCoins.splice(i, 1);
                this.updateHUD();
                return true;
            }
        }
        return false;
    }

    plantPowerUp(type, row, col, targetLayer = 'grid') {
        const config = this.powerUpConfigs[type];
        const plant = {
            type: type,
            row: row,
            col: col,
            hp: config.hp,
            maxHp: config.hp,
            attackTimer: 0,
            time: Math.random() * 10,
            shootingFlash: 0,
            recoil: 0,
            fuseTime: 0,
            isPrimed: false,
            // Yoshi Egg attributes
            armTimer: 0,
            armProgress: 0,
            isArmed: false,
            isSwallowing: false,
            // Tanooki Leaf attributes
            isSpinning: false,
            spinTimer: 0,
            // Frog Suit attributes
            isGrabbing: false
        };

        // Bob-omb starts primed immediately upon planting
        if (type === 'bob_omb') {
            plant.isPrimed = true;
            plant.fuseTime = 0;
            window.soundSystem.playFuse();
        }

        const plantX = this.gridStartX + col * this.cellWidth + 40;
        const plantY = this.gridStartY + row * this.cellHeight + this.cellHeight / 2;

        if (targetLayer === 'cloud') {
            this.cloudGrid[row][col] = plant;
            window.soundSystem.playCloudPuff();
            this.createSparks(plantX, plantY, '#ffffff', 12);
        } else {
            this.grid[row][col] = plant;
            if (type === 'frog_suit') {
                window.soundSystem.playWaterSplash();
                this.createSparks(plantX, plantY, '#48cae4', 12);
            } else {
                window.soundSystem.playPlant();
                this.createSparks(plantX, plantY, '#52b788', 10);
            }
        }
    }

    updateSeedCardSelection() {
        document.querySelectorAll('.seed-card').forEach(card => {
            const type = card.dataset.type;
            card.classList.toggle('selected', this.selectedPowerUp === type);
        });
        const shovelBtn = document.getElementById('shovel-btn');
        if (shovelBtn) {
            shovelBtn.classList.toggle('selected', this.isShovelActive);
        }
    }

    updateHUD() {
        const coinEl = document.getElementById('coin-count');
        if (coinEl) coinEl.innerText = this.coins;

        // Update card availability & cooldown styling
        document.querySelectorAll('.seed-card').forEach(card => {
            const type = card.dataset.type;
            const config = this.powerUpConfigs[type];
            const cd = this.cooldowns[type];
            const cdOverlay = card.querySelector('.cooldown-overlay');

            if (cdOverlay) {
                if (cd > 0) {
                    const pct = (cd / config.cooldown) * 100;
                    cdOverlay.style.height = `${pct}%`;
                    card.classList.add('on-cooldown');
                } else {
                    cdOverlay.style.height = '0%';
                    card.classList.remove('on-cooldown');
                }
            }

            if (this.coins < config.cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });

        // Boss Health Bar
        const bossBarContainer = document.getElementById('boss-hud');
        if (bossBarContainer) {
            if (this.bowser && this.bowser.hp > 0) {
                bossBarContainer.style.display = 'flex';
                const hpPct = Math.max(0, (this.bowser.hp / this.bowser.maxHp) * 100);
                const fillEl = document.getElementById('boss-hp-fill');
                const textEl = document.getElementById('boss-hp-text');
                if (fillEl) fillEl.style.width = `${hpPct}%`;
                if (textEl) textEl.innerText = `BOWSER: ${Math.ceil(this.bowser.hp)} / ${this.bowser.maxHp}`;
            } else {
                bossBarContainer.style.display = 'none';
            }
        }

        // Wave Progress
        const waveFill = document.getElementById('wave-progress-fill');
        if (waveFill) {
            const pct = Math.min(100, (this.currentWave / this.totalWaves) * 100);
            waveFill.style.width = `${pct}%`;
        }
    }

    addFloatingText(text, x, y, color = '#ffffff') {
        this.floatingTexts.push({
            text, x, y, color,
            alpha: 1.0,
            vy: -35,
            life: 0.9
        });
    }

    createSparks(x, y, color = '#ffcc00', count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 90;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 2 + Math.random() * 3,
                alpha: 1.0,
                life: 0.5 + Math.random() * 0.4
            });
        }
    }

    createExplosion(x, y, radius = 80) {
        window.soundSystem.playExplosion();
        // Fiery explosion shockwave particle
        this.particles.push({
            type: 'shockwave',
            x, y,
            radius: 10,
            maxRadius: radius,
            color: 'rgba(255, 120, 0, 0.8)',
            alpha: 1.0,
            life: 0.45
        });

        // Scorch mark on ground
        this.particles.push({
            type: 'scorch',
            x, y,
            radius: 38,
            alpha: 0.7,
            life: 8.0
        });

        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 70 + Math.random() * 200;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.5 ? '#ff3b30' : '#ffcc00',
                radius: 3 + Math.random() * 4,
                alpha: 1.0,
                life: 0.7 + Math.random() * 0.5
            });
        }
    }

    // --- GAME LOOP ---

    gameLoop(now) {
        const dt = Math.min((now - this.lastTime) / 1000, 0.1) * this.gameSpeed;
        this.lastTime = now;

        if (!this.isPaused && !this.isGameOver) {
            this.update(dt);
        }

        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(dt) {
        this.gameTime += dt;

        // 1. Update Cooldowns
        for (const key in this.cooldowns) {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
            }
        }

        // 2. Natural Sky Coins
        this.skyCoinTimer -= dt;
        if (this.skyCoinTimer <= 0) {
            this.skyCoinTimer = 9.0 + Math.random() * 4;
            const dropX = this.gridStartX + Math.random() * (this.cellWidth * (this.cols - 1));
            const targetY = this.gridStartY + 50 + Math.random() * (this.cellHeight * (this.rows - 1));
            this.fallingCoins.push({
                x: dropX,
                y: -20,
                targetY: targetY,
                vy: 90,
                value: 25,
                time: Math.random() * 10,
                life: 14.0
            });
        }

        // 3. Update Falling Coins
        for (let i = this.fallingCoins.length - 1; i >= 0; i--) {
            const coin = this.fallingCoins[i];
            coin.time += dt;
            if (coin.y < coin.targetY) {
                coin.y += coin.vy * dt;
            } else {
                coin.life -= dt;
            }
            if (coin.life <= 0) {
                this.fallingCoins.splice(i, 1);
            }
        }

        // 4. Update Power-ups
        this.updatePowerUps(dt);

        // 5. Update Minions
        this.updateMinions(dt);

        // 6. Update Projectiles
        this.updateProjectiles(dt);

        // 7. Update Paragoombas
        this.updateParagoombas(dt);

        // 8. Update Lawn Cleaners
        this.updateLawnCleaners(dt);

        // 9. Update Boss (Bowser)
        if (this.bowser) {
            this.updateBowser(dt);
        }

        // 10. Update Wave Progression
        this.updateWaves(dt);

        // 11. Update Particles & Floating Text
        this.updateEffects(dt);

        // 12. Update HUD
        this.updateHUD();
    }

    updatePowerUps(dt) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const plant = this.grid[r][c];
                if (!plant) continue;

                plant.time += dt;
                if (plant.shootingFlash > 0) plant.shootingFlash = Math.max(0, plant.shootingFlash - dt * 5);
                if (plant.recoil > 0) plant.recoil = Math.max(0, plant.recoil - dt * 6);

                const plantCenterX = this.gridStartX + c * this.cellWidth + this.cellWidth / 2;
                const plantCenterY = this.gridStartY + r * this.cellHeight + this.cellHeight / 2;

                // Check if minion is in front of power-up in same lane, or Bowser is on the field
                const hasEnemyInLane = this.minions.some(m => m.row === r && m.x > plantCenterX - 20) ||
                                      (this.bowser && this.bowser.hp > 0);

                // --- Fire Flower ---
                if (plant.type === 'fire_flower') {
                    plant.attackTimer += dt;
                    if (plant.attackTimer >= 1.4 && hasEnemyInLane) {
                        plant.attackTimer = 0;
                        plant.shootingFlash = 1.0;
                        this.projectiles.push({
                            type: 'fireball',
                            row: r,
                            x: plantCenterX + 16,
                            y: plantCenterY - 4,
                            vx: 330,
                            damage: 20,
                            angle: 0
                        });
                        window.soundSystem.playFireball();
                    }
                }

                // --- Superstar ---
                else if (plant.type === 'superstar') {
                    plant.attackTimer += dt;
                    // First coin after 5s, then every 22s
                    const interval = plant.firstCoinProduced ? 22.0 : 5.5;
                    if (plant.attackTimer >= interval) {
                        plant.attackTimer = 0;
                        plant.firstCoinProduced = true;
                        // Spawn coin that pops out
                        this.fallingCoins.push({
                            x: plantCenterX,
                            y: plantCenterY,
                            targetY: plantCenterY + 15,
                            vy: 20,
                            value: 25,
                            time: 0,
                            life: 14.0
                        });
                        this.createSparks(plantCenterX, plantCenterY, '#ffd700', 8);
                    }
                }

                // --- Bullet Blaster (Repeater) ---
                else if (plant.type === 'bullet_blaster') {
                    plant.attackTimer += dt;
                    if (plant.attackTimer >= 1.4 && hasEnemyInLane) {
                        plant.attackTimer = 0;
                        plant.recoil = 1.0;
                        plant.shootingFlash = 1.0;

                        // Shot 1
                        this.projectiles.push({
                            type: 'bullet_bill',
                            row: r,
                            x: plantCenterX + 24,
                            y: plantCenterY - 2,
                            vx: 360,
                            damage: 20
                        });
                        window.soundSystem.playBulletShoot();

                        // Shot 2 scheduled 0.2s later
                        setTimeout(() => {
                            if (this.grid[r] && this.grid[r][c] === plant && !this.isGameOver) {
                                this.projectiles.push({
                                    type: 'bullet_bill',
                                    row: r,
                                    x: plantCenterX + 24,
                                    y: plantCenterY - 2,
                                    vx: 360,
                                    damage: 20
                                });
                                window.soundSystem.playBulletShoot();
                            }
                        }, 200 / this.gameSpeed);
                    }
                }

                // --- Ice Flower ---
                else if (plant.type === 'ice_flower') {
                    plant.attackTimer += dt;
                    if (plant.attackTimer >= 1.4 && hasEnemyInLane) {
                        plant.attackTimer = 0;
                        plant.shootingFlash = 1.0;
                        this.projectiles.push({
                            type: 'iceball',
                            row: r,
                            x: plantCenterX + 16,
                            y: plantCenterY - 4,
                            vx: 330,
                            damage: 20,
                            angle: 0
                        });
                        window.soundSystem.playIceball();
                    }
                }

                // --- Bob-omb (Cherry Bomb) ---
                else if (plant.type === 'bob_omb') {
                    plant.fuseTime += dt;
                    if (Math.random() < dt * 6) {
                        window.soundSystem.playFuse();
                    }
                    if (plant.fuseTime >= 1.0) {
                        // DETONATE!
                        this.createExplosion(plantCenterX, plantCenterY, 110);

                        // Damage all minions in 3x3 surrounding cells
                        this.minions.forEach(m => {
                            const minionCenterX = m.x + m.width / 2;
                            const minionCenterY = this.gridStartY + m.row * this.cellHeight + this.cellHeight / 2;
                            const dist = Math.hypot(minionCenterX - plantCenterX, minionCenterY - plantCenterY);
                            if (dist < 130) {
                                m.hp -= 1800; // Massive bomb damage
                                this.addFloatingText('-1800', m.x, m.y - 10, '#ff3b30');
                            }
                        });

                        // Damage Bowser heavily if close
                        if (this.bowser) {
                            const dist = Math.hypot((this.bowser.x + 60) - plantCenterX, (this.bowser.y + 90) - plantCenterY);
                            if (dist < 180) {
                                this.bowser.hp -= 1200;
                                this.addFloatingText('-1200 BOMB!', this.bowser.x + 20, this.bowser.y + 40, '#ff3b30');
                            }
                        }

                        // Remove Bob-omb
                        this.grid[r][c] = null;
                    }
                }

                // --- Yoshi Egg (Potato Mine) ---
                else if (plant.type === 'yoshi_egg') {
                    if (!plant.isArmed) {
                        plant.armTimer += dt;
                        plant.armProgress = Math.min(1.0, plant.armTimer / 14.0);
                        if (plant.armTimer >= 14.0) {
                            plant.isArmed = true;
                            this.addFloatingText('HATCHED!', plantCenterX, plantCenterY - 15, '#22b14c');
                            this.createSparks(plantCenterX, plantCenterY, '#22b14c', 10);
                        }
                    } else if (!plant.isSwallowing) {
                        // Check if an approaching minion is in range — use a wide radius
                        // so Yoshi triggers BEFORE the minion's eating collision can fire.
                        // Minions become eatingTarget when m.x <= plantRight (~cellWidth*0.7 from left),
                        // so we detect at plantCenterX + 70 on the right side.
                        for (let m of this.minions) {
                            if (m.row === r && m.hp > 0) {
                                const mCenterX = m.x + m.width * 0.5;
                                // Trigger when minion centre is within 72px to the right of egg centre
                                if (mCenterX > plantCenterX - 20 && mCenterX < plantCenterX + 72) {
                                    plant.isSwallowing = true;
                                    m.hp = 0;
                                    m.isEating = false;
                                    window.soundSystem.playYoshiGulp();
                                    this.addFloatingText('GULP! YOSHI!', plantCenterX, plantCenterY - 15, '#22b14c');
                                    this.createSparks(plantCenterX, plantCenterY, '#22b14c', 16);
                                    setTimeout(() => {
                                        if (this.grid[r] && this.grid[r][c] === plant) {
                                            this.grid[r][c] = null;
                                        }
                                    }, 400 / this.gameSpeed);
                                    break;
                                }
                            }
                        }
                    }
                }

                // --- Tanooki Leaf (Umbrella Leaf) ---
                else if (plant.type === 'tanooki_leaf') {
                    if (plant.isSpinning) {
                        plant.spinTimer -= dt;
                        if (plant.spinTimer <= 0) {
                            plant.isSpinning = false;
                        }
                    }
                }

                // --- Frog Suit (Tangled Kelp) ---
                else if (plant.type === 'frog_suit') {
                    if (!plant.isGrabbing) {
                        // Check if an enemy minion in water enters its cell.
                        // Use a wide radius (72px) so the grab triggers BEFORE the
                        // minion's eating collision can fire and chew the frog suit.
                        for (let m of this.minions) {
                            if (m.row === r && m.hp > 0) {
                                const mCenterX = m.x + m.width * 0.5;
                                if (mCenterX > plantCenterX - 20 && mCenterX < plantCenterX + 72) {
                                    plant.isGrabbing = true;
                                    m.hp = 0;
                                    m.isEating = false;
                                    window.soundSystem.playFrogTongue();
                                    this.addFloatingText('DRAGGED UNDER!', plantCenterX, plantCenterY - 15, '#00b4d8');
                                    this.createSparks(plantCenterX, plantCenterY, '#0077b6', 16);
                                    setTimeout(() => {
                                        if (this.grid[r] && this.grid[r][c] === plant) {
                                            this.grid[r][c] = null;
                                        }
                                    }, 450 / this.gameSpeed);
                                    break;
                                }
                            }
                        }
                    }
                }

                // Check death
                if (plant.hp <= 0) {
                    this.grid[r][c] = null;
                }
            }
        }

        // Update Lakitu Clouds in cloudGrid
        for (let cr = 0; cr < this.rows; cr++) {
            for (let cc = 0; cc < this.cols; cc++) {
                const cloud = this.cloudGrid[cr][cc];
                if (cloud) {
                    cloud.time += dt;
                    if (cloud.hp <= 0) {
                        this.cloudGrid[cr][cc] = null;
                        if (this.grid[cr][cc]) {
                            this.createSparks(this.gridStartX + cc * this.cellWidth + 40, this.gridStartY + cr * this.cellHeight + this.cellHeight / 2, '#0077b6', 10);
                            this.grid[cr][cc] = null; // Top plant sinks with cloud!
                        }
                    }
                }
            }
        }
    }

    updateMinions(dt) {
        for (let i = this.minions.length - 1; i >= 0; i--) {
            const m = this.minions[i];
            m.time += dt;

            // Chilled status decay
            if (m.chilled) {
                m.chillTimer -= dt;
                if (m.chillTimer <= 0) {
                    m.chilled = false;
                }
            }

            const speedMult = m.chilled ? 0.5 : 1.0;

            // Check if minion is eating a power-up in its current cell
            const col = Math.floor((m.x + m.width * 0.3 - this.gridStartX) / this.cellWidth);
            let eatingTarget = null;
            if (col >= 0 && col < this.cols && this.grid[m.row]) {
                const plant = this.grid[m.row][col] || (this.cloudGrid[m.row] ? this.cloudGrid[m.row][col] : null);
                if (plant) {
                    const plantRight = this.gridStartX + col * this.cellWidth + this.cellWidth * 0.7;
                    if (m.x <= plantRight && m.x + m.width * 0.5 >= this.gridStartX + col * this.cellWidth) {
                        // Paratroopa jumps over the first power-up!
                        if (m.type === 'paratroopa' && !m.hasJumped) {
                            m.hasJumped = true;
                            m.x -= this.cellWidth * 1.1; // vault over
                            m.type = 'koopa'; // lose wings
                            this.addFloatingText('VAULT!', m.x + 20, m.y - 20, '#ffea00');
                        } else if (plant.type === 'yoshi_egg' && plant.isArmed) {
                            // Armed Yoshi Egg is immune to minion biting — it will swallow
                            // the minion itself via updatePowerUps. Don't let minions eat it.
                        } else if (plant.type === 'frog_suit' && !plant.isGrabbing) {
                            // Frog Suit grabs minions via updatePowerUps; minions can't bite it.
                        } else {
                            eatingTarget = plant;
                        }
                    }
                }
            }

            if (eatingTarget) {
                m.isEating = true;
                const biteDmg = (100 * speedMult) * dt;
                eatingTarget.hp -= biteDmg;

                // Sound chomp
                m.eatSoundTimer = (m.eatSoundTimer || 0) + dt;
                if (m.eatSoundTimer >= 0.35) {
                    m.eatSoundTimer = 0;
                    window.soundSystem.playChomp();
                    this.createSparks(m.x + 5, this.gridStartY + m.row * this.cellHeight + 45, '#ffffff', 3);
                }
            } else {
                m.isEating = false;
                m.x -= m.speed * speedMult * dt;

                // Boo enraged check
                if (m.type === 'boo' && m.hp <= 150 && !m.isAngry) {
                    m.isAngry = true;
                    m.speed = 72;
                    window.soundSystem.playBooScreech();
                    this.addFloatingText('BOO CHARGE!', m.x, m.y - 15, '#ff4d6d');
                }

                // Boom Boom Special: Summons 4 Spinies in cross formation
                if (m.type === 'boom_boom') {
                    m.summonTimer = (m.summonTimer || 0) + dt;
                    if (m.summonTimer >= 8.5 && !m.isEating) {
                        m.summonTimer = 0;
                        m.isSummoning = true;
                        m.summonAnimTimer = 1.2;
                        window.soundSystem.playBoomBoomSummon();
                        this.addFloatingText('SPINY SUMMON!', m.x, m.y - 20, '#d90429');

                        const offsets = [
                            { r: m.row - 1, x: m.x },
                            { r: m.row + 1, x: m.x },
                            { r: m.row, x: m.x - this.cellWidth },
                            { r: m.row, x: m.x + this.cellWidth }
                        ];
                        offsets.forEach(off => {
                            if (off.r >= 0 && off.r < this.rows) {
                                this.spawnMinion('spiny', off.r, off.x);
                            }
                        });
                    }
                    if (m.isSummoning) {
                        m.summonAnimTimer -= dt;
                        if (m.summonAnimTimer <= 0) m.isSummoning = false;
                    }
                }

                // Hammer Bro special: throws arcing hammer
                if (m.type === 'hammer_bro') {
                    m.hammerTimer = (m.hammerTimer || 0) + dt;
                    if (m.hammerTimer >= 3.5) {
                        m.hammerTimer = 0;
                        for (let c = this.cols - 1; c >= 0; c--) {
                            if (this.grid[m.row][c]) {
                                this.grid[m.row][c].hp -= 150;
                                this.createSparks(this.gridStartX + c * this.cellWidth + 40, this.gridStartY + m.row * this.cellHeight + 45, '#888', 8);
                                this.addFloatingText('-150 HAMMER!', this.gridStartX + c * this.cellWidth + 20, this.gridStartY + m.row * this.cellHeight + 20, '#ff9900');
                                window.soundSystem.playHit();
                                break;
                            }
                        }
                    }
                }
            }

            // Check if minion breached house threshold
            if (m.x < this.gridStartX - 25) {
                // Trigger lawn cleaner if available
                const cleaner = this.lawnCleaners[m.row];
                if (cleaner && !cleaner.used) {
                    if (!cleaner.active) {
                        cleaner.active = true;
                        window.soundSystem.playLawnMower();
                    }
                } else {
                    // Game Over! Minions entered the house!
                    this.triggerGameOver();
                    return;
                }
            }

            // Minion death
            if (m.hp <= 0) {
                this.createSparks(m.x + m.width / 2, this.gridStartY + m.row * this.cellHeight + 40, '#ffcc00', 12);
                // Drop coin chance
                if (Math.random() < 0.28) {
                    this.fallingCoins.push({
                        x: m.x + m.width / 2,
                        y: this.gridStartY + m.row * this.cellHeight + 30,
                        targetY: this.gridStartY + m.row * this.cellHeight + 45,
                        vy: 20,
                        value: 25,
                        time: 0,
                        life: 12.0
                    });
                }
                this.minions.splice(i, 1);
            }
        }
    }

    updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx * dt;
            p.angle = (p.angle || 0) + dt * 10;

            let hit = false;

            // Check collision with Bowser if active (Bowser occupies the right side across all lanes)
            if (this.bowser && this.bowser.hp > 0 && p.x >= this.bowser.x - 10) {
                hit = true;
                this.bowser.hp -= p.damage;
                window.soundSystem.playHit();
                this.addFloatingText(`-${p.damage}`, this.bowser.x - 10, p.y, p.type === 'iceball' ? '#48cae4' : '#ffea00');
                this.createSparks(p.x, p.y, p.type === 'iceball' ? '#ade8f4' : '#ff9900', 6);
            }

            // Check collision with minions in same row
            if (!hit) {
                for (let j = 0; j < this.minions.length; j++) {
                    const m = this.minions[j];
                    if (m.row === p.row && Math.abs(p.x - (m.x + m.width / 2)) < 26) {
                        hit = true;
                        window.soundSystem.playHit();
                        this.createSparks(p.x, p.y, p.type === 'iceball' ? '#ade8f4' : '#ff9900', 6);

                        // Shy Guy Mask Armor damage absorption
                        if (m.type === 'shy_guy' && m.maskHp > 0) {
                            m.maskHp -= p.damage;
                            this.addFloatingText(`-${p.damage} [MASK]`, m.x, m.y - 12, '#ffffff');
                            if (m.maskHp <= 0) {
                                m.maskBroken = true;
                                m.speed *= 1.35;
                                this.addFloatingText('MASK SHATTERED!', m.x, m.y - 18, '#ffcc00');
                                this.createSparks(m.x + m.width / 2, m.y + 15, '#ffffff', 16);
                            }
                        } else {
                            m.hp -= p.damage;
                            this.addFloatingText(`-${p.damage}`, m.x, m.y - 10, p.type === 'iceball' ? '#48cae4' : '#ffea00');
                        }

                        if (p.type === 'iceball') {
                            m.chilled = true;
                            m.chillTimer = 8.0; // 8s chill slow
                        }
                        break;
                    }
                }
            }

            // Remove projectile if hit or off-screen
            if (hit || p.x > this.width + 50) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateParagoombas(dt) {
        // Spawn Paragoombas occasionally on Level 4 (World 2-2) or Level 99
        if (this.level === 4 || (this.level === 99 && Math.random() < 0.25)) {
            this.paragoombaTimer = (this.paragoombaTimer !== undefined ? this.paragoombaTimer : 14.0) - dt;
            if (this.paragoombaTimer <= 0) {
                this.paragoombaTimer = 16.0 + Math.random() * 8;
                // Choose a target cell with a power-up, or a random cell
                const targets = [];
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 1; c < this.cols - 1; c++) {
                        if (this.grid[r][c]) targets.push({ row: r, col: c });
                    }
                }
                const chosen = (targets.length > 0 && Math.random() < 0.75)
                    ? targets[Math.floor(Math.random() * targets.length)]
                    : { row: Math.floor(Math.random() * this.rows), col: Math.floor(1 + Math.random() * (this.cols - 2)) };

                this.paragoombas.push({
                    targetRow: chosen.row,
                    targetCol: chosen.col,
                    x: this.gridStartX + chosen.col * this.cellWidth + (this.cellWidth - 50) / 2,
                    y: -100,
                    targetY: this.gridStartY + chosen.row * this.cellHeight + 10,
                    vy: 240,
                    state: 'descending', // 'descending', 'landed', 'deflected', 'exiting'
                    landTimer: 2.0,
                    time: 0
                });
            }
        }

        // Update active Paragoombas
        for (let i = this.paragoombas.length - 1; i >= 0; i--) {
            const p = this.paragoombas[i];
            p.time += dt;

            if (p.state === 'descending') {
                p.y += p.vy * dt;

                // Check for Tanooki Leaf protection within 3x3 surrounding tiles
                if (p.y >= p.targetY - 50) {
                    let protectedByTanooki = false;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const tr = p.targetRow + dr;
                            const tc = p.targetCol + dc;
                            if (tr >= 0 && tr < this.rows && tc >= 0 && tc < this.cols) {
                                const pl = this.grid[tr][tc];
                                if (pl && pl.type === 'tanooki_leaf') {
                                    pl.isSpinning = true;
                                    pl.spinTimer = 0.8;
                                    protectedByTanooki = true;
                                    break;
                                }
                            }
                        }
                        if (protectedByTanooki) break;
                    }

                    if (protectedByTanooki) {
                        p.state = 'deflected';
                        p.vy = -480;
                        window.soundSystem.playTanookiSpin();
                        this.addFloatingText('TANOOKI DEFLECT!', p.x - 10, p.y, '#ffd166');
                        this.createSparks(p.x + 25, p.y + 25, '#ffd166', 16);
                    } else if (p.y >= p.targetY) {
                        p.y = p.targetY;
                        p.state = 'landed';
                        p.landTimer = 1.8;
                    }
                }
            } else if (p.state === 'landed') {
                p.landTimer -= dt;
                if (p.landTimer <= 0) {
                    // Paragoomba Action: Steal plant or drop minion
                    const hasPlant = this.grid[p.targetRow] && this.grid[p.targetRow][p.targetCol];
                    if (hasPlant && Math.random() < 0.65) {
                        // Steals the power-up!
                        this.grid[p.targetRow][p.targetCol] = null;
                        this.addFloatingText('PLANT STOLEN!', p.x - 5, p.y - 12, '#ff3b30');
                        this.createSparks(p.x + 25, p.y + 25, '#ff3b30', 12);
                    } else {
                        // Drops a surprise minion!
                        const pool = ['goomba', 'shy_guy', 'boo'];
                        const chosen = pool[Math.floor(Math.random() * pool.length)];
                        this.spawnMinion(chosen, p.targetRow, p.x);
                        this.addFloatingText('MINION DROP!', p.x - 5, p.y - 12, '#f77f00');
                    }
                    p.state = 'exiting';
                    p.vy = -450;
                }
            } else if (p.state === 'deflected' || p.state === 'exiting') {
                p.y += p.vy * dt;
                if (p.y < -130) {
                    this.paragoombas.splice(i, 1);
                }
            }
        }
    }

    updateLawnCleaners(dt) {
        for (let i = 0; i < this.lawnCleaners.length; i++) {
            const cleaner = this.lawnCleaners[i];
            if (cleaner.active && !cleaner.used) {
                cleaner.x += cleaner.speed * dt;

                // Obliterate all minions in this lane
                for (let j = this.minions.length - 1; j >= 0; j--) {
                    const m = this.minions[j];
                    if (m.row === cleaner.row && Math.abs(cleaner.x - m.x) < 35) {
                        m.hp = 0;
                        this.createSparks(m.x, cleaner.y, '#2ec4b6', 15);
                        this.addFloatingText('SHELL STOMP!', m.x, cleaner.y - 15, '#2ec4b6');
                    }
                }

                // If exited right boundary
                if (cleaner.x > this.width + 40) {
                    cleaner.used = true;
                    cleaner.active = false;
                }
            }
        }
    }

    // --- BOWSER BOSS AI & ATTACKS ---

    updateBowser(dt) {
        const b = this.bowser;
        b.time += dt;

        // Bowser HP check
        if (b.hp <= 0) {
            this.triggerVictory();
            return;
        }

        b.actionTimer -= dt;

        if (b.state === 'idle') {
            if (b.actionTimer <= 0) {
                // Decide next move
                const r = Math.random();
                const hpPct = b.hp / b.maxHp;

                if (hpPct < 0.35 && r < 0.4) {
                    // Phase 3 Shell Spin Charge
                    b.state = 'shell_spin';
                    b.subTimer = 4.0;
                    b.targetLane = Math.floor(Math.random() * this.rows);
                    b.shellSpinX = b.x;
                    b.shellSpinDir = -1;
                    this.showBanner('BOWSER SHELL SPIN!', 2.0);
                    window.soundSystem.playBowserRoar();
                } else if (r < 0.55) {
                    // Fire Breath
                    b.state = 'telegraph_fire';
                    b.targetLane = Math.floor(Math.random() * this.rows);
                    b.subTimer = 1.6; // Telegraph warning duration
                    b.attackCharge = 0;
                    this.hazardLanes.push({ row: b.targetLane, timer: 1.6 });
                } else {
                    // Minion Drop
                    b.state = 'summoning';
                    b.subTimer = 1.2;
                    window.soundSystem.playBowserRoar();
                }
            }
        } else if (b.state === 'telegraph_fire') {
            b.subTimer -= dt;
            b.attackCharge = 1.0 - (b.subTimer / 1.6);
            if (b.subTimer <= 0) {
                // Unleash inferno!
                b.state = 'firing';
                b.subTimer = 1.8;
                window.soundSystem.playBowserFire();

                // Destroy power-ups in targeted lane or deal high damage
                const targetRow = b.targetLane;
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[targetRow][c]) {
                        const plant = this.grid[targetRow][c];
                        // Super Mushroom absorbs 1200 damage, others take 800
                        plant.hp -= 800;
                        this.createExplosion(this.gridStartX + c * this.cellWidth + 40, this.gridStartY + targetRow * this.cellHeight + 45, 50);
                    }
                }
            }
        } else if (b.state === 'firing') {
            b.subTimer -= dt;
            // Spawn flame particles across lane
            if (Math.random() < 0.7) {
                this.particles.push({
                    x: this.gridStartX + Math.random() * (this.cols * this.cellWidth),
                    y: this.gridStartY + b.targetLane * this.cellHeight + 20 + Math.random() * 45,
                    vx: -150 - Math.random() * 100,
                    vy: (Math.random() - 0.5) * 40,
                    color: Math.random() > 0.5 ? '#ff3b30' : '#ff9500',
                    radius: 6 + Math.random() * 8,
                    alpha: 1.0,
                    life: 0.6
                });
            }
            if (b.subTimer <= 0) {
                b.state = 'idle';
                b.actionTimer = 2.5 + Math.random() * 2;
                b.attackCharge = 0;
            }
        } else if (b.state === 'summoning') {
            b.subTimer -= dt;
            if (b.subTimer <= 0) {
                // Summon 2-3 minions into lanes!
                const numMinions = (b.hp < b.maxHp * 0.4) ? 3 : 2;
                for (let k = 0; k < numMinions; k++) {
                    const row = Math.floor(Math.random() * this.rows);
                    const types = ['goomba', 'koopa', 'koopa_armored', 'hammer_bro'];
                    const chosen = types[Math.floor(Math.random() * types.length)];
                    this.spawnMinion(chosen, row, this.width - 160 + k * 35);
                }
                b.state = 'idle';
                b.actionTimer = 3.5 + Math.random() * 2;
            }
        } else if (b.state === 'shell_spin') {
            b.subTimer -= dt;
            b.shellSpinX += b.shellSpinDir * 280 * dt;

            // Shell crush powerups in lane
            const col = Math.floor((b.shellSpinX - this.gridStartX) / this.cellWidth);
            if (col >= 0 && col < this.cols && this.grid[b.targetLane][col]) {
                this.grid[b.targetLane][col].hp -= 400 * dt;
            }

            if (b.shellSpinX < this.gridStartX + this.cellWidth * 2) {
                b.shellSpinDir = 1; // bounce back
            }
            if (b.shellSpinX >= this.width - 150) {
                b.shellSpinX = this.width - 150;
                b.state = 'idle';
                b.actionTimer = 3.0;
            }
        }

        // Clean hazard lanes
        for (let i = this.hazardLanes.length - 1; i >= 0; i--) {
            this.hazardLanes[i].timer -= dt;
            if (this.hazardLanes[i].timer <= 0) {
                this.hazardLanes.splice(i, 1);
            }
        }
    }

    // --- WAVE PROGRESSION ---

    updateWaves(dt) {
        if (this.gameMode === 'boss') {
            // Boss mode minion trickle
            this.waveSpawnTimer -= dt;
            if (this.waveSpawnTimer <= 0) {
                this.waveSpawnTimer = 5.0 + Math.random() * 3.5;
                const pool = ['goomba', 'koopa', 'koopa_armored', 'shy_guy'];
                const row = Math.floor(Math.random() * this.rows);
                this.spawnMinion(pool[Math.floor(Math.random() * pool.length)], row);
            }
            return;
        }

        // Story & Endless Mode
        this.waveTimer -= dt;

        if (this.waveTimer <= 0 && !this.waveInProgress && this.currentWave < this.totalWaves) {
            this.startNextWave();
        }

        // Spawning queue
        if (this.waveInProgress && this.waveEnemiesToSpawn.length > 0) {
            this.waveSpawnTimer -= dt;
            if (this.waveSpawnTimer <= 0) {
                const nextEnemy = this.waveEnemiesToSpawn.shift();
                const row = Math.floor(Math.random() * this.rows);
                this.spawnMinion(nextEnemy, row);
                this.waveSpawnTimer = 0.8 + Math.random() * 1.4;
            }
        } else if (this.waveInProgress && this.waveEnemiesToSpawn.length === 0 && this.minions.length === 0) {
            this.waveInProgress = false;
            if (this.currentWave >= this.totalWaves) {
                this.triggerVictory();
            } else {
                this.waveTimer = 9.0; // Time between waves
            }
        }
    }

    startNextWave() {
        this.currentWave++;
        this.waveInProgress = true;
        this.waveEnemiesToSpawn = [];

        const isFinalWave = (this.currentWave === this.totalWaves);
        if (isFinalWave) {
            this.showBanner('A HUGE WAVE OF MINIONS IS APPROACHING!', 3.5);
            window.soundSystem.playBowserRoar();
            // Flag Goomba leads the final charge!
            this.waveEnemiesToSpawn.push('flag_goomba');
            if (this.totalWaves >= 3) {
                this.waveEnemiesToSpawn.push('flag_goomba');
            }
        } else {
            this.showBanner(`WAVE ${this.currentWave} / ${this.totalWaves}`, 2.0);
        }

        // Build enemy composition from LEVEL_DATA
        let count = 3 + this.currentWave * 2;
        if (isFinalWave) count += 6;

        const lvlData = Game.LEVEL_DATA[this.level];
        const compositionFn = lvlData ? lvlData.composition : ((r) => r < 0.6 ? 'goomba' : 'koopa');

        for (let i = 0; i < count; i++) {
            this.waveEnemiesToSpawn.push(compositionFn(Math.random()));
        }

        this.waveSpawnTimer = 1.0;
    }

    spawnMinion(type, row, spawnX = null) {
        const x = spawnX !== null ? spawnX : this.width + 10 + Math.random() * 40;
        const y = this.gridStartY + row * this.cellHeight + (this.cellHeight - 55) / 2;

        let hp = 180;
        let speed = 24;
        let width = 50;
        let height = 55;
        let maskHp = 0;
        let maxMaskHp = 0;

        if (type === 'goomba' || type === 'flag_goomba') {
            hp = 180; speed = 23;
        } else if (type === 'koopa') {
            hp = 220; speed = 34;
        } else if (type === 'koopa_armored') {
            hp = 420; speed = 24;
        } else if (type === 'hammer_bro') {
            hp = 520; speed = 20;
        } else if (type === 'paratroopa') {
            hp = 240; speed = 40;
        } else if (type === 'shy_guy') {
            // Massive health coming from mask!
            hp = 200; speed = 26;
            maskHp = 550; maxMaskHp = 550; // Total 750 HP!
        } else if (type === 'boo') {
            hp = 350; speed = 22; // Slowly approaches while hiding face
        } else if (type === 'boom_boom') {
            hp = 600; speed = 20;
        } else if (type === 'spiny') {
            hp = 200; speed = 24;
        }

        this.minions.push({
            type, row, x, y, width, height,
            hp, maxHp: hp, speed,
            maskHp, maxMaskHp, maskBroken: false,
            isAngry: false, // For Boo
            isSummoning: false, summonTimer: 4.0, summonAnimTimer: 0, // For Boom Boom
            time: Math.random() * 10,
            chilled: false,
            chillTimer: 0,
            isEating: false,
            hasJumped: false
        });
    }

    updateEffects(dt) {
        // Floating text
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life / 0.9);
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.type === 'shockwave') {
                p.radius += (p.maxRadius - p.radius) * 8 * dt;
                p.alpha = Math.max(0, p.life / 0.45);
            } else if (p.type === 'scorch') {
                p.alpha = Math.max(0, p.life / 8.0) * 0.7;
            } else {
                p.x += (p.vx || 0) * dt;
                p.y += (p.vy || 0) * dt;
                p.alpha = Math.max(0, p.life);
            }
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Banner text
        if (this.bannerTimer > 0) {
            this.bannerTimer -= dt;
        }
    }

    triggerGameOver() {
        this.isGameOver = true;
        window.soundSystem.stopMusic();
        window.soundSystem.playGameOver();
        const modal = document.getElementById('gameover-modal');
        if (modal) modal.style.display = 'flex';
    }

    triggerVictory() {
        this.isVictory = true;
        window.soundSystem.stopMusic();
        window.soundSystem.playVictory();

        // Mark this level complete in the world map tracker
        if (typeof window.markLevelComplete === 'function') {
            window.markLevelComplete(this.level);
        }

        const modal = document.getElementById('victory-modal');
        if (modal) {
            const title = document.getElementById('victory-title');
            const desc  = document.getElementById('victory-desc');
            const nextBtn = document.getElementById('victory-next-btn');

            if (this.level === 10) {
                // Final boss defeated — game complete!
                title.innerText = '🎉 BOWSER DEFEATED! 🎉';
                desc.innerText  = 'You saved the Mushroom Kingdom! Princess Peach is rescued and the Power-ups stand triumphant!';
                if (nextBtn) nextBtn.innerText = 'WORLD MAP';
            } else {
                const nextLvl = Game.LEVEL_DATA[this.level + 1];
                title.innerText = `STAGE CLEARED!`;
                desc.innerText  = `${nextLvl ? nextLvl.name : 'Next Stage'} unlocked! Keep going!`;
                if (nextBtn) nextBtn.innerText = 'NEXT LEVEL →';
            }
            modal.style.display = 'flex';
        }
    }

    // --- RENDERING ---

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Mushroom Kingdom Lawn Background
        this.drawLawn();

        // 2. Draw Hazard Lane Highlights
        this.drawHazardLanes();

        // 3. Draw Lawn Cleaners
        this.drawLawnCleaners();

        // 4. Draw Scorch Marks
        this.drawScorchMarks();

        // 5. Draw Power-ups on Grid
        this.drawPowerUps();

        // 6. Draw Minions
        this.drawMinions();

        // 7. Draw Paragoombas (Bungee drops)
        this.drawParagoombas();

        // 8. Draw Bowser Boss
        if (this.bowser) {
            this.drawBowserEntity();
        }

        // 9. Draw Projectiles
        this.drawProjectiles();

        // 10. Draw Falling & Produced Coins
        this.drawCoins();

        // 11. Draw Particles & Explosions
        this.drawParticles();

        // 12. Draw Placement Hover Preview
        this.drawPlacementPreview();

        // 13. Draw Floating Numbers & Notifications
        this.drawHUDOverlays();
    }

    drawLawn() {
        const ctx = this.ctx;

        // Sky & Distant Mushroom Kingdom Hills
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.gridStartY);
        skyGrad.addColorStop(0, '#5c94fc');
        skyGrad.addColorStop(1, '#92bcfc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.gridStartY);

        // Cute smiling clouds
        ctx.fillStyle = '#ffffff';
        [150, 480, 800].forEach(cx => {
            ctx.beginPath();
            ctx.ellipse(cx, 32, 28, 14, 0, 0, Math.PI * 2);
            ctx.ellipse(cx - 16, 36, 16, 11, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 16, 36, 16, 11, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Top Brick Border
        ctx.fillStyle = '#b84418';
        ctx.fillRect(0, this.gridStartY - 10, this.width, 10);
        ctx.fillStyle = '#e86a38';
        for (let bx = 0; bx < this.width; bx += 30) {
            ctx.fillRect(bx + 2, this.gridStartY - 8, 26, 6);
        }

        // Draw Lawn Tiles: 6-row Pool (2 middle rows water) vs 5-row Grass
        for (let r = 0; r < this.rows; r++) {
            const isWater = this.isWaterLane(r);
            for (let c = 0; c < this.cols; c++) {
                const x = this.gridStartX + c * this.cellWidth;
                const y = this.gridStartY + r * this.cellHeight;

                if (isWater) {
                    // Shimmering Pool Water Tile
                    window.Sprites.drawWaterTile(ctx, x, y, this.cellWidth, this.cellHeight, this.gameTime);
                } else {
                    // Grass Checkerboard Tile
                    const isEven = (r + c) % 2 === 0;
                    ctx.fillStyle = isEven ? '#52b788' : '#40916c';
                    ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
                    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
                }
            }

            // Pool Coping / Curb Stones at the edge of the pool
            if (this.isPoolLevel) {
                if (r === 2) {
                    // Top curb of pool
                    const curY = this.gridStartY + 2 * this.cellHeight;
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(this.gridStartX, curY - 3, this.cols * this.cellWidth, 4);
                    ctx.strokeStyle = '#b0bec5';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.gridStartX, curY - 3, this.cols * this.cellWidth, 4);
                } else if (r === 4) {
                    // Bottom curb of pool
                    const curY = this.gridStartY + 4 * this.cellHeight;
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(this.gridStartX, curY - 1, this.cols * this.cellWidth, 4);
                    ctx.strokeStyle = '#b0bec5';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(this.gridStartX, curY - 1, this.cols * this.cellWidth, 4);
                }
            }
        }

        // Left Threshold Grass / Porch
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(0, this.gridStartY, this.gridStartX, this.rows * this.cellHeight);

        // Right Entry Road / Pipe threshold
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(this.gridStartX + this.cols * this.cellWidth, this.gridStartY, this.width - (this.gridStartX + this.cols * this.cellWidth), this.rows * this.cellHeight);

        // Warp Pipe Entrance on Right
        for (let r = 0; r < this.rows; r++) {
            const py = this.gridStartY + r * this.cellHeight + (this.cellHeight - 54) / 2;
            const px = this.width - 45;
            ctx.fillStyle = '#008000';
            ctx.fillRect(px, py, 45, 54);
            ctx.fillStyle = '#00a800';
            ctx.fillRect(px - 6, py, 10, 54);
            ctx.fillStyle = '#005500';
            ctx.fillRect(px - 6, py, 45, 5);
        }

        // Bottom Brick Border
        const bottomY = this.gridStartY + this.rows * this.cellHeight;
        ctx.fillStyle = '#b84418';
        ctx.fillRect(0, bottomY, this.width, 25);
    }

    drawHazardLanes() {
        const ctx = this.ctx;
        this.hazardLanes.forEach(h => {
            const y = this.gridStartY + h.row * this.cellHeight;
            const pulse = 0.4 + 0.3 * Math.sin(this.gameTime * 20);
            ctx.fillStyle = `rgba(255, 30, 0, ${pulse})`;
            ctx.fillRect(this.gridStartX, y, this.cols * this.cellWidth, this.cellHeight);

            // Warning icon / text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px "Press Start 2P", sans-serif, monospace';
            ctx.fillText('⚠️ WARNING: FIRE BREATH INCOMING! ⚠️', this.gridStartX + 60, y + 54);
        });
    }

    drawLawnCleaners() {
        this.lawnCleaners.forEach(cleaner => {
            if (!cleaner.used) {
                window.Sprites.drawLawnCleaner(this.ctx, cleaner.x, cleaner.y, cleaner.width, cleaner.height, {
                    time: this.gameTime,
                    spinning: cleaner.active
                });
            }
        });
    }

    drawScorchMarks() {
        this.particles.filter(p => p.type === 'scorch').forEach(p => {
            this.ctx.fillStyle = `rgba(30, 20, 10, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPowerUps() {
        // Draw Lakitu Clouds in water underneath plants
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cloud = this.cloudGrid[r][c];
                if (cloud) {
                    const x = this.gridStartX + c * this.cellWidth;
                    const y = this.gridStartY + r * this.cellHeight;
                    window.Sprites.drawLakituCloud(this.ctx, x, y, this.cellWidth, this.cellHeight, { time: cloud.time });
                }
            }
        }

        // Draw Power-ups
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const plant = this.grid[r][c];
                if (!plant) continue;

                const x = this.gridStartX + c * this.cellWidth;
                const y = this.gridStartY + r * this.cellHeight;

                const state = {
                    time: plant.time,
                    shootingFlash: plant.shootingFlash,
                    recoil: plant.recoil,
                    fuseTime: plant.fuseTime,
                    isPrimed: plant.isPrimed,
                    hpPercent: plant.hp / plant.maxHp,
                    isArmed: plant.isArmed,
                    armProgress: plant.armProgress,
                    isSwallowing: plant.isSwallowing,
                    isSpinning: plant.isSpinning,
                    isGrabbing: plant.isGrabbing
                };

                if (plant.type === 'fire_flower') {
                    window.Sprites.drawFireFlower(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'superstar') {
                    window.Sprites.drawSuperstar(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'super_mushroom') {
                    window.Sprites.drawSuperMushroom(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'bob_omb') {
                    window.Sprites.drawBobOmb(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'bullet_blaster') {
                    window.Sprites.drawBulletBlaster(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'ice_flower') {
                    window.Sprites.drawIceFlower(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'yoshi_egg') {
                    window.Sprites.drawYoshiEgg(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'tanooki_leaf') {
                    window.Sprites.drawTanookiLeaf(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                } else if (plant.type === 'frog_suit') {
                    window.Sprites.drawFrogSuit(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
                }
            }
        }
    }

    drawMinions() {
        this.minions.forEach(m => {
            const state = {
                time: m.time,
                chilled: m.chilled
            };

            if (m.type === 'goomba') {
                window.Sprites.drawGoomba(this.ctx, m.x, m.y, m.width, m.height, state);
            } else if (m.type === 'flag_goomba') {
                window.Sprites.drawFlagGoomba(this.ctx, m.x, m.y, m.width, m.height, state);
            } else if (m.type === 'koopa') {
                window.Sprites.drawKoopa(this.ctx, m.x, m.y, m.width, m.height, state);
            } else if (m.type === 'koopa_armored') {
                window.Sprites.drawKoopa(this.ctx, m.x, m.y, m.width, m.height, {
                    ...state,
                    shellColor: '#d90429',
                    shellBorder: '#720026'
                });
            } else if (m.type === 'hammer_bro') {
                window.Sprites.drawHammerBro(this.ctx, m.x, m.y, m.width, m.height, state);
            } else if (m.type === 'paratroopa') {
                window.Sprites.drawParatroopa(this.ctx, m.x, m.y, m.width, m.height, state);
            } else if (m.type === 'shy_guy') {
                window.Sprites.drawShyGuy(this.ctx, m.x, m.y, m.width, m.height, {
                    ...state,
                    maskHpRatio: m.maskHp / m.maxMaskHp,
                    maskBroken: m.maskBroken
                });
            } else if (m.type === 'boo') {
                window.Sprites.drawBoo(this.ctx, m.x, m.y, m.width, m.height, {
                    ...state,
                    isAngry: m.isAngry
                });
            } else if (m.type === 'boom_boom') {
                window.Sprites.drawBoomBoom(this.ctx, m.x, m.y, m.width, m.height, {
                    ...state,
                    isSummoning: m.isSummoning
                });
            } else if (m.type === 'spiny') {
                window.Sprites.drawSpiny(this.ctx, m.x, m.y, m.width, m.height, state);
            }

            // Health bar above minion if damaged
            if (m.hp < m.maxHp) {
                const barWidth = 36;
                const bx = m.x + (m.width - barWidth) / 2;
                const by = m.y - 8;
                this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this.ctx.fillRect(bx, by, barWidth, 5);
                this.ctx.fillStyle = m.chilled ? '#48cae4' : '#2ecc71';
                this.ctx.fillRect(bx, by, barWidth * (m.hp / m.maxHp), 5);
            }
        });
    }

    drawParagoombas() {
        this.paragoombas.forEach(p => {
            const shadowX = this.gridStartX + p.targetCol * this.cellWidth + this.cellWidth / 2;
            const shadowY = this.gridStartY + p.targetRow * this.cellHeight + this.cellHeight / 2 + 15;

            // Target ground shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            this.ctx.beginPath();
            this.ctx.ellipse(shadowX, shadowY, 22, 10, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Paragoomba descending with bungee cord / wings
            window.Sprites.drawParagoomba(this.ctx, p.x, p.y, 50, 55, {
                time: p.time,
                isBungee: p.state === 'descending' || p.state === 'landed'
            });
        });
    }

    drawBowserEntity() {
        const b = this.bowser;
        const state = {
            time: b.time,
            hpPercent: b.hp / b.maxHp,
            isAttacking: b.state === 'firing' || b.state === 'telegraph_fire',
            attackCharge: b.attackCharge
        };

        const drawX = b.state === 'shell_spin' ? b.shellSpinX : b.x;
        const drawY = b.y;

        window.Sprites.drawBowser(this.ctx, drawX, drawY, b.width, b.height, state);
    }

    drawProjectiles() {
        this.projectiles.forEach(p => {
            if (p.type === 'fireball') {
                window.Sprites.drawFireball(this.ctx, p.x, p.y, 9, p.angle);
            } else if (p.type === 'iceball') {
                window.Sprites.drawIceball(this.ctx, p.x, p.y, 9, p.angle);
            } else if (p.type === 'bullet_bill') {
                window.Sprites.drawBulletBill(this.ctx, p.x, p.y, 34, 22);
            }
        });
    }

    drawCoins() {
        this.fallingCoins.forEach(coin => {
            window.Sprites.drawCoin(this.ctx, coin.x, coin.y, 14, { time: coin.time });
        });
    }

    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            if (p.type === 'shockwave') {
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 6 * p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else if (p.type !== 'scorch') {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    drawPlacementPreview() {
        const { row, col } = this.hoveredCell;
        if (row < 0 || col < 0) return;

        const x = this.gridStartX + col * this.cellWidth;
        const y = this.gridStartY + row * this.cellHeight;
        const isWater = this.isWaterLane(row);

        this.ctx.save();

        if (this.isShovelActive) {
            // Shovel highlight
            this.ctx.fillStyle = 'rgba(231, 76, 60, 0.35)';
            this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
        } else if (this.selectedPowerUp) {
            let isValid = false;
            if (this.selectedPowerUp === 'lakitu_cloud') {
                isValid = isWater && this.cloudGrid[row][col] === null;
            } else if (this.selectedPowerUp === 'frog_suit') {
                isValid = isWater && this.grid[row][col] === null && this.cloudGrid[row][col] === null;
            } else {
                if (!isWater) {
                    isValid = (this.grid[row][col] === null);
                } else {
                    isValid = (this.cloudGrid[row][col] !== null && this.grid[row][col] === null);
                }
            }

            this.ctx.fillStyle = isValid ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
            this.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

            // Ghost icon of selected powerup
            this.ctx.globalAlpha = 0.55;
            const state = { time: this.gameTime, isArmed: true, armProgress: 1 };
            if (this.selectedPowerUp === 'fire_flower') window.Sprites.drawFireFlower(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'superstar') window.Sprites.drawSuperstar(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'super_mushroom') window.Sprites.drawSuperMushroom(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'bob_omb') window.Sprites.drawBobOmb(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'bullet_blaster') window.Sprites.drawBulletBlaster(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'ice_flower') window.Sprites.drawIceFlower(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'yoshi_egg') window.Sprites.drawYoshiEgg(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'tanooki_leaf') window.Sprites.drawTanookiLeaf(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'lakitu_cloud') window.Sprites.drawLakituCloud(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
            else if (this.selectedPowerUp === 'frog_suit') window.Sprites.drawFrogSuit(this.ctx, x, y, this.cellWidth, this.cellHeight, state);
        }

        this.ctx.restore();
    }

    drawHUDOverlays() {
        const ctx = this.ctx;

        // Floating Damage & Coin Texts
        this.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 15px "Courier New", monospace, sans-serif';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });

        // Banner Announcement (Waves, Bowser entry, etc.)
        if (this.bannerTimer > 0) {
            ctx.save();
            const alpha = Math.min(1.0, this.bannerTimer / 0.5);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, this.height / 2 - 40, this.width, 80);

            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 4;
            ctx.strokeRect(0, this.height / 2 - 40, this.width, 80);

            ctx.fillStyle = '#ffea00';
            ctx.font = 'bold 22px "Press Start 2P", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff3300';
            ctx.shadowBlur = 10;
            ctx.fillText(this.bannerText, this.width / 2, this.height / 2 + 8);
            ctx.restore();
        }

        // Pause Overlay
        if (this.isPaused) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME PAUSED', this.width / 2, this.height / 2);
            ctx.font = '18px Arial, sans-serif';
            ctx.fillText('Press SPACE to resume', this.width / 2, this.height / 2 + 35);
            ctx.restore();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
