// ---------- CONFIG ----------
const XP_PER_WORKOUT = 20;

// ---------- STATE ----------
let state = loadState();


// ---------- DOM ----------
const LOADING_REASON = {
  DAILY: "daily",
  LEVEL_UP: "level_up",
  FIRST_OPEN: "first_open"
};

const levelEl = document.querySelector(".level h1");
const xpTextEl = document.querySelector(".xp-text");
const streakEl = document.querySelector(".streak span");
const button = document.querySelector(".primary-action");
const progressCircle = document.querySelector(".xp-progress");
const loadingScreen = document.querySelector(".loading-screen");
const dashboard = document.querySelector(".dashboard");
const loadingRing = document.querySelector(".ring-progress");


// ---------- INIT ----------
playLoadingScreen();
setTimeout(render, 0);


// ---------- EVENTS ----------
button.addEventListener("click", completeWorkout);

// ---------- FUNCTIONS ----------
let lastRenderedLevel = state.level;

function triggerLevelUp() {
  const levelSection = document.querySelector(".level");
  const ring = document.querySelector(".xp-ring");

  levelSection.classList.add("level-up");
  ring.classList.add("ring-flash");

  setTimeout(() => {
    levelSection.classList.remove("level-up");
    ring.classList.remove("ring-flash");
  }, 400);
}
function playLoadingScreen() {
  const reason = getLoadingReason();
  const circumference = 565;

  let duration = 1200; // short by default

  if (reason === LOADING_REASON.FIRST_OPEN) {
    duration = 3500; // full cinematic
  }

  loadingRing.style.transition = `stroke-dashoffset ${duration}ms ease`;
  loadingRing.style.strokeDashoffset = 0;

  setTimeout(() => {
    loadingScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
  }, duration);
}

function getLoadingReason() {
  const hasOpenedBefore = localStorage.getItem("levelup_opened");

  if (!hasOpenedBefore) {
    localStorage.setItem("levelup_opened", "true");
    return LOADING_REASON.FIRST_OPEN;
  }

  return LOADING_REASON.DAILY;
}


function completeWorkout() {
  const today = new Date().toDateString();

  if (state.lastWorkoutDate === today) return;

  state.xp += XP_PER_WORKOUT;
  state.lastWorkoutDate = today;

  updateStreak(today);
  updateLevel();

  saveState();
  render();
}

function updateLevel() {
  const xpNeeded = getXpForNextLevel(state.level);

  if (state.xp >= xpNeeded) {
    state.xp -= xpNeeded;
    state.level += 1;
  }

  state.xpToNext = getXpForNextLevel(state.level);
}

function updateStreak(today) {
  if (!state.lastWorkoutDate) {
    state.streak = 1;
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    new Date(state.lastWorkoutDate).toDateString() ===
    yesterday.toDateString()
  ) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
}

function getXpForNextLevel(level) {
  return 100 + level * 20;
}

function render() {
  levelEl.textContent = state.level;
  xpTextEl.textContent = `${state.xp} / ${state.xpToNext} XP`;
  streakEl.textContent = `${state.streak}-day streak`;

  const progress = state.xp / state.xpToNext;
  const circumference = 565;
  const offset = circumference * (1 - progress);
  progressCircle.style.strokeDashoffset = offset;

  // ✅ LEVEL-UP CHECK
  if (state.level > lastRenderedLevel) {
    triggerLevelUp();
    lastRenderedLevel = state.level;
  }
}



function saveState() {
  localStorage.setItem("levelup_state", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("levelup_state");
  if (saved) return JSON.parse(saved);

  return {
    level: 1,
    xp: 0,
    xpToNext: getXpForNextLevel(1),
    streak: 0,
    lastWorkoutDate: null
  };
}


