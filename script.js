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
  const messageBanner = document.getElementById("messageBanner");

  let flashcards = [];
  let currentIndex = 0;
  let score = 0;
  let incorrectCards = [];
  let totalCards = 0;
  let completedCards = 0;

  // ============ CSV UPLOAD ============
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading feedback
    fileInput.disabled = true;
    const originalLabel = fileInput.nextElementSibling?.textContent;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSV(text).slice(1).filter(row => row.length >= 2 && row[0].trim() && row[1].trim());
        
        if (parsed.length === 0) {
          alert("No valid flashcard data found. Please check your CSV format.");
          fileInput.disabled = false;
          return;
        }
        
        flashcards = parsed.map(([q, a]) => ({ question: q.trim(), answer: a.trim() }));
        totalCards = flashcards.length;
        completedCards = 0;
        currentIndex = 0;
        score = 0;
        incorrectCards = [];
        
        if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
        showFlashcard();
        fileInput.disabled = false;
      } catch (error) {
        alert("Error parsing CSV. Please check the file format.");
        fileInput.disabled = false;
      }
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

  // ============ SHOW FLASHCARDS ============
  function showFlashcard() {
    flashcardContainer.innerHTML = "";
    const progressTracker = document.getElementById('progressTracker');
    const progressText = document.getElementById('progressText');
    
    if (currentIndex < flashcards.length && flashcards.length > 0) {
      if (progressTracker) progressTracker.style.display = '';
      if (progressText) progressText.style.display = '';
    } else {
      if (progressText) progressText.style.display = 'none';
      if (progressTracker) progressTracker.style.display = 'none';
      return showResult();
    }
    
    const { question, answer } = flashcards[currentIndex];
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
    const performance = percentage >= 80 ? "🎉 Excellent!" : percentage >= 60 ? "👍 Good Job!" : "📚 Keep Practicing!";
    
    flashcardContainer.innerHTML = `
      <div class="result-screen" style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #252525 0%, #1f1f1f 100%); border-radius: 20px; max-width: 500px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.05);">
        <h2 style="font-size: 2rem; margin: 0 0 1rem 0;">${performance}</h2>
        <p style="font-size: 1.2rem; margin: 1rem 0; color: #4CAF50; font-weight: 600;">Score: ${score}/${totalCards} (${percentage}%)</p>
        <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; margin: 1.5rem 0; overflow: hidden;">
          <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%); transition: width 0.6s ease;"></div>
        </div>
        ${incorrectCards.length > 0 ? `<button id="repeatIncorrectBtn" style="margin-top: 1.5rem; padding: 0.8rem 1.6rem; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); border: none; color: white; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1rem;">🔁 Review Incorrect (${incorrectCards.length})</button>` : ""}
      </div>`;
    
    // Hide progress tracker when showing result
    const progressTracker = document.getElementById('progressTracker');
    if (progressTracker) progressTracker.style.display = 'none';
    
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
      alert("Please enter both a question and answer!");
      return;
    }
    
    flashcards.push({question: q, answer: a});
    totalCards = flashcards.length;
    
    if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
    
    const div = document.createElement("div"); 
    div.style.cssText = "background: #1f1f1f; padding: 0.8rem; margin: 0.5rem 0; border-radius: 8px; border-left: 3px solid #4CAF50; font-size: 0.9rem;";
    div.innerHTML = `<strong>Q:</strong> ${q}<br><strong>A:</strong> ${a}`;
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
      alert("Please add at least one flashcard first!");
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

  // Hide Message Banner
  const hideMessageBtn = document.getElementById("hideMessageBtn");
  if (hideMessageBtn) {
    hideMessageBtn.addEventListener("click", () => { messageBanner.style.display = "none"; });
  }
});
