/* Charades PWA - Complete script.js */

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

/* =========================
   AUDIO
========================= */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    playTone(frequency, type, duration, volume = 0.1) {
        if (!this.enabled || !this.ctx) return;

        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }

            const oscillator = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(
                frequency,
                this.ctx.currentTime
            );

            gain.gain.setValueAtTime(
                volume,
                this.ctx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                this.ctx.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(this.ctx.destination);

            oscillator.start();
            oscillator.stop(this.ctx.currentTime + duration);
        } catch (error) {
            console.warn('Audio error:', error);
        }
    }

    playCorrect() {
        this.init();
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(880, 'sine', 0.2), 100);
    }

    playSkip() {
        this.init();
        this.playTone(330, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(165, 'sawtooth', 0.2), 100);
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

/* =========================
   VIBRATION
========================= */

const vibrate = (pattern) => {
    if (
        gameState.settings.vibe &&
        'vibrate' in navigator
    ) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Vibration error:', error);
        }
    }
};

/* =========================
   DATA
========================= */

const CATEGORIES = {
    animals: {
        name: 'Animals',
        icon: '🦁',
        words: [
            'Lion', 'Tiger', 'Elephant', 'Monkey', 'Giraffe',
            'Penguin', 'Snake', 'Kangaroo', 'Duck', 'Cheetah',
            'Octopus', 'Sloth', 'Flamingo', 'Chameleon',
            'Platypus', 'Walrus', 'Peacock', 'Hedgehog',
            'Komodo Dragon', 'Axolotl', 'Narwhal', 'Pangolin',
            'Capybara', 'Manatee', 'Zebra', 'Rhino', 'Hippo',
            'Crocodile', 'Alligator', 'Bear'
        ]
    },

    movies: {
        name: 'Movies',
        icon: '🎬',
        words: [
            'Titanic', 'Avatar', 'Frozen', 'Shrek', 'Jaws',
            'Lion King', 'Spider-Man', 'Batman', 'Star Wars',
            'Jurassic Park', 'Inception', 'Interstellar',
            'Gladiator', 'Matrix', 'Avengers', 'The Godfather',
            'Harry Potter', 'Toy Story', 'Up', 'Coco',
            'Pulp Fiction', 'Fight Club', 'Parasite', 'Whiplash',
            'Oppenheimer', 'La La Land', 'Dunkirk', 'Memento',
            'The Prestige'
        ]
    },

    tvshows: {
        name: 'TV Shows',
        icon: '📺',
        words: [
            'Breaking Bad', 'Stranger Things', 'Game of Thrones',
            'The Office', 'Friends', 'The Simpsons', 'SpongeBob',
            'South Park', 'Family Guy', 'Rick and Morty',
            'The Walking Dead', 'Black Mirror', 'Peaky Blinders',
            'The Crown', 'Squid Game', 'Better Call Saul',
            'The Boys', 'Mandalorian', 'Succession', 'Ted Lasso',
            'WandaVision', 'Loki', 'Daredevil', 'Sherlock',
            'Doctor Who'
        ]
    },

    food: {
        name: 'Food',
        icon: '🍕',
        words: [
            'Pizza', 'Burger', 'Ice Cream', 'Banana', 'Apple',
            'Sushi', 'Taco', 'Pancakes', 'Fries', 'Hot Dog',
            'Spaghetti', 'Croissant', 'Ramen', 'Burrito',
            'Lasagna', 'Cheesecake', 'Waffles', 'Guacamole',
            'Fondue', 'Escargot', 'Beef Wellington', 'Macarons',
            'Paella', 'Pho', 'Soufflé', 'Baklava', 'Tiramisu',
            'Bacon', 'Eggs', 'Toast'
        ]
    },

    countries: {
        name: 'Countries',
        icon: '🌍',
        words: [
            'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina',
            'UK', 'France', 'Germany', 'Italy', 'Spain', 'Russia',
            'China', 'Japan', 'South Korea', 'India', 'Australia',
            'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Sweden',
            'Norway', 'Finland', 'Ireland', 'Scotland', 'Greece',
            'Turkey', 'Vietnam', 'Thailand'
        ]
    },

    sports: {
        name: 'Sports',
        icon: '⚽',
        words: [
            'Soccer', 'Basketball', 'Tennis', 'Baseball',
            'Swimming', 'Golf', 'Running', 'Boxing', 'Volleyball',
            'Skateboarding', 'Archery', 'Surfing', 'Bowling',
            'Gymnastics', 'Skiing', 'Curling', 'Water Polo',
            'Fencing', 'Bobsleigh', 'Cricket', 'Rugby',
            'Triathlon', 'Badminton', 'Table Tennis', 'Wrestling',
            'Judo', 'Karate', 'Taekwondo'
        ]
    },

    minecraft: {
        name: 'Minecraft',
        icon: '⛏️',
        words: [
            'Creeper', 'Zombie', 'Skeleton', 'Diamond',
            'Crafting Table', 'Enderman', 'Pig', 'Steve',
            'Nether Portal', 'Ender Dragon', 'Redstone',
            'Brewing Stand', 'Ghast', 'Blaze', 'Villager',
            'Wither Boss', 'Elytra', 'Ocean Monument',
            'Shulker Box', 'Beacon', 'Conduit', 'Pickaxe',
            'Sword', 'Bow', 'TNT', 'Lava', 'Water Bucket',
            'Obsidian'
        ]
    },

    fortnite: {
        name: 'Fortnite',
        icon: '🏆',
        words: [
            'Battle Bus', 'Chug Jug', 'V-Bucks', 'Llama',
            'Pickaxe', 'Victory Royale', 'Tilted Towers',
            'Boogie Bomb', 'Slurp Juice', 'Launch Pad',
            'Reboot Van', 'Supply Drop', 'Storm Circle',
            'Shield Potion', 'Shadow Bomb', 'Pump Shotgun',
            'Sniper Rifle', 'Medkit', 'Bandages', 'Glider',
            'Emote', 'Building', 'Wood', 'Brick', 'Metal'
        ]
    },

    science: {
        name: 'Science',
        icon: '🔬',
        words: [
            'Atom', 'Molecule', 'DNA', 'Cell', 'Gravity',
            'Friction', 'Magnet', 'Electricity', 'Light', 'Sound',
            'Planet', 'Star', 'Galaxy', 'Black Hole',
            'Telescope', 'Microscope', 'Beaker', 'Experiment',
            'Einstein', 'Newton', 'Periodic Table', 'Oxygen',
            'Water', 'Carbon', 'Evolution', 'Fossil',
            'Dinosaur', 'Volcano', 'Earthquake'
        ]
    },

    school: {
        name: 'School',
        icon: '📚',
        words: [
            'Teacher', 'Student', 'Desk', 'Chair', 'Whiteboard',
            'Chalk', 'Marker', 'Pencil', 'Pen', 'Eraser',
            'Notebook', 'Textbook', 'Backpack', 'Homework',
            'Test', 'Exam', 'Recess', 'Cafeteria', 'Library',
            'Principal', 'Math', 'Science', 'History', 'Art',
            'Music', 'Gym', 'Locker', 'Bus', 'Bell'
        ]
    },

    music: {
        name: 'Music',
        icon: '🎵',
        words: [
            'Guitar', 'Piano', 'Drums', 'Violin', 'Flute',
            'Trumpet', 'Saxophone', 'Singer', 'Microphone',
            'Concert', 'Band', 'Orchestra', 'Song', 'Note',
            'Chord', 'Melody', 'Rhythm', 'Beat', 'Pop', 'Rock',
            'Jazz', 'Classical', 'Hip Hop', 'Country',
            'Headphones', 'Speaker', 'Radio', 'DJ'
        ]
    },

    technology: {
        name: 'Technology',
        icon: '💻',
        words: [
            'Computer', 'Smartphone', 'Tablet', 'Laptop',
            'Keyboard', 'Mouse', 'Monitor', 'Printer', 'Internet',
            'Website', 'App', 'Software', 'Hardware', 'Coding',
            'Programming', 'Robot', 'Artificial Intelligence',
            'Virtual Reality', 'Augmented Reality', 'Bluetooth',
            'Wi-Fi', 'Battery', 'Charger', 'Camera', 'Video Game',
            'Console', 'Controller'
        ]
    },

    random: {
        name: 'Random',
        icon: '🎲',
        words: []
    }
};

