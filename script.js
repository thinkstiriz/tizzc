'use strict';

// DOM Elements
const canvas = document.getElementById('rockCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const mascot = document.querySelector('.rocky-mascot');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const notification = document.getElementById('notification');
const rockSpinner = document.getElementById('rockSpinner');
const soundToggle = document.getElementById('soundToggle');
const brushColor = document.getElementById('brushColor');
const brushSize = document.getElementById('brushSize');
const sprayModeBtn = document.getElementById('sprayMode');
const eraserModeBtn = document.getElementById('eraserMode');

// State Variables
let isDrawing = false;
let sprayMode = false;
let eraserMode = false;
let glitterMode = false;
let currentRock = 'assets/rock_base1.png';
let history = [];
let colorHistory = ['#FF69B4', '#00FF99', '#FFD700'];
let stamps = ['assets/stamp_rock1.png', 'assets/stamp_rock2.png', 'assets/stamp_rock3.png'];
let currentStampIndex = 0;
let lastPosition = { x: 0, y: 0 };

// Sound Effects with Fallback
const sounds = {
    paint: createAudio('assets/paint_spray.mp3'),
    click: createAudio('assets/click.mp3'),
    splat: createAudio('assets/splat.mp3'),
    spin: createAudio('assets/spin.mp3'),
    pop: createAudio('assets/pop.mp3')
};

function createAudio(src) {
    try {
        const audio = new Audio(src);
        audio.volume = 0.5;
        return audio;
    } catch (e) {
        console.warn(`Failed to load audio: ${src}`);
        return { play: () => {}, currentTime: 0 };
    }
}

function playSound(sound) {
    if (soundToggle && soundToggle.checked) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn('Audio playback failed:', e));
    }
}

// Animation Utilities
function createElement(className, styles = {}) {
    const el = document.createElement('div');
    el.className = className;
    Object.assign(el.style, styles);
    document.body.appendChild(el);
    return el;
}

// Bouncing Rocks with Pop Effect
function createBouncingRocks() {
    const maxRocks = 5;
    if (document.querySelectorAll('.bouncing-rock').length >= maxRocks) return;
    const rock = createElement('bouncing-rock', {
        left: `${Math.random() * window.innerWidth}px`,
        animationDuration: `${8 + Math.random() * 10}s`
    });
    setTimeout(() => {
        createPopEffect(parseFloat(rock.style.left), window.innerHeight);
        rock.remove();
    }, 15000);
}

// Pop Effect
function createPopEffect(x, y) {
    for (let i = 0; i < 10; i++) {
        const pop = createElement('pop-effect', {
            left: `${x + (Math.random() - 0.5) * 20}px`,
            top: `${y}px`,
            width: '15px',
            height: '15px',
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
            animation: `pop 0.5s ease-out forwards`
        });
        pop.style.transform = `translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 50}px)`;
        setTimeout(() => pop.remove(), 500);
    }
    playSound(sounds.pop);
}

