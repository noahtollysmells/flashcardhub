document.addEventListener("DOMContentLoaded", function () {
  var flashcardContainer = document.getElementById("flashcardContainer");
  var createBtn = document.getElementById("createBtn");
  var createSection = document.getElementById("createSection");
  var addFlashcardBtn = document.getElementById("addFlashcardBtn");
  var startCustomBtn = document.getElementById("startCustomBtn");
  var newQuestionInput = document.getElementById("newQuestion");
  var newAnswerInput = document.getElementById("newAnswer");
  var newFlashcardsContainer = document.getElementById("newFlashcardsContainer");

  var flashcards = [];
  var currentIndex = 0;
  var score = 0;
  var incorrectCards = [];
  var totalCards = 0;
  var completedCards = 0;

  

  // ============ SHOW FLASHCARDS ============
  function showFlashcard() {
    flashcardContainer.innerHTML = "";
    var progressTracker = document.getElementById('progressTracker');
    
    if (currentIndex < flashcards.length && flashcards.length > 0) {
      if (progressTracker) progressTracker.classList.add('show');
    } else {
      if (progressTracker) progressTracker.classList.remove('show');
      return showResult();
    }
    
    var qa = flashcards[currentIndex] || { question: '', answer: '' };
    var question = qa.question;
    var answer = qa.answer;
    var card = document.createElement("div"); 
    card.classList.add("big-flashcard");

    var inner = document.createElement("div"); 
    inner.classList.add("flashcard-inner");

    var front = document.createElement("div"); 
    front.classList.add("flashcard-front");
    front.innerHTML = '<p>' + escapeHtml(question) + '</p><button class="skip-btn">⏭️ Skip</button>';

    var back = document.createElement("div"); 
    back.classList.add("flashcard-back");
    back.innerHTML = '<p>' + escapeHtml(answer) + '</p>' +
      '<div class="answer-buttons">' +
        '<button class="wrong-btn">I Got It Wrong ❌</button>' +
        '<button class="correct-btn">I Got It Right! ✅</button>' +
      '</div>';
    
    inner.appendChild(front); 
    inner.appendChild(back); 
    card.appendChild(inner); 
    flashcardContainer.appendChild(card);

    // Click to flip
    card.addEventListener("click", function (e) { 
      if (e && e.target && e.target.tagName === "BUTTON") return; 
      if (card.classList) card.classList.toggle("flipped");
    });

    // Skip button
    var skipBtn = front.querySelector(".skip-btn");
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        flashcards.push(flashcards.splice(currentIndex, 1)[0]);
        showFlashcard();
      });
    }
    
    // Wrong button
    var wrongBtn = back.querySelector(".wrong-btn");
    if (wrongBtn) {
      wrongBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        incorrectCards.push(flashcards.splice(currentIndex, 1)[0]);
        completedCards++;
        if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
        showFlashcard();
      });
    }
    
    // Correct button
    var correctBtn = back.querySelector(".correct-btn");
    if (correctBtn) {
      correctBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        score++;
        flashcards.splice(currentIndex, 1);
        completedCards++;
        if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
        showFlashcard();
      });
    }
  }

  // ============ RESULT SCREEN ============
  function showResult() {
    var percentage = totalCards > 0 ? Math.round((score / totalCards) * 100) : 0;
    var performance = "📚 Keep Practicing!";
    if (percentage >= 80) performance = "🎉 Excellent!";
    else if (percentage >= 60) performance = "👍 Good Job!";

    var progressBar = '<div class="progress-bar">' +
        '<div class="progress-fill" style="width: ' + percentage + '%"></div>' +
      '</div>';

    flashcardContainer.innerHTML = '<div class="result-screen">' +
        '<h2>' + performance + '</h2>' +
        '<p>Score: ' + score + '/' + totalCards + ' (' + percentage + '%)</p>' +
        progressBar +
        (incorrectCards.length > 0 ? '<button id="repeatIncorrectBtn" class="skip-btn">🔁 Review ' + incorrectCards.length + ' Wrong</button>' : '') +
      '</div>';
    
    var progressTracker = document.getElementById('progressTracker');
    if (progressTracker) progressTracker.classList.remove('show');
    
    var repeatBtn = document.getElementById("repeatIncorrectBtn");
    if (repeatBtn) repeatBtn.addEventListener("click", function () {
      flashcards = incorrectCards.slice(0);
      incorrectCards = [];
      currentIndex = 0;
      score = 0;
      completedCards = 0;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard();
    });
  }

  // ============ CREATE YOUR OWN ============
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      if (!createSection) return;
      if (createSection.classList && typeof createSection.classList.toggle === 'function') {
        createSection.classList.toggle("hidden");
      } else {
        createSection.style.display = (createSection.style.display === 'none' ? '' : 'none');
      }
    });
  }

  if (addFlashcardBtn && newQuestionInput && newAnswerInput && newFlashcardsContainer) {
    addFlashcardBtn.addEventListener("click", function () {
      var q = newQuestionInput.value.trim();
      var a = newAnswerInput.value.trim();

      if (!q || !a) {
        alert("⚠️ Please enter both question and answer!");
        return;
      }

      flashcards.push({ question: q, answer: a });
      totalCards = flashcards.length;

      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);

      var div = document.createElement("div");
      div.innerHTML = '<strong>Q:</strong> ' + escapeHtml(q) + '<br><strong>A:</strong> ' + escapeHtml(a);
      newFlashcardsContainer.appendChild(div);

      newQuestionInput.value = "";
      newAnswerInput.value = "";
      if (newQuestionInput.focus) newQuestionInput.focus();
    });

    // Allow Enter key to add flashcard (fallback for keyCode)
    newAnswerInput.addEventListener("keypress", function (e) {
      var code = e.key ? (e.key === 'Enter' ? 13 : 0) : (e.keyCode || e.which || 0);
      if (e.key === 'Enter' || code === 13) {
        if (addFlashcardBtn && addFlashcardBtn.click) addFlashcardBtn.click();
      }
    });
  }

  if (startCustomBtn) {
    startCustomBtn.addEventListener("click", function () {
      if (flashcards.length === 0) {
        alert("⚠️ Please add at least one flashcard first!");
        return;
      }
      if (createSection && createSection.classList) createSection.classList.add("hidden");
      currentIndex = 0;
      score = 0;
      incorrectCards = [];
      completedCards = 0;
      totalCards = flashcards.length;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard();
    });
  }

  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
  }
});
