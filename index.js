const quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect.",
  "Typing speed improves with consistent effort.",
  "Stay positive and keep typing!",
  "Consistency is the key to success."
];

const playerInputSection = document.getElementById('playerInputSection');
const playerNameInput = document.getElementById('playerName');
const startTestBtn = document.getElementById('startTestBtn');

const testSection = document.getElementById('testSection');
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput = document.getElementById('quoteInput');

const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');

const resetBtn = document.getElementById('resetBtn');

const leaderboardList = document.getElementById('leaderboardList');
const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

const darkModeToggle = document.getElementById('darkModeToggle');

let timer = 60;
let intervalId;
let currentQuote = "";
let startTime;
let totalErrors = 0;
let finished = false;
let playerName = "";

// Enable start button only if player name entered
playerNameInput.addEventListener('input', () => {
  startTestBtn.disabled = playerNameInput.value.trim() === "";
});

// Dark mode toggle event
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkModeToggle.checked);
  localStorage.setItem('darkMode', darkModeToggle.checked);
});

// Load dark mode preference on start
window.addEventListener('load', () => {
  const darkModePref = localStorage.getItem('darkMode');
  if (darkModePref === "true") {
    darkModeToggle.checked = true;
    document.body.classList.add('dark-mode');
  }
  loadLeaderboard();
});

// Start test button click
startTestBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim();
  if (!playerName) return;

  playerInputSection.style.display = 'none';
  testSection.style.display = 'block';

  resetTest();
  quoteInput.disabled = false;
  quoteInput.focus();
  quoteInput.disabled = false;
});

// Reset button click
resetBtn.addEventListener('click', () => {
  resetTest();
  quoteInput.focus();
});

// Clear leaderboard button click
clearLeaderboardBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the leaderboard?")) {
    localStorage.removeItem('leaderboard');
    leaderboardList.innerHTML = '';
  }
});

// Function to pick a random quote
function getRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

// Render the quote with span-wrapped letters for styling
function renderQuote(quote) {
  quoteDisplay.innerHTML = '';
  for (let char of quote) {
    const span = document.createElement('span');
    span.textContent = char;
    quoteDisplay.appendChild(span);
  }
}

// Reset test state
function resetTest() {
  clearInterval(intervalId);
  timer = 60;
  timerDisplay.textContent = timer;
  currentQuote = getRandomQuote();
  renderQuote(currentQuote);
  quoteInput.value = "";
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 100;
  totalErrors = 0;
  finished = false;
  startTime = null;
}

// Start countdown timer
function startTimer() {
  intervalId = setInterval(() => {
    timer--;
    timerDisplay.textContent = timer;

    if (timer <= 0) {
      clearInterval(intervalId);
      quoteInput.disabled = true;
      finished = true;
      saveScore();
      alert("Time's up! Your score was saved.");
    }
  }, 1000);
}

// Check input and update highlighting and stats
function checkInput() {
  const input = quoteInput.value;
  const quoteSpans = quoteDisplay.querySelectorAll('span');

  totalErrors = 0;

  for (let i = 0; i < quoteSpans.length; i++) {
    const char = input[i];

    if (char == null) {
      // Not typed yet
      quoteSpans[i].classList.remove('correct');
      quoteSpans[i].classList.remove('incorrect');
    } else if (char === quoteSpans[i].textContent) {
      quoteSpans[i].classList.add('correct');
      quoteSpans[i].classList.remove('incorrect');
    } else {
      quoteSpans[i].classList.add('incorrect');
      quoteSpans[i].classList.remove('correct');
      totalErrors++;
    }
  }

  // Extra characters typed beyond quote length count as errors
  if (input.length > quoteSpans.length) {
    totalErrors += input.length - quoteSpans.length;
  }

  const accuracy = input.length === 0 ? 100 : Math.max(0, ((input.length - totalErrors) / input.length) * 100);
  accuracyDisplay.textContent = accuracy.toFixed(2);

  // WPM = (characters / 5) / minutes passed
  const now = new Date();
  if (!startTime) {
    startTime = now;
  }
  const minutes = (now - startTime) / 1000 / 60;
  const wordsTyped = input.length / 5;
  const wpm = minutes > 0 ? wordsTyped / minutes : 0;
  wpmDisplay.textContent = Math.round(wpm);

  // Check if quote is fully typed correctly
  if (input === currentQuote) {
    clearInterval(intervalId);
    quoteInput.disabled = true;
    finished = true;
    saveScore();
    alert("Great job! You finished the test.");
  }
}

// Save score to leaderboard
function saveScore() {
  const wpm = parseInt(wpmDisplay.textContent);
  const accuracy = parseFloat(accuracyDisplay.textContent);

  if (wpm === 0) return; // Don't save zero scores

  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

  leaderboard.push({
    name: playerName,
    wpm: wpm,
    accuracy: accuracy.toFixed(2)
  });

  // Sort descending by WPM
  leaderboard.sort((a, b) => b.wpm - a.wpm);

  // Keep top 10
  leaderboard = leaderboard.slice(0, 10);

  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  loadLeaderboard();
}

// Load leaderboard from localStorage and display
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboardList.innerHTML = '';

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<li>No scores yet.</li>';
    return;
  }

  leaderboard.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} — WPM: ${entry.wpm}, Accuracy: ${entry.accuracy}%`;
    leaderboardList.appendChild(li);
  });
}

// Input event to start test and check input
quoteInput.addEventListener('input', () => {
  if (finished) return;

  if (!startTime) {
    startTimer();
  }

  checkInput();
});
