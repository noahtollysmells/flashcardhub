// ----------------------
// Flashcard Hub Script
// ----------------------

const fileInput = document.getElementById("fileInput");
const flashcardContainer = document.getElementById("flashcardContainer");
const zenBtn = document.getElementById("zenBtn");
const createBtn = document.getElementById("createBtn");
const createSection = document.getElementById("createSection");
const addFlashcardBtn = document.getElementById("addFlashcardBtn");
const startCustomBtn = document.getElementById("startCustomBtn");

let flashcards = [];
let currentIndex = 0;
let score = 0;
let incorrectCards = [];
let customCards = [];

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
    currentIndex = 0;
    score = 0;
    incorrectCards = [];
    showFlashcard();
  };
  reader.readAsText(file);
}

// CSV parser
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

  if (currentIndex >= flashcards.length) {
    return showResult();
  }

  const { question, answer } = flashcards[currentIndex];

  const card = document.createElement("div");
  card.classList.add("big-flashcard");

  const inner = document.createElement("div");
  inner.classList.add("flashcard-inner");

  // Front (Question + Skip)
  const front = document.createElement("div");
  front.classList.add("flashcard-front");
  front.innerHTML = `
    <p>${question}</p>
    <button class="skip-btn">⏭️ Skip</button>
  `;

  // Back (Answer + Correct/Wrong)
  const back = document.createElement("div");
  back.classList.add("flashcard-back");
  back.innerHTML = `
    <p>${answer}</p>
    <div class="answer-buttons">
      <button class="wrong-btn">❌ Wrong</button>
      <button class="correct-btn">✅ Correct</button>
    </div>
  `;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);
  flashcardContainer.appendChild(card);

  // Flip on click (anywhere except buttons)
  card.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    card.classList.toggle("flipped");
  });

  // Skip button → move card to end
  front.querySelector(".skip-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    flashcards.push(flashcards.splice(currentIndex, 1)[0]);
    showFlashcard();
  });

  // Wrong button → track
  back.querySelector(".wrong-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    incorrectCards.push(flashcards.splice(currentIndex, 1)[0]);
    showFlashcard();
  });

  // Correct button → score++
  back.querySelector(".correct-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    score++;
    flashcards.splice(currentIndex, 1);
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
      currentIndex = 0;
      score = 0;
      showFlashcard();
    });
  }
}

// ----------------------
// Zen Mode Toggle
// ----------------------
zenBtn.addEventListener("click", () => {
  document.body.classList.toggle("zen-mode");
});

// ----------------------
// Create Flashcards
// ----------------------
createBtn.addEventListener("click", () => {
  createSection.classList.remove("hidden");
});

addFlashcardBtn.addEventListener("click", () => {
  const question = document.getElementById("newQuestion").value;
  const answer = document.getElementById("newAnswer").value;
  if (!question || !answer) return;
  customCards.push({ question, answer });
  document.getElementById("newQuestion").value = "";
  document.getElementById("newAnswer").value = "";
  showFlashcardCustom();
});

startCustomBtn.addEventListener("click", () => {
  flashcards = [...customCards];
  customCards = [];
  currentIndex = 0;
  score = 0;
  incorrectCards = [];
  createSection.classList.add("hidden");
  showFlashcard();
});

function showFlashcardCustom() {
  // optional: show preview of custom cards if needed
}