// Paint Splatter Effect
function createSplatter(x, y, size = 50) {
    const splatter = createElement('paint-splatter', {
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
    setTimeout(() => splatter.remove(), 1000);
    playSound(sounds.splat);
}

// Confetti Burst
function createConfetti(x, y) {
    for (let i = 0; i < 20; i++) {
        const confetti = createElement('confetti', {
            left: `${x + (Math.random() - 0.5) * 50}px`,
            top: `${y}px`,
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
            transform: `rotate(${Math.random() * 360}deg)`
        });
        confetti.style.animation = `confettiFall ${1 + Math.random()}s ease-out forwards`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        setTimeout(() => confetti.remove(), 2000);
    }
    playSound(sounds.pop);
}

// Sparkle Effect
function createSparkle(x, y) {
    const sparkle = createElement('sparkle', {
        left: `${x}px`,
        top: `${y}px`,
        width: '20px',
        height: '20px',
        background: 'radial-gradient(circle, #FFD700, transparent)'
    });
    sparkle.style.animation = 'sparkle 0.8s ease-out forwards';
    setTimeout(() => sparkle.remove(), 800);
}

// Rainbow Trail
function createRainbowTrail(x, y) {
    if (Math.random() < 0.15) {
        const sparkle = createElement('rainbow-trail', {
            left: `${x}px`,
            top: `${y}px`,
            width: '15px',
            height: '15px',
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
            animation: `sparkle 0.5s ease-out forwards`
        });
        setTimeout(() => sparkle.remove(), 500);
    }
}

// Floating Stickers
function createFloatingSticker() {
    const section = document.querySelector('.section:not(#painter)');
    const sticker = createElement('floating-sticker', {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: '50px',
        height: '50px',
        background: `url(${stamps[Math.floor(Math.random() * stamps.length)]}) no-repeat center`,
        backgroundSize: 'contain',
        animation: `floatSticker ${5 + Math.random() * 5}s ease-in-out forwards`
    });
    section.appendChild(sticker);
    setTimeout(() => sticker.remove(), 10000);
}

// Wobble Effect for Cards
function addWobbleEffect() {
    const cards = document.querySelectorAll('.feature-card, .roadmap-item, .nft-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('wobble');
                setTimeout(() => entry.target.classList.remove('wobble'), 1000);
            }
        });
    }, { threshold: 0.5 });
    cards.forEach(card => observer.observe(card));
}

// Shake Screen Effect
function shakeScreen() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
    playSound(sounds.click);
}

// Copy to Clipboard
function copyToClipboard() {
    navigator.clipboard.writeText('5uiEw5iaZaW7hz7H9fSCWii2vZrDWBhHv371t6yXKSDR').then(() => {
        notification.classList.add('show');
        createConfetti(window.innerWidth / 2, window.innerHeight - 100);
        setTimeout(() => notification.classList.remove('show'), 2000);
        playSound(sounds.click);
    }).catch(e => console.error('Clipboard error:', e));
}

// Canvas Initialization
function initCanvas() {
    if (!canvas || !ctx) {
        console.error('Canvas or context not found');
        return;
    }
    canvas.width = 500;
    canvas.height = 350;

    const rockImage = new Image();
    rockImage.src = currentRock;
    rockImage.onerror = () => console.error(`Failed to load image: ${currentRock}`);
    rockImage.onload = () => {
        ctx.drawImage(rockImage, 0, 0, canvas.width, canvas.height);
        saveState();
    };

    // Consolidated Event Listeners
    const handleStart = (e) => {
        e.preventDefault();
        const pos = getEventPosition(e);
        isDrawing = true;
        lastPosition = pos;
        draw(pos);
    };

    const handleMove = (e) => {
        e.preventDefault();
        if (isDrawing) {
            const pos = getEventPosition(e);
            draw(pos);
            lastPosition = pos;
        }
    };

    const handleEnd = () => {
        isDrawing = false;
        ctx.beginPath();
        if (isDrawing) saveState();
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseout', handleEnd);
    canvas.addEventListener('touchstart', (e) => handleStart(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => handleMove(e.touches[0]));
    canvas.addEventListener('touchend', handleEnd);

    // Rock Base Change
    document.getElementById('rockBase').addEventListener('change', (e) => {
        currentRock = e.target.value;
        const rockImage = new Image();
        rockImage.src = currentRock;
        rockImage.onerror = () => console.error(`Failed to load image: ${currentRock}`);
        rockImage.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(rockImage, 0, 0, canvas.width, canvas.height);
            saveState();
        };
        playSound(sounds.click);
    });

    // Brush Modes
    sprayModeBtn.addEventListener('click', () => {
        sprayMode = !sprayMode;
        eraserMode = false;
        glitterMode = false;
        updateButtonStyles();
        playSound(sounds.click);
    });

    eraserModeBtn.addEventListener('click', () => {
        eraserMode = !eraserMode;
        sprayMode = false;
        glitterMode = false;
        updateButtonStyles();
        playSound(sounds.click);
    });

    document.getElementById('glitterMode')?.addEventListener('click', () => {
        glitterMode = !glitterMode;
        sprayMode = false;
        eraserMode = false;
        updateButtonStyles();
        playSound(sounds.click);
    });

    // Color History
    brushColor.addEventListener('change', () => {
        const color = brushColor.value;
        if (!colorHistory.includes(color)) {
            colorHistory.push(color);
            if (colorHistory.length > 5) colorHistory.shift();
            updateColorHistory();
        }
    });

    // Stamp Tool
    canvas.addEventListener('click', (e) => {
        if (!isDrawing && !sprayMode && !eraserMode && !glitterMode) {
            const pos = getEventPosition(e);
            const stamp = new Image();
            stamp.src = stamps[currentStampIndex];
            stamp.onerror = () => console.error(`Failed to load stamp: ${stamps[currentStampIndex]}`);
            stamp.onload = () => {
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate((Math.random() - 0.5) * Math.PI / 4);
                ctx.drawImage(stamp, -25, -25, 50, 50);
                ctx.restore();
                saveState();
                createSplatter(pos.clientX, pos.clientY, 40);
                playSound(sounds.splat);
            };
            currentStampIndex = (currentStampIndex + 1) % stamps.length;
        }
    });
}

// Update Button Styles
function updateButtonStyles() {
    sprayModeBtn.style.background = sprayMode ? 'var(--secondary)' : 'var(--accent)';
    eraserModeBtn.style.background = eraserMode ? 'var(--secondary)' : 'var(--accent)';
    const glitterModeBtn = document.getElementById('glitterMode');
    if (glitterModeBtn) {
        glitterModeBtn.style.background = glitterMode ? 'var(--secondary)' : 'var(--accent)';
    }
}

// Get Event Position
function getEventPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY
    };
}

