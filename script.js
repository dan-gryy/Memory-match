let cards = [];
let attempts = 0;
let timer = 0;
let interval = null;
let isPaused = false;
let duelMode = false;
let aiMemory = {};
let aiFlipped = [];
let playerFlipped = [];
let aiInterval = null;
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
  startGame();
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
function renderBoard(boardId, cardsArray, isPlayer) {
  const board = document.getElementById(boardId);
  board.innerHTML = "";
  cardsArray.forEach((symbol, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.dataset.owner = isPlayer ? "player" : "ai";
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
    if (isPlayer) {
      card.addEventListener("click", () => flipCard(card));
    }
    board.appendChild(card);
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
  aiMemory = {};
  aiFlipped = [];
  timer = 0;
  updateTimerDisplay();
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    updateTimerDisplay();
  }, 1000);
  playSound("tickSound");
  const symbols = getSymbols();
  const pairCount = symbols.length;
  const cardsArray = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  const cols = Math.ceil(Math.sqrt(pairCount * 2));
  if (duelMode) {
    document.getElementById(
      "playerBoard"
    ).style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    document.getElementById(
      "aiBoard"
    ).style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    renderBoard("playerBoard", cardsArray, true);
    renderBoard("aiBoard", [...cardsArray], false);
    startAI();
  } else {
    document.getElementById(
      "playerBoard"
    ).style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    document.getElementById("aiBoard").innerHTML = "";
    renderBoard("playerBoard", cardsArray, true);
  }
}
function togglePause() {
  const tick = document.getElementById("tickSound");
  if (!interval && !aiInterval && !isPaused) return;
  if (isPaused) {
    interval = setInterval(() => {
      timer++;
      document.getElementById("timer").innerText = `Time: ${timer}s`;
    }, 1000);
    tick.play();
    startAI();
    isPaused = false;
  } else {
    clearInterval(interval);
    interval = null;
    tick.pause();
    clearInterval(aiInterval);
    aiInterval = null;
    isPaused = true;
  }
}
function flipCard(card, by = "player") {
  const flippedGroup = by === "ai" ? aiFlipped : playerFlipped;
  if (
    flippedGroup.length === 2 &&
    flippedGroup[0].classList.contains("matched") &&
    flippedGroup[1].classList.contains("matched")
  ) {
    flippedGroup.length = 0;
  }
  if (
    flippedGroup.length >= 2 ||
    flippedGroup.includes(card) ||
    card.classList.contains("matched")
  ) {
    return;
  }
  card.classList.add("flipped");
  if (by === "ai" && !aiFlipped.includes(card)) {
    aiFlipped.push(card);
  }
  card.setAttribute("data-flip-time", Date.now());
  if (!flippedGroup.includes(card)) {
    flippedGroup.push(card);
  }
  if (by === "ai") {
    if (!aiMemory[card.dataset.symbol]) aiMemory[card.dataset.symbol] = [];
    if (!aiMemory[card.dataset.symbol].includes(card)) {
      aiMemory[card.dataset.symbol].push(card);
    }
    card.classList.add("ai-flip");
  }
  if (flippedGroup.length === 2) {
    setTimeout(() => checkMatch(by), 300);
  }
  if (by === "player" && flippedGroup.length === 2) {
    attempts++;
    updateTimerDisplay();
  }
  playSound("flipSound");
}
function checkMatch(by = "player") {
  const flippedGroup = by === "ai" ? aiFlipped : playerFlipped;
  const [first, second] = flippedGroup;
  if (!first || !second) {
    if (by === "ai") aiFlipped.length = 0;
    return;
  }
  const isMatch = first.dataset.symbol === second.dataset.symbol;
  if (isMatch) {
    first.classList.add("matched");
    second.classList.add("matched");
    if (by === "ai") {
      first.classList.add("ai-match");
      second.classList.add("ai-match");
      delete aiMemory[first.dataset.symbol];
    }
    if (by === "player") {
      playSound("matchSound");
    }
    flippedGroup.length = 0;
  } else {
    if (by === "player") {
      playSound("wrongSound");
    }
    setTimeout(() => {
      if (chaosMode) shuffleCardsInDOM();
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      flippedGroup.length = 0;
    }, 1000);
  }
  if (by === "ai") aiFlipped.length = 0;
  const playerTotal = document.querySelectorAll("#playerBoard .card").length;
  const playerMatched = document.querySelectorAll(
    "#playerBoard .matched"
  ).length;
  const aiTotal = document.querySelectorAll("#aiBoard .card").length;
  const aiMatched = document.querySelectorAll("#aiBoard .matched").length;
  const playerPairs = playerMatched / 2;
  const aiPairs = aiMatched / 2;
  const totalPairs = (playerTotal + aiTotal) / 2;
  const allPairsFound = playerPairs + aiPairs === totalPairs;
  const playerDone = playerMatched === playerTotal;
  const aiDone = duelMode && aiMatched === aiTotal;
  const soloMessage = document.getElementById("soloWinMessage");
  const duelMessage = document.getElementById("duelWinMessage");
  if (duelMode && (playerDone || aiDone || allPairsFound)) {
    clearInterval(interval);
    clearInterval(aiInterval);
    aiInterval = null;
    document.getElementById("tickSound").pause();
    document.getElementById("tickSound").currentTime = 0;
    if (playerPairs > aiPairs) {
      playSound("winSound");
      duelMessage.innerText = `🏆 You win! ${playerPairs} vs ${aiPairs} pairs`;
    } else if (aiPairs > playerPairs) {
      playSound("loseSound");
      duelMessage.innerText = `🤖 AI wins! ${aiPairs} vs ${playerPairs} pairs`;
    } else {
      playSound("winSound");
      duelMessage.innerText = `🤝 Draw! ${playerPairs} vs ${aiPairs} pairs`;
    }
    saveScore();
    duelMessage.classList.add("visible");
    document.querySelector(".volume-control").classList.add("win-position");
    document.querySelector(".difficulty-control").classList.add("win-position");
  }
  if (!duelMode && playerMatched === playerTotal) {
    clearInterval(interval);
    document.getElementById("tickSound").pause();
    document.getElementById("tickSound").currentTime = 0;
    playSound("winSound");
    saveScore();
    soloMessage.innerText = `🎉 Congratulations! You completed the game in ${timer} seconds with ${attempts} turns.`;
    soloMessage.classList.add("visible");
    document.querySelector(".volume-control").classList.add("win-position");
    document.querySelector(".difficulty-control").classList.add("win-position");
  }
}
function saveScore() {
  const difficulty = document.getElementById("difficulty").value;
  const chaos = chaosMode ? "ON" : "OFF";
  const scores = JSON.parse(localStorage.getItem("memoryScores") || "[]");
  scores.unshift({ time: timer, attempts, difficulty, chaos });
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
  document.getElementById("tickSound").pause();
  document.getElementById("tickSound").currentTime = 0;
  document.querySelector(".volume-control").classList.remove("win-position");
  document
    .querySelector(".difficulty-control")
    .classList.remove("win-position");
  document.getElementById("soloWinMessage").classList.remove("visible");
  document.getElementById("duelWinMessage").classList.remove("visible");
  clearInterval(aiInterval);
  aiInterval = null;
}
function updateTimerDisplay() {
  document.getElementById("timer").innerText = `Time: ${timer}s`;
  document.getElementById("attempts").innerText = `Turns: ${attempts}`;
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
document.getElementById("duelToggle").addEventListener("click", () => {
  duelMode = !duelMode;
  const btn = document.getElementById("duelToggle");
  btn.textContent = duelMode ? "⚔️ Duel vs AI: ON" : "⚔️ Duel vs AI: OFF";
  btn.classList.toggle("active", duelMode);
  document.getElementById("aiBoard").style.display = duelMode ? "grid" : "none";
});
function checkDuelWinner() {
  const playerDone =
    document.querySelectorAll("#playerBoard .matched").length === 16;
  const aiDone = document.querySelectorAll("#aiBoard .matched").length === 16;
  if (playerDone || aiDone) {
    clearInterval(interval);
    document.getElementById("tickSound").pause();
    document.getElementById("tickSound").currentTime = 0;
    playSound("winSound");
    const message = document.getElementById("winMessage");
    if (playerDone && !aiDone) {
      message.innerText = `🏆 You win!`;
    } else if (aiDone && !playerDone) {
      message.innerText = `🤖 AI wins!`;
    } else {
      message.innerText = `🤝 Draw!`;
    }
    message.style.display = "block";
  }
}
function canFlip(card) {
  return !card.classList.contains("matched");
}
function startAI() {
  clearInterval(aiInterval);
  const aiCards = Array.from(document.querySelectorAll("#aiBoard .card"));
  let aiBusy = false;
  function aiTurn() {
    if (aiBusy) return;
    aiBusy = true;
    const active = aiCards.filter(
      (c) => c.classList.contains("flipped") && !c.classList.contains("matched")
    );
    if (active.length > 0) {
      aiBusy = false;
      return;
    }
    for (let symbol in aiMemory) {
      const known = aiMemory[symbol].filter((c) => canFlip(c));
      if (known.length === 2) {
        flipCard(known[0], "ai");
        setTimeout(() => {
          flipCard(known[1], "ai");
          setTimeout(() => {
            aiBusy = false;
          }, 700);
        }, 600);
        return;
      }
    }
    for (let symbol in aiMemory) {
      const known = aiMemory[symbol].filter((c) => canFlip(c));
      if (known.length === 1) {
        const unmatched = aiCards.filter((c) => canFlip(c) && c !== known[0]);
        if (unmatched.length > 0) {
          flipCard(known[0], "ai");
          setTimeout(() => {
            const second =
              unmatched[Math.floor(Math.random() * unmatched.length)];
            flipCard(second, "ai");
            setTimeout(() => {
              aiBusy = false;
            }, 700);
          }, 600);
          return;
        }
      }
    }
    const unmatched = aiCards.filter((c) => canFlip(c));
    if (unmatched.length < 2) {
      aiBusy = false;
      return;
    }
    const first = unmatched[Math.floor(Math.random() * unmatched.length)];
    flipCard(first, "ai");
    setTimeout(() => {
      const stillUnmatched = aiCards.filter((c) => canFlip(c) && c !== first);
      const second =
        stillUnmatched[Math.floor(Math.random() * stillUnmatched.length)];
      flipCard(second, "ai");
      setTimeout(() => {
        aiBusy = false;
      }, 700);
    }, 600);
  }
  aiInterval = setInterval(aiTurn, 3000);
}
showScores();
