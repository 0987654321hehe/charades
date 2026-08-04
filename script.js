/ Charades PWA Complete JavaScript */

// --- UTILITY FUNCTIONS ---
const getEl = (id) => document.getElementById(id);

const addEvt = (id, event, handler, options = false) => {
const el = getEl(id);
if (el) el.addEventListener(event, handler, options);
};

const showEl = (id) => {
const el = getEl(id);
if (el) el.classList.remove('hidden');
};

const hideEl = (id) => {
const el = getEl(id);
if (el) el.classList.add('hidden');
};

// --- AUDIO SYNTHESIZER ---
class AudioEngine {
constructor() {
this.ctx = null;
this.enabled = true;
}

init() {
    if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
    }
}

playTone(frequency, type, duration, vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

playCorrect() {
    this.init();
    this.playTone(523.25, 'sine', 0.1); // C5
    setTimeout(() => this.playTone(880, 'sine', 0.2), 100); // A5
}

playSkip() {
    this.init();
    this.playTone(330, 'sawtooth', 0.1); // E4
    setTimeout(() => this.playTone(165, 'sawtooth', 0.2), 100); // E3
}

playBeep() {
    this.init();
    this.playTone(600, 'square', 0.1, 0.05);
}

playGameOver() {
    this.init();
    this.playTone(440, 'sine', 0.2);
    setTimeout(() => this.playTone(554, 'sine', 0.2), 200);
    setTimeout(() => this.playTone(659, 'sine', 0.4), 400);
    setTimeout(() => this.playTone(880, 'sine', 0.6), 600);
}
}
const audio = new AudioEngine();

// --- VIBRATION ENGINE ---
const vibrate = (pattern) => {
if (gameState.settings.vibe && 'vibrate' in navigator) {
try {
navigator.vibrate(pattern);
} catch (e) {
console.warn("Vibration error:", e);
}
}
};

