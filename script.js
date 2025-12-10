document.addEventListener("DOMContentLoaded", () => {
  const flashcardContainer = document.getElementById("flashcardContainer");
  const createBtn = document.getElementById("createBtn");
  const createSection = document.getElementById("createSection");
  const addFlashcardBtn = document.getElementById("addFlashcardBtn");
  const startCustomBtn = document.getElementById("startCustomBtn");
  const newQuestionInput = document.getElementById("newQuestion");
  const newAnswerInput = document.getElementById("newAnswer");
  const newFlashcardsContainer = document.getElementById("newFlashcardsContainer");

  let flashcards = [];
  let currentIndex = 0;
  let score = 0;
  let incorrectCards = [];
  let totalCards = 0;
  let completedCards = 0;

  

  // ============ SHOW FLASHCARDS ============
  function showFlashcard() {
    flashcardContainer.innerHTML = "";
    const progressTracker = document.getElementById('progressTracker');
    
    if (currentIndex < flashcards.length && flashcards.length > 0) {
      if (progressTracker) progressTracker.classList.add('show');
    } else {
      if (progressTracker) progressTracker.classList.remove('show');
      return showResult();
    }
    
    const { question, answer } = flashcards[currentIndex];
    const card = document.createElement("div"); 
    card.classList.add("big-flashcard");
    
    const inner = document.createElement("div"); 
    inner.classList.add("flashcard-inner");
    
    const front = document.createElement("div"); 
    front.classList.add("flashcard-front");
    front.innerHTML = `<p>${escapeHtml(question)}</p><button class="skip-btn">⏭️ Skip</button>`;
    
    const back = document.createElement("div"); 
    back.classList.add("flashcard-back");
    back.innerHTML = `<p>${escapeHtml(answer)}</p>
      <div class="answer-buttons">
        <button class="wrong-btn">I Got It Wrong ❌</button>
        <button class="correct-btn">I Got It Right! ✅</button>
      </div>`;
    
    inner.appendChild(front); 
    inner.appendChild(back); 
    card.appendChild(inner); 
    flashcardContainer.appendChild(card);

    // Click to flip
    card.addEventListener("click", e => { 
      if(e.target.tagName==="BUTTON") return; 
      card.classList.toggle("flipped");
    });

    // Skip button
    front.querySelector(".skip-btn").addEventListener("click", e => { 
      e.stopPropagation(); 
      flashcards.push(flashcards.splice(currentIndex,1)[0]); 
      showFlashcard(); 
    });
    
    // Wrong button
    back.querySelector(".wrong-btn").addEventListener("click", e => { 
      e.stopPropagation(); 
      incorrectCards.push(flashcards.splice(currentIndex,1)[0]); 
      completedCards++;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard(); 
    });
    
    // Correct button
    back.querySelector(".correct-btn").addEventListener("click", e => { 
      e.stopPropagation(); 
      score++; 
      flashcards.splice(currentIndex,1); 
      completedCards++;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard(); 
    });
  }

  // ============ RESULT SCREEN ============
  function showResult() {
    const percentage = totalCards > 0 ? Math.round((score / totalCards) * 100) : 0;
    let performance = "📚 Keep Practicing!";
    if (percentage >= 80) performance = "🎉 Excellent!";
    else if (percentage >= 60) performance = "👍 Good Job!";
    
    const progressBar = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
    `;
    
    flashcardContainer.innerHTML = `
      <div class="result-screen">
        <h2>${performance}</h2>
        <p>Score: ${score}/${totalCards} (${percentage}%)</p>
        ${progressBar}
        ${incorrectCards.length > 0 ? `<button id="repeatIncorrectBtn" class="skip-btn">🔁 Review ${incorrectCards.length} Wrong</button>` : ""}
      </div>`;
    
    const progressTracker = document.getElementById('progressTracker');
    if (progressTracker) progressTracker.classList.remove('show');
    
    const repeatBtn = document.getElementById("repeatIncorrectBtn");
    if(repeatBtn) repeatBtn.addEventListener("click", () => {
      flashcards = [...incorrectCards]; 
      incorrectCards = []; 
      currentIndex = 0; 
      score = 0;
      completedCards = 0;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard();
    });
  }

  // ============ CREATE YOUR OWN ============
  createBtn.addEventListener("click", () => { 
    createSection.classList.toggle("hidden"); 
  });

  addFlashcardBtn.addEventListener("click", () => {
    const q = newQuestionInput.value.trim(); 
    const a = newAnswerInput.value.trim();
    
    if(!q || !a) {
      alert("⚠️ Please enter both question and answer!");
      return;
    }
    
    flashcards.push({question: q, answer: a});
    totalCards = flashcards.length;
    
    if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
    
    const div = document.createElement("div"); 
    div.innerHTML = `<strong>Q:</strong> ${escapeHtml(q)}<br><strong>A:</strong> ${escapeHtml(a)}`;
    newFlashcardsContainer.appendChild(div);
    
    newQuestionInput.value = "";
    newAnswerInput.value = "";
    newQuestionInput.focus();
  });

  // Allow Enter key to add flashcard
  newAnswerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFlashcardBtn.click();
  });

  startCustomBtn.addEventListener("click", () => {
    if(flashcards.length === 0) {
      alert("⚠️ Please add at least one flashcard first!");
      return;
    }
    createSection.classList.add("hidden"); 
    currentIndex = 0; 
    score = 0; 
    incorrectCards = [];
    completedCards = 0;
    totalCards = flashcards.length;
    if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
    showFlashcard();
  });

  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
});
