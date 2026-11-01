# 🌟 Powerups Vs Minions

A Super Mario-themed Tower Defense game inspired by *Plants vs. Zombies*, featuring iconic power-ups defending the Mushroom Kingdom against Bowser's minion horde, culminating in an epic final boss battle against King Bowser!

---

## 🎮 How to Play

Simply double-click or open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari, etc.). No installation or server required!

---

## 🌻 Power-ups (Replacing Plants)

| Power-up | PVZ Counterpart | Cost | Description |
| :--- | :--- | :---: | :--- |
| **Fire Flower** | Peashooter | 100 | Shoots blazing fireballs forward in its lane, dealing 20 damage per shot. |
| **Superstar** | Sunflower | 50 | Shines with star power, generating +25 Gold Coins periodically to fund your army. |
| **Super Mushroom** | Wall-nut | 50 | Sturdy high-HP defense (4,000 HP) that absorbs bites and shields other power-ups. Shows visual damage stages (cheerful -> bandaged -> heavily cracked). |
| **Bob-omb** | Cherry Bomb | 150 | Ticking fuse ignites for ~1.0 second, then detonates with a massive 3x3 blast (1,800 damage), incinerating all nearby minions! |
| **Bullet Blaster** | Repeater | 200 | Heavy cast-iron Bill Blaster cannon that fires **2 Bullet Bills** at a time in rapid succession, each dealing 20 damage (same as Fire Flower). |
| **Ice Flower** | Snow-pea | 175 | Fires frosty iceballs that deal 20 damage and chill minions, slowing their movement and bite speed by **50%** for 8 seconds. |
| **Yoshi's Egg** | Potato Mine | 25 | Takes ~14s to hatch. Once armed, Baby Yoshi pokes out, swallows the first minion that steps on it in one gulp, and runs off! |
| **Tanooki Leaf** | Umbrella Leaf | 100 | Protects adjacent power-ups in a 3x3 radius from Paragoomba snatch and drop attacks with a swift raccoon tail spin! |
| **Lakitu's Cloud** | Lily Pad | 25 | Aquatic carrier planted on water tiles (in Pool levels), allowing non-aquatic power-ups to be planted on top! |
| **Frog Suit** | Tangled Kelp | 25 | Aquatic suit planted directly in water. Snaps its long elastic tongue to drag an oncoming minion under water! |

---

## 🌊 Pool Levels (PvZ1 6-Lane Pool Feature)

- **6 Distinct Lanes**: Features 2 middle lanes of shimmering water (lanes 2 & 3) sandwiched between grass lanes.
- **Lakitu's Cloud Carrier**: Non-aquatic power-ups cannot be planted directly in water; plant Lakitu's Cloud first, then place your defenders on top!
- **Aquatic Defenders**: Frog Suit can only be planted in water lanes, eliminating swimming minions.
- **Dual-Layer Shovel**: Digging up a tile with both a power-up and a cloud removes the top power-up first, while a second dig removes the cloud.

---

## 🐢 Minions (Replacing Zombies)

- **Goomba**: Common foot soldier with normal speed and bite.
- **Flag Goomba**: Only appears leading the charge on final waves of each level, waving Bowser's flag!
- **Green Koopa Troopa**: Agile runner, faster than Goombas.
- **Red Armored Koopa**: Hardened shell gives heavy armor (420 HP).
- **Hammer Bro**: Elite bruiser (520 HP) that periodically hurls arcing hammers at front-line power-ups.
- **Winged Paratroopa**: Leaps over the first power-up it encounters before shedding wings to walk.
- **Shy Guy (Heavy Armor)**: Has **massive health** (750 HP total)! Most of it comes from its hardened white mask, which visibly cracks, chips, and shatters as it takes damage, exposing a panicked unmasked runner!
- **Boo (Newspaper Zombie)**: Approaches slowly while bashfully hiding its face behind its hands. Once damaged below 150 HP, it reveals its terrifying face and rushes at high speed!
- **Boom Boom (Dancer Zombie)**: Heavy brawler (600 HP) who periodically winds up and summons 4 **Spinies** in cross formation (above, below, left, right)!
- **Spiny**: Spiked shell minion spawned by Boom Boom. Protected by razor-sharp spikes.
- **Paragoomba (Bungee Zombie)**: Aerial threat that descends from above on a bungee cord to steal power-ups or drop surprise minions into your defense! Deflected by Tanooki Leaf.

---

## 👑 The Final Boss: King Bowser (Replaces Dr. Zomboss)

Featured in **World 8-4: Bowser's Molten Keep**:
- **Massive 6,500 HP Boss**: Complete with dynamic health bar at top of screen!
- **Fire Breath**: Bowser charges up and unleashes an inferno across a targeted lane. *(Telegraphed with a lane hazard warning so you can place Super Mushrooms to tank it!)*
- **Minion Barrage**: Summons waves of Goombas, Koopas, and Hammer Bros.
- **Shell Spin Charge**: Bowser retreats into his spiked shell and rolls across the battlefield.
- **Enraged Phase**: When under 35% HP, Bowser ignites with a fiery aura and attacks with increased ferocity.

---

## 🛡️ Other Features

- **Green Shell & Pool Cleaners**: Emergency cleaners parked at the left of each lane (Green Shells on grass, Blue Shells/Submarines on water). If a minion breaches your threshold, the cleaner sweeps the lane!
- **Fullscreen Mode**: Dedicated Fullscreen button and `F` key to expand the game into a distraction-free arcade experience that scales to fit your display.
- **Interactive In-Game Almanac**: Click the **📖 Almanac** button to view animated sprites, stats, and lore for every power-up and minion.
- **Speed Toggle**: Switch between **1x Speed** and **2x Speed** anytime.
- **World Selector**: Choose between World 1-1, World 1-2, World 2-1 (Pool), World 2-2 (Pool), Bowser's Boss Battle, or Endless Pool Rampage.
- **Procedural Audio Synthesizer**: Authentic 8-bit/16-bit sound effects (coin chimes, explosions, cannon blasts, Bowser roars, Yoshi gulps, Tanooki tail spins, water splashes, Boo screeches) and dynamic chiptune background music built with the Web Audio API.

---

## ⌨️ Controls & Shortcuts

- **`1` - `9`, `0`**: Select Power-up (1: Fire Flower, 2: Superstar, 3: Super Mushroom, 4: Bob-omb, 5: Bullet Blaster, 6: Ice Flower, 7: Yoshi Egg, 8: Tanooki Leaf, 9: Lakitu Cloud, 0: Frog Suit)
- **`S`**: Shovel / Super Pickaxe (Dig up power-ups)
- **`F`**: Toggle Fullscreen
- **`Spacebar`**: Pause / Resume
- **Mouse Hover / Click**: Automatically collect floating coins
- **Mouse Click**: Place selected power-up on grid