// --- DATA ---
const CATEGORIES = {
animals: {
name: "Animals",
icon: "🦁",
words: ["Lion", "Tiger", "Elephant", "Monkey", "Giraffe", "Penguin", "Snake", "Kangaroo", "Duck", "Cheetah", "Octopus", "Sloth", "Flamingo", "Chameleon", "Platypus", "Walrus", "Peacock", "Hedgehog", "Komodo Dragon", "Axolotl", "Narwhal", "Pangolin", "Capybara", "Manatee", "Zebra", "Rhino", "Hippo", "Crocodile", "Alligator", "Bear"]
},
movies: {
name: "Movies",
icon: "🎬",
words: ["Titanic", "Avatar", "Frozen", "Shrek", "Jaws", "Lion King", "Spider-Man", "Batman", "Star Wars", "Jurassic Park", "Inception", "Interstellar", "Gladiator", "Matrix", "Avengers", "The Godfather", "Harry Potter", "Toy Story", "Up", "Coco", "Pulp Fiction", "Fight Club", "Parasite", "Whiplash", "Oppenheimer", "La La Land", "Dunkirk", "Memento", "The Prestige"]
},
tvshows: {
name: "TV Shows",
icon: "📺",
words: ["Breaking Bad", "Stranger Things", "Game of Thrones", "The Office", "Friends", "The Simpsons", "SpongeBob", "South Park", "Family Guy", "Rick and Morty", "The Walking Dead", "Black Mirror", "Peaky Blinders", "The Crown", "Squid Game", "Better Call Saul", "The Boys", "Mandalorian", "Succession", "Ted Lasso", "WandaVision", "Loki", "Daredevil", "Sherlock", "Doctor Who"]
},
food: {
name: "Food",
icon: "🍕",
words: ["Pizza", "Burger", "Ice Cream", "Banana", "Apple", "Sushi", "Taco", "Pancakes", "Fries", "Hot Dog", "Spaghetti", "Croissant", "Ramen", "Burrito", "Lasagna", "Cheesecake", "Waffles", "Guacamole", "Fondue", "Escargot", "Beef Wellington", "Macarons", "Paella", "Pho", "Soufflé", "Baklava", "Tiramisu", "Bacon", "Eggs", "Toast"]
},
countries: {
name: "Countries",
icon: "🌍",
words: ["USA", "Canada", "Mexico", "Brazil", "Argentina", "UK", "France", "Germany", "Italy", "Spain", "Russia", "China", "Japan", "South Korea", "India", "Australia", "Egypt", "South Africa", "Nigeria", "Kenya", "Sweden", "Norway", "Finland", "Ireland", "Scotland", "Greece", "Turkey", "Vietnam", "Thailand"]
},
sports: {
name: "Sports",
icon: "⚽",
words: ["Soccer", "Basketball", "Tennis", "Baseball", "Swimming", "Golf", "Running", "Boxing", "Volleyball", "Skateboarding", "Archery", "Surfing", "Bowling", "Gymnastics", "Skiing", "Curling", "Water Polo", "Fencing", "Bobsleigh", "Cricket", "Rugby", "Triathlon", "Badminton", "Table Tennis", "Wrestling", "Judo", "Karate", "Taekwondo"]
},
minecraft: {
name: "Minecraft",
icon: "⛏️",
words: ["Creeper", "Zombie", "Skeleton", "Diamond", "Crafting Table", "Enderman", "Pig", "Steve", "Nether Portal", "Ender Dragon", "Redstone", "Brewing Stand", "Ghast", "Blaze", "Villager", "Wither Boss", "Elytra", "Ocean Monument", "Shulker Box", "Beacon", "Conduit", "Pickaxe", "Sword", "Bow", "TNT", "Lava", "Water Bucket", "Obsidian"]
},
fortnite: {
name: "Fortnite",
icon: "🏆",
words: ["Battle Bus", "Chug Jug", "V-Bucks", "Llama", "Pickaxe", "Victory Royale", "Tilted Towers", "Boogie Bomb", "Slurp Juice", "Launch Pad", "Reboot Van", "Supply Drop", "Storm Circle", "Shield Potion", "Shadow Bomb", "Pump Shotgun", "Sniper Rifle", "Medkit", "Bandages", "Glider", "Emote", "Building", "Wood", "Brick", "Metal"]
},
science: {
name: "Science",
icon: "🔬",
words: ["Atom", "Molecule", "DNA", "Cell", "Gravity", "Friction", "Magnet", "Electricity", "Light", "Sound", "Planet", "Star", "Galaxy", "Black Hole", "Telescope", "Microscope", "Beaker", "Experiment", "Einstein", "Newton", "Periodic Table", "Oxygen", "Water", "Carbon", "Evolution", "Fossil", "Dinosaur", "Volcano", "Earthquake"]
},
school: {
name: "School",
icon: "📚",
words: ["Teacher", "Student", "Desk", "Chair", "Whiteboard", "Chalk", "Marker", "Pencil", "Pen", "Eraser", "Notebook", "Textbook", "Backpack", "Homework", "Test", "Exam", "Recess", "Cafeteria", "Library", "Principal", "Math", "Science", "History", "Art", "Music", "Gym", "Locker", "Bus", "Bell"]
},
music: {
name: "Music",
icon: "🎵",
words: ["Guitar", "Piano", "Drums", "Violin", "Flute", "Trumpet", "Saxophone", "Singer", "Microphone", "Concert", "Band", "Orchestra", "Song", "Note", "Chord", "Melody", "Rhythm", "Beat", "Pop", "Rock", "Jazz", "Classical", "Hip Hop", "Country", "Headphones", "Speaker", "Radio", "DJ"]
},
technology: {
name: "Technology",
icon: "💻",
words: ["Computer", "Smartphone", "Tablet", "Laptop", "Keyboard", "Mouse", "Monitor", "Printer", "Internet", "Website", "App", "Software", "Hardware", "Coding", "Programming", "Robot", "Artificial Intelligence", "Virtual Reality", "Augmented Reality", "Bluetooth", "Wi-Fi", "Battery", "Charger", "Camera", "Video Game", "Console", "Controller"]
},
random: {
name: "Random",
icon: "🎲",
words: [] // Will be populated dynamically from all categories
}
};

// Populate Random Category
Object.keys(CATEGORIES).forEach(key => {
if (key !== 'random') {
CATEGORIES.random.words = CATEGORIES.random.words.concat(CATEGORIES[key].words);
}
});

// --- STATE MANAGEMENT ---
let gameState = {
selectedCategory: null,
mode: 'solo',
difficulty: 'medium',
timerLength: 60,
timeRemaining: 60,
currentWordIndex: 0,
deck: [],
history: [],
score: 0,
correctCount: 0,
skippedCount: 0,
activeTeam: 'A',
teamNames: { A: 'Team 1', B: 'Team 2' },
timerInterval: null,
isPaused: false,
stats: {
gamesPlayed: 0,
highScore: 0,
totalCorrect: 0,
totalSkipped: 0,
totalPlayTime: 0, // in seconds internally
categoryCounts: {}
},
settings: {
theme: true, // true = dark, false = light
sound: true,
vibe: true,
tilt: true
}
};

