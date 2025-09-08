// Flashcard variables
let flashcards = [];
let currentIndex = 0;
let score = 0;

// ================= CSV Upload =================
document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;

    // Parse CSV safely (handles commas inside quotes)
    flashcards = parseCSV(text).slice(1).map(([q, a]) => ({ question: q, answer: a }));
    currentIndex = 0;
    score = 0;

    showFlashcard();
  };
  reader.readAsText(file);
}

// CSV parser that handles quotes and commas
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

// ================= Flashcard Display =================
function showFlashcard() {
  const container = document.getElementById("flashcardContainer");
  container.innerHTML = "";

  if (currentIndex >= flashcards.length) {
    return showResult();
  }

  const { question, answer } = flashcards[currentIndex];

  const card = document.createElement("div");
  card.classList.add("big-flashcard");

  const inner = document.createElement("div");
  inner.classList.add("flashcard-inner");

  // Front (Question)
  const front = document.createElement("div");
  front.classList.add("flashcard-front");
  front.innerHTML = `
    <p>${question}</p>
    <button class="skip-btn">⏭️ Skip</button>
  `;

  // Back (Answer)
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
  container.appendChild(card);

  // Flip on click (except buttons)
  card.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    card.classList.toggle("flipped");
  });

  // Skip button
  front.querySelector(".skip-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    flashcards.push(flashcards.splice(currentIndex, 1)[0]);
    showFlashcard();
  });

  // Wrong button
  back.querySelector(".wrong-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    flashcards.splice(currentIndex, 1);
    showFlashcard();
  });

  // Correct button
  back.querySelector(".correct-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    score++;
    flashcards.splice(currentIndex, 1);
    showFlashcard();
  });
}

function showResult() {
  const container = document.getElementById("flashcardContainer");
  container.innerHTML = `
    <div class="result-screen">
      <h2>${score > 0 ? "🎉 Test Completed!" : "❌ Test Finished"}</h2>
      <p>Your Score: ${score}</p>
    </div>
  `;
}

// ================= Manual Flashcards =================
document.getElementById("createBtn").addEventListener("click", () => {
  document.getElementById("createSection").classList.toggle("hidden");
});

let customFlashcards = [];

document.getElementById("addFlashcardBtn").addEventListener("click", () => {
  const question = document.getElementById("newQuestion").value.trim();
  const answer = document.getElementById("newAnswer").value.trim();
  if (!question || !answer) return;

  customFlashcards.push({ question, answer });

  const container = document.getElementById("newFlashcardsContainer");
  const p = document.createElement("p");
  p.textContent = `Q: ${question} | A: ${answer}`;
  container.appendChild(p);

  document.getElementById("newQuestion").value = "";
  document.getElementById("newAnswer").value = "";
});

document.getElementById("startCustomBtn").addEventListener("click", () => {
  if (customFlashcards.length === 0) return;
  flashcards = [...customFlashcards];
  currentIndex = 0;
  score = 0;

  document.getElementById("createSection").classList.add("hidden");
  showFlashcard();
});
// Existing code for flashcards...

// Zen Mode toggle
const zenBtn = document.getElementById("zenBtn");
if (zenBtn) {
  zenBtn.addEventListener("click", () => {
    document.body.classList.toggle("zen-mode");
  });
}