/* Populate Random */
Object.keys(CATEGORIES).forEach((key) => {
    if (key !== 'random') {
        CATEGORIES.random.words =
            CATEGORIES.random.words.concat(CATEGORIES[key].words);
    }
});

/* =========================
   GAME STATE
========================= */

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

    teamNames: {
        A: 'Team Red',
        B: 'Team Blue'
    },

    timerInterval: null,
    isPaused: false,
    gameStartedAt: null,

    stats: {
        gamesPlayed: 0,
        highScore: 0,
        totalCorrect: 0,
        totalSkipped: 0,
        totalPlayTime: 0,
        categoryCounts: {}
    },

    settings: {
        theme: true,
        sound: true,
        vibe: true,
        tilt: true
    }
};

/* =========================
   LOCAL STORAGE
========================= */

const loadLocalStorage = () => {
    try {
        const savedStats = localStorage.getItem('charades_stats');

        if (savedStats) {
            const parsed = JSON.parse(savedStats);

            gameState.stats = {
                ...gameState.stats,
                ...parsed,
                categoryCounts: {
                    ...gameState.stats.categoryCounts,
                    ...(parsed.categoryCounts || {})
                }
            };
        }

        const savedSettings =
            localStorage.getItem('charades_settings');

        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);

            gameState.settings = {
                ...gameState.settings,
                ...parsed
            };
        }
    } catch (error) {
        console.warn('Failed to load local storage:', error);
    }
};