// --- INITIALIZATION ---
const initApp = () => {
loadLocalStorage();
renderCategories();
setupEventListeners();
setupPWAInstall();
registerServiceWorker();
applySettingsUI();
};

const loadLocalStorage = () => {
try {
const savedStats = localStorage.getItem('charades_stats');
if (savedStats) gameState.stats = JSON.parse(savedStats);

    const savedSettings = localStorage.getItem('charades_settings');
    if (savedSettings) gameState.settings = JSON.parse(savedSettings);
} catch (e) {
    console.warn("Failed to load local storage", e);
}
};

const saveStats = () => {
try {
localStorage.setItem('charades_stats', JSON.stringify(gameState.stats));
} catch (e) { console.warn("Save stats failed", e); }
};

const saveSettings = () => {
try {
localStorage.setItem('charades_settings', JSON.stringify(gameState.settings));
} catch (e) { console.warn("Save settings failed", e); }
};

const applySettingsUI = () => {
const themeToggle = getEl('set-theme');
const soundToggle = getEl('set-sound');
const vibeToggle = getEl('set-vibe');
const tiltToggle = getEl('set-tilt');

if (themeToggle) themeToggle.checked = gameState.settings.theme;
if (soundToggle) soundToggle.checked = gameState.settings.sound;
if (vibeToggle) vibeToggle.checked = gameState.settings.vibe;
if (tiltToggle) tiltToggle.checked = gameState.settings.tilt;

if (!gameState.settings.theme) {
    document.body.classList.add('light-theme');
} else {
    document.body.classList.remove('light-theme');
}

audio.enabled = gameState.settings.sound;
};

// --- DOM RENDERERS ---
const renderCategories = () => {
const grid = getEl('category-grid');
if (!grid) return;

grid.innerHTML = '';
Object.keys(CATEGORIES).forEach(key => {
    const cat = CATEGORIES[key];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
        <div class="category-icon">${cat.icon}</div>
        <div class="category-title">${cat.name}</div>
    `;
    card.addEventListener('click', () => selectCategory(key));
    grid.appendChild(card);
});
};

// --- NAVIGATION ---
const showView = (viewId) => {
const views = ['view-home', 'view-setup', 'view-game', 'view-results'];
views.forEach(id => {
const el = getEl(id);
if (el) {
if (id === viewId) {
el.classList.add('active');
} else {
el.classList.remove('active');
}
}
});
};

const selectCategory = (catKey) => {
gameState.selectedCategory = catKey;
const title = getEl('setup-category-title');
if (title) title.innerText = ${CATEGORIES[catKey].name} Setup`;
showView('view-setup');
};

// --- EVENT LISTENERS ---
const setupEventListeners = () => {
// Top Bar
addEvt('btn-stats-open', 'click', openStatsModal);
addEvt('btn-stats-close', 'click', () => closeModal('modal-stats'));
addEvt('btn-settings-open', 'click', () => openModal('modal-settings'));
addEvt('btn-settings-close', 'click', () => closeModal('modal-settings'));

// Setup
addEvt('btn-setup-back', 'click', () => showView('view-home'));

setupSegmentControl('mode-selector', (val) => {
    gameState.mode = val;
    const container = getEl('team-names-container');
    if (container) {
        if (val === 'teams') container.classList.remove('hidden');
        else container.classList.add('hidden');
    }
});

setupSegmentControl('difficulty-selector', (val) => gameState.difficulty = val);
setupSegmentControl('timer-selector', (val) => gameState.timerLength = parseInt(val, 10));
addEvt('btn-start-game', 'click', startGame);

// Home
addEvt('btn-daily-challenge', 'click', startDailyChallenge);

// Gameplay
addEvt('btn-correct', 'click', handleCorrect);
addEvt('btn-skip', 'click', handleSkip);
addEvt('btn-pause', 'click', pauseGame);
addEvt('btn-resume', 'click', resumeGame);
addEvt('btn-quit', 'click', quitGame);

// Results
addEvt('btn-play-again', 'click', startGame);
addEvt('btn-home', 'click', () => showView('view-home'));

// Settings
addEvt('set-theme', 'change', (e) => {
    gameState.settings.theme = e.target.checked;
    applySettingsUI();
    saveSettings();
});
addEvt('set-sound', 'change', (e) => {
    gameState.settings.sound = e.target.checked;
    applySettingsUI();
    saveSettings();
});
addEvt('set-vibe', 'change', (e) => {
    gameState.settings.vibe = e.target.checked;
    saveSettings();
});
addEvt('set-tilt', 'change', (e) => {
    gameState.settings.tilt = e.target.checked;
    saveSettings();
});
addEvt('btn-reset-stats', 'click', resetStats);

// Gestures
setupSwipeGestures();
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleTilt);
}
};

