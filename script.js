let cards = [];
let flipped = [];
let attempts = 0;
let timer = 0;
let interval = null;
let isPaused = false;
const emojiSets = {
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🦄",
    "🐙",
    "🦕",
    "🦖",
    "🐢",
    "🐍",
    "🐬",
    "🐳",
    "🦈",
    "🦋",
    "🐞",
    "🐝",
    "🦀",
    "🐡",
    "🦚",
    "🦜",
  ],
  cars: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🚚",
    "🚛",
    "🚜",
    "🛻",
    "🚍",
    "🚔",
    "🚘",
    "🚖",
    "🛞",
    "🛣️",
    "⛽",
    "🛑",
    "🚦",
    "🚧",
    "🔧",
    "🛠️",
    "⚙️",
    "🧰",
    "🔩",
    "🪛",
    "🧪",
    "🧼",
  ],
  food: [
    "🍎",
    "🍌",
    "🍇",
    "🍉",
    "🍓",
    "🍒",
    "🍍",
    "🥭",
    "🥝",
    "🍅",
    "🥕",
    "🌽",
    "🥔",
    "🥦",
    "🧄",
    "🧅",
    "🍞",
    "🥐",
    "🥖",
    "🧀",
    "🍗",
    "🍖",
    "🥩",
    "🍔",
    "🍟",
    "🌭",
    "🍕",
    "🥪",
    "🌮",
    "🌯",
    "🥗",
    "🍝",
  ],
  fantasy: [
    "🧙‍♂️",
    "🧝‍♀️",
    "🧛‍♂️",
    "🧞‍♂️",
    "🧜‍♀️",
    "🧚‍♀️",
    "🐉",
    "🦄",
    "🔮",
    "🪄",
    "🧪",
    "🪬",
    "🪷",
    "🌌",
    "🌠",
    "☄️",
    "🪐",
    "🚀",
    "👽",
    "🛰️",
    "🧿",
    "🕯️",
    "📜",
    "🗝️",
    "🧵",
    "🧶",
    "🪡",
    "🧩",
    "🪞",
    "🪙",
    "🧭",
    "🪤",
  ],
};
function getSymbols() {
  const level = document.getElementById("difficulty").value;
  const theme = document.getElementById("theme").value;
  const base = emojiSets[theme] || emojiSets["animals"];
  if (level === "easy") return base.slice(0, 8);
  if (level === "medium") return base.slice(0, 18);
  if (level === "hard") return base.slice(0, 32);
  return base.slice(0, 8);
}
document.getElementById("difficulty").addEventListener("change", () => {
  resetStats();
  generateBoard();
});
function updateGridSize() {
  document.getElementById("winMessage").style.display = "none";
  const board = document.getElementById("gameBoard");
  const level = document.getElementById("difficulty").value;
  if (level === "easy") board.style.gridTemplateColumns = "repeat(4, 100px)";
  if (level === "medium") board.style.gridTemplateColumns = "repeat(6, 100px)";
  if (level === "hard") board.style.gridTemplateColumns = "repeat(8, 100px)";
}
document.getElementById("theme").addEventListener("change", () => {
  const theme = document.getElementById("theme").value;
  document.body.classList.remove(
    "theme-animals",
    "theme-cars",
    "theme-food",
    "theme-fantasy"
  );
  document.body.classList.add(`theme-${theme}`);
  resetStats();
  generateBoard();
});
function generateBoard() {
  flipped = [];
  cards = [];
  document.getElementById("gameBoard").innerHTML = "";
  document.body.classList.remove("easy", "medium", "hard");
  document.body.classList.add(document.getElementById("difficulty").value);
  updateGridSize();
  const symbols = getSymbols();
  cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  cards.forEach((symbol) => {
    const card = document.createElement("div");
    card.classList.add("card");
    const inner = document.createElement("div");
    inner.classList.add("card-inner");
    const front = document.createElement("div");
    front.classList.add("card-front");
    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = symbol;
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.dataset.symbol = symbol;
    card.addEventListener("click", () => flipCard(card));
    document.getElementById("gameBoard").appendChild(card);
  });
}
function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").innerText = `Time: ${timer}s`;
  }, 1000);
  playSound("tickSound");
}
function startGame() {
  resetStats();
  generateBoard();
  startTimer();
}
function togglePause() {
  const tick = document.getElementById("tickSound");
  if (!interval && !isPaused) return;
  if (isPaused) {
    interval = setInterval(() => {
      timer++;
      document.getElementById("timer").innerText = `Time: ${timer}s`;
    }, 1000);
    tick.play();
    isPaused = false;
  } else {
    clearInterval(interval);
    interval = null;
    tick.pause();
    isPaused = true;
  }
}
function flipCard(card) {
  if (
    flipped.length === 2 ||
    flipped.includes(card) ||
    card.classList.contains("flipped")
  )
    return;
  card.classList.add("flipped");
  flipped.push(card);
  if (flipped.length === 2) {
    attempts++;
    document.getElementById("attempts").innerText = `Turns: ${attempts}`;
    checkMatch();
  }
  playSound("flipSound");
}
function checkMatch() {
  const [first, second] = flipped;
  if (first.dataset.symbol === second.dataset.symbol) {
    first.classList.add("matched");
    second.classList.add("matched");
    flipped = [];
    playSound("matchSound");
    if (document.querySelectorAll(".matched").length === cards.length) {
      clearInterval(interval);
      document.getElementById("tickSound").pause();
      document.getElementById("tickSound").currentTime = 0;
      playSound("winSound");
      saveScore();
      const message = document.getElementById("winMessage");
      message.innerText = `🎉 Congratulations! You completed the game in ${timer} seconds with ${attempts} turns.`;
      message.style.display = "block";
      document.querySelector(".volume-control").classList.add("win-position");
      document
        .querySelector(".difficulty-control")
        .classList.add("win-position");
    }
  } else {
    playSound("wrongSound");
    setTimeout(() => {
      if (chaosMode) {
        shuffleCardsInDOM();
      }
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      flipped = [];
    }, 1000);
  }
}
function saveScore() {
  const difficulty = document.getElementById("difficulty").value;
  const score = {
    attempts,
    time: timer,
    difficulty,
    chaos: chaosMode ? "ON" : "OFF",
  };
  const scores = JSON.parse(localStorage.getItem("memoryScores") || "[]");
  scores.push(score);
  scores.sort((a, b) => a.time - b.time || a.attempts - b.attempts);
  localStorage.setItem("memoryScores", JSON.stringify(scores.slice(0, 10)));
  showScores();
}
function showScores() {
  const scores = JSON.parse(localStorage.getItem("memoryScores") || "[]");
  const list = document.getElementById("highScores");
  list.innerHTML = "";
  scores.forEach((s, i) => {
    const item = document.createElement("li");
    item.textContent = `${i + 1}. Time: ${s.time}, Turns: ${
      s.attempts
    }, Difficulty: ${s.difficulty}, Chaos: ${s.chaos || "OFF"}`;
    list.appendChild(item);
  });
}
function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) sound.play();
}
function resetStats() {
  clearInterval(interval);
  interval = null;
  timer = 0;
  attempts = 0;
  isPaused = false;
  document.getElementById("timer").innerText = `Time: 0s`;
  document.getElementById("attempts").innerText = `Turns: 0`;
  document.getElementById("winMessage").style.display = "none";
  document.getElementById("tickSound").pause();
  document.getElementById("tickSound").currentTime = 0;
  document.querySelector(".volume-control").classList.remove("win-position");
  document
    .querySelector(".difficulty-control")
    .classList.remove("win-position");
}
const volumeSlider = document.getElementById("volumeSlider");
const volumeIcon = document.getElementById("volumeIcon");
volumeSlider.addEventListener("input", (e) => {
  const volume = parseFloat(e.target.value);
  const sounds = [
    "flipSound",
    "matchSound",
    "winSound",
    "tickSound",
    "wrongSound",
  ];
  sounds.forEach((id) => {
    const audio = document.getElementById(id);
    if (audio) audio.volume = volume;
  });
  volumeIcon.textContent = volume === 0 ? "🔇" : "🔊";
});
let chaosMode = false;
function shuffleCardsInDOM() {
  const board = document.querySelector(".game-board");
  const cards = Array.from(board.children);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach((card) => {
    card.classList.add("shuffle-animate");
    board.appendChild(card);
    setTimeout(() => card.classList.remove("shuffle-animate"), 400);
  });
}
const chaosBtn = document.getElementById("chaosToggle");
chaosBtn.addEventListener("click", () => {
  chaosMode = !chaosMode;
  chaosBtn.textContent = `Chaos Mode: ${chaosMode ? "ON" : "OFF"}`;
  chaosBtn.classList.toggle("active", chaosMode);
});
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.add("button-press");
    setTimeout(() => btn.classList.remove("button-press"), 200);
  });
});
document.getElementById("hintButton").addEventListener("click", () => {
  const allCards = Array.from(document.querySelectorAll(".card"));
  const unmatched = allCards.filter(
    (card) =>
      !card.classList.contains("flipped") && !card.classList.contains("matched")
  );
  allCards.forEach((card) => card.classList.remove("hint"));
  const symbolMap = {};
  unmatched.forEach((card) => {
    const symbol = card.dataset.symbol;
    if (!symbolMap[symbol]) symbolMap[symbol] = [];
    symbolMap[symbol].push(card);
  });
  for (const pair of Object.values(symbolMap)) {
    if (pair.length >= 2) {
      pair[0].classList.add("hint");
      pair[1].classList.add("hint");
      break;
    }
  }
});
showScores();