const saveStats = () => {
    try {
        localStorage.setItem(
            'charades_stats',
            JSON.stringify(gameState.stats)
        );
    } catch (error) {
        console.warn('Save stats failed:', error);
    }
};

const saveSettings = () => {
    try {
        localStorage.setItem(
            'charades_settings',
            JSON.stringify(gameState.settings)
        );
    } catch (error) {
        console.warn('Save settings failed:', error);
    }
};

/* =========================
   SETTINGS
========================= */

const applySettingsUI = () => {
    const themeToggle = getEl('set-theme');
    const soundToggle = getEl('set-sound');
    const vibeToggle = getEl('set-vibe');
    const tiltToggle = getEl('set-tilt');

    if (themeToggle) {
        themeToggle.checked = gameState.settings.theme;
    }

    if (soundToggle) {
        soundToggle.checked = gameState.settings.sound;
    }

    if (vibeToggle) {
        vibeToggle.checked = gameState.settings.vibe;
    }

    if (tiltToggle) {
        tiltToggle.checked = gameState.settings.tilt;
    }

    document.body.classList.toggle(
        'light-theme',
        !gameState.settings.theme
    );

    audio.enabled = gameState.settings.sound;
};

/* =========================
   RENDER CATEGORIES
========================= */

const renderCategories = () => {
    const grid = getEl('category-grid');

    if (!grid) return;

    grid.innerHTML = '';

    Object.keys(CATEGORIES).forEach((key) => {
        const category = CATEGORIES[key];

        const card = document.createElement('div');
        card.className = 'category-card';

        card.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-title">${category.name}</div>
        `;

        card.addEventListener('click', () => {
            selectCategory(key);
        });

        grid.appendChild(card);
    });
};

/* =========================
   NAVIGATION
========================= */

const showView = (viewId) => {
    const views = [
        'view-home',
        'view-setup',
        'view-game',
        'view-results'
    ];

    views.forEach((id) => {
        const el = getEl(id);

        if (!el) return;

        el.classList.toggle('active', id === viewId);
    });
};

const selectCategory = (categoryKey) => {
    if (!CATEGORIES[categoryKey]) return;

    gameState.selectedCategory = categoryKey;

    const title = getEl('setup-category-title');

    if (title) {
        title.innerText =
            `${CATEGORIES[categoryKey].name} Setup`;
    }

    showView('view-setup');
};

/* =========================
   MODALS
========================= */

const openModal = (id) => {
    const el = getEl(id);

    if (el) {
        el.classList.add('active');
    }
};

const closeModal = (id) => {
    const el = getEl(id);

    if (el) {
        el.classList.remove('active');
    }
};

/* =========================
   SEGMENT CONTROLS
========================= */

const setupSegmentControl = (containerId, callback) => {
    const container = getEl(containerId);

    if (!container) return;

    const buttons =
        container.querySelectorAll('.segment');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((b) =>
                b.classList.remove('active')
            );

            button.classList.add('active');

            const value =
                button.dataset.mode ??
                button.dataset.diff ??
                button.dataset.time;

            callback(value);
        });
    });
};

/* =========================
   SHUFFLE
========================= */

const shuffleArray = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
};

/* =========================
   DIFFICULTY
========================= */

const getDifficultyDeck = (words) => {
    const shuffled = shuffleArray(words);

    /*
       Difficulty changes how many words are used
       before recycling the deck.

       Easy = more familiar/easier pool
       Medium = full pool
       Hard = full pool
       Extreme = full pool
    */

    if (gameState.difficulty === 'easy') {
        return shuffled.slice(
            0,
            Math.max(10, Math.ceil(shuffled.length * 0.6))
        );
    }

    if (gameState.difficulty === 'hard') {
        return shuffled;
    }

    if (gameState.difficulty === 'extreme') {
        return shuffled;
    }

    return shuffled;
};

/* =========================
   DAILY CHALLENGE
========================= */

const startDailyChallenge = () => {
    const keys = Object.keys(CATEGORIES)
        .filter((key) => key !== 'random');

    const today = new Date();

    const seed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();

    const index = seed % keys.length;

    gameState.selectedCategory = keys[index];
    gameState.timerLength = 60;
    gameState.mode = 'solo';
    gameState.difficulty = 'medium';

    startGame();
};

/* =========================
   START GAME
========================= */

const startGame = () => {
    if (!gameState.selectedCategory) {
        gameState.selectedCategory = 'random';
    }

    const category =
        CATEGORIES[gameState.selectedCategory];

    if (!category || !category.words.length) {
        console.error('Invalid category or empty word list.');
        return;
    }

    clearInterval(gameState.timerInterval);

    gameState.deck =
        getDifficultyDeck(category.words);

    gameState.currentWordIndex = 0;
    gameState.score = 0;
    gameState.correctCount = 0;
    gameState.skippedCount = 0;
    gameState.history = [];
    gameState.timeRemaining =
        gameState.timerLength;
    gameState.isPaused = false;
    gameState.gameStartedAt = Date.now();

    const indicator =
        getEl('game-team-indicator');

    if (gameState.mode === 'teams') {
        const teamA = getEl('team-a-input');
        const teamB = getEl('team-b-input');

        gameState.teamNames.A =
            teamA?.value.trim() || 'Team Red';

        gameState.teamNames.B =
            teamB?.value.trim() || 'Team Blue';

        if (indicator) {
            indicator.innerText =
                `Playing: ${gameState.teamNames[gameState.activeTeam]}`;

            indicator.classList.remove('hidden');
        }
    } else {
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    updateGameUI();
    showView('view-game');

    audio.init();

    nextWord();
    startTimer();
};

/* =========================
   WORD MANAGEMENT
========================= */

const nextWord = () => {
    if (!gameState.deck.length) return;

    if (
        gameState.currentWordIndex >=
        gameState.deck.length
    ) {
        gameState.deck =
            shuffleArray(gameState.deck);

        gameState.currentWordIndex = 0;
    }

    const currentWord =
        gameState.deck[gameState.currentWordIndex];

    const wordEl = getEl('card-word');

    if (wordEl) {
        wordEl.innerText = currentWord;
    }
};

/* =========================
   CORRECT
========================= */

const handleCorrect = () => {
    if (gameState.isPaused) return;
    if (!gameState.deck.length) return;

    vibrate(50);
    audio.playCorrect();

    const currentWord =
        gameState.deck[gameState.currentWordIndex];

    gameState.score++;
    gameState.correctCount++;

    gameState.history.push({
        word: currentWord,
        result: 'correct'
    });

    gameState.currentWordIndex++;

    animateCard('right');
    updateGameUI();
    nextWord();
};

/* =========================
   SKIP
========================= */

const handleSkip = () => {
    if (gameState.isPaused) return;
    if (!gameState.deck.length) return;

    vibrate([30, 50, 30]);
    audio.playSkip();

    const currentWord =
        gameState.deck[gameState.currentWordIndex];

    gameState.skippedCount++;

    gameState.history.push({
        word: currentWord,
        result: 'skipped'
    });

    gameState.currentWordIndex++;

    animateCard('left');
    updateGameUI();
    nextWord();
};

/* =========================
   CARD ANIMATION
========================= */

const animateCard = (direction) => {
    const card = getEl('word-card');

    if (!card) return;

    const x =
        direction === 'right'
            ? 300
            : -300;

    const rotation =
        direction === 'right'
            ? 20
            : -20;

    card.style.transition =
        'transform 0.2s ease-in, opacity 0.2s ease-in';

    card.style.transform =
        `translateX(${x}px) rotate(${rotation}deg)`;

    card.style.opacity = '0';

    setTimeout(() => {
        card.style.transition = 'none';
        card.style.transform =
            'translateX(0) rotate(0deg)';
        card.style.opacity = '1';
    }, 200);
};

/* =========================
   GAME UI
========================= */

const updateGameUI = () => {
    const scoreEl = getEl('game-score');
    const timerEl = getEl('timer-display');

    if (scoreEl) {
        scoreEl.innerText = gameState.score;
    }

    if (timerEl) {
        timerEl.innerText =
            gameState.timeRemaining;
    }
};

/* =========================
   TIMER
========================= */

const startTimer = () => {
    clearInterval(gameState.timerInterval);

    gameState.timerInterval =
        setInterval(() => {
            if (gameState.isPaused) return;

            gameState.timeRemaining--;

            updateGameUI();

            if (
                gameState.timeRemaining <= 5 &&
                gameState.timeRemaining > 0
            ) {
                audio.playBeep();
            }

            if (gameState.timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
};

/* =========================
   PAUSE / RESUME / QUIT
========================= */

const pauseGame = () => {
    if (gameState.isPaused) return;

    gameState.isPaused = true;
    openModal('modal-pause');
};

const resumeGame = () => {
    gameState.isPaused = false;
    closeModal('modal-pause');
};

const quitGame = () => {
    clearInterval(gameState.timerInterval);

    gameState.timerInterval = null;
    gameState.isPaused = false;

    closeModal('modal-pause');
    showView('view-home');
};

/* =========================
   END GAME
========================= */

const endGame = () => {
    if (
        !gameState.timerInterval &&
        !gameState.gameStartedAt
    ) {
        return;
    }

    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;

    vibrate([100, 50, 100, 50, 200]);
    audio.playGameOver();

    gameState.stats.gamesPlayed++;

    gameState.stats.totalCorrect +=
        gameState.correctCount;

    gameState.stats.totalSkipped +=
        gameState.skippedCount;

    const elapsed =
        gameState.gameStartedAt
            ? Math.max(
                0,
                Math.round(
                    (Date.now() -
                        gameState.gameStartedAt) /
                    1000
                )
            )
            : gameState.timerLength;

    gameState.stats.totalPlayTime +=
        Math.min(elapsed, gameState.timerLength);

    if (
        gameState.score >
        gameState.stats.highScore
    ) {
        gameState.stats.highScore =
            gameState.score;
    }

    const category =
        gameState.selectedCategory;

    gameState.stats.categoryCounts[category] =
        (gameState.stats.categoryCounts[category] || 0) + 1;

    saveStats();

    const finalScore =
        getEl('final-score');

    const resultCorrect =
        getEl('res-correct');

    const resultSkipped =
        getEl('res-skipped');

    const list =
        getEl('words-summary-list');

    if (finalScore) {
        finalScore.innerText =
            gameState.score;
    }

    if (resultCorrect) {
        resultCorrect.innerText =
            gameState.correctCount;
    }

    if (resultSkipped) {
        resultSkipped.innerText =
            gameState.skippedCount;
    }

    if (list) {
        list.innerHTML =
            gameState.history.map((item) => `
                <div
                    class="res-item"
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:8px 0;
                        border-bottom:
                            1px solid var(--border-color);
                    "
                >
                    <span>${escapeHTML(item.word)}</span>

                    <strong
                        class="${
                            item.result === 'correct'
                                ? 'text-success'
                                : 'text-danger'
                        }"
                    >
                        ${item.result.toUpperCase()}
                    </strong>
                </div>
            `).join('');
    }

    if (gameState.mode === 'teams') {
        gameState.activeTeam =
            gameState.activeTeam === 'A'
                ? 'B'
                : 'A';
    }

    gameState.gameStartedAt = null;

    showView('view-results');
};

/* =========================
   HTML ESCAPE
========================= */

const escapeHTML = (value) => {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

/* =========================
   SWIPE CONTROLS
========================= */

const setupSwipeGestures = () => {
    const card = getEl('word-card');

    if (!card) return;

    let startX = 0;
    let startY = 0;

    card.addEventListener(
        'touchstart',
        (event) => {
            if (!event.touches.length) return;

            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;
        },
        { passive: true }
    );

    card.addEventListener(
        'touchend',
        (event) => {
            if (!event.changedTouches.length) return;

            const diffX =
                event.changedTouches[0].clientX -
                startX;

            const diffY =
                event.changedTouches[0].clientY -
                startY;

            if (
                Math.abs(diffX) >
                Math.abs(diffY)
            ) {
                if (diffX > 60) {
                    handleCorrect();
                } else if (diffX < -60) {
                    handleSkip();
                }
            }
        },
        { passive: true }
    );
};

/* =========================
   TILT CONTROLS
========================= */

let lastTiltTime = 0;

const handleTilt = (event) => {
    const gameView =
        getEl('view-game');

    if (
        !gameState.settings.tilt ||
        gameState.isPaused ||
        !gameView ||
        !gameView.classList.contains('active')
    ) {
        return;
    }

    const now = Date.now();

    if (now - lastTiltTime < 1000) {
        return;
    }

    const beta = event.beta;

    if (typeof beta !== 'number') return;

    if (beta > 45 && beta < 90) {
        lastTiltTime = now;
        handleCorrect();
    } else if (beta < -15 && beta > -90) {
        lastTiltTime = now;
        handleSkip();
    }
};

/* =========================
   MOTION PERMISSION
========================= */

const requestMotionPermission = async () => {
    try {
        if (
            typeof DeviceOrientationEvent !==
            'undefined' &&
            typeof DeviceOrientationEvent.requestPermission ===
            'function'
        ) {
            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission === 'granted') {
                window.addEventListener(
                    'deviceorientation',
                    handleTilt
                );
            }
        } else if (
            'DeviceOrientationEvent' in window
        ) {
            window.addEventListener(
                'deviceorientation',
                handleTilt
            );
        }
    } catch (error) {
        console.warn(
            'Motion permission error:',
            error
        );
    }
};

/* =========================
   STATISTICS
========================= */

const openStatsModal = () => {
    const setVal = (id, value) => {
        const el = getEl(id);

        if (el) {
            el.innerText = value;
        }
    };

    setVal(
        'st-games',
        gameState.stats.gamesPlayed
    );

    setVal(
        'st-high',
        gameState.stats.highScore
    );

    setVal(
        'st-correct',
        gameState.stats.totalCorrect
    );

    setVal(
        'st-skipped',
        gameState.stats.totalSkipped
    );

    setVal(
        'st-time',
        `${Math.round(
            gameState.stats.totalPlayTime / 60
        )}m`
    );

    let topCategory = '-';
    let max = 0;

    Object.keys(
        gameState.stats.categoryCounts
    ).forEach((category) => {
        const count =
            gameState.stats.categoryCounts[category];

        if (count > max) {
            max = count;

            topCategory =
                CATEGORIES[category]
                    ? CATEGORIES[category].name
                    : category;
        }
    });

    setVal('st-fav', topCategory);

    openModal('modal-stats');
};

const resetStats = () => {
    if (
        !confirm(
            'Reset all statistics? This cannot be undone.'
        )
    ) {
        return;
    }

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
};

/* =========================
   PWA INSTALL
========================= */

let deferredPrompt = null;

const setupPWAInstall = () => {
    const banner =
        getEl('pwa-install-banner');

    const button =
        getEl('btn-pwa-install');

    if (!banner || !button) return;

    window.addEventListener(
        'beforeinstallprompt',
        (event) => {
            event.preventDefault();

            deferredPrompt = event;

            banner.classList.remove('hidden');
        }
    );

    button.addEventListener(
        'click',
        async () => {
            if (!deferredPrompt) return;

            try {
                await deferredPrompt.prompt();

                await deferredPrompt.userChoice;
            } catch (error) {
                console.warn(
                    'Install prompt error:',
                    error
                );
            }

            deferredPrompt = null;

            banner.classList.add('hidden');
        }
    );

    window.addEventListener(
        'appinstalled',
        () => {
            deferredPrompt = null;
            banner.classList.add('hidden');
        }
    );
};

/* =========================
   SERVICE WORKER
========================= */

const registerServiceWorker = () => {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener(
        'load',
        () => {
            navigator.serviceWorker
                .register('./service-worker.js')
                .then(() => {
                    console.log(
                        'Service Worker registered'
                    );
                })
                .catch((error) => {
                    console.warn(
                        'Service Worker registration failed:',
                        error
                    );
                });
        }
    );
};

/* =========================
   EVENT LISTENERS
========================= */

const setupEventListeners = () => {
    /* Header */
    addEvt(
        'btn-stats-open',
        'click',
        openStatsModal
    );

    addEvt(
        'btn-stats-close',
        'click',
        () => closeModal('modal-stats')
    );

    addEvt(
        'btn-settings-open',
        'click',
        () => openModal('modal-settings')
    );

    addEvt(
        'btn-settings-close',
        'click',
        () => closeModal('modal-settings')
    );

    /* Setup */
    addEvt(
        'btn-setup-back',
        'click',
        () => showView('view-home')
    );

    setupSegmentControl(
        'mode-selector',
        (value) => {
            gameState.mode = value;

            const container =
                getEl('team-names-container');

            if (!container) return;

            if (value === 'teams') {
                container.classList.remove(
                    'hidden'
                );
            } else {
                container.classList.add(
                    'hidden'
                );
            }
        }
    );

    setupSegmentControl(
        'difficulty-selector',
        (value) => {
            gameState.difficulty = value;
        }
    );

    setupSegmentControl(
        'timer-selector',
        (value) => {
            const parsed =
                parseInt(value, 10);

            if (!Number.isNaN(parsed)) {
                gameState.timerLength = parsed;
            }
        }
    );

    addEvt(
        'btn-start-game',
        'click',
        () => {
            requestMotionPermission();
            startGame();
        }
    );

    /* Home */
    addEvt(
        'btn-daily-challenge',
        'click',
        startDailyChallenge
    );

    /* Gameplay */
    addEvt(
        'btn-correct',
        'click',
        handleCorrect
    );

    addEvt(
        'btn-skip',
        'click',
        handleSkip
    );

    addEvt(
        'btn-pause',
        'click',
        pauseGame
    );

    addEvt(
        'btn-resume',
        'click',
        resumeGame
    );

    addEvt(
        'btn-quit',
        'click',
        quitGame
    );

    /* Results */
    addEvt(
        'btn-play-again',
        'click',
        startGame
    );

    addEvt(
        'btn-home',
        'click',
        () => showView('view-home')
    );

    /* Settings */
    addEvt(
        'set-theme',
        'change',
        (event) => {
            gameState.settings.theme =
                event.target.checked;

            applySettingsUI();
            saveSettings();
        }
    );

    addEvt(
        'set-sound',
        'change',
        (event) => {
            gameState.settings.sound =
                event.target.checked;

            applySettingsUI();
            saveSettings();
        }
    );

    addEvt(
        'set-vibe',
        'change',
        (event) => {
            gameState.settings.vibe =
                event.target.checked;

            saveSettings();
        }
    );

    addEvt(
        'set-tilt',
        'change',
        (event) => {
            gameState.settings.tilt =
                event.target.checked;

            saveSettings();
        }
    );

    addEvt(
        'btn-reset-stats',
        'click',
        resetStats
    );

    /* Gestures */
    setupSwipeGestures();
};

/* =========================
   INITIALIZATION
========================= */

const initApp = () => {
    loadLocalStorage();
    renderCategories();
    setupEventListeners();
    setupPWAInstall();
    registerServiceWorker();
    applySettingsUI();
};

window.addEventListener(
    'DOMContentLoaded',
    initApp
);