const setupSegmentControl = (containerId, callback) => {
const container = getEl(containerId);
if (!container) return;
const buttons = container.querySelectorAll('.segment');
buttons.forEach(btn => {
btn.addEventListener('click', () => {
buttons.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
callback(btn.dataset.mode || btn.dataset.diff || btn.dataset.time);
});
});
};

// --- GAME LOGIC ---
const shuffleArray = (array) => {
const arr = [...array];
for (let i = arr.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
};

const startDailyChallenge = () => {
const keys = Object.keys(CATEGORIES).filter(k => k !== 'random');
const today = new Date();
// Simple deterministic random based on date
const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
const index = seed % keys.length;

gameState.selectedCategory = keys[index];
gameState.timerLength = 60;
gameState.mode = 'solo';
startGame();
};

const startGame = () => {
if (!gameState.selectedCategory) gameState.selectedCategory = 'random';
const cat = CATEGORIES[gameState.selectedCategory];

// Setup Deck
gameState.deck = shuffleArray(cat.words);
gameState.currentWordIndex = 0;
gameState.score = 0;
gameState.correctCount = 0;
gameState.skippedCount = 0;
gameState.history = [];
gameState.timeRemaining = gameState.timerLength;
gameState.isPaused = false;

// Team Mode Check
const indicator = getEl('game-team-indicator');
if (gameState.mode === 'teams') {
    const teamA = getEl('team-a-input');
    const teamB = getEl('team-b-input');
    gameState.teamNames.A = teamA ? teamA.value || 'Team 1' : 'Team 1';
    gameState.teamNames.B = teamB ? teamB.value || 'Team 2' : 'Team 2';
    if (indicator) {
        indicator.innerText = `Playing: ${gameState.teamNames[gameState.activeTeam]}`;
        indicator.classList.remove('hidden');
    }
} else {
    if (indicator) indicator.classList.add('hidden');
}

updateGameUI();
showView('view-game');
audio.init(); // Must be initialized on user gesture
nextWord();
startTimer();
};

const nextWord = () => {
if (gameState.currentWordIndex >= gameState.deck.length) {
gameState.deck = shuffleArray(gameState.deck);
gameState.currentWordIndex = 0;
}
const currentWord = gameState.deck[gameState.currentWordIndex];
const wordEl = getEl('card-word');
if (wordEl) wordEl.innerText = currentWord;
};

const handleCorrect = () => {
if (gameState.isPaused) return;
vibrate(50);
audio.playCorrect();
gameState.score += 1; // +1 Point for correct
gameState.correctCount++;
gameState.history.push({ word: gameState.deck[gameState.currentWordIndex], result: 'correct' });
gameState.currentWordIndex++;
animateCard('right');
updateGameUI();
nextWord();
};

const handleSkip = () => {
if (gameState.isPaused) return;
vibrate([30, 50, 30]);
audio.playSkip();
gameState.skippedCount++;
gameState.history.push({ word: gameState.deck[gameState.currentWordIndex], result: 'skipped' });
gameState.currentWordIndex++;
animateCard('left');
updateGameUI();
nextWord();
};

const animateCard = (direction) => {
const card = getEl('word-card');
if (!card) return;

const x = direction === 'right' ? 300 : -300;
card.style.transition = 'transform 0.2s ease-in, opacity 0.2s ease-in';
card.style.transform = `translateX(${x}px) rotate(${direction === 'right' ? 20 : -20}deg)`;
card.style.opacity = '0';

setTimeout(() => {
    card.style.transition = 'none';
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = '1';
}, 200);
};

const updateGameUI = () => {
const scoreEl = getEl('game-score');
const timerEl = getEl('timer-display');
if (scoreEl) scoreEl.innerText = gameState.score;
if (timerEl) timerEl.innerText = gameState.timeRemaining;
};

const startTimer = () => {
clearInterval(gameState.timerInterval);
gameState.timerInterval = setInterval(() => {
if (!gameState.isPaused) {
gameState.timeRemaining--;
updateGameUI();

        if (gameState.timeRemaining <= 5 && gameState.timeRemaining > 0) {
            audio.playBeep();
        }
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }
}, 1000);
};

const pauseGame = () => {
gameState.isPaused = true;
openModal('modal-pause');
};

const resumeGame = () => {
gameState.isPaused = false;
closeModal('modal-pause');
};

const quitGame = () => {
clearInterval(gameState.timerInterval);
closeModal('modal-pause');
showView('view-home');
};

const endGame = () => {
clearInterval(gameState.timerInterval);
vibrate([100, 50, 100, 50, 200]);
audio.playGameOver();

// Stats updates
gameState.stats.gamesPlayed++;
gameState.stats.totalCorrect += gameState.correctCount;
gameState.stats.totalSkipped += gameState.skippedCount;
gameState.stats.totalPlayTime += gameState.timerLength;
if (gameState.score > gameState.stats.highScore) {
    gameState.stats.highScore = gameState.score;
}

const catName = gameState.selectedCategory;
gameState.stats.categoryCounts[catName] = (gameState.stats.categoryCounts[catName] || 0) + 1;
saveStats();

// UI Updates
const fScore = getEl('final-score');
const rCorrect = getEl('res-correct');
const rSkipped = getEl('res-skipped');
const list = getEl('words-summary-list');

if (fScore) fScore.innerText = gameState.score;
if (rCorrect) rCorrect.innerText = gameState.correctCount;
if (rSkipped) rSkipped.innerText = gameState.skippedCount;
if (list) {
    list.innerHTML = gameState.history.map(item => `
        <div class="res-item" style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
            <span>${item.word}</span>
            <strong class="${item.result === 'correct' ? 'text-success' : 'text-danger'}">${item.result.toUpperCase()}</strong>
        </div>
    `).join('');
}

if (gameState.mode === 'teams') {
    gameState.activeTeam = gameState.activeTeam === 'A' ? 'B' : 'A';
}

showView('view-results');
};

// --- GESTURES & SENSORS ---
const setupSwipeGestures = () => {
const card = getEl('word-card');
if (!card) return;

let startX = 0;
let startY = 0;

card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, { passive: true });

card.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 60) handleCorrect();
        else if (diffX < -60) handleSkip();
    }
}, { passive: true });
};

