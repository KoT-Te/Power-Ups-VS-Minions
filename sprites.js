/**
 * Powerups Vs Minions - Canvas Sprite & Visual Renderer
 * Procedural vector graphics with animations, particle effects, and Super Mario aesthetic.
 */

const Sprites = {
    // --- POWER-UPS ---

    drawFireFlower(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const bob = Math.sin(time * 4) * 2;
        const cx = x + width / 2;
        const cy = y + height / 2 + bob;

        ctx.save();

        // Stem
        ctx.strokeStyle = '#22b14c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 8);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Leaves
        ctx.fillStyle = '#22b14c';
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy + 22, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + 22, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Outer Flame Petals (Red-Orange)
        ctx.fillStyle = '#ff2b00';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 24, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b81400';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Middle Layer (Bright Orange/Yellow)
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 19, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center Face (Cream/Yellow)
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 14, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy - 2, 2.2, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5, cy - 2, 2.2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 5.5, cy - 4, 1, 0, Math.PI * 2);
        ctx.arc(cx + 4.5, cy - 4, 1, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle when shooting recently
        if (state.shootingFlash > 0) {
            ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(cx + 18, cy - 2, 12 * state.shootingFlash, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawSuperstar(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const bob = Math.sin(time * 3.5) * 3;
        const cx = x + width / 2;
        const cy = y + height / 2 + bob - 2;

        ctx.save();

        // Pulsing Rainbow / Gold Glow
        const pulse = 0.5 + 0.5 * Math.sin(time * 5);
        const glowRad = 28 + pulse * 10;
        const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRad);
        glowGrad.addColorStop(0, 'rgba(255, 240, 100, 0.7)');
        glowGrad.addColorStop(0.6, 'rgba(255, 215, 0, 0.3)');
        glowGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // 5-Point Star Path
        const drawStar = (rOuter, rInner) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const aOuter = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                const aInner = aOuter + Math.PI / 5;
                const ox = cx + Math.cos(aOuter) * rOuter;
                const oy = cy + Math.sin(aOuter) * rOuter;
                const ix = cx + Math.cos(aInner) * rInner;
                const iy = cy + Math.sin(aInner) * rInner;
                if (i === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
                ctx.lineTo(ix, iy);
            }
            ctx.closePath();
        };

        // Star Outline & Fill
        drawStar(26, 12);
        ctx.fillStyle = '#ffde17';
        ctx.fill();
        ctx.strokeStyle = '#b89200';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner Shading
        const grad = ctx.createLinearGradient(cx, cy - 20, cx, cy + 20);
        grad.addColorStop(0, 'rgba(255, 255, 220, 0.6)');
        grad.addColorStop(1, 'rgba(255, 170, 0, 0.3)');
        ctx.fillStyle = grad;
        drawStar(23, 10);
        ctx.fill();

        // Star Eyes (Vertical black ovals)
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5, cy, 2.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 5.5, cy - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 4.5, cy - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawSuperMushroom(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const breath = Math.sin(time * 2.5) * 1.5;
        const cx = x + width / 2;
        const cy = y + height / 2 + 6;
        const hpPct = state.hpPercent !== undefined ? state.hpPercent : 1;

        ctx.save();

        // Base / Face (Peach/Cream)
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 17, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c68b59';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cap (Red Mushroom Cap)
        ctx.fillStyle = '#e52521';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 4 + breath * 0.5, 27, 24, 0, Math.PI, 0); // half dome
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#99120f';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cap highlight sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 18, 12, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // White Spots
        ctx.fillStyle = '#ffffff';
        // Center spot
        ctx.beginPath();
        ctx.ellipse(cx, cy - 9 + breath * 0.5, 10, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        // Left spot
        ctx.beginPath();
        ctx.ellipse(cx - 20, cy - 4, 6, 9, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right spot
        ctx.beginPath();
        ctx.ellipse(cx + 20, cy - 4, 6, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eyes & Expression based on HP
        if (hpPct > 0.66) {
            // Happy / Healthy
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(cx - 6, cy + 12, 2.5, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 6, cy + 12, 2.5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Smile
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy + 15, 4, 0.1, Math.PI - 0.1);
            ctx.stroke();
        } else if (hpPct > 0.33) {
            // Sweating / Bandage
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(cx - 6, cy + 12, 2.2, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 6, cy + 12, 2.2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Sweat drop
            ctx.fillStyle = '#3ca9ff';
            ctx.beginPath();
            ctx.arc(cx + 14, cy + 7, 3, 0, Math.PI * 2);
            ctx.fill();

            // Band-aid on cap
            ctx.fillStyle = '#d4aa70';
            ctx.fillRect(cx - 16, cy - 14, 12, 6);
            ctx.fillStyle = '#ff7b7b';
            ctx.fillRect(cx - 12, cy - 13, 4, 4);
        } else {
            // Heavily Damaged / Dizzy
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            // X eyes
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy + 9); ctx.lineTo(cx - 3, cy + 14);
            ctx.moveTo(cx - 3, cy + 9); ctx.lineTo(cx - 8, cy + 14);
            ctx.moveTo(cx + 3, cy + 9); ctx.lineTo(cx + 8, cy + 14);
            ctx.moveTo(cx + 8, cy + 9); ctx.lineTo(cx + 3, cy + 14);
            ctx.stroke();

            // Cracks on cap
            ctx.strokeStyle = '#4a0807';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy - 2);
            ctx.lineTo(cx - 8, cy - 14);
            ctx.lineTo(cx - 12, cy - 20);
            ctx.stroke();

            // Two criss-cross band-aids
            ctx.fillStyle = '#d4aa70';
            ctx.fillRect(cx + 5, cy - 15, 14, 6);
            ctx.fillRect(cx + 9, cy - 19, 6, 14);
        }

        ctx.restore();
    },

    drawBobOmb(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const fuseTime = state.fuseTime || 0; // counts up to 1.0s before boom
        const isPrimed = state.isPrimed || false;
        const cx = x + width / 2;
        const cy = y + height / 2 + 4;

        ctx.save();

        // Scale & Flash effect when ignited
        let flashColor = '#1a1a1a';
        let scale = 1.0;
        if (isPrimed) {
            const flash = Math.sin(time * 30);
            flashColor = flash > 0 ? '#ff3b30' : '#ffffff';
            scale = 1.0 + (fuseTime / 1.0) * 0.35; // Expands right before popping
        }

        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // Windup Key on back (Golden)
        const keyAngle = time * 8;
        ctx.save();
        ctx.translate(-16, -6);
        ctx.rotate(keyAngle);
        ctx.fillStyle = '#f5c518';
        ctx.strokeStyle = '#a67c00';
        ctx.lineWidth = 2;
        ctx.fillRect(-3, -12, 6, 24);
        ctx.beginPath();
        ctx.arc(0, -12, 5, 0, Math.PI * 2);
        ctx.arc(0, 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Orange Feet
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.ellipse(-10, 19, 9, 6, 0.2, 0, Math.PI * 2);
        ctx.ellipse(10, 19, 9, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b35400';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Round Bomb Body
        ctx.fillStyle = flashColor;
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isPrimed ? '#ff9900' : '#444';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Highlight sheen
        if (!isPrimed) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.ellipse(-7, -8, 6, 10, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Fuse Cap / Stem
        ctx.fillStyle = '#dcdde1';
        ctx.fillRect(-5, -25, 10, 6);

        // Burning Fuse String
        ctx.strokeStyle = '#c8a065';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.quadraticCurveTo(8, -32, 4, -38);
        ctx.stroke();

        // Fuse Spark
        const sparkX = 4 + Math.random() * 4 - 2;
        const sparkY = -38 + Math.random() * 4 - 2;
        const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 8);
        sparkGrad.addColorStop(0, '#ffffaa');
        sparkGrad.addColorStop(0.5, '#ff6600');
        sparkGrad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Oval Eyes (Yellow)
        ctx.fillStyle = '#fff455';
        ctx.beginPath();
        ctx.ellipse(4, -2, 2.8, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(13, -2, 2.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawBulletBlaster(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const recoil = state.recoil || 0; // Recoil animation offset
        const cx = x + width / 2;
        const cy = y + height / 2 + 5;

        ctx.save();

        // Base Pedestal (Cast Iron)
        ctx.fillStyle = '#2c2d30';
        ctx.fillRect(cx - 24, cy + 18, 48, 12);
        ctx.strokeStyle = '#18191a';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx - 24, cy + 18, 48, 12);

        // Main Cannon Block (with recoil shift to the left)
        const bx = cx - recoil * 6;
        ctx.fillStyle = '#3a3c40';
        ctx.fillRect(bx - 20, cy - 22, 40, 40);
        ctx.strokeStyle = '#1b1c1e';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx - 20, cy - 22, 40, 40);

        // Top cap
        ctx.fillStyle = '#4a4d52';
        ctx.fillRect(bx - 22, cy - 26, 44, 6);
        ctx.strokeRect(bx - 22, cy - 26, 44, 6);

        // Front Muzzle Opening (Facing Right towards minions)
        ctx.fillStyle = '#111213';
        ctx.beginPath();
        ctx.ellipse(bx + 19, cy - 2, 5, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();

        // White Skull / Bill Emblem on side
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx - 2, cy - 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c2d30';
        ctx.beginPath();
        ctx.arc(bx - 4, cy - 5, 2, 0, Math.PI * 2);
        ctx.arc(bx, cy - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle Flash
        if (state.shootingFlash > 0) {
            ctx.fillStyle = 'rgba(255, 180, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(bx + 26, cy - 2, 14 * state.shootingFlash, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawIceFlower(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const bob = Math.sin(time * 3.8) * 2;
        const cx = x + width / 2;
        const cy = y + height / 2 + bob;

        ctx.save();

        // Stem (Cyan-Teal)
        ctx.strokeStyle = '#00a896';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 8);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Leaves (Frosted Teal)
        ctx.fillStyle = '#02c39a';
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy + 22, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + 22, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Frost Aura / Mist
        const mistGrad = ctx.createRadialGradient(cx, cy - 2, 5, cx, cy - 2, 28);
        mistGrad.addColorStop(0, 'rgba(180, 240, 255, 0.4)');
        mistGrad.addColorStop(1, 'rgba(180, 240, 255, 0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 28, 0, Math.PI * 2);
        ctx.fill();

        // Outer Petals (Deep Ice Blue)
        ctx.fillStyle = '#0077b6';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 24, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#03045e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Middle Layer (Cyan / Sky)
        ctx.fillStyle = '#48cae4';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 19, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center Face (Pure White Ice)
        ctx.fillStyle = '#caf0f8';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 14, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#03045e';
        ctx.beginPath();
        ctx.ellipse(cx - 5, cy - 2, 2.2, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 5, cy - 2, 2.2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 5.5, cy - 4, 1, 0, Math.PI * 2);
        ctx.arc(cx + 4.5, cy - 4, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawYoshiEgg(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const cx = x + width / 2;
        const cy = y + height / 2 + 6;
        const isArmed = state.isArmed || false;
        const armProgress = state.armProgress || 0;
        const isSwallowing = state.isSwallowing || false;

        ctx.save();

        if (isSwallowing) {
            // Yoshi leap & tongue snap animation
            const jumpY = cy - 14;
            // Green Baby Yoshi body
            ctx.fillStyle = '#22b14c';
            ctx.beginPath();
            ctx.ellipse(cx, jumpY, 18, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#156b2f';
            ctx.lineWidth = 2;
            ctx.stroke();

            // White snout / cheeks
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(cx + 8, jumpY + 2, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Big open mouth & tongue
            ctx.fillStyle = '#900';
            ctx.beginPath();
            ctx.ellipse(cx + 14, jumpY + 4, 8, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Snapping pink tongue reaching forward
            ctx.strokeStyle = '#ff4d6d';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + 14, jumpY + 4);
            ctx.lineTo(cx + 55, jumpY + 4);
            ctx.stroke();

            // Tongue tip
            ctx.fillStyle = '#ff758f';
            ctx.beginPath();
            ctx.arc(cx + 55, jumpY + 4, 6, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(cx + 2, jumpY - 6, 2.5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (isArmed) {
            // Hatched: Baby Yoshi poking head out of cracked shell cradle
            // Bottom half egg shell
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.arc(cx, cy + 6, 18, 0, Math.PI, false);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#2b2d42';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Green spot on lower shell
            ctx.fillStyle = '#22b14c';
            ctx.beginPath();
            ctx.ellipse(cx - 6, cy + 12, 5, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Cracked jagged shell rim
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.moveTo(cx - 18, cy + 6);
            ctx.lineTo(cx - 10, cy + 2);
            ctx.lineTo(cx - 3, cy + 6);
            ctx.lineTo(cx + 5, cy + 1);
            ctx.lineTo(cx + 12, cy + 6);
            ctx.lineTo(cx + 18, cy + 6);
            ctx.stroke();

            // Cute Baby Yoshi Head bobbing
            const yoshiBob = Math.sin(time * 5) * 2;
            const headY = cy - 8 + yoshiBob;

            // Green head
            ctx.fillStyle = '#22b14c';
            ctx.beginPath();
            ctx.ellipse(cx, headY, 14, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#156b2f';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Big White Cheeks / Snout
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(cx + 4, headY + 3, 9, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Red crest on back of head
            ctx.fillStyle = '#e63946';
            ctx.beginPath();
            ctx.ellipse(cx - 12, headY - 2, 4, 6, -0.4, 0, Math.PI * 2);
            ctx.fill();

            // Cheerful Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(cx - 1, headY - 4, 2.2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx - 1.5, headY - 6, 1, 0, Math.PI * 2);
            ctx.fill();

            // Blushing orange cheek
            ctx.fillStyle = 'rgba(255, 140, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(cx + 4, headY + 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Unarmed: Rocking spotted Yoshi Egg
            const rock = Math.sin(time * (4 + armProgress * 8)) * (0.05 + armProgress * 0.15);
            ctx.translate(cx, cy + 6);
            ctx.rotate(rock);

            // Egg body (White dome)
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 21, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2b2d42';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Green Spots
            ctx.fillStyle = '#22b14c';
            ctx.beginPath();
            ctx.ellipse(-5, -6, 5, 7, 0.3, 0, Math.PI * 2);
            ctx.ellipse(6, 4, 6, 8, -0.2, 0, Math.PI * 2);
            ctx.ellipse(-6, 9, 4, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Crack lines when close to hatching
            if (armProgress > 0.6) {
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-8, -2); ctx.lineTo(-2, 3); ctx.lineTo(4, -1); ctx.lineTo(9, 4);
                ctx.stroke();
            }
        }

        ctx.restore();
    },

    drawTanookiLeaf(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const cx = x + width / 2;
        const cy = y + height / 2 + 4;
        const isSpinning = state.isSpinning || false;

        ctx.save();
        ctx.translate(cx, cy);

        if (isSpinning) {
            // Tail spin swirl effect
            ctx.rotate(time * 30);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 26, 0, Math.PI * 1.5);
            ctx.stroke();

            // Swirl stars
            ctx.fillStyle = '#ffd166';
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                ctx.fillRect(Math.cos(a) * 26 - 2, Math.sin(a) * 26 - 2, 4, 4);
            }
        } else {
            // Gentle leaf breathe
            const bob = Math.sin(time * 3) * 2;
            ctx.translate(0, bob);
        }

        // Striped Raccoon Tail on back
        ctx.save();
        const tailWag = Math.sin(time * 6) * 0.2;
        ctx.translate(-10, 8);
        ctx.rotate(-0.5 + tailWag);

        // Tail body
        ctx.fillStyle = '#a65d28';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a2e0a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dark brown stripes on tail
        ctx.fillStyle = '#3a1f0a';
        ctx.fillRect(-6, -7, 4, 14);
        ctx.fillRect(2, -7, 4, 14);
        ctx.restore();

        // Tanooki Leaf Body (Warm brown/orange oak leaf)
        ctx.fillStyle = '#bc6c25';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.bezierCurveTo(20, -18, 22, 10, 0, 18);
        ctx.bezierCurveTo(-22, 10, -20, -18, 0, -22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#6f3900';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Center leaf vein
        ctx.strokeStyle = '#8d4800';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(0, 15);
        ctx.stroke();

        // Raccoon Ears on top of leaf
        ctx.fillStyle = '#8c4b14';
        // Left ear
        ctx.beginPath();
        ctx.moveTo(-12, -14); ctx.lineTo(-18, -26); ctx.lineTo(-6, -20);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(12, -14); ctx.lineTo(18, -26); ctx.lineTo(6, -20);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Inner cream ear tufts
        ctx.fillStyle = '#faedcd';
        ctx.beginPath();
        ctx.moveTo(-11, -16); ctx.lineTo(-15, -23); ctx.lineTo(-8, -19);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(11, -16); ctx.lineTo(15, -23); ctx.lineTo(8, -19);
        ctx.closePath(); ctx.fill();

        // Cute Leaf Eyes
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(-5, -2, 2, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -2, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawLakituCloud(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const bob = Math.sin(time * 3) * 2;
        const cx = x + width / 2;
        const cy = y + height / 2 + bob + 8;

        ctx.save();

        // Water ripples beneath cloud
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14, 30, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Fluffy Lakitu Cloud Body
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        // Central base
        ctx.ellipse(cx, cy + 4, 32, 14, 0, 0, Math.PI * 2);
        // Fluffy puffs
        ctx.arc(cx - 18, cy + 2, 14, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy + 2, 14, 0, Math.PI * 2);
        ctx.arc(cx - 8, cy - 8, 15, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 8, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b0c4de';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Smiling Face
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy - 2, 2.2, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 6, cy - 2, 2.2, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cheerful smile
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy + 1, 5, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Rosy cheeks
        ctx.fillStyle = '#ffb3c1';
        ctx.beginPath();
        ctx.arc(cx - 13, cy + 2, 3, 0, Math.PI * 2);
        ctx.arc(cx + 13, cy + 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawFrogSuit(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const bob = Math.sin(time * 3.5) * 2;
        const cx = x + width / 2;
        const cy = y + height / 2 + bob + 6;
        const isGrabbing = state.isGrabbing || false;

        ctx.save();

        // Water ripples
        ctx.strokeStyle = 'rgba(72, 202, 228, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14, 28, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Snapping Frog Tongue when grabbing
        if (isGrabbing) {
            ctx.strokeStyle = '#ff4d6d';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx + 10, cy + 6);
            ctx.lineTo(cx + 50, cy + 6);
            ctx.stroke();

            ctx.fillStyle = '#ff758f';
            ctx.beginPath();
            ctx.arc(cx + 50, cy + 6, 7, 0, Math.PI * 2);
            ctx.fill();
        }

        // Green Frog Hood / Head
        ctx.fillStyle = '#38b000';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 22, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#007200';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Big Bulbous Frog Eyes on top
        const drawFrogEye = (ex, ey) => {
            ctx.fillStyle = '#38b000';
            ctx.beginPath();
            ctx.arc(ex, ey, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#007200';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Eye ball
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex, ey, 6.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupil (Horizontal frog slit)
            ctx.fillStyle = '#111';
            ctx.fillRect(ex - 4, ey - 2, 8, 3.5);
        };
        drawFrogEye(cx - 12, cy - 10);
        drawFrogEye(cx + 12, cy - 10);

        // Cream / Yellow Face & Cheeks
        ctx.fillStyle = '#fff3b0';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Smiling mouth
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 8, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    },

    // --- PROJECTILES ---

    drawFireball(ctx, x, y, radius = 9, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Flame Trail
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 1.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffcc00');
        grad.addColorStop(0.7, '#ff3700');
        grad.addColorStop(1, 'rgba(255, 55, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid fireball core
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fffa65';
        ctx.beginPath();
        ctx.arc(-2, -2, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawIceball(ctx, x, y, radius = 9, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Frost Aura
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 1.6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#90e0ef');
        grad.addColorStop(0.8, '#0096c7');
        grad.addColorStop(1, 'rgba(0, 150, 199, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#ade8f4';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ice crystal facets
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.7, 0); ctx.lineTo(radius * 0.7, 0);
        ctx.moveTo(0, -radius * 0.7); ctx.lineTo(0, radius * 0.7);
        ctx.stroke();

        ctx.restore();
    },

    drawBulletBill(ctx, x, y, width = 34, height = 22) {
        ctx.save();
        ctx.translate(x, y);

        // Torpedo Body (Black)
        ctx.fillStyle = '#1c1c1e';
        ctx.beginPath();
        // Nose is rounded on the right (facing forward)
        ctx.moveTo(-width / 2, -height / 2);
        ctx.lineTo(width / 4, -height / 2);
        ctx.arc(width / 4, 0, height / 2, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(-width / 2, height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Body highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, -height / 3.5, width / 2.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Clenched Arm / Glove
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-4, height / 4, 7, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Angry Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(width / 5, -2, 5, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Black Pupil
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(width / 5 + 2, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Slanted Angry Eyebrow
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width / 5 - 5, -9);
        ctx.lineTo(width / 5 + 6, -5);
        ctx.stroke();

        // Exhaust / Flame at tail
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(-width / 2, -4);
        ctx.lineTo(-width / 2 - 8, 0);
        ctx.lineTo(-width / 2, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    // --- MINIONS ---

    drawGoomba(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const walk = Math.sin(time * 10);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;

        ctx.save();

        if (isChilled) {
            ctx.filter = 'hue-rotate(180deg) saturate(1.4)';
        }

        // Feet (Alternating Walk)
        ctx.fillStyle = '#4a2511';
        ctx.beginPath();
        // Left foot
        ctx.ellipse(cx - 10, cy + 20 + walk * 2.5, 9, 6, 0.2, 0, Math.PI * 2);
        // Right foot
        ctx.ellipse(cx + 10, cy + 20 - walk * 2.5, 9, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#271105';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Body / Stem (Cream)
        ctx.fillStyle = '#fce5cd';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cca177';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head (Mushroom / Triangle Dome, Brown)
        ctx.fillStyle = '#a64d14';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 24);
        ctx.bezierCurveTo(cx + 26, cy - 22, cx + 28, cy + 8, cx, cy + 8);
        ctx.bezierCurveTo(cx - 28, cy + 8, cx - 26, cy - 22, cx, cy - 24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#602805';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Eyebrows (V-shape angry)
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 14);
        ctx.lineTo(cx - 2, cy - 7);
        ctx.lineTo(cx - 2, cy - 4);
        ctx.lineTo(cx - 14, cy - 9);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 14);
        ctx.lineTo(cx + 2, cy - 7);
        ctx.lineTo(cx + 2, cy - 4);
        ctx.lineTo(cx + 14, cy - 9);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx - 7, cy - 2, 3.5, 6, 0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 7, cy - 2, 3.5, 6, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 2, 2.2, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // White Fangs pointing up
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 8);
        ctx.lineTo(cx - 7, cy + 2);
        ctx.lineTo(cx - 4, cy + 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 4, cy + 8);
        ctx.lineTo(cx + 7, cy + 2);
        ctx.lineTo(cx + 10, cy + 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    drawKoopa(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const walk = Math.sin(time * 10);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;
        const shellColor = state.shellColor || '#22b14c'; // Green or Red
        const shellBorder = state.shellBorder || '#156b2f';

        ctx.save();

        if (isChilled) {
            ctx.filter = 'hue-rotate(180deg) saturate(1.4)';
        }

        // Feet
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy + 21 + walk * 2.5, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 8, cy + 21 - walk * 2.5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell (Dominant feature)
        ctx.fillStyle = shellColor;
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy + 2, 17, 20, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = shellBorder;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Shell Rim (White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy + 16, 17, 5, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head (Yellow)
        ctx.fillStyle = '#ffd13b';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 10, 11, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b88d0d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Snout / Beak
        ctx.fillStyle = '#ffd13b';
        ctx.beginPath();
        ctx.ellipse(cx - 19, cy - 7, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Big friendly/goofy eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx - 13, cy - 12, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 12, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawHammerBro(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;

        ctx.save();
        if (isChilled) ctx.filter = 'hue-rotate(180deg) saturate(1.4)';

        // Koopa Base
        this.drawKoopa(ctx, x, y, width, height, { time, shellColor: '#0077b6', shellBorder: '#023e8a', chilled: false });

        // White Helmet with Chin Strap
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 15, 12, 10, -0.1, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2b2d42';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Held Hammer (Swings when winding up)
        const swing = Math.sin(time * 8) * 0.4;
        ctx.save();
        ctx.translate(cx - 20, cy);
        ctx.rotate(swing);
        // Handle
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-2, -18, 4, 24);
        // Hammer Head
        ctx.fillStyle = '#4a4e69';
        ctx.fillRect(-8, -26, 16, 10);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-8, -26, 16, 10);
        ctx.restore();

        ctx.restore();
    },

    drawParatroopa(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const wingFlap = Math.sin(time * 12) * 8;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();

        // Flapping White Wings on back
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 10 + wingFlap, 14, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        this.drawKoopa(ctx, x, y - 6, width, height, state);

        ctx.restore();
    },

    drawShyGuy(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const walk = Math.sin(time * 10);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;
        const maskHpRatio = state.maskHpRatio !== undefined ? state.maskHpRatio : 1.0;
        const maskBroken = state.maskBroken || (maskHpRatio <= 0);

        ctx.save();
        if (isChilled) ctx.filter = 'hue-rotate(180deg) saturate(1.4)';

        // Blue Shoes
        ctx.fillStyle = '#1e3d59';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy + 20 + walk * 2.5, 7, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 8, cy + 20 - walk * 2.5, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red Robe
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy + 18);
        ctx.lineTo(cx - 16, cy - 6);
        ctx.quadraticCurveTo(cx, cy - 26, cx + 16, cy - 6);
        ctx.lineTo(cx + 14, cy + 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#9d0208';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Belt with Gold Buckle
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 13, cy + 11, 26, 4);
        ctx.fillStyle = '#ffb703';
        ctx.fillRect(cx - 3, cy + 10, 6, 6);

        if (!maskBroken) {
            // White Mask (Tough Armor)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(cx - 3, cy - 6, 12, 14, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2b2d42';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Mask Eye Holes (Black)
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.ellipse(cx - 8, cy - 8, 2.5, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 1, cy - 8, 2.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Mask Mouth Hole
            ctx.beginPath();
            ctx.ellipse(cx - 3, cy + 1, 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Visual Cracks on mask as health depletes
            if (maskHpRatio < 0.66) {
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy - 14);
                ctx.lineTo(cx - 6, cy - 6);
                ctx.lineTo(cx - 3, cy - 2);
                ctx.stroke();
            }
            if (maskHpRatio < 0.33) {
                ctx.beginPath();
                ctx.moveTo(cx + 4, cy - 12);
                ctx.lineTo(cx + 1, cy - 4);
                ctx.lineTo(cx + 5, cy + 2);
                ctx.stroke();
            }
        } else {
            // UNMASKED SHY GUY! Terrified, blushing, comical expression!
            ctx.fillStyle = '#1a1a24';
            ctx.beginPath();
            ctx.ellipse(cx - 3, cy - 6, 11, 13, -0.1, 0, Math.PI * 2);
            ctx.fill();

            // Huge wide anime eyes (O_O)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 7, 4, 0, Math.PI * 2);
            ctx.arc(cx + 1, cy - 7, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 7, 2, 0, Math.PI * 2);
            ctx.arc(cx + 1, cy - 7, 2, 0, Math.PI * 2);
            ctx.fill();

            // Blushing red cheeks
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.arc(cx - 9, cy - 1, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 3, cy - 1, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Sweat droplet
            ctx.fillStyle = '#48cae4';
            ctx.beginPath();
            ctx.arc(cx + 7, cy - 12, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawBoo(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const float = Math.sin(time * 4) * 3;
        const cx = x + width / 2;
        const cy = y + height / 2 + float;
        const isAngry = state.isAngry || false;
        const isChilled = state.chilled || false;

        ctx.save();
        if (isChilled) ctx.filter = 'hue-rotate(180deg) saturate(1.4)';

        // Ghost Tail pointing back
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy + 6);
        ctx.quadraticCurveTo(cx + 28, cy + 18, cx + 22, cy + 2);
        ctx.quadraticCurveTo(cx + 20, cy - 4, cx + 12, cy - 6);
        ctx.fill();

        // Round Ghost Body (White sphere)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b0bec5';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (!isAngry) {
            // Shy stage: Covering eyes/face with white stubby hands!
            // Blushing pink cheeks
            ctx.fillStyle = '#ff85a1';
            ctx.beginPath();
            ctx.arc(cx - 10, cy + 4, 4, 0, Math.PI * 2);
            ctx.arc(cx + 10, cy + 4, 4, 0, Math.PI * 2);
            ctx.fill();

            // Stubby hands over eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(cx - 7, cy - 4, 7, 5, 0.3, 0, Math.PI * 2);
            ctx.ellipse(cx + 7, cy - 4, 7, 5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b0bec5';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Peeking eyes behind fingers
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 5, 1.8, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy - 5, 1.8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Enraged stage: Spooky angry Boo face!
            // Menacing eyebrows & eyes
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy - 12); ctx.lineTo(cx - 2, cy - 7);
            ctx.moveTo(cx + 12, cy - 12); ctx.lineTo(cx + 2, cy - 7);
            ctx.stroke();

            // Black eyes with red pinprick
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 6, 3, 0, Math.PI * 2);
            ctx.arc(cx + 7, cy - 6, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0054';
            ctx.beginPath();
            ctx.arc(cx - 7, cy - 6, 1.2, 0, Math.PI * 2);
            ctx.arc(cx + 7, cy - 6, 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Wide Open Screaming Mouth
            ctx.fillStyle = '#590d22';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 5, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Sharp White Fangs
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            // Top fangs
            ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 5, cy + 6); ctx.lineTo(cx - 2, cy);
            ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 5, cy + 6); ctx.lineTo(cx + 8, cy);
            // Bottom fangs
            ctx.moveTo(cx - 5, cy + 12); ctx.lineTo(cx - 3, cy + 8); ctx.lineTo(cx - 1, cy + 12);
            ctx.moveTo(cx + 1, cy + 12); ctx.lineTo(cx + 3, cy + 8); ctx.lineTo(cx + 5, cy + 12);
            ctx.fill();

            // Long Red Tongue sticking out
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 13, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Outstretched arms
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(cx - 20, cy - 2, 7, 5, -0.4, 0, Math.PI * 2);
            ctx.ellipse(cx + 20, cy - 2, 7, 5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b0bec5';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    },

    drawBoomBoom(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const walk = Math.sin(time * 8);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;
        const isSummoning = state.isSummoning || false;

        ctx.save();
        if (isChilled) ctx.filter = 'hue-rotate(180deg) saturate(1.4)';

        // Spiked Red Shell on Back
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 2, 20, 22, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#590d22';
        ctx.lineWidth = 3;
        ctx.stroke();

        // White spikes on shell
        ctx.fillStyle = '#ffffff';
        [-8, 0, 8].forEach(sy => {
            ctx.beginPath();
            ctx.moveTo(cx + 28, cy + sy - 4);
            ctx.lineTo(cx + 38, cy + sy);
            ctx.lineTo(cx + 28, cy + sy + 4);
            ctx.closePath();
            ctx.fill();
        });

        // Feet
        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy + 22 + walk * 2, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 10, cy + 22 - walk * 2, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d62828';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Muscular Orange Body
        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy + 4, 20, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d62828';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cream Chest/Belly Plate
        ctx.fillStyle = '#ffe3a8';
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy + 6, 12, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#f77f00';
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy - 14, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d62828';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Angry V-brows & Eyes
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 20); ctx.lineTo(cx - 6, cy - 15);
        ctx.moveTo(cx + 2, cy - 20); ctx.lineTo(cx - 4, cy - 15);
        ctx.stroke();

        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 14, 3, 0, Math.PI * 2);
        ctx.arc(cx - 2, cy - 14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - 11, cy - 14, 1.8, 0, Math.PI * 2);
        ctx.arc(cx - 3, cy - 14, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Sharp Teeth Snarl
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.rect(cx - 12, cy - 8, 12, 4);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx - 12, cy - 8, 12, 4);

        // Flailing Windmill Arms
        const armAngle = isSummoning ? time * 25 : Math.sin(time * 8) * 0.8;
        ctx.save();
        ctx.translate(cx - 6, cy - 2);
        ctx.rotate(armAngle);
        ctx.fillStyle = '#f77f00';
        ctx.fillRect(-16, -6, 32, 12);
        ctx.strokeStyle = '#d62828';
        ctx.lineWidth = 2;
        ctx.strokeRect(-16, -6, 32, 12);
        ctx.restore();

        ctx.restore();
    },

    drawSpiny(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const walk = Math.sin(time * 10);
        const cx = x + width / 2;
        const cy = y + height / 2;
        const isChilled = state.chilled || false;

        ctx.save();
        if (isChilled) ctx.filter = 'hue-rotate(180deg) saturate(1.4)';

        // Waddling Orange Feet
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy + 16 + walk * 2, 7, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 8, cy + 16 - walk * 2, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red Spiny Shell Dome
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9d0208';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Sharp White Conical Spikes
        const drawSpike = (sx, sy, angle) => {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.moveTo(-5, 0); ctx.lineTo(0, -14); ctx.lineTo(5, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#495057';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        };

        drawSpike(cx, cy - 10, 0);             // Top spike
        drawSpike(cx - 12, cy - 6, -0.6);      // Left-front spike
        drawSpike(cx + 12, cy - 6, 0.6);       // Right-back spike

        // Yellow Face Peeking out from shell
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy + 8, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e09f3e';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Black Bead Eye
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - 14, cy + 7, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawFlagGoomba(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();

        // Goomba Base
        this.drawGoomba(ctx, x, y, width, height, state);

        // Tall Wooden Flagpole held in hand
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(cx + 10, cy - 45, 4, 65);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 10, cy - 45, 4, 65);

        // Gold spearhead atop flagpole
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 54);
        ctx.lineTo(cx + 7, cy - 45);
        ctx.lineTo(cx + 17, cy - 45);
        ctx.closePath();
        ctx.fill();

        // Waving Red Bowser Banner Flag
        const wave = Math.sin(time * 8) * 3;
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 44);
        ctx.lineTo(cx + 42, cy - 40 + wave);
        ctx.lineTo(cx + 34, cy - 28 + wave * 0.5);
        ctx.lineTo(cx + 44, cy - 16 + wave);
        ctx.lineTo(cx + 14, cy - 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7f0909';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bowser Skull emblem on flag
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 26, cy - 30 + wave * 0.7, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx + 25, cy - 31 + wave * 0.7, 1, 0, Math.PI * 2);
        ctx.arc(cx + 28, cy - 31 + wave * 0.7, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawParagoomba(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const flap = Math.sin(time * 12) * 6;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();

        // Flapping White Wings on Goomba Head
        const drawWing = (wx, wy, flip) => {
            ctx.save();
            ctx.translate(wx, wy);
            ctx.scale(flip, 1);
            ctx.rotate(flap * 0.08);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(8, -8, 12, 6, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#adb5bd';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        };

        drawWing(cx - 10, cy - 14, -1);
        drawWing(cx + 10, cy - 14, 1);

        // Bungee Rope from sky if descending
        if (state.isBungee) {
            ctx.strokeStyle = '#e63946';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 20);
            ctx.lineTo(cx, -100);
            ctx.stroke();
        }

        // Goomba Base
        this.drawGoomba(ctx, x, y, width, height, state);

        ctx.restore();
    },

    // --- FINAL BOSS: BOWSER ---

    drawBowser(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const breath = Math.sin(time * 3) * 3;
        const isAttacking = state.isAttacking || false; // Mouth open & fire charging
        const attackCharge = state.attackCharge || 0; // 0 to 1
        const cx = x + width / 2;
        const cy = y + height / 2 + breath;
        const hpPct = state.hpPercent !== undefined ? state.hpPercent : 1;
        const isEnraged = hpPct < 0.3;

        ctx.save();

        // Enraged Aura
        if (isEnraged) {
            const auraPulse = 0.5 + 0.5 * Math.sin(time * 12);
            ctx.shadowColor = '#ff2a00';
            ctx.shadowBlur = 25 * auraPulse;
        }

        // Huge Spiky Green Shell on Back (Right side)
        ctx.fillStyle = '#198754';
        ctx.beginPath();
        ctx.ellipse(cx + 25, cy - 10, 52, 64, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f5132';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Spikes on Shell
        const spikes = [
            { x: cx + 45, y: cy - 45, angle: 0.6 },
            { x: cx + 65, y: cy - 15, angle: 0.2 },
            { x: cx + 55, y: cy + 20, angle: -0.3 },
            { x: cx + 30, y: cy - 60, angle: 1.0 },
            { x: cx + 35, y: cy + 45, angle: -0.7 }
        ];

        spikes.forEach(sp => {
            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.rotate(sp.angle);

            // Orange Ring around spike base
            ctx.fillStyle = '#fd7e14';
            ctx.beginPath();
            ctx.ellipse(0, 5, 9, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // White Horn Spike
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath();
            ctx.moveTo(-7, 5);
            ctx.lineTo(0, -22);
            ctx.lineTo(7, 5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#343a40';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        // Muscular Tail
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.moveTo(cx + 60, cy + 25);
        ctx.quadraticCurveTo(cx + 90, cy + 30, cx + 85, cy + 10);
        ctx.quadraticCurveTo(cx + 70, cy + 15, cx + 55, cy + 15);
        ctx.fill();
        ctx.strokeStyle = '#b78103';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Huge Massive Feet / Claws
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.ellipse(cx - 20, cy + 62, 22, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 25, cy + 64, 24, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b78103';
        ctx.lineWidth = 3;
        ctx.stroke();

        // White Toe Claws
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(cx - 36 + i * 11, cy + 63);
            ctx.lineTo(cx - 41 + i * 11, cy + 72);
            ctx.lineTo(cx - 31 + i * 11, cy + 72);
            ctx.closePath();
            ctx.fill();
        }

        // Scaly Yellow Torso & Belly Plates
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy + 14, 38, 48, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b78103';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Padded Segmented Tan Belly Plates
        ctx.fillStyle = '#ffe082';
        for (let i = -1; i <= 2; i++) {
            ctx.beginPath();
            ctx.ellipse(cx - 22, cy + 5 + i * 16, 22, 8, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b78103';
            ctx.lineWidth = 1.8;
            ctx.stroke();
        }

        // Spiked Wristbands (Black & Chrome)
        ctx.fillStyle = '#212529';
        ctx.fillRect(cx - 48, cy + 22, 14, 20);
        ctx.fillStyle = '#f8f9fa';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 52, cy + 25 + i * 6);
            ctx.lineTo(cx - 48, cy + 22 + i * 6);
            ctx.lineTo(cx - 48, cy + 28 + i * 6);
            ctx.fill();
        }

        // Green Horned Head
        ctx.fillStyle = '#198754';
        ctx.beginPath();
        ctx.ellipse(cx - 26, cy - 36, 28, 26, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f5132';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Yellow Horns
        const drawHorn = (hx, hy, angle, flip) => {
            ctx.save();
            ctx.translate(hx, hy);
            ctx.rotate(angle);
            ctx.fillStyle = '#ffca28';
            ctx.beginPath();
            ctx.moveTo(-6 * flip, 0);
            ctx.quadraticCurveTo(-14 * flip, -24, 0, -32);
            ctx.quadraticCurveTo(8 * flip, -18, 6 * flip, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#8d6e63';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        };
        drawHorn(cx - 18, cy - 58, 0.4, 1);
        drawHorn(cx + 2, cy - 52, 0.7, 1);

        // Fiery Red / Orange Spiked Mane & Eyebrows
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 56);
        ctx.lineTo(cx - 10, cy - 78);
        ctx.lineTo(cx + 5, cy - 65);
        ctx.lineTo(cx + 22, cy - 82);
        ctx.lineTo(cx + 28, cy - 58);
        ctx.lineTo(cx + 40, cy - 68);
        ctx.lineTo(cx + 34, cy - 42);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#842029';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Fierce Red Eyebrow
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.moveTo(cx - 44, cy - 44);
        ctx.lineTo(cx - 18, cy - 48);
        ctx.lineTo(cx - 22, cy - 38);
        ctx.closePath();
        ctx.fill();

        // Menacing Eyes (Red with black slit pupil)
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.ellipse(cx - 30, cy - 38, 7, 9, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.arc(cx - 32, cy - 38, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(cx - 33, cy - 42, 2.5, 8); // slit pupil

        // Snout & Huge Jaws
        ctx.fillStyle = '#ffe082';
        ctx.beginPath();
        ctx.ellipse(cx - 44, cy - 20, 22, 17, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b78103';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Nostril
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx - 56, cy - 25, 3.5, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth Opening & Fangs
        const mouthOpen = isAttacking ? 16 + attackCharge * 12 : 8;
        ctx.fillStyle = '#49111c';
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy - 14);
        ctx.quadraticCurveTo(cx - 38, cy - 14, cx - 28, cy - 10);
        ctx.quadraticCurveTo(cx - 38, cy - 14 + mouthOpen, cx - 58, cy - 14 + mouthOpen);
        ctx.closePath();
        ctx.fill();

        // Sharp White Fangs
        ctx.fillStyle = '#ffffff';
        // Upper fangs
        ctx.beginPath();
        ctx.moveTo(cx - 56, cy - 14); ctx.lineTo(cx - 52, cy - 6); ctx.lineTo(cx - 48, cy - 14);
        ctx.moveTo(cx - 42, cy - 14); ctx.lineTo(cx - 38, cy - 7); ctx.lineTo(cx - 34, cy - 14);
        ctx.fill();
        // Lower fangs
        ctx.beginPath();
        ctx.moveTo(cx - 52, cy - 14 + mouthOpen); ctx.lineTo(cx - 48, cy - 20 + mouthOpen); ctx.lineTo(cx - 44, cy - 14 + mouthOpen);
        ctx.fill();

        // Fire Charge inside Mouth when Attacking
        if (isAttacking || attackCharge > 0) {
            const fireRadius = 14 + Math.sin(time * 25) * 6 + attackCharge * 15;
            const fireGrad = ctx.createRadialGradient(cx - 58, cy - 12, 2, cx - 58, cy - 12, fireRadius);
            fireGrad.addColorStop(0, '#ffffff');
            fireGrad.addColorStop(0.3, '#ffea00');
            fireGrad.addColorStop(0.7, '#ff3d00');
            fireGrad.addColorStop(1, 'rgba(255, 61, 0, 0)');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.arc(cx - 58, cy - 12, fireRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    // --- LAWN CLEANER: KOOPA SHELL / MARIO KART ---

    drawLawnCleaner(ctx, x, y, width, height, state = {}) {
        const time = state.time || 0;
        const spinning = state.spinning || false;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();
        ctx.translate(cx, cy);

        if (spinning) {
            ctx.rotate(time * 25);
        }

        // Green Shell Body
        ctx.fillStyle = '#2ec4b6';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#011627';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Hexagon / White Shell Trim
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 10, 19, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center Shell Pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -8, 16, 12);

        ctx.restore();
    },

    // --- COINS ---

    drawCoin(ctx, x, y, radius = 13, state = {}) {
        const time = state.time || 0;
        const scaleX = Math.cos(time * 6);
        ctx.save();
        ctx.translate(x, y);

        // Pulsing Gold Aura
        const auraGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, radius * 1.6);
        auraGrad.addColorStop(0, 'rgba(255, 235, 59, 0.7)');
        auraGrad.addColorStop(1, 'rgba(255, 193, 7, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(Math.abs(scaleX) * 0.8 + 0.2, 1.0);

        // Gold Rim
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner Coin Face
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Center Vertical Bar
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-2, -radius * 0.5, 4, radius);

        ctx.restore();
    },

    // --- POOL WATER TILES ---

    drawWaterTile(ctx, x, y, width, height, time = 0) {
        ctx.save();

        // Base Water Blue Gradient
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, '#0077b6');
        grad.addColorStop(0.5, '#0096c7');
        grad.addColorStop(1, '#0077b6');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, width, height);

        // Subtle Pool Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Animated Water Waves / Caustics
        const waveOffset = Math.sin(time * 3 + x * 0.05) * 4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + height * 0.35 + waveOffset);
        ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.35 - waveOffset, x + width - 6, y + height * 0.35 + waveOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 10, y + height * 0.7 - waveOffset);
        ctx.quadraticCurveTo(x + width * 0.5, y + height * 0.7 + waveOffset, x + width - 10, y + height * 0.7 - waveOffset);
        ctx.stroke();

        ctx.restore();
    }
};

window.Sprites = Sprites;

