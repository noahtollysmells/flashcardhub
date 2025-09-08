document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const flashcardContainer = document.getElementById("flashcardContainer");
  const createBtn = document.getElementById("createBtn");
  const createSection = document.getElementById("createSection");
  const addFlashcardBtn = document.getElementById("addFlashcardBtn");
  const startCustomBtn = document.getElementById("startCustomBtn");
  const newQuestionInput = document.getElementById("newQuestion");
  const newAnswerInput = document.getElementById("newAnswer");
  const newFlashcardsContainer = document.getElementById("newFlashcardsContainer");
  const hideMessageBtn = document.getElementById("hideMessageBtn");
  const messageBanner = document.getElementById("messageBanner");

  let flashcards = [];
  let currentIndex = 0;
  let score = 0;
  let incorrectCards = [];

  // ---------------- CSV Upload ----------------
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      flashcards = parseCSV(text).slice(1).map(([q, a]) => ({ question: q, answer: a }));
      currentIndex = 0; score = 0; incorrectCards = [];
      showFlashcard();
    };
    reader.readAsText(file);
  });

  function parseCSV(text) {
    const rows = [];
    let row = [], val = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && text[i + 1] === '"') { val += '"'; i++; }
      else if (char === '"') inQuotes = !inQuotes;
      else if (char === "," && !inQuotes) { row.push(val.trim()); val = ""; }
      else if ((char === "\n" || char === "\r") && !inQuotes) { if(val||row.length){row.push(val.trim());rows.push(row);} row=[]; val=""; }
      else val += char;
    }
    if (val||row.length) row.push(val.trim()), rows.push(row);
    return rows;
  }

  // ---------------- Show Flashcards ----------------
  function showFlashcard() {
    flashcardContainer.innerHTML = "";
    if (currentIndex >= flashcards.length) return showResult();
    const { question, answer } = flashcards[currentIndex];
    const card = document.createElement("div"); card.classList.add("big-flashcard");
    const inner = document.createElement("div"); inner.classList.add("flashcard-inner");
    const front = document.createElement("div"); front.classList.add("flashcard-front");
    front.innerHTML = `<p>${question}</p><button class="skip-btn">⏭️ Skip</button>`;
    const back = document.createElement("div"); back.classList.add("flashcard-back");
    back.innerHTML = `<p>${answer}</p>
      <div class="answer-buttons">
        <button class="wrong-btn">❌ Wrong</button>
        <button class="correct-btn">✅ Correct</button>
      </div>`;
    inner.appendChild(front); inner.appendChild(back); card.appendChild(inner); flashcardContainer.appendChild(card);

    card.addEventListener("click", e => { if(e.target.tagName==="BUTTON") return; card.classList.toggle("flipped"); });

    front.querySelector(".skip-btn").addEventListener("click", e => { e.stopPropagation(); flashcards.push(flashcards.splice(currentIndex,1)[0]); showFlashcard(); });
    back.querySelector(".wrong-btn").addEventListener("click", e => { e.stopPropagation(); incorrectCards.push(flashcards.splice(currentIndex,1)[0]); showFlashcard(); });
    back.querySelector(".correct-btn").addEventListener("click", e => { e.stopPropagation(); score++; flashcards.splice(currentIndex,1); showFlashcard(); });
  }

  // ---------------- Result Screen ----------------
  function showResult() {
    flashcardContainer.innerHTML = `
      <div class="result-screen">
        <h2>${score > 0 ? "🎉 Test Completed!" : "❌ Test Completed"}</h2>
        <p>Your Score: ${score}</p>
        ${incorrectCards.length>0?`<button id="repeatIncorrectBtn">🔁 Repeat Incorrect Questions</button>`:""}
      </div>`;
    const repeatBtn = document.getElementById("repeatIncorrectBtn");
    if(repeatBtn) repeatBtn.addEventListener("click",()=>{
      flashcards = [...incorrectCards]; incorrectCards=[]; currentIndex=0; score=0; showFlashcard();
    });
  }

  // ---------------- Create Your Own Flashcards ----------------
  createBtn.addEventListener("click", ()=>{ createSection.classList.toggle("hidden"); });

  addFlashcardBtn.addEventListener("click", ()=>{
    const q = newQuestionInput.value.trim(); const a = newAnswerInput.value.trim();
    if(!q||!a) return alert("Enter both question and answer!");
    flashcards.push({question:q, answer:a});
    const div = document.createElement("div"); div.textContent = `Q: ${q} | A: ${a}`;
    newFlashcardsContainer.appendChild(div);
    newQuestionInput.value=""; newAnswerInput.value="";
  });

  startCustomBtn.addEventListener("click", ()=>{
    if(flashcards.length===0) return alert("Add at least one flashcard!");
    createSection.classList.add("hidden"); currentIndex=0; score=0; incorrectCards=[]; showFlashcard();
  });

  // ---------------- Hide Message ----------------
  hideMessageBtn.addEventListener("click", ()=>{ messageBanner.style.display="none"; });
});