let lastTiltTime = 0;
const handleTilt = (e) => {
const gameView = getEl('view-game');
if (!gameState.settings.tilt || gameState.isPaused || !gameView || !gameView.classList.contains('active')) return;

const now = Date.now();
if (now - lastTiltTime < 1000) return;

const beta = e.beta; 
if (beta > 45 && beta < 90) { // Tilt down
    lastTiltTime = now;
    handleCorrect();
} else if (beta < -15 && beta > -90) { // Tilt up
    lastTiltTime = now;
    handleSkip();
}
};

// --- MODALS & STATS ---
const openModal = (id) => {
const el = getEl(id);
if (el) el.classList.add('active');
};

const closeModal = (id) => {
const el = getEl(id);
if (el) el.classList.remove('active');
};

const openStatsModal = () => {
const setVal = (id, val) => {
const el = getEl(id);
if (el) el.innerText = val;
};

setVal('st-games', gameState.stats.gamesPlayed);
setVal('st-high', gameState.stats.highScore);
setVal('st-correct', gameState.stats.totalCorrect);
setVal('st-skipped', gameState.stats.totalSkipped);
setVal('st-time', `${Math.round(gameState.stats.totalPlayTime / 60)}m`);

let topCat = '-';
let max = 0;
Object.keys(gameState.stats.categoryCounts).forEach(cat => {
    if (gameState.stats.categoryCounts[cat] > max) {
        max = gameState.stats.categoryCounts[cat];
        topCat = CATEGORIES[cat] ? CATEGORIES[cat].name : cat;
    }
});
setVal('st-fav', topCat);

openModal('modal-stats');
};

const resetStats = () => {
if (confirm("Reset all statistics? This cannot be undone.")) {
gameState.stats = {
gamesPlayed: 0,
highScore: 0,
totalCorrect: 0,
totalSkipped: 0,
totalPlayTime: 0,
categoryCounts: {}
};
saveStats();
closeModal('modal-settings');
}
};

// --- PWA ---
let deferredPrompt;
const setupPWAInstall = () => {
const banner = getEl('pwa-install-banner');
const btn = getEl('btn-pwa-install');

if (!banner || !btn) return;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.remove('hidden');
});

btn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            banner.classList.add('hidden');
        });
    }
});
};

const registerServiceWorker = () => {
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('service-worker.js')
.then(() => console.log('SW Registered'))
.catch(err => console.warn('SW Registration failed:', err));
}
};

// Bootstrap
window.addEventListener('DOMContentLoaded', initApp);