// Save Canvas State
function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 20) history.shift();
}

// Update Color History Palette
function updateColorHistory() {
    const controls = document.querySelector('.painter-controls');
    document.querySelectorAll('.color-swatch').forEach(swatch => swatch.remove());
    colorHistory.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        swatch.style.width = '30px';
        swatch.style.height = '30px';
        swatch.style.border = '2px solid var(--dark)';
        swatch.style.borderRadius = '50%';
        swatch.style.cursor = 'pointer';
        swatch.addEventListener('click', () => {
            brushColor.value = color;
            playSound(sounds.click);
        });
        controls.appendChild(swatch);
    });
}

// Drawing Logic
function draw(e) {
    if (!isDrawing) return;
    const { x, y, clientX, clientY } = e;
    const size = brushSize.value;
    const color = brushColor.value;

    ctx.globalCompositeOperation = eraserMode ? 'destination-out' : 'source-over';

    if (glitterMode) {
        for (let i = 0; i < 10; i++) {
            const offsetX = x + (Math.random() - 0.5) * size;
            const offsetY = y + (Math.random() - 0.5) * size;
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, Math.random() * 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 70%)`;
            ctx.fill();
            createSparkle(clientX, clientY);
        }
    } else if (sprayMode) {
        for (let i = 0; i < 15; i++) {
            const offsetX = x + (Math.random() - 0.5) * size * 2;
            const offsetY = y + (Math.random() - 0.5) * size * 2;
            const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2);
            if (distance < size) {
                ctx.beginPath();
                ctx.arc(offsetX, offsetY, Math.random() * 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(lastPosition.x, lastPosition.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    createSplatter(clientX, clientY);
    playSound(sounds.paint);
}

// Canvas Controls
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rockImage = new Image();
    rockImage.src = currentRock;
    rockImage.onerror = () => console.error(`Failed to load image: ${currentRock}`);
    rockImage.onload = () => {
        ctx.drawImage(rockImage, 0, 0, canvas.width, canvas.height);
        saveState();
    };
    createConfetti(window.innerWidth / 2, canvas.getBoundingClientRect().top + canvas.height / 2);
    playSound(sounds.click);
}

function undoCanvas() {
    if (history.length > 1) {
        history.pop();
        const img = new Image();
        img.src = history[history.length - 1];
        img.onerror = () => console.error('Failed to load undo state');
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }
    playSound(sounds.click);
}

function downloadRock() {
    const link = document.createElement('a');
    link.download = 'my_rocky_art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    createConfetti(window.innerWidth / 2, canvas.getBoundingClientRect().top + canvas.height / 2);
    playSound(sounds.click);
}

function saveToGallery() {
    const dataURL = canvas.toDataURL('image/png');
    let gallery = JSON.parse(localStorage.getItem('rockyGallery') || '[]');
    gallery.push(dataURL);
    if (gallery.length > 10) gallery.shift();
    localStorage.setItem('rockyGallery', JSON.stringify(gallery));
    alert('Artwork saved to gallery!');
    createConfetti(window.innerWidth / 2, canvas.getBoundingClientRect().top + canvas.height / 2);
    playSound(sounds.click);
}

// Spin the Rock Game
function spinRock() {
    const randomDeg = Math.floor(Math.random() * 360) + 720;
    rockSpinner.style.transform = `rotate(${randomDeg}deg)`;
    rockSpinner.style.transition = 'transform 2s ease-out';
    playSound(sounds.spin);
    setTimeout(() => {
        const rewards = [
            'Virtual Rock Sticker! 🪨',
            'Painted Rock NFT Voucher! 🎨',
            '$RARE Meme Token! 💸',
            'Exclusive Rocky Dance! 💃'
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        alert(`You won: ${reward}`);
        createConfetti(window.innerWidth / 2, window.innerHeight / 2);
    }, 2000);
}

// Initialize Animations
function initAnimations() {
    createBouncingRocks();
    setInterval(createBouncingRocks, 12000);
    setInterval(createFloatingSticker, 5000);

    document.querySelectorAll('.cta-button, .social-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
            playSound(sounds.click);
        });
        btn.addEventListener('mouseenter', (e) => {
            const rect = btn.getBoundingClientRect();
            createSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            btn.classList.add('jumpy');
            setTimeout(() => btn.classList.remove('jumpy'), 500);
        });
    });

    document.querySelectorAll('.nft-card').forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const rect = card.getBoundingClientRect();
            createSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
        });
    });

    addWobbleEffect();
    document.querySelector('.sticky-buy')?.addEventListener('click', shakeScreen);

    document.querySelectorAll('.section').forEach(section => {
        const brush = createElement('floating-brush', {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`
        });
        section.appendChild(brush);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initAnimations();

    if (mascot) {
        document.addEventListener('mousemove', (e) => {
            mascot.style.left = `${e.clientX + 20}px`;
            mascot.style.top = `${e.clientY + 20}px`;
            createRainbowTrail(e.clientX, e.clientY);
        });

        mascot.addEventListener('mouseenter', () => {
            mascot.classList.add('dance');
            setTimeout(() => mascot.classList.remove('dance'), 1000);
        });
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            playSound(sounds.click);
        });
    }

    console.log('Rocky Art Reward script initialized');
});

// Additional CSS for Animations
const style = document.createElement('style');
style.textContent = `
    .pop-effect {
        position: fixed;
        border-radius: 50%;
    }
    @keyframes pop {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
    }
    .rainbow-trail {
        position: fixed;
        border-radius: 50%;
    }
    .floating-sticker {
        position: absolute;
        opacity: 0;
    }
    @keyframes floatSticker {
        0% { opacity: 0; transform: translateY(0); }
        50% { opacity: 0.8; transform: translateY(-50px); }
        100% { opacity: 0; transform: translateY(-100px); }
    }
    .sparkle {
        position: fixed;
        animation: sparkle 0.8s ease-out forwards;
    }
    @keyframes sparkle {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
    }
    .wobble {
        animation: wobble 0.5s ease-in-out;
    }
    @keyframes wobble {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        75% { transform: rotate(-5deg); }
    }
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .dance {
        animation: dance 1s ease-in-out;
    }
    @keyframes dance {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.2) rotate(10deg); }
    }
    .jumpy {
        animation: jumpy 0.5s ease-in-out;
    }
    @keyframes jumpy {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(5deg); }
    }
`;
document.head.appendChild(style);