let cards = [];
let flipped = [];
let attempts = 0;
let timer = 0;
let interval;

function getSymbols() {
  const base = [
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
    "🦩",
    "🐇",
    "🐿️",
    "🦔",
    "🦘",
    "🦥",
    "🦧",
    "🐉",
    "🪲",
    "🪳",
    "🪱",
    "🪰",
    "🪵",
    "🪶",
    "🪸",
    "🪷",
    "🪼",
  ];

  const level = document.getElementById("difficulty").value;
  if (level === "easy") return base.slice(0, 8);
  if (level === "medium") return base.slice(0, 18);
  if (level === "hard") return base.slice(0, 32);
  return base.slice(0, 8);
}
function updateGridSize() {
  document.getElementById("winMessage").style.display = "none";
  const board = document.getElementById("gameBoard");
  const level = document.getElementById("difficulty").value;
  if (level === "easy") board.style.gridTemplateColumns = "repeat(4, 100px)";
  if (level === "medium") board.style.gridTemplateColumns = "repeat(6, 100px)";
  if (level === "hard") board.style.gridTemplateColumns = "repeat(8, 100px)";
}

function startGame() {
  clearInterval(interval);
  timer = 0;
  attempts = 0;
  flipped = [];
  document.getElementById("timer").innerText = "Time: 0s";
  document.getElementById("attempts").innerText = "Attempts: 0";
  document.getElementById("gameBoard").innerHTML = "";
  updateGridSize();
  const symbols = getSymbols();
  cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  cards.forEach((symbol) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.addEventListener("click", () => flipCard(card));
    document.getElementById("gameBoard").appendChild(card);
  });
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").innerText = `Time: ${timer}s`;
  }, 1000);
}
function flipCard(card) {
  if (
    flipped.length === 2 ||
    flipped.includes(card) ||
    card.classList.contains("flipped")
  )
    return;
  card.textContent = card.dataset.symbol;
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
      playSound("winSound");
      saveScore();
      const message = document.getElementById("winMessage");
      message.innerText = `🎉 Congratulations! You completed the game in <strong>{timer}</strong> seconds with <strong>{attempts}</strong> turns.`;
      message.style.display = "block";
    }
  } else {
    setTimeout(() => {
      first.textContent = "";
      second.textContent = "";
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      flipped = [];
    }, 1000);
  }
}
function saveScore() {
  const difficulty = document.getElementById("difficulty").value;
  const score = { attempts, time: timer, difficulty };
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
    }, Рівень: ${s.difficulty}`;
    list.appendChild(item);
  });
}
function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) sound.play();
}
showScores();
