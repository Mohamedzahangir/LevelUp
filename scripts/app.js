// ---------- CONFIG ----------
const XP_PER_WORKOUT = 20;

// ---------- STATE ----------
let state = loadState();

// ---------- DOM ----------
const levelEl = document.querySelector(".level h1");
const xpTextEl = document.querySelector(".xp-text");
const streakEl = document.querySelector(".streak span");
const button = document.querySelector(".primary-action");

// ---------- INIT ----------
render();

// ---------- EVENTS ----------
button.addEventListener("click", completeWorkout);

// ---------- FUNCTIONS ----------

function completeWorkout() {
  const today = new Date().toDateString();

  // Prevent double logging in same day
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

  if (new Date(state.lastWorkoutDate).toDateString() === yesterday.toDateString()) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
}

function getXpForNextLevel(level) {
  return 100 + level * 20; // smooth scaling
}

function render() {
  levelEl.textContent = state.level;
  xpTextEl.textContent = `${state.xp} / ${state.xpToNext} XP`;
  streakEl.textContent = `${state.streak}-day streak`;
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
