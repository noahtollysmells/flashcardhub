// ----------------------
// Flashcard Hub Script
// ----------------------

const fileInput = document.getElementById("fileInput");
const flashcardContainer = document.getElementById("flashcardContainer");
const zenBtn = document.getElementById("zenBtn");
const createSection = document.getElementById("createSection");
const closeCreateBtn = document.getElementById("closeCreateBtn");
const newFlashcardsContainer = document.getElementById("newFlashcardsContainer");
const newQuestion = document.getElementById("newQuestion");
const newAnswer = document.getElementById("newAnswer");
const addFlashcardBtn = document.getElementById("addFlashcardBtn");
const startCustomBtn = document.getElementById("startCustomBtn");

let flashcards = [];
let score = 0;
let incorrectCards = [];

// ----------------------
// CSV Upload & Parsing
// ----------------------
fileInput.addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    flashcards = parseCSV(text)
      .slice(1)
      .map(([q, a]) => ({ question: q, answer: a }));
    score = 0;
    incorrectCards = [];
    showFlashcard();
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && text[i + 1] === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentValue || currentRow.length) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
}

// ----------------------
// Show Flashcard
// ----------------------
function showFlashcard() {
  flashcardContainer.innerHTML = "";

  if (flashcards.length === 0) return showResult();

  const { question, answer } = flashcards[0]; // always pick first card

  const card = document.createElement("div");
  card.classList.add("big-flashcard");

  const inner = document.createElement("div");
  inner.classList.add("flashcard-inner");

  const front = document.createElement("div");
  front.classList.add("flashcard-front");
  front.innerHTML = `<p>${question}</p><button class="skip-btn">⏭️ Skip</button>`;

  const back = document.createElement("div");
  back.classList.add("flashcard-back");
  back.innerHTML = `<p>${answer}</p>
    <div class="answer-buttons">
      <button class="wrong-btn">❌ Wrong</button>
      <button class="correct-btn">✅ Correct</button>
    </div>`;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);
  flashcardContainer.appendChild(card);

  card.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") return;
    card.classList.toggle("flipped");
  });

  front.querySelector(".skip-btn").addEventListener("click", e => {
    e.stopPropagation();
    flashcards.push(flashcards.shift()); // move first card to end
    showFlashcard();
  });

  back.querySelector(".wrong-btn").addEventListener("click", e => {
    e.stopPropagation();
    incorrectCards.push(flashcards.shift()); // remove first card and track
    showFlashcard();
  });

  back.querySelector(".correct-btn").addEventListener("click", e => {
    e.stopPropagation();
    score++;
    flashcards.shift(); // remove first card
    showFlashcard();
  });
}

// ----------------------
// Result Screen
// ----------------------
function showResult() {
  flashcardContainer.innerHTML = `
    <div class="result-screen">
      <h2>${score > 0 ? "🎉 Test Completed!" : "❌ Test Completed"}</h2>
      <p>Your Score: ${score}</p>
      ${
        incorrectCards.length > 0
          ? `<button id="repeatIncorrectBtn">🔁 Repeat Incorrect Questions</button>`
          : ""
      }
    </div>
  `;

  const repeatBtn = document.getElementById("repeatIncorrectBtn");
  if (repeatBtn) {
    repeatBtn.addEventListener("click", () => {
      flashcards = [...incorrectCards];
      incorrectCards = [];
      score = 0;
      showFlashcard();
    });
  }
}

// ----------------------
// Zen Mode Toggle
// ----------------------
if (zenBtn) {
  zenBtn.addEventListener("click", () => {
    document.body.classList.toggle("zen-mode");
  });
}

// ----------------------
// Close Create Section
// ----------------------
if (closeCreateBtn) {
  closeCreateBtn.addEventListener("click", () => {
    createSection.classList.add("hidden");
  });
}

// ----------------------
// Create Custom Flashcards
// ----------------------
if (addFlashcardBtn && startCustomBtn) {
  addFlashcardBtn.addEventListener("click", () => {
    const q = newQuestion.value.trim();
    const a = newAnswer.value.trim();
    if (!q || !a) return;
    flashcards.push({ question: q, answer: a });

    const item = document.createElement("div");
    item.textContent = `Q: ${q} → A: ${a}`;
    newFlashcardsContainer.appendChild(item);

    newQuestion.value = "";
    newAnswer.value = "";
  });

  startCustomBtn.addEventListener("click", () => {
    createSection.classList.add("hidden");
    score = 0;
    incorrectCards = [];
    showFlashcard();
  });
}
